# Feature Specification: Registro de Usuarios de KynWallet

**Feature Branch**: `feature/registro-julio-cisneros` (directorio de spec: `002-registro-usuarios`)

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Agrega la funcionalidad de registro de usuarios a la aplicación
existente de billetera virtual KynWallet, que ya cuenta con una pantalla de inicio de sesión.
[…] Permitir que una persona complete un formulario de registro con datos ficticios, reciba
validaciones y, cuando todos los datos sean válidos, vuelva al login con un mensaje de éxito.
[…] Demostración funcional con datos ficticios, sin backend, base de datos, envío de correos,
verificación de identidad ni servicios externos." (texto completo en la solicitud de
`/speckit-specify` del 2026-10-19).

**Relación con otras features**: amplía `001-login-billetera`. Modifica de forma explícita un
comportamiento de esa feature (el enlace "Regístrate", ver FR-021) y NO DEBE alterar ningún otro
de sus requisitos.

**Diseño de referencia**: Figma, archivo "Billetera Virtual - Prototipos (Copy)"
(`q3svEn6CvsilMMj61UrFks`), frame `04 · Registro` (nodo `31:2`, 1440 × 1024). Frame accesible y
revisado el 2026-10-19. Solo existe la versión de escritorio; no hay frame móvil.

## Clarifications

### Session 2026-10-19

- Q: ¿Qué texto exacto debe tener el mensaje de éxito, dado que la cuenta creada no sirve para
  iniciar sesión? → A: "Registro completado (demostración). Inicia sesión con una cuenta de
  demostración."
- Q: ¿"alert" significa el diálogo nativo del navegador o un aviso dentro de la página? → A: El
  diálogo nativo del navegador, con el texto exacto "Próximamente".
- Q: ¿Qué debe ocurrir al activar el enlace "términos y condiciones"? → A: Abre una ventana
  emergente (diálogo modal) dentro de la página con un texto ficticio de términos.
- Q: (tras la implementación) ¿Basta con 8 caracteres? "12345678" se aceptaba. → A: No. La
  contraseña del registro debe tener mínimo 8 caracteres, al menos una mayúscula, una minúscula y
  un carácter especial (FR-029, US2-11). El login no cambia.
- Q: ¿También debe exigir un número? → A: Sí (FR-029).
- Q: (tras la implementación) Después de registrarse, el login respondía "Servicio de acceso no
  disponible" (sin `.env.local`) o rechazaba la cuenta nueva. ¿La cuenta registrada debe servir
  para iniciar sesión? → A: Sí, solo en memoria: funciona hasta recargar o cerrar la pestaña y no
  se guarda en el navegador. Cambian FR-012, FR-014 y el caso límite del correo ya usado; se
  añaden US1-6, US2-12 y FR-030. El mensaje de éxito pasa a "Registro completado
  (demostración). Ya puedes iniciar sesión con tu nueva cuenta."
- Q: (tras la implementación) ¿Qué pasa con la casilla al abrir y cerrar los términos? → A: Al
  cerrar la ventana ("Cerrar" o Escape) la casilla queda marcada; si ya lo estaba, sigue igual
  (US5-4, FR-017).

## Contexto: hallazgos en la documentación y el código existentes

Diferencias relevantes detectadas entre lo que pide esta feature y lo que documenta o implementa
`001-login-billetera`. Se tratan como entradas para el plan, no como defectos de la feature 001.

