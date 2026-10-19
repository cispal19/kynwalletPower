# Implementation Plan: Registro de Usuarios de KynWallet

**Branch**: `feature/registro-julio-cisneros` (spec `002-registro-usuarios`) | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-registro-usuarios/spec.md`

## Summary

Se añade la pantalla de registro `/registro` a la demo existente de KynWallet sin recrear el
proyecto y conservando el login. El formulario recoge nombre completo, correo, contraseña,
confirmación y aceptación de términos. Valida con funciones puras del dominio que reutilizan las
reglas de correo y contraseña del login. Con datos válidos, simula el registro (1 s, sin guardar
nada) mediante un puerto y un adaptador, como el login. Después vuelve a `/login`, que muestra el
mensaje de éxito con el `Alert` existente.

Lo nuevo es la navegación: hoy la app no tiene rutas. Se plantea un módulo mínimo sobre la History
API, sin dependencias. La composición de dos paneles y el `BrandPanel` se comparten con textos por
pantalla. Google y Apple usan `window.alert("Próximamente")`. "términos y condiciones" abre un
`<dialog>` nativo. Todo se desarrolla con TDD sobre Vitest y Testing Library, que ya están en el
proyecto.

## Technical Context

**Language/Version**: TypeScript 5.9 (`strict`), React 19, Vite 8. Node.js: **≥ 22.22.2 en la
práctica** (lo exige `jsdom@30`). `package.json` declara `>=20`; se cambia a `^22.22.2 || >=24.15.0` en T001 (D1, resuelta).

**Primary Dependencies**: las existentes (`react`, `react-dom`, `@fontsource-variable/inter`).
**No se añaden dependencias.**

**Storage**: N/A. Estado en memoria; nada en URL, historial con datos, ni almacenamiento del
navegador (FR-027).

**Testing**: Vitest 5, React Testing Library, `@testing-library/user-event`, jsdom 30,
`axe-core` (helper `src/test/a11y.ts`), cobertura v8 con umbral del 80 %. Se agrega un sustituto
de `HTMLDialogElement.showModal/close` en `src/test/setup.ts`, porque jsdom no lo implementa
(research R9).

**Target Platform**: las dos últimas versiones de Chrome, Firefox, Safari y Edge (con `<dialog>`
nativo), desde 320px hasta escritorio.

**Project Type**: SPA solo frontend.

**Performance Goals**: mensaje de éxito en ≤ 2 s tras "Crear cuenta" (SC-002), con espera
simulada de 1 s.

**Constraints**: sin backend, red, base de datos ni servicios externos (SC-008); WCAG 2.1 AA;
no romper ninguna de las 111 pruebas del login; sin scroll horizontal desde 320px.

**Scale/Scope**: 2 rutas, 1 pantalla nueva, 1 componente nuevo (`Modal`), 1 módulo de
navegación, ~6 archivos de dominio, aplicación e infraestructura nuevos y cambios acotados en
6 archivos del login y la composición.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD | Cada tarea empieza con una prueba que falla; la prueba de "Regístrate" del login se cambia antes que el código (research R12). **Requisito previo: la línea base debe estar en verde**, hoy solo lo está con Node 22; D1 resuelta (Node ≥ 22.22.2, T001) | ✅ tras T001 |
| II. SOLID | `validateRegistration` (reglas), `createRegister` (orquestación), `SimulatedRegistrationGateway` (simulación), `RegisterForm` (presentación) y `navigation` (rutas): una responsabilidad cada uno. Puerto propio `RegistrationGateway` en lugar de ampliar `AuthGateway` (2.4). Inyección desde `main.tsx` (2.5). `Checkbox` y `BrandPanel` se amplían con props opcionales, sin romper su uso (2.2) | ✅ |
| III. Clean Architecture | El dominio no depende de React; la aplicación solo del dominio; el adaptador en `infrastructure/`; la UI no importa infraestructura. Las reglas ESLint por capa existentes cubren los archivos nuevos sin cambios | ✅ |
| IV. DRY/KISS/YAGNI | Se reutilizan `validateEmail`/`validatePassword`, `MESSAGES`, `TextField`, `PasswordField`, `Button`, `SocialButton`, `Divider`, `Alert`, `Checkbox`, `BrandPanel` y la composición. Navegación propia de ~40 líneas en lugar de un router (justificada en Complexity Tracking, 4.2). Sin librería de formularios ni E2E | ✅ |
| V. Seguridad | Validación en el límite (5.1); las contraseñas no salen del formulario ni llegan al puerto (5.4); el mensaje de éxito no lleva datos y nada va a la URL ni al almacenamiento; errores sin detalles internos (5.5); sin secretos nuevos | ✅ |
| VI. BRD/ARD | No existen (supuesto de la spec) | ✅ N/A |
| 7. Dependencias | Ninguna nueva. **Hallazgo**: `engines` no refleja lo que exigen `jsdom`/`undici` (7.2 pide versiones acotadas y coherentes); se corrige en T001 (D1 resuelta) | ✅ tras T001 |
| 8.1 Pruebas | Unitarias, de componente y de integración con umbral del 80 %; no baja la cobertura global | ✅ |
| 8.2 Convenciones | ESLint, Prettier y `tsc` existentes | ✅ |
| 8.3 Documentación | README (rutas, registro simulado y sus límites, versión de Node, hosting SPA), spec y contrato de 001 actualizados por FR-021, en el mismo cambio | ✅ |
| 8.4 Accesibilidad AA | Etiquetas asociadas, `aria-invalid`/`aria-describedby`, `role=status/alert`, `dialog` nativo, foco gestionado en los cambios de ruta, `document.title` por ruta, auditoría `axe-core` | ✅ (contraste según D4) |
| 8.5 Reutilización | Ver IV; `AuthLayout` sale de `LoginScreen` para compartirse | ✅ |
| 8.6 Sistema de diseño | Mismos tokens; 002 no crea tokens nuevos. Los tokens accesibles son una desviación **heredada de 001, todavía sin aprobar a nivel de proyecto** (D4). Degradado y SVG del archivo copia distintos (D2, D3) | ⚠️ D2–D3; D4 heredada, abierta en el proyecto |
| 8.7 Observabilidad | La demo no emite logs ni métricas (tampoco el login; ESLint prohíbe `console`). Cubierto por la excepción temporal EX-001 (ver abajo), vigente hasta el 2026-12-31 | ✅ con excepción aprobada (9.1) |
| 9.2 Trazabilidad | `it('US2-6: …')`, tareas que referencian FR/US, commits con el ID | ✅ |
| 9.3/9.4 Revisión y controles | `npm run verify` y pull request revisado | ✅ |
| 9.5 Verificación en planificación | Esta tabla | ✅ |

**Resultado del gate (pre-research)**: APROBADO CON CONDICIONES. No hay violaciones sin
justificar. Hay una condición previa a la implementación (línea base en verde: D1 resuelta el 2026-10-19, se ejecuta en T001) y tres
desviaciones que necesitan decisión antes de integrar (D2/D3 de diseño). D4 es una desviación heredada de 001 que no bloquea esta feature, pero sigue abierta en el proyecto. D5 quedó resuelta con la excepción EX-001.

**Re-check post-diseño (Phase 1)**: data-model, contratos y quickstart no introducen
dependencias, capas ni datos persistentes nuevos. El puerto `RegistrationGateway` sigue el
patrón existente y se justifica por FR-028 y 2.5. Las conclusiones se mantienen.

## Diferencias entre specs anteriores y código, y su efecto

| Hallazgo | Efecto en este cambio |
|---|---|
| Las pruebas fallan con Node 20, que es lo que declaran `package.json` y el README de 001 | Bloquea TDD; se resuelve primero (D1, resuelta: Node ≥ 22.22.2 en T001) |
| El plan de 001 descarta un router; la spec 002 exige `/login` y `/registro` | Navegación mínima propia (R2); se documenta la nueva decisión |
| Spec 001 FR-016/US5-1 y su contrato dicen que "Regístrate" muestra un aviso | Se cambia la prueba, el código y la documentación de 001 (FR-021) |
| El plan de 001 dice que `authenticate` valida; el código solo normaliza | Sin efecto; el registro replica el patrón real (la UI valida y el caso de uso delega) |
| `BrandPanel` tiene textos fijos | Se parametriza (R5) |
| Los tokens citan el archivo Figma original; el registro viene de una copia sin variables y con otro degradado y otros SVG | D2, D3 |

## Project Structure

### Documentation (this feature)

```text
specs/002-registro-usuarios/
├── plan.md                         # Este archivo
├── research.md                     # Phase 0 (incluye decisiones pendientes D1–D5)
├── data-model.md                   # Phase 1
├── quickstart.md                   # Phase 1: ejecución, validación manual, teclado y revisión visual
├── contracts/
│   ├── ui-register.md              # UI observable del registro, cambios del login y navegación
│   └── registration-gateway.md     # Caso de uso, puerto y adaptador
├── checklists/
│   └── requirements.md
└── tasks.md                        # Phase 2 (/speckit-tasks; no se crea aquí)
```

### Source Code (repository root)

Leyenda: **[N]** nuevo, **[M]** modificado, **[→]** movido. El resto no cambia.

```text
package.json                          [M] engines.node (D1)
.nvmrc                                [N] (D1, aprobada)
README.md                             [M] rutas, registro simulado, Node, hosting SPA

