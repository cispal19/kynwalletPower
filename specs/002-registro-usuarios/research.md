# Research: Registro de Usuarios de KynWallet

**Feature**: `002-registro-usuarios` | **Date**: 2026-10-19

Todas las incógnitas del Technical Context quedan resueltas aquí. Las decisiones que necesitan
aprobación de una persona se listan al final ("Decisiones pendientes").

## R0. Línea base del proyecto existente

Revisión del estado real antes de planificar (Constitución I: las pruebas existentes son el
contrato que no puede romperse).

| Elemento | Estado encontrado | Consecuencia |
|---|---|---|
| Pruebas | 15 archivos, 111 pruebas. **Fallan al arrancar con Node 20.20.2** (`TypeError … reading 'bind'` en `undici`); **pasan 111/111 con Node 22.23.1** | `jsdom@30` exige Node `^22.22.2 \|\| ^24.15 \|\| >=26` y `undici@8` exige `>=22.19`, pero `package.json` declara `engines.node >=20` y el README dice "Node.js 20 LTS". Ver D1. |
| Navegación | No existe: `App.tsx` renderiza siempre `LoginScreen` + `LoginForm`. El plan de 001 descartó un router (YAGNI) | Se necesita un mecanismo nuevo (R2) |
| "Regístrate" | `Button variant="link"` que muestra "Función no disponible en esta demostración" | Pasa a navegar a `/registro` (FR-021) |
| Mensajes globales | `Alert` (`tone: error → role=alert`, `info → role=status`) y estado `notice` del `loginReducer` | Se reutilizan para el mensaje de éxito (R3) |
| Panel de marca | `BrandPanel` con textos fijos del login; `LoginScreen` contiene la composición de dos columnas | Se parametrizan textos y se comparte la composición (R5) |
| Validación | `validateEmail`/`validatePassword` privadas en `src/domain/validation.ts` | Se exportan y se reutilizan (R4), sin cambiar su comportamiento |
| Plan 001 vs. código | El plan dice que el caso de uso `authenticate` "valida y delega"; el código solo normaliza el correo y delega (la validación ocurre en la UI vía `validateCredentials`) | Sin impacto funcional. El registro sigue el patrón real del código: la UI valida con funciones del dominio y el caso de uso delega. |
| Observabilidad (Const. 8.7) | Ni el plan ni el código de 001 emiten logs; ESLint prohíbe `console` | Desviación preexistente; cubierta por la excepción EX-001 (plan.md) |

## R1. Referencia visual (Figma `04 · Registro`, nodo `31:2`)

Frame accesible mediante el MCP de Figma (`get_metadata`, `get_design_context`,
`get_screenshot`). `get_variable_defs` devuelve `{}`: el archivo copia **no tiene variables**, los
colores están escritos como valores. No existe frame móvil.

**Colores** (comparados con `src/ui/styles/tokens.css`):

| Uso en el frame | Valor Figma | Token existente | Observación |
|---|---|---|---|
| Fondo panel formulario, inputs, botones sociales | `#ffffff` | `--neutral-0` | igual |
| Bordes de inputs, casilla, sociales, divisor | `#d7d9e6` | `--neutral-300` (accesible: `--neutral-border`) | igual |
| Placeholder | `#a9abc2` | `--neutral-400` (accesible: `--neutral-600`) | igual |
| Subtítulo, "o regístrate con", "¿Ya tienes cuenta?" | `#8a8ba8` | `--neutral-500` `#8a8ca8` | diferencia de 1 unidad en G; se trata como el mismo token |
| Etiquetas, texto de términos | `#3d3f5c` | `--neutral-700` | igual |
| Título, texto sociales | `#16182c` | `--neutral-900` | igual |
| Botón "Crear cuenta" | `#ff6b3d` | `--brand-500` (accesible: `--brand-700`) | igual |
| Enlaces "términos y condiciones", "Inicia sesión" | `#ef5226` | `--brand-600` (accesible: `--brand-700`) | igual |
| Degradado del panel de marca | `linear-gradient(70.73deg, #ff8a65 31.698%, #ef5226 83.455%)` | `--brand-gradient`: `121.19deg, #ff8a65 0%, #ef5226 70.71%` | **distinto ángulo y paradas** (ver D2) |
| Tarjeta, chip | `rgba(255,255,255,.16)`, borde `.35`, chip `rgba(255,217,128,.9)` | `--card-*` | igual |
| Línea del chip | `rgba(22,24,44,.15)`, 4px | — | el `BrandPanel` actual no la dibuja; no se añade para no alterar el login (fuera de alcance) |