| # | Hallazgo | Documento / código | Impacto en esta feature |
|---|----------|--------------------|-------------------------|
| H1 | La aplicación no tiene rutas: la raíz muestra siempre la pantalla de login. No existe `/login`. El plan de 001 descarta explícitamente un router (Principio IV, YAGNI). | `plan.md` 001 (tabla de Constitución, IV); `src/App.tsx` | Esta feature introduce las direcciones `/login` y `/registro`. La decisión técnica y su justificación (Constitución 4.2) corresponden al plan. |
| H2 | "Regístrate" en el login hoy muestra el aviso "Función no disponible en esta demostración". | spec 001 FR-016 y US5-1; `contracts/ui-login.md`; `LoginForm.tsx` | Ese comportamiento se reemplaza por la navegación a `/registro` (FR-021). Requiere actualizar la spec 001 en el mismo cambio (Constitución 8.3). |
| H3 | En el login, Google y Apple muestran un aviso en la página ("Función no disponible en esta demostración"); el registro exige un *alert* con el texto "Próximamente". | spec 001 FR-016; `LoginForm.tsx` | Comportamientos distintos para el mismo botón en dos pantallas. Esta spec no cambia el login (ver FR-012 y Assumptions). |
| H4 | En el login, por debajo del ancho de escritorio, el panel de marca se reduce a una franja con el logo; el registro pide ocultar el panel complementario en móvil. | spec 001 FR-018; `research.md` 001 R10; `BrandPanel.module.css` | Ver FR-019: se asume el mismo patrón que el login (logo visible) para conservar la marca. |
| H5 | La spec 001 cita otro archivo de Figma (`f7uDsv8sh6ZOtK2OitTqtg`, nodo `2:2`); esta feature usa la copia `q3svEn6CvsilMMj61UrFks`. | spec 001, encabezado | Si los archivos divergen, el login sigue rigiéndose por su propio archivo. |
| H6 | El panel de marca del login tiene textos fijos ("Tu dinero, sin fronteras."); el de registro usa textos distintos. | `BrandPanel.tsx` | El panel debe admitir textos distintos por pantalla (detalle de plan). |
| H7 | El login valida longitudes máximas (correo ≤ 254, contraseña ≤ 128) que la solicitud de registro no menciona. | spec 001 FR-003/FR-004; `src/domain/validation.ts` | Se asumen los mismos límites para que exista una sola regla (Constitución 4.1). |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una cuenta con datos válidos (Priority: P1)

Como persona que aún no usa KynWallet, quiero completar el formulario de registro con mis datos y
crear una cuenta, para después poder iniciar sesión.

**Why this priority**: es el objetivo de la feature; sin el flujo completo (formulario válido →
login con mensaje de éxito) no hay valor demostrable.

**Independent Test**: abrir `/registro`, completar los cuatro campos con datos válidos, marcar
los términos, presionar "Crear cuenta" y comprobar que se llega a `/login` con el mensaje de
éxito visible.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro con los cuatro campos completos y válidos y la casilla de
   términos marcada, **When** la persona presiona "Crear cuenta", **Then** la aplicación muestra
   la pantalla de inicio de sesión en la dirección `/login` y en ella un mensaje de éxito visible.
2. **Given** el formulario válido enviado, **When** el registro simulado está en curso, **Then**
   el botón "Crear cuenta" muestra un estado de carga, queda deshabilitado y no admite envíos
   adicionales.
3. **Given** la persona llega al login tras registrarse, **When** se muestra el mensaje de éxito,
   **Then** es anunciado automáticamente por tecnologías de asistencia y el formulario de login
   aparece vacío y operativo.
4. **Given** el mensaje de éxito visible en el login, **When** la persona recarga la página o
   vuelve a entrar en `/login`, **Then** el mensaje ya no se muestra.
5. **Given** el último campo con foco, **When** la persona presiona Enter, **Then** el
   formulario se envía igual que al presionar "Crear cuenta".
6. **Given** la persona se registró con un correo y una contraseña, **When** inicia sesión con
   ellos sin recargar la página, **Then** entra y ve la bienvenida con su nombre completo, aunque
   no haya cuentas de demostración configuradas (FR-014).

---

### User Story 2 - Corregir datos inválidos antes de registrarse (Priority: P1)

Como persona que se registra, quiero saber qué dato falta o es incorrecto, junto al campo
afectado y sin perder lo que ya escribí, para corregirlo rápidamente.

