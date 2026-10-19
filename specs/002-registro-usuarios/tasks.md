---

description: "Task list for 002-registro-usuarios"
---

# Tasks: Registro de Usuarios de KynWallet

**Input**: Design documents from `/specs/002-registro-usuarios/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-register.md,
contracts/registration-gateway.md, quickstart.md

**Tests**: OBLIGATORIAS. La Constitución (Principio I, TDD) exige escribir cada prueba antes del
código y verla fallar (Rojo → Verde → Refactor). Dentro de cada fase, las tareas de prueba van
primero.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5 de spec.md)
- Proyecto único en la raíz del repositorio; las pruebas viven junto al código (`*.test.ts(x)`).
- Trazabilidad (Constitución 9.2): cada `it(...)` DEBE empezar con el ID del escenario o
  requisito, p. ej. `it('US2-6: …')`, `it('FR-028: …')`.
- **No se añaden dependencias.** Ejecuta las pruebas con Node ≥ 22.22.2 (ver T001).
- Textos exactos: [contracts/ui-register.md](./contracts/ui-register.md). Reglas:
  [data-model.md](./data-model.md).

---

## Phase 1: Setup (Línea base)

**Purpose**: Dejar en verde la línea base existente antes de cualquier cambio (TDD exige partir
de pruebas que pasan).

- [X] T001 Aplicar D1 (research.md; **confirmada el 2026-10-19** por Julio Cesar Cisneros Palomino con la recomendación): en `package.json` cambiar `engines.node` de `">=20"` a `"^22.22.2 || >=24.15.0"` (requisito de `jsdom@30`/`undici@8`) y crear `.nvmrc` con el contenido `22`
- [X] T002 Con Node 22 (`nvm use`), ejecutar `npm ci` y `npm run verify`; confirmar que pasan las 111 pruebas existentes en 15 archivos, que la cobertura es ≥ 80 % y que no hay errores. Si algún control falla, corregirlo antes de continuar y anotarlo en `specs/002-registro-usuarios/plan.md` (sección Implementation Notes)

**Checkpoint**: línea base en verde con Node 22

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: dominio, caso de uso, simulación, navegación y composición compartida que todas las
historias usan.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests (escribir primero y verlas fallar) ⚠️

- [X] T003 [P] Crear `src/domain/registration.test.ts` para `validateRegistration` (data-model.md, RegistrationData). Casos: nombre `''` y `'   '` → "Ingresa tu nombre completo"; nombre con 100 caracteres tras `trim` válido y con 101 → "El nombre no puede superar 100 caracteres"; nombre `'  Ana  '` válido; correo `''` → "Ingresa tu correo electrónico"; `'usuario@'`, `'usuario.com'`, `'a@b.c'` y correo de 255 caracteres → "Ingresa un correo electrónico válido"; correo `'  Ana@Example.com '` válido; contraseña `''` → "Ingresa tu contraseña"; `'1234567'` (7) → "La contraseña debe tener al menos 8 caracteres"; `'12345678'` (exactamente 8) válida; 128 válida; 129 → "La contraseña no puede superar 128 caracteres"; la contraseña no se recorta (`'        '`, 8 espacios, es válida); confirmación `''` → "Confirma tu contraseña"; confirmación distinta, distinta solo en mayúsculas (`'Clave123'`/`'clave123'`) y con un espacio final (`'clave 123'`/`'clave 123 '`) → "Las contraseñas no coinciden"; `acceptedTerms: false` → "Debes aceptar los términos y condiciones"; datos completos y válidos → `{}`; envío vacío → errores en las 5 claves
- [X] T004 [P] Crear `src/application/register.test.ts` según contracts/registration-gateway.md: C1 con gateway falso que responde `success` → `{ kind: 'success' }` y el gateway recibe exactamente `{ fullName: 'Ana Pérez', email: 'ana@example.com' }` a partir de `fullName: '  Ana Pérez '` y `email: ' ANA@Example.com '`; C2 gateway que lanza o rechaza → `{ kind: 'unavailable' }` sin propagar; C3 el argumento recibido por el gateway no tiene las claves `password` ni `confirmPassword`
- [X] T005 [P] Crear `src/infrastructure/SimulatedRegistrationGateway.test.ts` con `vi.useFakeTimers()`: S1 no resuelve antes de `delayMs` y resuelve `{ kind: 'success' }` al cumplirse (por defecto 1000 ms, configurable con `{ delayMs }`); S2 no escribe en `localStorage`/`sessionStorage` ni llama a `fetch` (espías)
- [X] T006 [P] Crear `src/ui/navigation/navigation.test.ts`: `ROUTES.login === '/login'` y `ROUTES.register === '/registro'`; `navigate('/registro')` usa `history.pushState` y `navigate('/login', { replace: true })` usa `history.replaceState`; un componente de prueba con `useCurrentPath()` se vuelve a renderizar tras `navigate` y tras un evento `popstate`; `resolveRoute('/login')` → `'login'`, `resolveRoute('/registro')` → `'register'`, `resolveRoute('/')` y `resolveRoute('/otra')` → `null`; `DOCUMENT_TITLES` contiene "KynWallet · Iniciar sesión" y "KynWallet · Crear cuenta". Restaurar `history` con `history.replaceState(null, '', '/')` en `afterEach`
- [X] T007 [P] Crear `src/ui/navigation/Link.test.tsx`: renderiza `link` con `href` dado; un clic simple llama a `preventDefault` y cambia `location.pathname`; con `ctrlKey`/`metaKey` no intercepta; se activa con Enter desde el teclado; acepta `className` y `children`
- [X] T008 [P] Crear `src/ui/layout/BrandPanel/BrandPanel.test.tsx`: con `title="Comienza tu camino financiero."` y `description="Crea tu cuenta…"` muestra ambos textos; el logo "KynWallet" está presente; la tarjeta tiene `aria-hidden="true"`
- [X] T009 [P] Preparar el soporte de pruebas antes de las pruebas que lo usan: crear `src/test/registerStub.ts` (como `src/test/authStub.ts`): `createRegisterStub(result: RegistrationResult = { kind: 'success' })` que devuelve `{ register: vi.fn(...), defer(), release() }` (solo importa tipos del dominio). Además, en el `afterEach` de `src/test/setup.ts`, añadir `history.replaceState(null, '', '/')` y restaurar `document.title` a 'KynWallet · Iniciar sesión', para que ninguna prueba dependa del orden de ejecución (Constitución 1.4)

### Implementation

- [X] T010 Añadir a `MESSAGES` en `src/domain/messages.ts` (sin tocar los existentes): `FULL_NAME_REQUIRED: 'Ingresa tu nombre completo'`, `FULL_NAME_TOO_LONG: 'El nombre no puede superar 100 caracteres'`, `CONFIRM_PASSWORD_REQUIRED: 'Confirma tu contraseña'`, `PASSWORDS_MISMATCH: 'Las contraseñas no coinciden'`, `TERMS_REQUIRED: 'Debes aceptar los términos y condiciones'`, `SIGNUP_SUCCESS: 'Registro completado (demostración). Inicia sesión con una cuenta de demostración.'`, `SIGNUP_UNAVAILABLE: 'No pudimos completar el registro. Intenta más tarde.'`, `COMING_SOON: 'Próximamente'`, `TERMS_TITLE: 'Términos y condiciones'` y `TERMS_TEXT` (texto ficticio en español de 2–3 párrafos que incluya la frase exacta "Documento de demostración sin valor legal")
- [X] T011 En `src/domain/validation.ts`, exportar `validateEmail` y `validatePassword` (hoy privadas) sin cambiar su lógica; las pruebas de `src/domain/validation.test.ts` deben seguir pasando
- [X] T012 Crear `src/domain/registration.ts` hasta pasar T003: tipos `RegistrationData` (`fullName`, `email`, `password`, `confirmPassword`: string; `acceptedTerms`: boolean), `RegistrationErrors = Partial<Record<keyof RegistrationData, string>>`, `RegistrationResult = { kind: 'success' } | { kind: 'unavailable' }`, constante `FULL_NAME_MAX_LENGTH = 100` y `validateRegistration(data)`, que reutiliza `validateEmail`/`validatePassword` y compara la confirmación con `!==` sin recortar
- [X] T013 [P] Crear `src/application/ports/RegistrationGateway.ts` con `RegistrationRequest = { fullName: string; email: string }` e `interface RegistrationGateway { register(request: RegistrationRequest): Promise<RegistrationResult> }`
- [X] T014 Crear `src/application/register.ts` hasta pasar T004: `export type Register = (data: RegistrationData) => Promise<RegistrationResult>` y `createRegister(gateway)` con `try/catch` → `unavailable`, `fullName.trim()` y `normalizeEmail(email)`, sin pasar contraseñas (mismo estilo que `src/application/authenticate.ts`)
- [X] T015 Crear `src/infrastructure/SimulatedRegistrationGateway.ts` (depende de T012 y T013) hasta pasar T005: `class SimulatedRegistrationGateway implements RegistrationGateway`, constructor `(options: { delayMs?: number } = {})`, `DEFAULT_DELAY_MS = 1000`, espera y devuelve `{ kind: 'success' }` sin guardar nada (mismo estilo que `InMemoryAuthGateway`)
- [X] T016 Crear `src/ui/navigation/routes.ts` (`ROUTES`, `DOCUMENT_TITLES` por ruta, `resolveRoute(pathname): 'login' | 'register' | null`) y `src/ui/navigation/navigation.ts` (`navigate(path, { replace? })`, que llama a `pushState`/`replaceState` y emite un evento propio `kyn:navigate`; `useCurrentPath()` con `useSyncExternalStore`, suscrito a `popstate` y `kyn:navigate`) hasta pasar T006
- [X] T017 Crear `src/ui/navigation/Link.tsx` (depende de T016) y `src/ui/navigation/Link.module.css` hasta pasar T007: `<a href>` que intercepta solo el clic primario sin modificadores y llama a `navigate`. El estilo reutiliza el de enlace del botón con `composes: link from '../components/Button/Button.module.css';` (sin duplicar CSS)
- [X] T018 Prueba (escribir y ver fallar antes de T020): ampliar `src/App.test.tsx` con `describe('App · rutas')`: `FR-018` al montar en `/` y en `/otra` (fijar con `history.replaceState(null, '', ruta)` antes de `render`) termina en `location.pathname === '/login'` mostrando el `heading` "Bienvenido de nuevo"; montar en `/login` muestra el login. Actualizar las llamadas existentes a `render(<App …/>)` para pasar también `register={createRegisterStub().register}` (T009)
- [X] T019 Mover `src/ui/features/login/LoginScreen.tsx` y `LoginScreen.module.css` a `src/ui/layout/AuthLayout/AuthLayout.tsx` y `AuthLayout.module.css` sin cambiar el marcado ni los puntos de corte (960px, 1280px, 479px). Nueva firma: `AuthLayout({ brand: { title: ReactNode; description: string }, children })`. Ampliar `src/ui/layout/BrandPanel/BrandPanel.tsx` con las props `title` y `description` hasta pasar T008; el logo, la tarjeta, el degradado y los SVG no cambian (D2/D3: se usan los del login). Borrar los archivos originales de `LoginScreen`
- [X] T020 Modificar `src/App.tsx` hasta pasar T018: props `{ authenticate: Authenticate; register: Register }`; leer `useCurrentPath()`; con `resolveRoute` igual a `'login'`, renderizar `AuthLayout` con `brand={{ title: <>Tu dinero,<br />sin fronteras.</>, description: 'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.' }}` y `LoginForm`; con `null`, llamar a `navigate(ROUTES.login, { replace: true })` en un efecto. `/registro` se conecta en US1 y hasta entonces también redirige. Actualizar `src/main.tsx` para crear `createRegister(new SimulatedRegistrationGateway())` y pasar `register` a `App`
- [X] T021 Ejecutar `npm test` y `npm run lint`: las 111 pruebas previas y las nuevas pasan, y las reglas de capas de ESLint no reportan errores en los archivos nuevos

**Checkpoint**: base lista; el login funciona igual en `/login` y `/` redirige a `/login`

---

## Phase 3: User Story 1 - Crear una cuenta con datos válidos (Priority: P1) 🎯 MVP

**Goal**: en `/registro`, un formulario completo y válido simula el registro y lleva a `/login`
con el mensaje de éxito.

**Independent Test**: abrir `/registro`, completar los cuatro campos con datos válidos, marcar
los términos y presionar "Crear cuenta"; se llega a `/login` con "Registro completado
(demostración). Inicia sesión con una cuenta de demostración." visible (quickstart, escenarios 1,
2, 4 y 5).

### Tests for User Story 1 ⚠️

- [X] T022 [P] [US1] Crear `src/ui/features/register/registerReducer.test.ts`: estado inicial (`status: 'editing'`, valores vacíos, `acceptedTerms: false`, `failure: false`); `change` actualiza el valor; `toggleTerms` actualiza la casilla; `submit` con datos válidos → `submitting`; `submit` con errores → sigue en `editing` (FR-009); `submit` en `submitting` devuelve el mismo estado; `result` `unavailable` → `failure: true`, conservando valores y casilla; `change` desde `failure` → `editing` con `failure: false`
- [X] T023 [P] [US1] Ampliar `src/ui/features/login/loginReducer.test.ts`: `initialLoginState` tiene `successNotice: null`; el estado inicial creado con `createInitialLoginState('texto')` tiene `successNotice: 'texto'`; `change` lo pone en `null`; `change` no borra `notice` ("Función no disponible…" conserva su comportamiento); `logout` deja `successNotice: null`
- [X] T024 [P] [US1] Ampliar `src/ui/components/Alert/Alert.test.tsx`: acepta las props opcionales `ref` y `tabIndex`; con `tabIndex={-1}` el elemento puede recibir el foco programáticamente; sin ellas, el comportamiento actual no cambia
- [X] T025 [US1] Crear `src/ui/features/register/RegisterForm.test.tsx` con `setup()` que renderiza `<RegisterForm register={stub.register} onRegistered={onRegistered} />` y completa datos válidos. Casos: contrato (`heading` nivel 1 "Crea tu cuenta"; subtítulo "Completa tus datos para comenzar"; `textbox` "Nombre completo" con `autocomplete="name"` y placeholder "Ej: Diego Martínez"; `textbox` "Correo electrónico" con `autocomplete="email"` y placeholder "tucorreo@ejemplo.com"; campos "Contraseña" y "Confirmar contraseña" con `autocomplete="new-password"`; `checkbox` "Acepto los términos y condiciones"; `button` "Crear cuenta"). US1-1: válido → `register` llamado una vez con los 5 valores y después `onRegistered` llamado sin argumentos. US1-2: con `stub.defer()`, el botón "Creando cuenta…" queda deshabilitado con `aria-busy="true"`; más clics y Enter no repiten la llamada. US1-5: Enter en "Confirmar contraseña" envía. FR-009: con la casilla sin marcar no se llama a `register`. FR-028: con `createRegisterStub({ kind: 'unavailable' })` → `alert` "No pudimos completar el registro. Intenta más tarde.", valores conservados y `onRegistered` sin llamar
- [X] T026 [US1] Ampliar `src/ui/features/login/LoginForm.test.tsx`: con `initialNotice={MESSAGES.SIGNUP_SUCCESS}` se muestra `status` con ese texto exacto antes del `heading` "Bienvenido de nuevo" y tiene el foco (US1-3); los campos están vacíos; escribir en "Correo electrónico" oculta el mensaje (FR-013); sin la prop, no hay mensaje
- [X] T027 [US1] Ampliar `src/App.test.tsx` con `describe('App · US1 registro válido')`: montar en `/registro`, completar datos válidos, marcar términos y "Crear cuenta" → `location.pathname === '/login'`, `status` con el mensaje de éxito; `history.replaceState` (espía) se usó para ir a `/login` (R3); desmontar y volver a montar en `/login` → sin mensaje (US1-4); FR-027: después del registro, `location.href` no contiene el nombre ni el correo, y `localStorage`/`sessionStorage` están vacíos

### Implementation for User Story 1

- [X] T028 [P] [US1] Ampliar `src/ui/components/Alert/Alert.tsx` con las props opcionales `ref?: Ref<HTMLDivElement>` y `tabIndex?: number` hasta pasar T024
- [X] T029 [US1] Crear `src/ui/features/register/registerReducer.ts` hasta pasar T022: tipos `RegisterField = 'fullName' | 'email' | 'password' | 'confirmPassword'` y `RegisterState` (data-model.md, RegisterFormState: `status`, `values`, `acceptedTerms`, `touched`, `fieldErrors`, `failure`); acciones `change`, `toggleTerms`, `submit`, `result`. `submit` usa `validateRegistration`
- [X] T030 [US1] Crear `src/ui/features/register/useRegisterForm.ts` (mismo patrón que `useLoginForm.ts`: refs `inFlight` y `mounted`; `submit()` devuelve los errores para que la vista gestione el foco). Con `success` llama a `onRegistered()`; con `unavailable` despacha `result`
- [X] T031 [US1] Crear `src/ui/features/register/RegisterForm.tsx` y `RegisterForm.module.css` hasta pasar T025. Usar `<form noValidate>`, `TextField` (nombre y correo), `PasswordField` (ambas contraseñas), `Checkbox` con `label="Acepto los términos y condiciones"`, `Alert tone="error"` con `MESSAGES.SIGNUP_UNAVAILABLE` encima del botón, y `Button type="submit" loadingLabel="Creando cuenta…"`. CSS según research.md R1: `.form { display: flex; flex-direction: column; gap: 16px; }`; título 30px Bold `var(--neutral-900)`; subtítulo 16px `var(--neutral-600)`, separado 6–8px del título
- [X] T032 [US1] Login hasta pasar T023 y T026. En `src/ui/features/login/loginReducer.ts`, añadir `successNotice: string | null`, exportar `createInitialLoginState(successNotice?: string)` y limpiar `successNotice` en `change`. En `src/ui/features/login/useLoginForm.ts`, aceptar `initialNotice?: string` (inicializador perezoso de `useReducer`). En `src/ui/features/login/LoginForm.tsx`, prop `initialNotice?: string`: renderizar `<Alert tone="info" tabIndex={-1} ref={…}>` antes del encabezado y enfocarlo al montar si existe
- [X] T033 [US1] Conectar el registro en `src/App.tsx` hasta pasar T027. Estado `signupCompleted`. Ruta `'register'`: `AuthLayout` con `brand={{ title: <>Comienza tu<br />camino financiero.</>, description: 'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.' }}` y `<RegisterForm register={register} onRegistered={…} />`; `onRegistered` hace `setSignupCompleted(true)` y `navigate(ROUTES.login, { replace: true })`. Ruta `'login'`: pasar `initialNotice={signupCompleted ? MESSAGES.SIGNUP_SUCCESS : undefined}` y consumir el aviso (volver a `false`) en un efecto tras el render

**Checkpoint**: US1 funciona y se prueba de forma independiente (MVP)

---

## Phase 4: User Story 2 - Corregir datos inválidos antes de registrarse (Priority: P1)

**Goal**: errores inline junto a cada control, accesibles, sin perder datos y sin redirección.

**Independent Test**: enviar vacío y luego cada dato inválido por separado; ver cada mensaje
junto a su control, los datos conservados y la dirección `/registro` (quickstart, escenarios 7 a
12).

### Tests for User Story 2 ⚠️

- [X] T034 [P] [US2] Ampliar `src/ui/features/register/registerReducer.test.ts`: `blur(campo)` marca el campo como tocado y muestra su error; `fieldErrors` solo incluye controles tocados; `submit` marca todo como tocado (incluida `acceptedTerms`); el error de términos no aparece con `blur` de otros campos ni con `toggleTerms` antes del primer `submit`; `change` de `password` vuelve a calcular el error de `confirmPassword` si ya estaba tocada (US2-9, en ambos sentidos); `toggleTerms(true)` tras el envío oculta el error (US2-8)
- [X] T035 [P] [US2] Ampliar `src/ui/components/Checkbox/Checkbox.test.tsx`: con `error` el `input` tiene `aria-invalid="true"` y `aria-describedby` apunta al texto del error, visible bajo la casilla; acepta `ref`; con `labelSuffix` el nombre accesible es la etiqueta más el sufijo (vía `aria-labelledby`), hacer clic en la etiqueta cambia la casilla y hacer clic en un botón dentro de `labelSuffix` no la cambia; sin las props nuevas, la casilla "Recordarme" del login se comporta igual; sin violaciones de `axe`
- [X] T036 [US2] Ampliar `src/ui/features/register/RegisterForm.test.tsx`. US2-1: envío vacío → los 5 mensajes de data-model.md, cada uno enlazado a su control con `aria-describedby` y con `aria-invalid="true"`, `register` sin llamar y foco en "Nombre completo". US2-2: nombre `'   '` + Tab → "Ingresa tu nombre completo". US2-3: `'usuario@'` + Tab → "Ingresa un correo electrónico válido". US2-4: `'1234567'` → "La contraseña debe tener al menos 8 caracteres" y, al escribir el octavo carácter, el mensaje desaparece (límite de 8 aceptado). US2-5: confirmación distinta + Tab → "Las contraseñas no coinciden". US2-6: todo válido sin términos → "Debes aceptar los términos y condiciones" junto a la casilla. US2-7: tras cualquier error, los 4 valores y la casilla siguen iguales. US2-8: corregir oculta solo el mensaje de ese control. US2-9: cambiar la contraseña después de una confirmación coincidente muestra el error al enviar. US2-10: el nombre accesible o la descripción de cada control incluye su error. Foco al primer error en el orden nombre → correo → contraseña → confirmación → casilla (probar con solo la confirmación inválida, y con solo la casilla)
- [X] T037 [US2] Ampliar `src/App.test.tsx`: `FR-009` montar en `/registro`, enviar con errores → `location.pathname` sigue siendo `'/registro'` y no hay mensaje de éxito

### Implementation for User Story 2

- [X] T038 [P] [US2] Ampliar `src/ui/components/Checkbox/Checkbox.tsx` y `Checkbox.module.css` hasta pasar T035: props opcionales `error?: string`, `labelSuffix?: ReactNode` y `ref?: Ref<HTMLInputElement>`. Estructura: `input[aria-labelledby=textId][aria-invalid][aria-describedby=errorId]` + `<span id={textId}><label htmlFor>…</label>{labelSuffix}</span>` + `<p id={errorId}>`. Error 13px `var(--danger-600)` y borde de la casilla en `var(--danger-600)` cuando es inválida; separación casilla–texto de 12px solo cuando hay `labelSuffix` (diseño 04 · Registro), para no alterar "Recordarme"
- [X] T039 [US2] Ampliar `src/ui/features/register/registerReducer.ts` hasta pasar T034: acción `blur`, `touched` por control y errores visibles con una función equivalente a `visibleErrors` de `loginReducer.ts`
- [X] T040 [US2] Ampliar `src/ui/features/register/useRegisterForm.ts` y `RegisterForm.tsx` hasta pasar T036 y T037: `onBlur` en los 4 campos, prop `error` en cada `TextField`/`PasswordField`/`Checkbox`, refs para enfocar el primer control con error tras `submit()`

**Checkpoint**: US1 y US2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Moverse entre login y registro (Priority: P2)

**Goal**: "Regístrate" lleva a `/registro`, "Inicia sesión" lleva a `/login`, y las rutas
directas, el historial, el título y el foco funcionan.

**Independent Test**: desde `/login`, "Regístrate" → `/registro`; "Inicia sesión" → `/login`;
atrás y adelante del navegador (quickstart, escenarios 15 a 17).

### Tests for User Story 3 ⚠️

- [X] T041 [US3] Modificar `src/ui/features/login/LoginForm.test.tsx` (FR-021): quitar `'Regístrate'` del `it.each` de `US5-1`, que conserva "¿Olvidaste tu contraseña?", "Google" y "Apple"; añadir `it('FR-021: "Regístrate" es un enlace a /registro')`, que comprueba `getByRole('link', { name: 'Regístrate' })` con `href="/registro"` y que al hacer clic `location.pathname === '/registro'`; en `FR-014` (orden de tabulación), cambiar `getByRole('button', { name: 'Regístrate' })` por `getByRole('link', { name: 'Regístrate' })`. Verificar que estas pruebas fallan antes de T045
- [X] T042 [P] [US3] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: `US3-1` `link` "Inicia sesión" con `href="/login"`, precedido del texto "¿Ya tienes cuenta?"; al hacer clic, `location.pathname === '/login'`
- [X] T043 [P] [US3] Crear `src/ui/layout/AuthLayout/AuthLayout.test.tsx`: con `focusHeadingOnMount`, al montar enfoca el primer `h1` de `main` (al que da `tabIndex=-1`) salvo que el foco ya esté dentro de `main`; sin la prop, no mueve el foco
- [X] T044 [US3] Ampliar `src/App.test.tsx` con `describe('App · US3 navegación')`. US3-2: en `/login`, clic en "Regístrate" → `/registro` con los 4 campos vacíos. US3-1: en `/registro`, clic en "Inicia sesión" → `/login` sin mensaje de éxito. US3-3: tras ir y volver, `history.back()` y `await` del `popstate` → `/registro` vacío; `history.forward()` → `/login`. US3-4: montar en `/registro` directamente muestra "Crea tu cuenta". `document.title` es "KynWallet · Crear cuenta" en `/registro` e "KynWallet · Iniciar sesión" en `/login`. Tras navegar, el foco está en el `h1` de la pantalla nueva; en la carga inicial no se mueve. Tras un registro válido, el foco está en el mensaje de éxito y no en el `h1`

### Implementation for User Story 3

- [X] T045 [US3] En `src/ui/features/login/LoginForm.tsx`, sustituir `<Button variant="link" onClick={notAvailable}>Regístrate</Button>` por `<Link href={ROUTES.register}>Regístrate</Link>` hasta pasar T041; el resto del pie no cambia
- [X] T046 [US3] En `src/ui/features/register/RegisterForm.tsx` y `RegisterForm.module.css`, añadir el pie `<p>¿Ya tienes cuenta? <Link href={ROUTES.login}>Inicia sesión</Link></p>` (14px, `var(--neutral-600)`, centrado, `gap: 5px`, igual que `.footer` del login) hasta pasar T042
- [X] T047 [US3] En `src/ui/layout/AuthLayout/AuthLayout.tsx`, añadir la prop opcional `focusHeadingOnMount?: boolean` hasta pasar T043. En `src/App.tsx`, actualizar `document.title` con `DOCUMENT_TITLES` en cada cambio de ruta, pasar `focusHeadingOnMount` solo cuando la ruta cambió tras la carga inicial y usar `key={route}` en `AuthLayout` para remontar el formulario vacío al volver, hasta pasar T044

**Checkpoint**: US1, US2 y US3 funcionan; las dos pantallas están conectadas

---

## Phase 6: User Story 4 - Opciones de registro con Google y Apple (Priority: P3)

**Goal**: Google y Apple muestran `alert("Próximamente")` sin autenticación externa.

**Independent Test**: activar "Google" y "Apple" en `/registro`; diálogo "Próximamente" y datos
intactos (quickstart, escenario 13).

### Tests for User Story 4 ⚠️

- [X] T048 [US4] Ampliar `src/ui/features/register/RegisterForm.test.tsx` con `vi.spyOn(window, 'alert').mockImplementation(() => {})` y `vi.spyOn(globalThis, 'fetch')`. US4-1: el texto "o regístrate con" está presente; clic en `button` "Google" y luego en "Apple" → `alert` llamado dos veces, cada una exactamente con `'Próximamente'`; también con el foco en el botón y Enter; `fetch` y `window.open` sin llamar. US4-2: con datos escritos, los valores siguen iguales, no aparecen errores nuevos y `location.pathname` no cambia

### Implementation for User Story 4

- [X] T049 [US4] En `src/ui/features/register/RegisterForm.tsx` y `RegisterForm.module.css`, añadir tras "Crear cuenta" `<Divider>o regístrate con</Divider>` y dos `SocialButton` (`provider="Google"` y `provider="Apple"`) con `onClick={() => window.alert(MESSAGES.COMING_SOON)}`, en una rejilla de 2 columnas con `gap: 16px` (diseño: 2 × 192px), hasta pasar T048. No cambiar `SocialButton` ni el login

**Checkpoint**: US4 funciona de forma independiente

---

## Phase 7: User Story 5 - Consultar los términos y condiciones (Priority: P3)

**Goal**: "términos y condiciones" abre una ventana modal accesible con texto ficticio.

**Independent Test**: abrir la ventana, cerrarla con "Cerrar" y con Escape; el foco vuelve al
enlace y la casilla no cambia (quickstart, escenario 14).

### Tests for User Story 5 ⚠️

- [X] T050 [US5] Añadir a `src/test/setup.ts` un sustituto mínimo, solo si `HTMLDialogElement.prototype.showModal` no existe (jsdom 30 no lo implementa, research R9): `showModal()` pone el atributo `open`; `close()` lo quita y emite el evento `close`. Comentar el motivo en el código
- [X] T051 [P] [US5] Crear `src/ui/components/Modal/Modal.test.tsx`: con `open` renderiza `dialog` con nombre accesible igual al `title` (`aria-labelledby` → `h2`) y llama a `showModal`; el botón "Cerrar" llama a `onClose`; un evento `cancel` (Escape) llama a `onClose` y cancela el comportamiento por defecto; al pasar a `open=false`, el foco vuelve al elemento de `returnFocusRef`; sin violaciones de `axe` estando abierto
- [X] T052 [US5] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: `US5-1` `button` "términos y condiciones" abre `dialog` "Términos y condiciones" con el texto "Documento de demostración sin valor legal" y un `button` "Cerrar"; el foco entra en la ventana. `US5-2` "Cerrar" y Escape la cierran y el foco vuelve a "términos y condiciones". `US5-4` con datos escritos y la casilla marcada, y también desmarcada, abrir y cerrar no cambia nada ni muestra errores. `FR-017` el `checkbox` sigue llamándose "Acepto los términos y condiciones"

### Implementation for User Story 5

- [X] T053 [P] [US5] Crear `src/ui/components/Modal/Modal.tsx` y `Modal.module.css` hasta pasar T051: props `open: boolean`, `title: string`, `onClose: () => void`, `returnFocusRef: RefObject<HTMLElement | null>`, `children`; `<dialog aria-labelledby>` controlado con `showModal()`/`close()` en un efecto; `h2`; botón "Cerrar" con `Button variant="secondary"`. Estilos con tokens existentes: fondo `var(--neutral-0)`, radio `var(--radius-card)`, `max-width: 480px`, `width: calc(100% - 32px)`, `::backdrop` translúcido sobre `var(--neutral-900)`
- [X] T054 [US5] Crear `src/ui/features/register/TermsDialog.tsx` (`Modal` con `MESSAGES.TERMS_TITLE` y `MESSAGES.TERMS_TEXT`). En `RegisterForm.tsx`, pasar a `Checkbox` `label="Acepto los"` y `labelSuffix={<Button variant="link" ref={termsRef} onClick={openTerms}>términos y condiciones</Button>}` (el texto del enlace en 14px SemiBold, como en el diseño), con estado local `termsOpen`, hasta pasar T052. Si `Button` no acepta `ref`, añadirlo como prop opcional en `src/ui/components/Button/Button.tsx` con su prueba en `Button.test.tsx`

**Checkpoint**: todas las historias funcionan de forma independiente

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: accesibilidad global, documentación, controles y verificación manual

- [X] T055 [P] Ampliar `src/App.test.tsx` con `describe('App · accesibilidad (FR-025, SC-005)')`: `expectNoA11yViolations` en `/registro` vacío, en `/registro` con todos los errores visibles, en `/registro` con la ventana de términos abierta y en `/login` con el mensaje de éxito
- [X] T056 [P] Ampliar `src/ui/features/register/RegisterForm.test.tsx` con `it('FR-023: orden de tabulación …')`: recorrer con `user.tab()` y comprobar el orden de contracts/ui-register.md (nombre → correo → contraseña → "Mostrar contraseña" → confirmación → "Mostrar contraseña" → casilla → "términos y condiciones" → "Crear cuenta" → Google → Apple → "Inicia sesión"); y `it('FR-027: …')`: las contraseñas no aparecen en el DOM fuera de sus campos, la URL, la consola ni el almacenamiento (como la prueba equivalente de `LoginForm.test.tsx`)
- [X] T057 [P] Actualizar `README.md`: título "KynWallet · Inicio de sesión y registro (demo)"; enlace al frame `04 · Registro` y a `specs/002-registro-usuarios/`; rutas `/login` y `/registro`; sección "Registro simulado" (no crea una cuenta utilizable, no guarda datos, espera de 1 s, Google y Apple muestran "Próximamente", términos ficticios); requisito Node ≥ 22.22.2 y `nvm use`; nota de hosting estático (redirigir rutas a `index.html`); árbol de arquitectura con `navigation/`, `layout/AuthLayout`, `features/register`, `Modal`, `register`/`RegistrationGateway`/`SimulatedRegistrationGateway`; quitar "registro" de "Fuera de alcance"
- [X] T058 [P] Añadir notas de enmienda en la documentación de 001, sin reescribir su historia: en `specs/001-login-billetera/spec.md` bajo FR-016 y US5-1 ("Enmendado por 002-registro-usuarios FR-021: 'Regístrate' navega a /registro"); en `specs/001-login-billetera/contracts/ui-login.md` la fila "Registro" pasa a `link` "Regístrate" → `/registro` y se ajusta el orden de teclado; en `specs/001-login-billetera/quickstart.md`, el escenario 10 sin "Regístrate"
- [X] T059 Ejecutar `npm run verify` con Node 22: lint, formato, tipos, pruebas con cobertura ≥ 80 % en líneas, ramas, funciones y sentencias, build, auditorías y secretos, todo en verde. Confirmar que siguen pasando las 111 pruebas previas (salvo las dos modificadas en T041 por FR-021)
- [ ] T060 Validación manual en navegador real con `npm run dev` siguiendo `specs/002-registro-usuarios/quickstart.md`: escenarios 1–18, la comprobación de teclado y la revisión visual a 1440 × 1024 frente a la captura del frame `04 · Registro` (Figma `q3svEn6CvsilMMj61UrFks`, nodo `31:2`) y a 1024, 375 y 320px frente a FR-019/FR-020 (no hay frame móvil). Registrar el resultado y las capturas en la descripción del pull request
- [X] T061 Registrar en `specs/002-registro-usuarios/plan.md` (Implementation Notes) la resolución de D1–D3: versión de Node aplicada, degradado y SVG usados. Comprobar que 002 no añadió tokens de color nuevos en `src/ui/styles/tokens.css` y mencionar en la descripción del pull request que la desviación de colores (D4, Const. 8.6) es heredada de 001 y sigue pendiente de aprobación de diseño a nivel de proyecto. Comprobar además que la excepción EX-001 (Const. 8.7, en plan.md) sigue vigente (vence el 2026-12-31) y citarla en la descripción del pull request

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T001 → T002
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias
- **US1 (Phase 3)**: depende de Foundational. Es el MVP
- **US2 (Phase 4)**: depende de US1 (amplía `registerReducer`, `useRegisterForm` y `RegisterForm`)
- **US3 (Phase 5)**: depende de Foundational y de que exista la ruta `/registro` (T033). Puede ir en paralelo con US2 coordinando ediciones de `RegisterForm.tsx`
- **US4 (Phase 6)**: depende de US1 (T031); independiente de US2 y US3
- **US5 (Phase 7)**: depende de US2 (T038, `labelSuffix` en `Checkbox`)
- **Polish (Phase 8)**: depende de todas las historias

### Within Each User Story

- Las pruebas se escriben y se ven fallar antes de implementar
- Reducer → hook → componente → integración en `App`
- Cada checkpoint exige `npm test` en verde

### Parallel Opportunities

- Phase 2: T003–T009 (pruebas y soporte de pruebas, archivos distintos); luego T013 en paralelo con T016; T015 tras T013, y T017 tras T016
- US1: T022, T023 y T024 en paralelo; T028 en paralelo con T029
- US2: T034 y T035 en paralelo; T038 en paralelo con T039
- US3: T042 y T043 en paralelo
- US5: T051 en paralelo con T052 (después de T050); T053 en paralelo con la preparación del texto de términos
- Polish: T055, T056, T057 y T058 en paralelo
- US4 puede desarrollarse en paralelo con US2 o US3 (otro desarrollador), coordinando ediciones de `RegisterForm.tsx`

---

## Parallel Example: Foundational

```bash
# Pruebas de dominio, aplicación, infraestructura y navegación a la vez (archivos distintos):
Task: "T003 src/domain/registration.test.ts"
Task: "T004 src/application/register.test.ts"
Task: "T005 src/infrastructure/SimulatedRegistrationGateway.test.ts"
Task: "T006 src/ui/navigation/navigation.test.ts"
Task: "T007 src/ui/navigation/Link.test.tsx"
Task: "T008 src/ui/layout/BrandPanel/BrandPanel.test.tsx"
```

## Parallel Example: User Story 1

```bash
Task: "T022 src/ui/features/register/registerReducer.test.ts"
Task: "T023 src/ui/features/login/loginReducer.test.ts"
Task: "T024 src/ui/components/Alert/Alert.test.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "T034 src/ui/features/register/registerReducer.test.ts"
Task: "T035 src/ui/components/Checkbox/Checkbox.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 (línea base en verde con Node 22)
2. Phase 2 (dominio, caso de uso, simulación, navegación, composición)
3. Phase 3 (US1)
4. **STOP and VALIDATE**: quickstart, escenarios 1, 2, 4 y 5; `npm test` en verde
5. Demostrable: registro válido → login con mensaje de éxito

### Incremental Delivery

1. Base → US1 (MVP)
2. US2: errores inline completos (también P1; completa el valor central de la feature)
3. US3: conexión login ↔ registro (FR-021)
4. US4 y US5: elementos secundarios del diseño
5. Polish: accesibilidad global, documentación, `verify`, validación manual y decisiones D1–D5

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Cada historia se completa y se prueba de forma independiente
- Ver fallar las pruebas antes de implementar (Constitución I)
- Commit después de cada tarea o grupo lógico, con el ID de la tarea en el mensaje (Constitución 9.2)
- No refactorizar fuera de lo indicado: el login solo cambia en T019 (movimiento sin cambio de marcado), T032 (aviso de éxito) y T045 ("Regístrate")