**Tipografía** (Inter, ya instalada): título 30px Bold; subtítulo 16px Regular; etiquetas 14px
Medium; placeholder/valor 15px; texto de términos 14px Medium con enlace 14px SemiBold; botón 16px
SemiBold; divisor 13px Regular; sociales 15px SemiBold; pie 14px (enlace SemiBold). Panel de marca:
logo 26px Bold, titular 44px Bold (line-height 1.08), texto 17px (line-height 1.5). Coincide con
los estilos existentes.

**Dimensiones y espaciado** (escritorio 1440 × 1024):

| Elemento | Valor | Comparación con el login |
|---|---|---|
| Panel de marca | 620px, padding 64/56px | igual |
| Columna del formulario | 400px, x = 820 | igual |
| Inputs / botón principal | 52px, radio 12px, borde 1.5px | igual |
| Sociales | 2 × 192px, alto 48px, separación 16px (820→1028, 192 de ancho) | el login usa `gap: 12px` en una rejilla de 2 columnas |
| Casilla | 20px, radio 6px, borde 1.5px; texto a 12px de la casilla | `Checkbox` usa `gap: 8px` |
| Título → subtítulo | 6px | igual (8px en código) |
| Subtítulo → primera etiqueta | ~21px | — |
| Etiqueta → input | 7px | `TextField` usa `gap: 8px` |
| Input → siguiente etiqueta | **16px** | login: **22px** (`gap` del formulario) |
| Última contraseña → casilla | 18px; casilla → botón 16px | — |
| Botón → divisor ~20px; divisor → sociales ~22px; sociales → pie 20px | — | similares al login |
| Altura total del formulario | 140 → 815 (675px) | centrado vertical como el login |

**Distribución**: misma composición de dos paneles que el login; el formulario del registro es
más compacto (16px entre campos) para alojar cuatro campos y la casilla.

**Componentes**: logo, campos de texto, campos de contraseña con icono de visibilidad, casilla,
botón principal, divisor con texto, dos botones sociales, pie con enlace. Todos existen en el
proyecto.

**Recursos gráficos**: los SVG del archivo copia son marcadores de posición y **difieren** de los
del proyecto: el logo es una elipse 10×28 + un círculo 14px translúcido (el proyecto usa
`logo-mark.svg`, rectángulo redondeado 20×44 con círculo naranja); el ojo es una elipse rellena
`#A9ABC2` al 50 % (el proyecto: elipse con trazo `#8A8CA8`); el icono social es `#D7D9E6` (el
proyecto: `#8A8CA8`). Ver D3.

**Verificación visual**: se hará sobre la captura del frame (escritorio). Para móvil no existe
referencia; se verificará solo contra las reglas de FR-019/FR-020, sin inventar detalles.

## R2. Navegación entre `/login` y `/registro`

- **Decision**: módulo propio mínimo en `src/ui/navigation/` basado en la History API del
  navegador:
  - `routes.ts`: constantes `ROUTES = { login: '/login', register: '/registro' }` (fuente única).
  - `useCurrentPath()`: lee `window.location.pathname` y se suscribe a `popstate` y a un evento
    propio emitido por `navigate` (`useSyncExternalStore`).
  - `navigate(path, { replace? })`: `history.pushState`/`replaceState` + notificación.
  - `Link`: `<a href>` real que intercepta el clic simple (sin teclas modificadoras) y llama a
    `navigate`; con teclado se activa con Enter como cualquier enlace.
  - `App` resuelve la ruta: `/login` → login, `/registro` → registro, cualquier otra
    (incluida `/`) → `navigate('/login', { replace: true })`.
- **Rationale**: dos rutas fijas no justifican una dependencia (Constitución 4.2, 4.3, 7.4). La
  History API cubre direcciones directas, atrás/adelante y recarga. `vite dev` y `vite preview`
  ya devuelven `index.html` para cualquier ruta (`appType: 'spa'`), así que no hay que configurar
  nada para la demo.
- **Alternatives considered**:
  - `react-router` (MIT, mantenido): resuelve lo mismo con una dependencia de runtime y una API
    mucho mayor de lo necesario; el plan 001 ya lo descartó. Reconsiderar si aparecen rutas con
    parámetros o anidadas.
  - Enrutamiento por hash (`#/registro`): más simple, pero la spec exige la dirección `/login`.
  - Estado en memoria sin URL: incumple FR-018 (direcciones accesibles directamente e historial).
- **Note**: si la demo se publica en un hosting estático, este debe redirigir las rutas
  desconocidas a `index.html`; se documenta en el README.

## R3. Transmisión y presentación del mensaje de éxito