**Why this priority**: la solicitud exige las validaciones y que ningún error permita completar
el registro; es tan crítico como el flujo exitoso.

**Independent Test**: enviar el formulario vacío y luego con cada dato inválido por separado;
comprobar cada mensaje junto a su control, que los datos se conservan y que no hay redirección.

**Acceptance Scenarios**:

1. **Given** el formulario vacío y la casilla sin marcar, **When** la persona presiona "Crear
   cuenta", **Then** se muestra un mensaje junto a cada uno de los cuatro campos y junto a la
   casilla de términos, no se completa el registro, la dirección sigue siendo `/registro` y el
   foco se mueve al primer control con error.
2. **Given** un nombre completo formado solo por espacios, **When** la persona sale del campo o
   envía el formulario, **Then** se muestra "Ingresa tu nombre completo".
3. **Given** un correo sin formato válido (por ejemplo "usuario@", "usuario.com" o "a@b.c"),
   **When** la persona sale del campo o envía, **Then** se muestra "Ingresa un correo electrónico
   válido".
4. **Given** una contraseña de 7 caracteres, **When** la persona sale del campo o envía, **Then**
   se muestra "La contraseña debe tener al menos 8 caracteres".
5. **Given** una confirmación distinta de la contraseña, **When** la persona sale del campo de
   confirmación o envía, **Then** se muestra "Las contraseñas no coinciden" junto a la
   confirmación.
6. **Given** todos los campos válidos y la casilla sin marcar, **When** la persona presiona
   "Crear cuenta", **Then** se muestra "Debes aceptar los términos y condiciones" junto a la
   casilla y no se completa el registro.
7. **Given** cualquier error mostrado, **When** se presenta el mensaje, **Then** los valores de
   todos los campos y el estado de la casilla se conservan exactamente como estaban.
8. **Given** un campo o la casilla con error, **When** la persona corrige el valor, **Then** el
   mensaje de ese control desaparece sin afectar los demás.
9. **Given** la confirmación coincide y la persona cambia después la contraseña, **When** la
   persona envía o sale de la confirmación, **Then** se muestra "Las contraseñas no coinciden";
   y si vuelve a coincidir, el mensaje desaparece.
10. **Given** un control con error, **When** lo lee un lector de pantalla, **Then** se anuncia
    su etiqueta, que es inválido y el texto del error.
11. **Given** una contraseña de 8 o más caracteres sin mayúscula (por ejemplo "12345678"), sin
    minúscula, sin número o sin carácter especial, **When** la persona sale del campo o envía, **Then** se
    muestra el mensaje de la primera regla incumplida (FR-029) y no se completa el registro.
12. **Given** un correo ya registrado en la sesión o de una cuenta de demostración, **When** la
    persona envía el formulario válido con él, **Then** tras la espera se muestra "Ya existe una
    cuenta con este correo" junto al correo, el foco pasa a ese campo, se conservan los datos y
    no se redirige; el mensaje desaparece al editar el correo (FR-030).

---

### User Story 3 - Moverse entre login y registro (Priority: P2)

Como persona que usa la demostración, quiero pasar del login al registro y volver, para elegir
la acción que necesito.

**Why this priority**: conecta la feature con el login existente; el registro puede probarse
entrando directamente en `/registro`, por eso no es P1.

**Independent Test**: desde `/login` activar "Regístrate" y llegar a `/registro`; desde allí
activar "Inicia sesión" y volver a `/login`.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** la persona activa el enlace "Inicia sesión" del
   texto "¿Ya tienes cuenta? Inicia sesión", **Then** la aplicación muestra la pantalla de
   inicio de sesión en `/login`, sin mensaje de éxito.
2. **Given** la pantalla de inicio de sesión, **When** la persona activa "Regístrate", **Then**
   la aplicación muestra la pantalla de registro en `/registro` con el formulario vacío.
