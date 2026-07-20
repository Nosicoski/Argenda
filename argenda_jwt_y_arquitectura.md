# Argenda — Arquitectura, flujo JWT e instrucciones

## 1. Resumen del modelo

- **El tenant es el `negocio`**, no el usuario. Todo dato lleva `negocio_id` y se aísla con Row-Level Security (RLS) en PostgreSQL.
- **`usuario`** = identidad con login. Su email es único *dentro* del negocio.
- **`usuario_sucursal`** = acceso de un usuario a una sucursal + su **rol** allí. La agenda de un profesional cuelga de esta fila.
- **`cliente` (reservador)** = contacto sin cuenta de login. Reserva desde la página pública y gestiona su cita con un *magic link* (`gestion_token`).
- **La "agenda" no es una tabla**: es una vista sobre `reserva` (incluida como `v_agenda`).

### Roles
| Rol | Puede |
|-----|-------|
| **ADMIN** | Todo: config del negocio, sucursales, usuarios, servicios, todas las agendas. |
| **RECEPCIONISTA** | Solo **ver** la agenda de su sucursal. |
| **PROFESIONAL** | Ver **y manipular** su propia agenda (crear/mover/cancelar sus reservas). |

---

## 2. Estrategia multi-tenant

Shared DB + shared schema + `negocio_id` + **RLS**. En cada request, tras validar el JWT, la app ejecuta:

```sql
SET app.current_negocio = '<negocio_id del token>';
```

A partir de ahí toda query queda acotada al tenant automáticamente, incluso si hay un bug en la capa de aplicación. Es la barrera de seguridad más importante contra fugas de datos entre negocios.

---

## 3. Flujo JWT (access + refresh con rotación en DB)

Dos tokens:

- **Access token** (JWT firmado, corto: ~15 min). Se manda en `Authorization: Bearer <token>`. Es *stateless*: no se consulta a la DB para validarlo.
- **Refresh token** (largo: ~30 días). Se guarda **hasheado** en la tabla `refresh_token` para poder **revocarlo** y **rotarlo**.

### Claims del access token
```json
{
  "sub": "<usuario_id>",
  "negocio_id": "<uuid>",          // -> fija app.current_negocio (RLS)
  "accesos": [                      // roles por sucursal
    { "sucursal_id": "<uuid>", "rol": "ADMIN" },
    { "sucursal_id": "<uuid>", "rol": "PROFESIONAL" }
  ],
  "iat": 1700000000,
  "exp": 1700000900,
  "jti": "<uuid>"
}
```

### Login
1. El negocio se determina por el subdominio/slug (p.ej. `mibarberia.argenda.com`).
2. Se valida `email + password` (bcrypt/argon2) dentro de ese `negocio_id`.
3. Se emite **access** (15 min) + **refresh** (30 días). El refresh se guarda hasheado (SHA-256) en `refresh_token`.

### Uso normal
- El cliente manda el access en cada request. El backend verifica la firma y `exp`, y setea `app.current_negocio` desde el claim.

### Renovación (rotación)
1. Cuando el access expira, el cliente hace `POST /auth/refresh` con el refresh token.
2. El backend busca su hash en `refresh_token`: debe existir, **no** estar `revocado` y **no** vencido.
3. Emite un **nuevo par** access+refresh, marca el refresh viejo como `revocado = true` y guarda `reemplazado_por = <id del nuevo>`.
4. **Detección de robo**: si llega un refresh que ya está `revocado`, significa que alguien lo reusó → se revoca **toda la cadena** de ese usuario y se fuerza re-login.

### Logout
- Marca el refresh actual como `revocado = true`. (Logout global = revocar todos los del usuario.)

### En Spring Boot
- `spring-boot-starter-security` + una librería JWT (`jjwt` o `spring-security-oauth2-resource-server` con `NimbusJwtDecoder`).
- Un `OncePerRequestFilter` valida el access y, tras autenticar, ejecuta el `SET app.current_negocio` en la conexión de esa request (o vía un `Interceptor`/`AOP` antes de tocar el repositorio).
- Endpoints: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.

### Flujo del reservador (sin JWT)
- No recibe tokens. Reserva desde la página pública → se crea/matchea `cliente` por email/teléfono → se crea `reserva` con un `gestion_token`.
- Para ver/cancelar: enlace tipo `argenda.com/r/<gestion_token>`. El token identifica la reserva; no hay sesión ni login.

---

## 4. Cómo abrir/importar el diagrama `.drawio`

**Opción A — abrir el archivo directo (lo más simple):**
1. Andá a https://app.diagrams.net (o abrí la app de escritorio draw.io).
2. `File → Open From → Device` y elegí `argenda_arquitectura.drawio`.

**Opción B — pegar el XML:**
1. Abrí https://app.diagrams.net → *Create New Diagram* → *Blank* → *Create*.
2. Menú `Extras → Edit Diagram...`.
3. Borrá el contenido, pegá **todo** el XML del archivo `.drawio` y hacé clic en *OK*.

Si usás VS Code, el plugin *Draw.io Integration* abre el `.drawio` visualmente con doble clic.