- **Decision**: aviso de un solo uso en memoria, propiedad de `App`:
  1. `RegisterForm` llama a `onRegistered()` cuando el caso de uso responde `success`.
  2. `App` guarda `signupCompleted = true` y llama a `navigate('/login', { replace: true })`
     (reemplaza la entrada de `/registro` para que "atrás" no vuelva a un formulario enviado).
  3. Al renderizar el login, `App` le pasa `initialNotice = MESSAGES.SIGNUP_SUCCESS` y, en el mismo
     ciclo, consume el aviso (`signupCompleted = false`). El `loginReducer` recibe el aviso como
     estado inicial (inicializador perezoso de `useReducer`).
  4. El login lo muestra con el `Alert` existente (`tone="info"`, `role="status"`) encima del
     título, y mueve el foco a ese mensaje (`tabIndex=-1`) para garantizar su lectura, igual que
     hace `WelcomeView` con su título.
  5. Escribir en cualquier campo del login oculta el aviso de éxito (FR-013). El aviso "Función no
     disponible…" conserva su comportamiento actual.
- **Rationale**: reutiliza `Alert`, el estado de avisos del reducer y la inyección por props ya
  usada en `App`. No pasa datos personales por la URL, el historial ni el almacenamiento
  (FR-027, Constitución 5.4). Al ser memoria, recargar o volver a entrar en `/login` no lo
  muestra (FR-013).
- **Alternatives considered**: `history.state` (sobrevive a la recarga, habría que borrarlo a
  mano); parámetro `?registered=1` (visible, se puede compartir y reaparece al recargar);
  `sessionStorage` (persiste y lo prohíbe FR-027); `role="status"` sin mover el foco (los lectores
  de pantalla no anuncian de forma fiable una región viva que ya trae contenido al montarse).

## R4. Validación del registro

- **Decision**: `validateRegistration(data) → RegistrationErrors` en el dominio
  (`src/domain/registration.ts`), función pura que:
  - reutiliza `validateEmail` y `validatePassword` de `src/domain/validation.ts` (se exportan; sin
    cambio de comportamiento) para que correo y contraseña tengan una sola fuente (Const. 4.1, H7);
  - nombre: `trim()` no vacío → si no, "Ingresa tu nombre completo"; ≤ 100 caracteres tras trim;
  - confirmación: vacía → "Confirma tu contraseña"; distinta (comparación exacta, sin recortar ni
    normalizar mayúsculas) → "Las contraseñas no coinciden";
  - términos: `false` → "Debes aceptar los términos y condiciones".
  - Los textos se añaden a `src/domain/messages.ts`.
- **Momento**: igual que el login. Cada campo se valida al salir de él y al enviar; los errores
  visibles se recalculan en cada cambio de los campos ya tocados. Así, cambiar la contraseña
  vuelve a evaluar la confirmación (US2-9). El error de términos solo se marca al enviar.
- **Rationale**: misma forma que `validateCredentials`, probada con pruebas unitarias puras.

## R5. Reutilización de la composición y del panel de marca

- **Decision**:
  - Mover `LoginScreen` (+ CSS) a `src/ui/layout/AuthLayout/` como `AuthLayout`, sin cambiar su
    marcado ni sus puntos de corte. Recibe `brand` (titular y texto) y `children`.
  - `BrandPanel` recibe `title: ReactNode` y `description: string` por props. El login pasa sus
    textos actuales ("Tu dinero,<br/>sin fronteras." …) y el registro los suyos. La tarjeta y el
    logo no cambian.
  - Degradado: según D2.
  - Formulario de registro con su propio CSS (`gap: 16px`, sociales con 16px de separación);
    el del login no cambia.
- **Rationale**: es el cambio mínimo para reutilizar sin duplicar (Const. 4.1, 8.5). Las pruebas
  del login lo protegen: el marcado del login no cambia.
- **Alternatives considered**: duplicar `LoginScreen` como `RegisterScreen` (duplica
  composición y puntos de corte); dar a `LoginScreen` props de registro (nombre engañoso).

## R6. Responsive

- **Decision**: reutilizar los puntos de corte del login (research 001 R10): **≥ 960px** dos
  paneles (43 % / resto hasta 1280px, 620px fijos desde 1280px); **< 960px** solo el formulario,
  con la franja del logo (se ocultan titular, texto y tarjeta); **< 480px** padding lateral de
  16px.
- **Rationale**: el frame mide 1440px y la columna de marca solo cabe junto a un formulario de
  400px a partir de ~960px. Mantener el mismo punto de corte evita que login y registro cambien
  de distribución en anchos distintos. El registro es más alto (675px de formulario), así que en
  pantallas bajas se permite el desplazamiento vertical; el horizontal sigue prohibido.