3. **Given** la persona navegó entre pantallas, **When** usa los botones atrás y adelante del
   navegador, **Then** se muestra la pantalla correspondiente a cada dirección.
4. **Given** la persona abre directamente `/login` o `/registro`, **When** carga la página,
   **Then** se muestra la pantalla correspondiente.

---

### User Story 4 - Opciones de registro con Google y Apple (Priority: P3)

Como persona que prefiere registrarse con una cuenta externa, quiero saber que esa opción aún no
existe, para no esperar una acción que no ocurrirá.

**Why this priority**: mantiene la fidelidad al diseño sin ampliar el alcance (YAGNI).

**Independent Test**: activar "Google" y "Apple" en el registro y comprobar el aviso
"Próximamente" sin ninguna autenticación externa.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** la persona activa "Google" o "Apple" con ratón o
   teclado, **Then** se muestra un aviso con el texto exacto "Próximamente", no se abre ninguna
   ventana ni dirección externa y no hay comunicación con servicios externos.
2. **Given** datos ya escritos en el formulario, **When** la persona activa "Google" o "Apple" y
   cierra el aviso, **Then** los datos se conservan, no se muestran errores de validación nuevos
   y la dirección sigue siendo `/registro`.

---

### User Story 5 - Consultar los términos y condiciones (Priority: P3)

Como persona que se registra, quiero leer los términos y condiciones antes de aceptarlos, para
saber a qué me comprometo.

**Why this priority**: el diseño muestra el enlace y la aceptación es obligatoria, pero el
registro es demostrable sin leer el texto.

**Independent Test**: activar "términos y condiciones", comprobar que se abre la ventana con el
texto ficticio, cerrarla con el botón y con Escape, y verificar que la casilla quedó marcada y
los datos no cambiaron.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** la persona activa el enlace "términos y
   condiciones" con ratón o teclado, **Then** se abre una ventana emergente dentro de la página
   con el título "Términos y condiciones", un texto ficticio que indica que se trata de una
   demostración y un botón "Cerrar"; el foco pasa a la ventana.
2. **Given** la ventana abierta, **When** la persona presiona "Cerrar" o la tecla Escape,
   **Then** la ventana se cierra y el foco vuelve al enlace "términos y condiciones".
3. **Given** la ventana abierta, **When** la persona navega con Tab, **Then** el foco permanece
   dentro de la ventana y el contenido de fondo no es operable.
4. **Given** datos escritos y la casilla en cualquier estado, **When** la persona abre y cierra
   la ventana ("Cerrar" o Escape), **Then** la casilla queda marcada (si tenía el error de
   términos, este desaparece), los demás datos no cambian y no aparecen errores nuevos. Abrir la
   ventana sin cerrarla no marca la casilla.
5. **Given** la ventana abierta, **When** la lee un lector de pantalla, **Then** se anuncia como
   diálogo con su título.

---

### Edge Cases

- **Envíos repetidos**: presionar "Crear cuenta" varias veces seguidas procesa un único registro
  y produce una única redirección.
- **Espacios periféricos**: en nombre y correo se ignoran al validar; un nombre de solo espacios
  es inválido.
- **Espacios en la contraseña**: se respetan tal cual en contraseña y confirmación; "clave 123"
  y "clave 123 " no coinciden.
- **Mayúsculas**: la comparación entre contraseña y confirmación distingue mayúsculas.
- **Longitudes excesivas**: correo > 254 caracteres o contraseña > 128 se rechazan con mensaje;
  nombre > 100 caracteres se rechaza con "El nombre no puede superar 100 caracteres".
- **Texto pegado**: se valida igual que el escrito.
- **Correo ya usado por una cuenta de demostración o ya registrado en la sesión**: el registro se
  rechaza con "Ya existe una cuenta con este correo" (FR-030). Así se revela que el correo
  existe, como en cualquier registro; en esta demostración las cuentas de demostración ya están
  en el bundle (README), por lo que no se expone nada nuevo.