src/
├── main.tsx                          [M] crea SimulatedRegistrationGateway e inyecta `register`
├── App.tsx                           [M] resuelve la ruta, título, foco y aviso de un solo uso
├── App.test.tsx                      [M] + integración de rutas, redirección y mensaje; a11y
├── domain/
│   ├── registration.ts (+ .test)     [N] RegistrationData, RegistrationResult, validateRegistration
│   ├── validation.ts                 [M] exporta validateEmail / validatePassword (sin cambio de lógica)
│   └── messages.ts                   [M] + textos del registro, COMING_SOON, SIGNUP_SUCCESS, TERMS_*
├── application/
│   ├── ports/RegistrationGateway.ts  [N]
│   └── register.ts (+ .test)         [N] createRegister
├── infrastructure/
│   └── SimulatedRegistrationGateway.ts (+ .test)  [N]
├── ui/
│   ├── navigation/                   [N]
│   │   ├── routes.ts                 #   ROUTES y títulos de documento
│   │   ├── navigation.ts (+ .test)   #   navigate(), useCurrentPath()
│   │   └── Link.tsx (+ .test)        #   <a href> con navegación sin recarga
│   ├── layout/
│   │   ├── AuthLayout/               [→] desde features/login/LoginScreen(.module.css); + AuthLayout.test.tsx [N] (foco al navegar)
│   │   └── BrandPanel/BrandPanel.tsx [M] props title/description; + BrandPanel.test.tsx [N]
│   ├── components/
│   │   ├── Checkbox/                 [M] props opcionales error, labelSuffix, ref
│   │   ├── Modal/ (+ .test)          [N] <dialog> modal accesible
│   │   ├── Alert/Alert.tsx (+ .test) [M] props opcionales ref y tabIndex (foco en el mensaje de éxito)
│   │   └── Button/Button.tsx (+ .test) [M] prop opcional ref, solo si hace falta para devolver el foco al enlace de términos
│   │                                     (Button.module.css no cambia: Link reutiliza `.link` con `composes`)
│   ├── features/login/
│   │   ├── LoginForm.tsx (+ .test)   [M] "Regístrate" → Link; aviso de éxito y foco
│   │   ├── loginReducer.ts (+ .test) [M] successNotice
│   │   ├── useLoginForm.ts           [M] acepta initialNotice
│   │   └── LoginScreen.*             [→] AuthLayout
│   └── features/register/            [N]
│       ├── RegisterForm.tsx (+ .test)
│       ├── RegisterForm.module.css   #   gap 16px, sociales 16px (research R1)
│       ├── registerReducer.ts (+ .test)
│       ├── useRegisterForm.ts
│       └── TermsDialog.tsx           #   Modal + texto de términos
└── test/
    ├── setup.ts                      [M] sustituto de showModal/close; restaura history y document.title tras cada prueba (Const. 1.4)
    └── registerStub.ts               [N] caso de uso falso controlable (como authStub)

