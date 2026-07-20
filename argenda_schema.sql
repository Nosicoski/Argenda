-- ============================================================================
-- ARGENDA - Esquema PostgreSQL (multi-tenant)
-- Estrategia: shared DB + shared schema + tenant_id (negocio_id) + RLS
-- Motor: PostgreSQL 14+   |   Backend: Spring Boot
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "btree_gist";   -- para evitar solapamiento de reservas

-- ---------------------------------------------------------------------------
-- Tipos ENUM
-- ---------------------------------------------------------------------------
CREATE TYPE rol_usuario   AS ENUM ('ADMIN', 'RECEPCIONISTA', 'PROFESIONAL');
CREATE TYPE estado_reserva AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO_SHOW');

-- ============================================================================
-- 1. NEGOCIO  (raiz del tenant)
-- ============================================================================
CREATE TABLE negocio (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      text        NOT NULL,
    slug        text        NOT NULL UNIQUE,        -- identifica al tenant (subdominio/URL)
    plan        text        NOT NULL DEFAULT 'FREE',
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. SUCURSAL
-- ============================================================================
CREATE TABLE sucursal (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id  uuid NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
    nombre      text NOT NULL,
    slug        text NOT NULL,                      -- URL publica de reservas
    direccion   text,
    timezone    text NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
    telefono    text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (negocio_id, slug)
);
CREATE INDEX idx_sucursal_negocio ON sucursal(negocio_id);

-- ============================================================================
-- 3. USUARIO  (identidad con login: admin / recepcionista / profesional)
--    email es unico DENTRO del negocio (multi-tenant)
-- ============================================================================
CREATE TABLE usuario (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id      uuid NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
    email           text NOT NULL,
    password_hash   text NOT NULL,                  -- bcrypt/argon2 (Spring Security)
    nombre_completo text NOT NULL,
    telefono        text,
    activo          boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (negocio_id, email)
);
CREATE INDEX idx_usuario_negocio ON usuario(negocio_id);

-- ============================================================================
-- 4. USUARIO_SUCURSAL  (acceso del usuario a una sucursal + su ROL alli)
--    - Un usuario puede trabajar en varias sucursales.
--    - La AGENDA de un profesional cuelga de la fila con rol = PROFESIONAL.
--    - ADMIN se materializa con una fila por cada sucursal que administra.
-- ============================================================================
CREATE TABLE usuario_sucursal (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id  uuid NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
    usuario_id  uuid NOT NULL REFERENCES usuario(id)  ON DELETE CASCADE,
    sucursal_id uuid NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    rol         rol_usuario NOT NULL,
    UNIQUE (usuario_id, sucursal_id)
);
CREATE INDEX idx_us_negocio  ON usuario_sucursal(negocio_id);
CREATE INDEX idx_us_sucursal ON usuario_sucursal(sucursal_id);

-- ============================================================================
-- 5. SERVICIO  (ofrecido en una sucursal)
-- ============================================================================
CREATE TABLE servicio (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id   uuid NOT NULL REFERENCES negocio(id)  ON DELETE CASCADE,
    sucursal_id  uuid NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    nombre       text NOT NULL,
    duracion_min integer NOT NULL CHECK (duracion_min > 0),
    precio       numeric(12,2) NOT NULL DEFAULT 0,
    activo       boolean NOT NULL DEFAULT true
);
CREATE INDEX idx_servicio_sucursal ON servicio(sucursal_id);

-- ============================================================================
-- 6. PROFESIONAL_SERVICIO  (que profesional presta que servicio)  N:N
-- ============================================================================
CREATE TABLE profesional_servicio (
    negocio_id          uuid NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
    usuario_sucursal_id uuid NOT NULL REFERENCES usuario_sucursal(id) ON DELETE CASCADE,
    servicio_id         uuid NOT NULL REFERENCES servicio(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_sucursal_id, servicio_id)
);

-- ============================================================================
-- 7. CLIENTE  (el RESERVADOR: contacto, SIN cuenta de login)
--    Vive dentro del tenant. La misma persona en 2 negocios = 2 filas.
-- ============================================================================
CREATE TABLE cliente (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id  uuid NOT NULL REFERENCES negocio(id) ON DELETE CASCADE,
    nombre      text NOT NULL,
    email       text,
    telefono    text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (negocio_id, email)
);
CREATE INDEX idx_cliente_negocio ON cliente(negocio_id);

-- ============================================================================
-- 8. RESERVA  (la "agenda" es una VISTA sobre esta tabla)
-- ============================================================================
CREATE TABLE reserva (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    negocio_id     uuid NOT NULL REFERENCES negocio(id)  ON DELETE CASCADE,
    sucursal_id    uuid NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    profesional_id uuid NOT NULL REFERENCES usuario_sucursal(id) ON DELETE RESTRICT, -- dueño de la agenda
    servicio_id    uuid NOT NULL REFERENCES servicio(id) ON DELETE RESTRICT,
    cliente_id     uuid NOT NULL REFERENCES cliente(id)  ON DELETE RESTRICT,
    inicio         timestamptz NOT NULL,
    fin            timestamptz NOT NULL,
    estado         estado_reserva NOT NULL DEFAULT 'PENDIENTE',
    gestion_token  uuid NOT NULL DEFAULT gen_random_uuid(),  -- magic link para el cliente
    notas          text,
    created_at     timestamptz NOT NULL DEFAULT now(),
    CHECK (fin > inicio),
    -- Un profesional no puede tener dos reservas activas solapadas:
    CONSTRAINT no_solapamiento EXCLUDE USING gist (
        profesional_id WITH =,
        tstzrange(inicio, fin) WITH &&
    ) WHERE (estado <> 'CANCELADA')
);
CREATE INDEX idx_reserva_agenda      ON reserva(profesional_id, inicio);
CREATE INDEX idx_reserva_sucursal    ON reserva(sucursal_id, inicio);
CREATE UNIQUE INDEX idx_reserva_token ON reserva(gestion_token);

-- ============================================================================
-- 9. REFRESH_TOKEN  (JWT: rotacion + revocacion en DB)
-- ============================================================================
CREATE TABLE refresh_token (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      uuid NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token_hash      text NOT NULL,                  -- SHA-256 del refresh (nunca en claro)
    emitido_at      timestamptz NOT NULL DEFAULT now(),
    expira_at       timestamptz NOT NULL,           -- p.ej. now() + 30 dias
    revocado        boolean NOT NULL DEFAULT false,
    reemplazado_por uuid REFERENCES refresh_token(id), -- linaje de rotacion (deteccion de reuso)
    user_agent      text,
    ip              inet
);
CREATE INDEX idx_refresh_usuario ON refresh_token(usuario_id);
CREATE UNIQUE INDEX idx_refresh_hash ON refresh_token(token_hash);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- La app fija por request:  SET app.current_negocio = '<uuid del claim negocio_id>';
-- Toda consulta queda automaticamente acotada al tenant.
-- ============================================================================
ALTER TABLE sucursal             ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario              ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_sucursal     ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicio             ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesional_servicio ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente              ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserva              ENABLE ROW LEVEL SECURITY;

CREATE POLICY t_sucursal ON sucursal
    USING (negocio_id = current_setting('app.current_negocio')::uuid);
CREATE POLICY t_usuario ON usuario
    USING (negocio_id = current_setting('app.current_negocio')::uuid);
CREATE POLICY t_us ON usuario_sucursal
    USING (negocio_id = current_setting('app.current_negocio')::uuid);
CREATE POLICY t_servicio ON servicio
    USING (negocio_id = current_setting('app.current_negocio')::uuid);
CREATE POLICY t_ps ON profesional_servicio
    USING (negocio_id = current_setting('app.current_negocio')::uuid);
CREATE POLICY t_cliente ON cliente
    USING (negocio_id = current_setting('app.current_negocio')::uuid);
CREATE POLICY t_reserva ON reserva
    USING (negocio_id = current_setting('app.current_negocio')::uuid);

-- ============================================================================
-- Vista de agenda (comodidad para el frontend)
-- ============================================================================
CREATE VIEW v_agenda AS
SELECT r.id, r.sucursal_id, r.profesional_id,
       u.nombre_completo AS profesional,
       s.nombre AS servicio, c.nombre AS cliente,
       r.inicio, r.fin, r.estado
FROM reserva r
JOIN usuario_sucursal us ON us.id = r.profesional_id
JOIN usuario u           ON u.id = us.usuario_id
JOIN servicio s          ON s.id = r.servicio_id
JOIN cliente c           ON c.id = r.cliente_id;