- **Salir antes de terminar**: navegar al login sin enviar descarta los datos; al volver a
  `/registro` el formulario está vacío.
- **Recarga en `/registro`**: el formulario aparece vacío; ningún dato se conservó.
- **Dirección desconocida o raíz** (por ejemplo `/` o `/otra`): se muestra el login en `/login`.
- **Ventana estrecha (320 px)**: el formulario completo es utilizable sin desplazamiento
  horizontal.
- **Términos con la casilla marcada**: abrir y cerrar la ventana de términos no desmarca la
  casilla; sin marcar, la marca al cerrarse (US5-4).
- **Diálogo nativo abierto**: mientras se muestra "Próximamente", la página no admite
  interacción; al cerrarlo todo queda como estaba.
- **Fallo inesperado durante la simulación**: se muestra un mensaje comprensible, se conservan
  los datos y no hay redirección.

## Requirements *(mandatory)*

### Reglas funcionales

**Formulario y validación**

- **FR-001**: La pantalla de registro DEBE ofrecer los campos "Nombre completo", "Correo
  electrónico", "Contraseña" y "Confirmar contraseña", y una casilla de aceptación de términos y
  condiciones.
- **FR-002**: Todos los campos y la casilla DEBEN ser obligatorios.
- **FR-003**: El nombre completo DEBE contener al menos un carácter distinto de espacio y como
  máximo 100 caracteres tras ignorar los espacios periféricos.
- **FR-004**: El correo DEBE validarse con la misma regla de formato y longitud que el login
  (una única fuente de la regla), ignorando espacios periféricos y mayúsculas.
- **FR-005**: La contraseña DEBE tener entre 8 y 128 caracteres, sin recortar espacios (misma
  regla que el login).
- **FR-006**: La confirmación DEBE ser idéntica, carácter a carácter, a la contraseña.
- **FR-007**: La casilla de términos DEBE estar marcada para completar el registro.
- **FR-008**: Los mensajes de validación DEBEN mostrarse junto al control afectado al salir del
  campo y al intentar enviar, y DEBEN ocultarse cuando el valor se corrija. Textos:

  | Control | Condición | Mensaje |
  |---------|-----------|---------|
  | Nombre completo | Vacío o solo espacios | Ingresa tu nombre completo |
  | Nombre completo | > 100 caracteres | El nombre no puede superar 100 caracteres |
  | Correo | Vacío | Ingresa tu correo electrónico |
  | Correo | Formato inválido o > 254 | Ingresa un correo electrónico válido |
  | Contraseña | Vacía | Ingresa tu contraseña |
  | Contraseña | < 8 caracteres | La contraseña debe tener al menos 8 caracteres |
  | Contraseña | > 128 caracteres | La contraseña no puede superar 128 caracteres |
  | Contraseña | Sin letra mayúscula | La contraseña debe incluir al menos una letra mayúscula |
  | Contraseña | Sin letra minúscula | La contraseña debe incluir al menos una letra minúscula |
  | Contraseña | Sin número | La contraseña debe incluir al menos un número |
  | Contraseña | Sin carácter especial | La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %) |
  | Confirmar contraseña | Vacía | Confirma tu contraseña |
  | Confirmar contraseña | Distinta de la contraseña | Las contraseñas no coinciden |
  | Términos | Sin marcar (solo al enviar) | Debes aceptar los términos y condiciones |
  | Correo | Ya registrado (tras enviar, FR-030) | Ya existe una cuenta con este correo |

- **FR-009**: Al presionar "Crear cuenta" el sistema DEBE validar todos los campos y la casilla;
  si existe cualquier error NO DEBE completar el registro ni redirigir, y DEBE mover el foco al
  primer control con error.
- **FR-010**: Ante errores, el sistema DEBE conservar todos los valores introducidos y el estado
  de la casilla.

**Registro simulado y resultado**