specs/001-login-billetera/
├── spec.md                           [M] nota de enmienda en FR-016/US5-1 → 002 FR-021
├── contracts/ui-login.md             [M] "Regístrate" pasa a ser link
└── quickstart.md                     [M] escenario 10 sin "Regístrate"
```

**Structure Decision**: se mantiene el proyecto único y la organización por capas de 001. El
registro vive en `ui/features/register/`, junto a `features/login/`. Lo compartido por ambas
pantallas sube a `ui/layout/` (composición) y `ui/navigation/` (rutas). Las pruebas siguen junto
al código.

## Diseño por responsabilidad

| Responsabilidad | Dónde | Qué hace |
|---|---|---|
| Reglas de validación | `domain/registration.ts` | `validateRegistration`, que reutiliza las reglas de correo y contraseña |
| Simulación del resultado | `application/register.ts` + `infrastructure/SimulatedRegistrationGateway.ts` | Normaliza y minimiza, espera 1 s, `success` o `unavailable` |
| Estado del formulario | `features/register/registerReducer.ts` + `useRegisterForm.ts` | Máquina de estados (data-model) y protección contra envíos repetidos |
| Presentación | `features/register/RegisterForm.tsx` | Controles, errores inline, foco al primer error, alert, ventana |
| Navegación y aviso de éxito | `ui/navigation/*` + `App.tsx` | Rutas, título, foco tras navegar, aviso de un solo uso |

## Plan de pruebas (TDD; IDs de la spec)

Cada fila se escribe primero y se ve fallar. Entre paréntesis, el archivo de prueba.

| Qué se prueba | Casos | Nivel (archivo) |
|---|---|---|
| Campos obligatorios | Envío vacío → 5 mensajes; nombre `"   "` → "Ingresa tu nombre completo"; nombre de 100 válido y de 101 inválido | Unit (`registration.test.ts`), componente (`RegisterForm.test.tsx` US2-1, US2-2) |
| Correo inválido | `usuario@`, `usuario.com`, `a@b.c`, > 254 → "Ingresa un correo electrónico válido"; espacios periféricos aceptados | Unit, componente (US2-3) |
| Longitud de contraseña | 7 → error; **8 → válida**; 128 válida, 129 error; espacios no recortados | Unit, componente (US2-4) |
| Confirmación | Vacía → "Confirma tu contraseña"; distinta (incluye mayúsculas y espacio final) → "Las contraseñas no coinciden"; cambiar la contraseña revalida | Unit, reducer, componente (US2-5, US2-9) |
| Términos | Sin marcar → error solo al enviar; marcar lo oculta | Reducer, componente (US2-6, US2-8) |
| Errores inline y conservación | `aria-invalid` y `aria-describedby` por control; valores y casilla intactos; foco al primer error; `register` no se llama; ruta sigue en `/registro` | Componente, integración `App` (US2-1, US2-7, US2-10, FR-009, FR-010) |
| Registro válido | Botón "Creando cuenta…" deshabilitado; envíos repetidos → una llamada; redirección a `/login` con el mensaje de éxito enfocado y con `role=status`; recargar (remontar) no lo muestra; escribir lo oculta | Componente, integración (US1-1 a US1-5, FR-013) |
| Fallo inesperado | El stub responde `unavailable` → `alert` "No pudimos completar el registro…", datos conservados, sin redirección | Componente (FR-028) |
| Caso de uso y adaptador | C1–C3, S1–S2 de [registration-gateway](./contracts/registration-gateway.md) (con temporizadores falsos) | Unit |
| Enlace "Inicia sesión" | `link` con `href="/login"`; clic → `/login` sin mensaje; atrás → `/registro` | Componente (`Link.test.tsx`), integración (US3-1, US3-3) |
| Rutas | `/registro` directo; `/` y `/otra` → `/login` con reemplazo; título del documento; foco en el `h1` tras navegar | Unit (`navigation.test.ts`), integración (US3-4, FR-018) |
| Google y Apple | `window.alert` espiado: llamado con exactamente "Próximamente", una vez por clic; sin cambios de ruta ni de datos; por teclado (Enter) también | Componente (US4-1, US4-2) |
| Ventana de términos | Abre `dialog` "Términos y condiciones"; Cerrar y Escape la cierran; foco vuelve al enlace; casilla sin cambios | Componente (`Modal.test.tsx`, `RegisterForm.test.tsx` US5-1 a US5-4) |
| Accesibilidad | `axe-core` sin violaciones: registro vacío, con errores, con la ventana abierta; login con mensaje de éxito | Integración (`App.test.tsx`, FR-025, SC-005) |
| **No regresión del login** | Las 111 pruebas existentes pasan sin cambios, salvo dos de `LoginForm.test.tsx` que se reescriben por FR-021: US5-1 ("Regístrate" sale del `it.each`; los otros tres elementos siguen mostrando el aviso) y FR-014 (en el orden de tabulación, "Regístrate" pasa a ser un `link`). Nuevas: el mensaje de éxito se oculta al escribir; logout no lo muestra | Todos (FR-021, FR-022, SC-004) |

Verificación manual (navegador real): [quickstart.md](./quickstart.md), con los escenarios
funcionales, la comprobación de teclado y la revisión visual en escritorio (frente a la captura
del frame) y en móvil (frente a las reglas de FR-019/FR-020, porque no existe frame móvil).

## Orden de implementación sugerido

1. **Línea base** (D1): Node y `engines`; `npm run verify` en verde.
2. **Dominio**: `validateRegistration` + mensajes (US2).
3. **Aplicación e infraestructura**: `createRegister` + `SimulatedRegistrationGateway` (FR-011, FR-028).
4. **Navegación**: `routes`, `navigate`, `useCurrentPath`, `Link`; `App` con rutas sin pantalla de
   registro todavía (US3-4).
5. **Composición compartida**: `AuthLayout` y `BrandPanel` con props, con el login en verde.
6. **Registro**: reducer, hook y `RegisterForm` (US1, US2).
7. **Login ↔ registro**: "Regístrate", "Inicia sesión" y aviso de éxito (US3, FR-013, FR-021).
8. **Google/Apple** (US4) y **ventana de términos** (US5).
9. **Accesibilidad, revisión visual, teclado** y **documentación** (README y specs de 001).

## Documentación a actualizar (Constitución 8.3)

- `README.md`: título y descripción (login y registro); rutas `/login` y `/registro`; registro
  simulado (no crea una cuenta utilizable, no guarda datos, Google/Apple muestran
  "Próximamente", los términos son ficticios); versión de Node (D1); en hosting estático hay que
  redirigir rutas a `index.html`; enlace a `specs/002-registro-usuarios/`; quitar "registro" de
  "Fuera de alcance".
- `specs/001-login-billetera/spec.md`, `contracts/ui-login.md` y `quickstart.md`: nota de
  enmienda por FR-021, sin reescribir su historia.
- `index.html`: el `<title>` inicial sigue siendo "KynWallet · Iniciar sesión"; `App` lo ajusta
  por ruta.

## Complexity Tracking

| Violación / desviación | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Módulo de navegación propio (`ui/navigation/`) donde el plan 001 decidió "sin router" | FR-018 y FR-016 exigen direcciones `/login` y `/registro`, accesibles directamente y con historial | Hash routing no da `/login`; sin URL incumple FR-018; `react-router` añade una dependencia de runtime para 2 rutas fijas (4.3, 7.4) |
| Puerto + adaptador para un registro que no hace nada | Separa la simulación de la UI (3.3), permite probar FR-028 y reproduce el patrón de 001 (8.5) | Un `setTimeout` en el hook mezcla responsabilidades y deja FR-028 sin forma de probarse |
| Sustituto de `showModal` en `setup.ts` | jsdom 30 no implementa `<dialog>` modal | Un modal propio con trampa de foco manual añade más código y más riesgo de accesibilidad que el nativo |
| Tokens accesibles distintos de Figma (heredado de 001, sin cambios en 002) | WCAG AA obligatorio (8.4). **Aprobación de diseño (8.6) pendiente a nivel de proyecto desde 001; no bloquea 002 (D4)** | Reproducir los colores exactos incumple 8.4 |
| Sin logs ni métricas (preexistente) | Demo solo-cliente sin backend ni destino de logs; `console` prohibido por lint. **Excepción EX-001 aprobada (9.1), vence el 2026-12-31** | Añadir un logger sin destino es código sin uso (4.4) |

## Decisiones pendientes antes de avanzar

Detalle y recomendación de cada una en [research.md](./research.md#decisiones-pendientes).

| ID | Decisión | Bloquea |
|---|---|---|
| ~~D1~~ | ✅ Resuelta el 2026-10-19: se aplica la recomendación (`engines`, `.nvmrc` y README a Node ≥ 22.22.2), confirmada por Julio Cesar Cisneros Palomino. Se ejecuta en T001 | — |
| **D2** | Degradado del panel de marca: el mismo del login (recomendado) o uno propio del registro | Revisión visual |
| **D3** | SVG: reutilizar los del login (recomendado) o los del archivo copia | Revisión visual |
| D4 | Aprobación de diseño de los tokens accesibles: **desviación heredada de 001, sin cambios en 002**. Queda abierta a nivel de proyecto, ligada a la aprobación pendiente del plan de 001 | No bloquea 002 (decisión del 2026-10-19) |
| ~~D5~~ | ✅ Resuelta el 2026-10-19: excepción temporal EX-001 a 8.7 (ver Excepciones registradas) | — |

No se detectan conflictos entre este plan y la spec. La spec asume en sus Assumptions la ruta
`/registro` y el logo visible en móvil; el plan los adopta tal cual.

## Excepciones registradas (Constitución 9.1)

### EX-001 · Observabilidad (regla 8.7)

| Campo | Valor |
|---|---|
| Regla exceptuada | 8.7 Observabilidad: los componentes DEBEN emitir logs estructurados y métricas. También alcanza el registro estructurado de eventos de seguridad de la regla 5.5. |
| Alcance | La demo solo-cliente de KynWallet: login (`001-login-billetera`) y registro (`002-registro-usuarios`) |
| Justificación | No hay backend, servicio de logs ni destino de métricas. Los eventos (intentos de acceso y registros simulados) usan datos ficticios y no salen del navegador. Un logger sin destino sería código sin uso (regla 4.4), y ESLint prohíbe `console` para no exponer datos (regla 5.4). |
| Mitigación | Los errores se manejan de forma explícita y sin detalles internos (regla 5.5, FR-028). Ningún dato introducido se registra ni persiste (FR-027). |
| Aprobada por | Julio Cesar Cisneros Palomino, responsable técnico del proyecto |
| Fecha de aprobación | 2026-10-19 |
| Vencimiento | **2026-12-31**. Antes de esa fecha hay que renovarla con una nueva aprobación o implementar logs estructurados. Si se incorpora un backend o un destino de logs antes, la excepción vence en ese momento. |


## Implementation Notes

Registro de `/speckit-implement` (2026-10-19).

### Línea base (T001–T002)

- D1 aplicada: `engines.node` = `^22.22.2 || >=24.15.0` en `package.json` (y en la entrada raíz
  de `package-lock.json`), `.nvmrc` con `22`, README actualizado.
- Con Node 22.23.1: `npm ci` y `npm run verify` en verde; 111 pruebas en 15 archivos. No hubo
  que corregir nada.
- `package-lock.json` ya traía cambios locales previos a esta feature (se quitaron campos
  `libc` de dependencias opcionales). No se tocaron.

### Resolución de D1–D5 (T061)

| ID | Resultado |
|---|---|
| D1 | Aplicada (ver arriba) |
| D2 | **Se aplicó la recomendación de forma provisional**: el registro usa el mismo degradado del login (`--brand-gradient`). Falta la confirmación de diseño; si el degradado del archivo copia es intencional, el cambio es el previsto en research.md (D2) |
| D3 | **Se aplicó la recomendación de forma provisional**: se reutilizan los SVG del login (`logo-mark.svg`, `eye.svg`, `social-placeholder.svg`). Falta la confirmación de diseño |
| D4 | Sin cambios: `src/ui/styles/tokens.css` no se modificó y 002 no crea tokens nuevos. La desviación de colores sigue heredada de 001 y pendiente de aprobación de diseño a nivel de proyecto; hay que mencionarlo en el pull request |
| D5 | EX-001 vigente (vence el 2026-12-31); hay que citarla en el pull request |

### Desviaciones menores respecto a tasks.md

- **Consumo del aviso de éxito (T033)**: la regla `react-hooks/set-state-in-effect` del lint
  prohíbe volver `signupCompleted` a `false` dentro de un efecto. `App` lo consume al **salir** de
  `/login`, ajustando el estado durante el render (patrón de React para reaccionar a un cambio de
  props). El efecto observable es el mismo: el login lo recibe una sola vez como estado inicial,
  y volver a `/login` o recargar no lo muestra (US1-4, US3-1).
- **`SimulatedRegistrationGateway.register()`** no declara el parámetro de la petición, porque la
  simulación no lo usa y el lint no permite parámetros sin usar. Sigue cumpliendo el puerto
  `RegistrationGateway`; sus pruebas lo usan a través del puerto.
- **`MESSAGES.TERMS_TEXT`** es una lista de párrafos (3), no una cadena.
- **`Checkbox`** ahora envuelve la casilla en un contenedor (`.field`) para mostrar el error
  debajo sin desmontar el `input`. "Recordarme" sigue funcionando igual (sus pruebas pasan sin
  cambios).
- **`Modal`**: si el navegador no movió el foco dentro de la ventana al abrirla, lo lleva a
  "Cerrar". En navegadores reales lo mueve `showModal()`; en jsdom, este respaldo.
- **Build**: `Link.module.css` reutiliza el estilo de enlace con
  `composes: link from '../components/Button/Button.module.css'` (T017). Vite muestra por eso el
  aviso de PostCSS "did not pass the `from` option"; no rompe nada: el bundle aplica ambas
  clases. `npm run verify` termina en verde.

### Verificación final (T059)

- `npm run verify` con Node 22.23.1: lint, formato, tipos, build, auditorías y secretos en verde.
- 240 pruebas en 25 archivos. Cobertura: sentencias 98,4 %, ramas 96,56 %, funciones 100 %,
  líneas 100 %.
- Las 111 pruebas previas siguen pasando. Solo cambiaron las dos de `LoginForm.test.tsx`
  previstas por FR-021: US5-1 (sale "Regístrate" del `it.each`) y FR-014 ("Regístrate" es un
  `link`).

### Pendiente

- **T060**: la validación manual en navegador real (escenarios 1–18, teclado y revisión visual
  frente al frame `04 · Registro` y en 1024, 375 y 320px) está **sin hacer**. La inercia del
  fondo y la retención del foco del `<dialog>` solo se pueden comprobar ahí.

### Cambio posterior: complejidad de la contraseña (FR-029, US2-11)

- Pedido tras la implementación: "12345678" se aceptaba. Ahora la contraseña del registro exige
  mínimo 8 caracteres, al menos una mayúscula, una minúscula y un carácter especial. Se muestra un
  mensaje a la vez (longitud → mayúscula → minúscula → especial).
- Solo aplica al registro (`validateNewPassword` en `src/domain/registration.ts`, que reutiliza
  `validatePassword` para la longitud). El login conserva la regla de 001 para no rechazar las
  contraseñas existentes de las cuentas de demostración.
- Confirmado después: también se exige al menos un número (orden de mensajes: longitud →
  mayúscula → minúscula → número → especial).
- Actualizados spec (Clarifications, US2-11, FR-008, FR-029, Assumptions), data-model,
  contracts/ui-register.md y quickstart (contraseña de ejemplo `Clave-segura1!`).

### Cambio posterior: la cuenta registrada sirve para iniciar sesión (FR-014, FR-030)

- Reportado tras la implementación: "una vez registrado me dice servicio no disponible". Causa:
  sin `.env.local` no hay cuentas de demostración y el login responde `unavailable` a cualquier
  correo; y aunque las hubiera, la cuenta registrada no existía (FR-014 original).
- Decisión del usuario: la cuenta registrada debe servir, **solo en memoria** (se pierde al
  recargar). Se descartó `localStorage` por la Constitución 5.4 (contraseñas sin cifrar en el
  navegador).
- Diseño: `InMemoryAccountStore` (infraestructura) compartido, creado en `main.tsx`.
  `SimulatedRegistrationGateway(store, { reservedEmails })` guarda la cuenta o responde
  `email-taken`; `InMemoryAuthGateway(accounts, { registered: store })` busca primero en el
  almacén. Sin configuración, solo las cuentas registradas inician sesión; el resto sigue en
  `unavailable` (001 C4 sin cambios).
- El puerto ahora recibe `password` (no la confirmación). Nuevo resultado `email-taken` con el
  mensaje "Ya existe una cuenta con este correo" en el campo de correo y foco en él (FR-030,
  US2-12). Nuevo mensaje de éxito: "Registro completado (demostración). Ya puedes iniciar sesión
  con tu nueva cuenta."; el texto de los términos se ajustó.
- TDD: pruebas nuevas M1–M4, S3–S4, C3–C4, US1-6 (gateway e integración en `App` con el cableado
  real, con y sin cuentas de demostración) y US2-12 (reducer y componente). `npm run verify`: 0,
  268 pruebas, cobertura 98.55 % / 96.98 % / 100 % / 100 %.
- Actualizados spec (Clarifications, US1-6, US2-12, caso límite, FR-008, FR-012, FR-014, FR-030,
  Assumptions), data-model, research R7, contratos, quickstart (escenarios 2, 6 y 6b) y README.

### Cambio posterior: cerrar los términos marca la casilla (US5-4, FR-017)

- Pedido tras la implementación: al abrir la ventana de términos y cerrarla, la casilla debe
  quedar seleccionada. `RegisterForm` llama a `toggleTerms(true)` en el `onClose` de
  `TermsDialog`, que cubre "Cerrar" y Escape; el reducer recalcula el error de la casilla.
- Pruebas US5-4 reescritas (red → green): cierre con "Cerrar" y con Escape, casilla ya marcada,
  abrir sin cerrar no marca y el error de términos desaparece.
- Actualizados spec (Clarifications, US5-4, caso límite, FR-017), contracts/ui-register.md y
  quickstart (escenario 14).