## R7. Caso de uso y simulación del registro

- **Decision**: seguir el patrón real del login.
  - Dominio: `RegistrationData`, `RegistrationResult = { kind: 'success' } | { kind:
    'email-taken' } | { kind: 'unavailable' }`.
  - Aplicación: puerto `RegistrationGateway { register(request): Promise<RegistrationResult> }` y
    caso de uso `createRegister(gateway)`. Normaliza nombre (trim) y correo
    (`normalizeEmail`), envía la contraseña pero no la confirmación (minimización, Const. 5.4) y convierte
    cualquier excepción en `unavailable` (FR-028).
  - Infraestructura: `SimulatedRegistrationGateway` espera 1000 ms (configurable para pruebas) y
    guarda la cuenta en un `InMemoryAccountStore` compartido con `InMemoryAuthGateway`, o responde
    `email-taken` (FR-014, FR-030).
  - `main.tsx` (raíz de composición) crea el gateway y pasa `register` a `App`.
- **Rationale**: separa presentación (UI), reglas (dominio) y simulación (infraestructura) con la
  misma inyección de dependencias que ya usa el login (Const. 2.5, 3.x). Permite probar FR-028 con
  un doble de pruebas. Cambiar a un backend real solo cambiaría el adaptador.
- **Alternatives considered**: un `setTimeout` dentro del hook de la UI (mezcla simulación con
  presentación y deja FR-028 sin forma de probarse); reutilizar `AuthGateway` (mezcla
  responsabilidades, Const. 2.4).
- **Datos sensibles**: el registro no se agrega a `VITE_DEMO_USERS`. La cuenta vive solo en
  memoria (se pierde al recargar), sin almacenamiento del navegador ni red. *Revisado tras la
  implementación*: la decisión original (cuenta no utilizable) se cambió a petición del usuario;
  se descartó `localStorage` porque dejaría contraseñas sin cifrar en el navegador (Const. 5.4).

## R8. Aviso "Próximamente" (Google y Apple)

- **Decision**: `window.alert('Próximamente')` desde el formulario de registro. El texto vive en
  `MESSAGES.COMING_SOON`. Los botones son `SocialButton` existentes; solo cambia su `onClick`.
- **Pruebas**: `vi.spyOn(window, 'alert').mockImplementation(() => {})` y comprobación del texto
  exacto, de que se llamó una vez por clic y de que los valores no cambiaron. jsdom no implementa
  `alert`, por eso se sustituye.
- **Notes**: el diálogo nativo es accesible y devuelve el foco al botón al cerrarse en los
  navegadores objetivo; se comprueba a mano (quickstart). El login no cambia (H3 de la spec).

## R9. Ventana de términos y condiciones

- **Decision**: elemento nativo `<dialog>` abierto con `showModal()`, en un componente
  reutilizable `Modal` (`src/ui/components/Modal/`) con título (`aria-labelledby`), contenido y
  botón "Cerrar". El navegador aporta la modalidad (fondo inerte), el cierre con Escape (evento
  `cancel`) y el anuncio como diálogo. El componente devuelve el foco explícitamente al elemento
  que lo abrió, en lugar de confiar en la restauración del navegador.
- **Texto**: `TERMS_TEXT` en `src/domain/messages.ts`, ficticio y en español, con la mención
  "Documento de demostración sin valor legal".
- **Pruebas**: jsdom 30 **no implementa** `HTMLDialogElement.showModal` (comprobado). Se añade a
  `src/test/setup.ts` un sustituto mínimo de `showModal`/`close` (atributo `open` + evento
  `close`) para probar apertura, cierre con botón y con Escape (evento `cancel`), retorno del foco
  y que la casilla no cambia. La retención del foco y la inercia del fondo dependen del navegador
  y se verifican a mano (quickstart).
- **Alternatives considered**: modal propio con `div role="dialog"` y trampa de foco manual (más
  código y más riesgo de accesibilidad); librería de diálogos (dependencia innecesaria).

## R10. Casilla de términos con enlace

- **Decision**: ampliar `Checkbox` sin romper su uso actual: props opcionales `error`,
  `labelSuffix` (contenido interactivo tras la etiqueta) y `ref`. Estructura:
  `<input aria-labelledby={textId} aria-invalid aria-describedby={errorId}>` +
  `<span id={textId}><label htmlFor>Acepto los</label> <Button variant="link">términos y
  condiciones</Button></span>` + error.