- **FR-011**: Con datos válidos, el sistema DEBE simular el registro con una espera breve
  (aprox. 1 segundo, igual que el login) con indicador de carga y envío deshabilitado, sin
  backend, base de datos, envío de correos ni servicios externos.
- **FR-012**: Al completarse, el sistema DEBE dirigir a `/login` y mostrar allí un mensaje de
  éxito visible y anunciado automáticamente, con el texto exacto "Registro completado
  (demostración). Ya puedes iniciar sesión con tu nueva cuenta."
- **FR-013**: El mensaje de éxito DEBE mostrarse solo en la llegada inmediata tras un registro;
  NO DEBE reaparecer al recargar ni al entrar en `/login` por otro camino, y DEBE ocultarse
  cuando la persona empiece a escribir en el login.
- **FR-014**: El registro simulado DEBE crear una cuenta utilizable para iniciar sesión (correo,
  contraseña exacta y nombre completo como nombre de bienvenida) que viva solo en la memoria de
  la pestaña: se pierde al recargar o cerrar y NO DEBE guardarse en almacenamiento del navegador,
  en la dirección ni enviarse por red. La confirmación de contraseña y la casilla no se
  conservan. El formulario no conserva los datos tras la redirección.

**Acciones secundarias**

- **FR-015**: Los botones "Google" y "Apple" de la pantalla de registro DEBEN mostrar un aviso
  con el texto exacto "Próximamente" y NO DEBEN iniciar autenticación externa, abrir ventanas ni
  contactar servicios externos. El aviso DEBE ser el diálogo nativo del navegador; al cerrarlo,
  el foco DEBE volver al botón activado.
- **FR-016**: El enlace "Inicia sesión" del texto "¿Ya tienes cuenta? Inicia sesión" DEBE
  dirigir a `/login`.
- **FR-017**: El enlace "términos y condiciones" del texto de la casilla DEBE abrir una ventana
  emergente modal dentro de la página con el título "Términos y condiciones", un texto ficticio
  que indique que es una demostración sin valor legal, y un botón "Cerrar". La ventana DEBE
  cerrarse con "Cerrar" o Escape, retener el foco mientras está abierta, devolverlo al enlace al
  cerrarse y anunciarse como diálogo. Al cerrarse la ventana, la casilla DEBE quedar marcada
  (nunca se desmarca); abrir la ventana NO DEBE cambiarla ni alterar los datos del formulario.

**Navegación y convivencia con el login**

- **FR-018**: La aplicación DEBE ofrecer las direcciones `/login` (inicio de sesión) y
  `/registro` (registro), accesibles directamente, con historial del navegador funcional; la
  raíz y cualquier dirección desconocida DEBEN llevar a `/login`.
- **FR-021**: En el login, "Regístrate" DEBE dirigir a `/registro` en lugar de mostrar
  "Función no disponible en esta demostración". Esto modifica el FR-016 y el escenario US5-1 de
  `001-login-billetera` solo para ese elemento.
- **FR-022**: Todos los demás requisitos de `001-login-billetera` DEBEN seguir cumpliéndose sin
  cambios, y sus pruebas automatizadas DEBEN seguir pasando, salvo las que verifican el
  comportamiento anterior de "Regístrate" (escenario US5-1 y orden de tabulación FR-014 de 001),
  que se actualizan por FR-021.

**Accesibilidad y seguridad**

