# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es ARGENDA

SaaS de gestión de turnos/reservas (agenda, pacientes, profesionales) en Angular 22 + Bootstrap 5.3. El proyecto está en **fase de diseño**: primero se construye la UI, la funcionalidad real viene después (los datos hoy viven en LocalStorage vía servicios). Idioma del código, la UI y la comunicación: **español**.

## Comandos

```bash
npm start          # ng serve — dev server en http://localhost:4200
npm run build      # ng build — producción
npm run watch      # build en modo watch (configuración development)
npm test           # ng test — corre Vitest
```

No hay linter configurado. Testing con Vitest (no Karma/Jasmine).

## Reglas de trabajo (obligatorias)

1. **Prohibido escribir comentarios en el código.** No se agregan comentarios en TS, HTML ni CSS salvo que el usuario lo autorice textualmente en la conversación. El código existente casi no tiene comentarios; mantener eso.
2. **Fidelidad al diseño del usuario.** Los diseños los propone el usuario (mockups, capturas, descripciones) y se implementan fielmente, sin "mejoras" creativas por cuenta propia. Ante ambigüedad de diseño, preguntar antes de diseñar.
3. **Mono-design: un solo lenguaje visual.** Todo lo nuevo debe verse como parte del mismo sistema. Antes de crear un botón, card, modal o navbar nuevo, revisar si ya existe una clase/componente equivalente y reutilizarlo o extenderlo. No introducir estilos, paletas, tipografías, librerías de UI ni patrones UX distintos a los ya establecidos.
4. **Colores solo vía tokens `--arg-*`.** Nunca hardcodear hex nuevos en componentes; si hace falta un color que no existe, proponerlo como token en `src/styles.css` y consultarlo primero.
5. **Tono formal y profesional** en textos de la UI (es-AR neutro, tratamiento consistente con las pantallas existentes).

## Sistema de diseño (brandbook)

Tokens definidos en `src/styles.css` — única fuente de verdad de la paleta:

| Token | Valor | Uso |
|---|---|---|
| `--arg-primary` | `#34817e` | Verde teal — acciones principales |
| `--arg-primary-dark` | `#2a6a67` | Hover/active del primario |
| `--arg-primary-tint` | `#e7f1f0` | Fondos suaves del primario |
| `--arg-secondary` | `#16302f` | Marino oscuro — topbar admin, cabeceras |
| `--arg-tertiary` | `#f4b740` | Dorado — acentos destacados |
| `--arg-neutral` | `#5c6b70` | Gris neutral — texto secundario |
| `--arg-surface` / `-soft` / `-softer` | `#ffffff` / `#eaf2f4` / `#f3f7f8` | Superficies |
| `--arg-border` | `#e3e9ea` | Bordes |
| `--arg-text` | `#22343c` | Texto principal |
| `--arg-font` | `'Hanken Grotesk', …` | Tipografía única (Google Fonts, pesos 400–800) |

Estilos en **CSS vanilla** (sin SCSS). Bootstrap 5.3 + Bootstrap Icons se cargan globalmente desde `angular.json`; Bootstrap aporta grilla y utilidades, pero la identidad visual la dan las clases propias.

### Componentes/clases UI ya establecidos — reutilizar antes de crear

- Botón primario global: `.btn-arg-primary` (`src/styles.css`)
- Navbar pública: `src/app/components/navbar/` (`.main-header` sticky con blur, `.brand-logo`, `.booking-button`, `.profile-menu`)
- Topbar admin: `src/app/shared/topbar/` (`.arg-navbar` fondo marino, `.arg-nav-link`, `.arg-avatar`)
- Auth: `.auth-card`, `.btn-auth-primary`, inputs de 48px con focus primario (`src/app/pages/login/login.css`)
- Reserva: `.booking-card`, `.service-option`, `.btn-continue`/`.btn-back`/`.btn-confirm` (`src/app/pages/booking/booking.css`)
- FAB de chat: `.arg-chat-fab` (`src/app/app.css`)

Convenciones visuales del sistema: bordes redondeados, sombras suaves, estados hover con `--arg-primary-dark`, responsive con breakpoint ~900px en navbars.

## Arquitectura

Angular 22 **standalone** (sin NgModules), **zoneless** (`provideZonelessChangeDetection()`), estado con **signals** (`signal()`, `computed()`).

```
src/app/
├── components/   # UI reutilizable pública (navbar, footer, service-card, appointment-stepper)
├── shared/       # UI compartida admin (topbar)
├── features/     # Zona privada: agenda/, pacientes/, profesionales/ (página + modales por feature)
├── pages/        # Zona pública: home, services, booking, login, register, my-appointments
├── services/     # Datos (AuthService, etc.) con persistencia en LocalStorage
├── models/       # Interfaces TypeScript
└── app.routes.ts # Rutas con título "X | Argenda"
```

Dos zonas visuales bien separadas:
- **Pública** (`/inicio`, `/servicios`, `/reservar`, `/iniciar-sesion`, `/registro`, `/mis-turnos`): usa `Navbar` + `Footer`.
- **Admin/privada** (`/agenda` — ruta por defecto, `/pacientes`, `/profesionales`): usa `Topbar` con fondo `--arg-secondary`.

La lista de rutas públicas que decide qué barra mostrar vive en `app.ts`. Al crear una ruta nueva, agregarla ahí según su zona y darle título con el patrón `"Nombre | Argenda"`.

Nombres de archivos: `nombre-componente.ts/html/css`, `nombre.service.ts`, `nombre.model.ts`. Dominio en español (pacientes, turnos, profesionales, reservas).

Documentos de referencia en la raíz: `argenda_schema.sql` (modelo de datos futuro), `argenda_jwt_y_arquitectura.md` y `argenda_arquitectura.drawio` (arquitectura objetivo).