- **Rationale**: HTML no permite un botón dentro de `<label>`. Con `aria-labelledby` la casilla se
  anuncia "Acepto los términos y condiciones", hacer clic en "Acepto los" la marca, y el botón del
  enlace no la cambia (FR-017).
- **Note**: "términos y condiciones" abre una ventana, no navega; por eso es un `button` con
  aspecto de enlace (patrón existente `Button variant="link"`).

## R11. Accesibilidad y foco

- Orden de tabulación (FR-023): nombre → correo → contraseña → visibilidad → confirmación →
  visibilidad → casilla → "términos y condiciones" → "Crear cuenta" → Google → Apple → "Inicia
  sesión".
- Al enviar con errores, el foco va al primer control con error, en ese orden.
- Al cambiar de ruta: se actualiza `document.title` ("KynWallet · Iniciar sesión" / "KynWallet ·
  Crear cuenta", WCAG 2.4.2) y el foco pasa al `h1` de la pantalla nueva (o al mensaje de éxito,
  R3). En la carga inicial no se mueve el foco.
- Autocompletado: `name`, `email`, `new-password` (ambas contraseñas).
- Auditoría `axe-core` (helper existente) sobre: registro vacío, con todos los errores, con la
  ventana de términos abierta, y login con el mensaje de éxito.

## R12. Estrategia de pruebas (Constitución I y 8.1)

- **TDD obligatorio**: cada tarea empieza con una prueba que falla (Rojo → Verde → Refactor). El
  primer paso de implementación es dejar la línea base en verde (D1).
- **Herramientas existentes**: Vitest 5, Testing Library, `user-event`, jsdom, `axe-core`, umbral
  de cobertura del 80 %. No se añaden dependencias.
- **Niveles**: unitarias (dominio, caso de uso, gateway, reducer, rutas), de componente
  (`Checkbox`, `Modal`, `Link`, `RegisterForm`, `LoginForm`) e integración (`App`: rutas,
  redirección, mensaje de éxito, atrás/adelante).
- **Trazabilidad (9.2)**: cada `it(...)` empieza con el ID del escenario o requisito (`US2-6`,
  `FR-015`), como en 001.
- **No regresión**: las 111 pruebas existentes deben seguir pasando. Solo se modifica una, la de
  "Regístrate" (US5-1 de 001), por FR-021: primero se cambia la prueba (Rojo) y después el código.
- **Sin E2E** (como en 001, YAGNI). La revisión visual y la comprobación de teclado en navegador
  real se hacen a mano siguiendo el quickstart.

## Decisiones pendientes

| ID | Decisión | Recomendación | Bloquea |
|---|---|---|---|
| D1 | Versión de Node: las pruebas no arrancan con Node 20, que es lo que declaran `package.json` y el README | Declarar `engines.node: "^22.22.2 \|\| >=24.15.0"` (lo que exige `jsdom`), añadir `.nvmrc` con `22` y actualizar el README. Alternativa: bajar `jsdom` a una versión compatible con Node 20 (cambia una dependencia probada). | ✅ **Resuelta el 2026-10-19**: se aplica la recomendación (Node ≥ 22.22.2, `.nvmrc` con `22`, README actualizado), confirmada por Julio Cesar Cisneros Palomino. Se ejecuta en T001 |
| D2 | Degradado del panel de marca: el frame de registro usa otro ángulo y otras paradas que el login | Mantener el degradado del login en ambas pantallas: la diferencia parece accidental del archivo copia y SC-006 no la cubre. Si diseño confirma que es intencional, añadir `--brand-gradient-signup` y una prop `variant` en `BrandPanel` (cambio de ~5 líneas). | La revisión visual (SC-006) |
| D3 | Recursos gráficos del archivo copia (logo, ojo, icono social) difieren de los del proyecto | Reutilizar los SVG existentes del login para que ambas pantallas muestren la misma marca y los mismos iconos; todos son marcadores de posición. | La revisión visual |
| D4 | Colores accesibles distintos de Figma (heredado de 001, pendiente de aprobación de diseño, Const. 8.6) | Aplicar los mismos tokens accesibles en el registro, sin crear tokens nuevos. **Decisión del 2026-10-19**: se trata como desviación heredada de 001; no bloquea 002 y sigue abierta a nivel de proyecto | No bloquea 002 |
| D5 | Observabilidad (Const. 8.7): la demo no emite logs ni métricas (tampoco el login) | ✅ **Resuelta el 2026-10-19**: excepción temporal EX-001, aprobada por Julio Cesar Cisneros Palomino, vence el 2026-12-31 (plan.md, Excepciones registradas) | — |