- **FR-023**: La pantalla DEBE operarse completamente con teclado, con orden de foco lógico
  (campos en orden visual, casilla, enlace de términos, "Crear cuenta", Google, Apple, "Inicia
  sesión") y foco visible.
- **FR-024**: Cada campo y la casilla DEBEN tener etiqueta asociada; cada error DEBE estar
  asociado a su control, marcarlo como inválido y ser anunciado por tecnologías de asistencia.
- **FR-025**: La pantalla DEBE cumplir WCAG 2.1 AA (Constitución 8.4).
- **FR-026**: Las contraseñas DEBEN ocultarse por defecto y cada campo de contraseña DEBE
  ofrecer un control accesible para mostrarla u ocultarla, igual que el login.
- **FR-027**: Ningún dato introducido (nombre, correo, contraseñas) DEBE aparecer en la
  dirección, en registros de diagnóstico, en almacenamiento del navegador ni en mensajes, salvo
  dentro de los propios campos (Constitución 5.4).
- **FR-028**: Los errores inesperados DEBEN mostrarse con un mensaje comprensible, sin detalles
  técnicos.
- **FR-029**: Además de FR-005, la contraseña del registro DEBE incluir al menos una letra
  mayúscula, una letra minúscula, un número y un carácter especial (cualquier carácter que no sea letra,
  número ni espacio). Las letras acentuadas y la ñ cuentan como mayúsculas o minúsculas. Se
  muestra un solo mensaje, el de la primera regla incumplida, en este orden: longitud, mayúscula,
  minúscula, número, carácter especial. El login no aplica esta regla (spec 001 FR-004), para no rechazar
  contraseñas existentes.
- **FR-030**: Si el correo (normalizado) ya pertenece a una cuenta de demostración o a una cuenta
  registrada en la sesión, el registro NO DEBE completarse ni sobrescribir la cuenta existente, y
  DEBE mostrar "Ya existe una cuenta con este correo" junto al correo, con el foco en ese campo,
  conservando los datos y sin redirigir. El mensaje DEBE ocultarse al editar el correo.

### Referencias visuales (Figma `04 · Registro`, nodo `31:2`)

Estas referencias guían la fidelidad visual; no añaden comportamiento. Ante conflicto con las
reglas funcionales o con WCAG 2.1 AA, prevalecen estas últimas (mismo criterio que la feature
001 para colores con contraste insuficiente).

- **VR-001**: Composición en escritorio de dos paneles: panel de marca a la izquierda (620 px
  de 1440 en el diseño) y panel de formulario a la derecha (columna de 400 px).
- **VR-002**: Panel de marca: logo "KynWallet"; titular "Comienza tu camino financiero."; texto
  "Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier
  lugar."; tarjeta ilustrativa "Kyn Card" (5294 •••• •••• 4827, STEVEN LUNA, 12/29), igual a la
  del login. El fondo es un degradado naranja como el del login.
- **VR-003**: Panel de formulario, en este orden: título "Crea tu cuenta"; subtítulo "Completa
  tus datos para comenzar"; "Nombre completo" (marcador "Ej: Diego Martínez"); "Correo
  electrónico" (marcador "tucorreo@ejemplo.com"); "Contraseña" (marcador de puntos, control de
  visibilidad); "Confirmar contraseña" (marcador de puntos, control de visibilidad); casilla
  "Acepto los términos y condiciones" con "términos y condiciones" resaltado como enlace; botón
  principal "Crear cuenta"; separador "o regístrate con"; botones "Google" y "Apple" lado a
  lado; pie "¿Ya tienes cuenta? Inicia sesión" con "Inicia sesión" resaltado.
- **VR-004**: Campos, botones y separador reutilizan el estilo de los componentes del login
  (mismas alturas, radios, colores y tipografía).
- **VR-005**: Los iconos de Google, Apple y del control de visibilidad son marcadores de
  posición en el diseño, igual que en el login.
- **VR-006**: El diseño no define el aspecto de los mensajes de error, del mensaje de éxito ni de
  la ventana de términos; DEBEN reutilizar los estilos, tokens y componentes ya presentes en el
  login. El aviso "Próximamente" usa el diálogo nativo y no tiene estilo propio.

### Requisitos de adaptación (responsive)

- **FR-019**: En anchos de escritorio DEBE mostrarse la composición de dos paneles (VR-001). En
  anchos móviles DEBE mostrarse solo el formulario y ocultarse el panel complementario
  (titular, texto y tarjeta), conservando el logo visible como en el login.
- **FR-020**: La pantalla DEBE funcionar desde 320 px de ancho sin desplazamiento horizontal,
  usando los mismos puntos de corte que el login.

### Key Entities

- **Solicitud de registro**: datos del formulario (nombre completo, correo, contraseña,
  confirmación, aceptación de términos) y su resultado: errores por control, registro simulado
  completado o fallo inesperado. Existe solo mientras la pantalla está abierta; no se persiste.
- **Términos y condiciones**: texto ficticio de demostración mostrado en la ventana; sin valor
  legal ni versión.
- **Aviso de registro completado**: indicación de un solo uso que el registro entrega al login
  para mostrar el mensaje de éxito; no contiene datos personales.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona completa el registro con datos válidos y llega al login con el mensaje
  de éxito en menos de 90 segundos desde que se muestra el formulario.
- **SC-002**: El mensaje de éxito aparece en el login en un máximo de 2 segundos tras presionar
  "Crear cuenta" con datos válidos.
- **SC-003**: En el 100 % de los envíos con al menos un dato inválido no hay redirección y se
  conservan todos los valores introducidos.
- **SC-004**: El 100 % de los escenarios de aceptación de esta spec se verifica con pruebas
  automatizadas que pasan, y el 100 % de las pruebas existentes del login sigue pasando, salvo
  las actualizadas por FR-021 (ver FR-022).
- **SC-005**: Una auditoría automatizada de accesibilidad no encuentra incumplimientos WCAG 2.1
  AA en la pantalla de registro ni en el login con el mensaje de éxito, y ambas son operables
  solo con teclado.
- **SC-006**: La revisión visual frente al frame `04 · Registro` no detecta diferencias en
  textos, orden de elementos ni jerarquía visual en escritorio.
- **SC-007**: A 375 px de ancho el panel complementario no se muestra y el formulario completo es
  visible y usable sin desplazamiento horizontal.
- **SC-008**: Durante toda la demostración no se produce ninguna comunicación de red con
  servicios externos al activar Google o Apple ni al registrarse.
- **SC-009**: El 90 % de los participantes de una prueba de usabilidad completa el registro sin
  asistencia tras corregir, como máximo, un error de validación.

## Assumptions

- La demostración sigue siendo solo del lado del cliente, en español, sin sesión persistente;
  no existen BRD ni ARD (Constitución, Principio VI).
- Las validaciones se ejecutan al salir del campo y al enviar, como en el login; el error de la
  casilla de términos solo aparece al enviar.
- Los límites máximos (nombre 100, correo 254, contraseña 128) y el formato de correo se asumen
  por coherencia con el login, aunque la solicitud solo pide formato válido y mínimo 8.
- La contraseña del registro exige mayúscula, minúscula, número y carácter especial (FR-029).
- Las cuentas registradas viven solo en memoria (FR-014); no hay persistencia porque guardar
  contraseñas en el navegador contradiría la Constitución 5.4. El correo ya existente se detecta
  (FR-030).
- El login conserva sus avisos de Google, Apple y "¿Olvidaste tu contraseña?" sin cambios; la
  diferencia con el diálogo nativo "Próximamente" del registro es intencional según la solicitud
  y podría unificarse en una feature posterior.
- El texto ficticio de términos lo redacta el equipo durante la implementación; basta con que
  sea claramente ficticio y en español.
- El diálogo nativo del navegador cumple los requisitos de accesibilidad para "Próximamente";
  su apariencia depende del navegador y queda fuera de la revisión visual (SC-006).
- En móvil se mantiene el logo visible (patrón del login, H4), ya que el diseño no incluye un
  frame móvil; si se desea ocultar también el logo, debe indicarse.
- La dirección del registro es `/registro` (en español, como el resto de la interfaz); la
  solicitud solo fija `/login`.
- Para cumplir WCAG AA se aplican los mismos tokens accesibles derivados que en el login
  (desviación de colores de Figma pendiente de aprobación, registrada en el plan de 001).
