# Data Model: Registro de Usuarios de KynWallet

**Feature**: `002-registro-usuarios` | **Date**: 2026-10-19

No hay persistencia. Los datos del formulario existen solo mientras la pantalla está abierta y
se descartan al navegar o recargar. La cuenta registrada (correo, contraseña y nombre) vive en un
almacén en memoria compartido con el login hasta recargar la página (FR-014). Las entidades del login
([001 data-model](../001-login-billetera/data-model.md)) no cambian, salvo lo indicado en
"Cambios en el login".

## RegistrationData (dominio, valor)

Datos del formulario de registro.

| Campo | Tipo | Regla (FR-002 a FR-008) | Mensaje |
|---|---|---|---|
| `fullName` | string | Vacío o solo espacios tras `trim` | "Ingresa tu nombre completo" |
| | | > 100 caracteres tras `trim` | "El nombre no puede superar 100 caracteres" |
| `email` | string | Reutiliza `validateEmail` del login: vacío tras `trim` | "Ingresa tu correo electrónico" |
| | | Formato inválido (`^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`) o > 254 caracteres | "Ingresa un correo electrónico válido" |
| `password` | string | Reutiliza `validatePassword`: vacía (sin recortar) | "Ingresa tu contraseña" |
| | | < 8 caracteres | "La contraseña debe tener al menos 8 caracteres" |
| | | > 128 caracteres | "La contraseña no puede superar 128 caracteres" |
| | | Sin mayúscula (`\p{Lu}`) — solo registro, FR-029 | "La contraseña debe incluir al menos una letra mayúscula" |
| | | Sin minúscula (`\p{Ll}`) | "La contraseña debe incluir al menos una letra minúscula" |
| | | Sin número (`\p{N}`) | "La contraseña debe incluir al menos un número" |
| | | Sin carácter especial (`[^\p{L}\p{N}\s]`) | "La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %)" |
| `confirmPassword` | string | Vacía | "Confirma tu contraseña" |
| | | `!== password` (exacta: distingue mayúsculas y espacios) | "Las contraseñas no coinciden" |
| `acceptedTerms` | boolean | `false` | "Debes aceptar los términos y condiciones" |

`validateRegistration(data) → RegistrationErrors` (`Partial<Record<keyof RegistrationData,
string>>`) es pura; `{}` significa válido. Valores límite: contraseña de exactamente 8 caracteres
con mayúscula, minúscula, número y carácter especial es válida ("Abcdef1!"); "12345678" no lo es; nombre de 100 caracteres es válido y de 101 no lo es.

## RegistrationRequest (aplicación → puerto)

Lo que el caso de uso entrega al puerto, minimizado (Constitución 5.4):

| Campo | Origen |
|---|---|
| `fullName` | `RegistrationData.fullName` con `trim` |
| `email` | `normalizeEmail(RegistrationData.email)` |

Al puerto llegan el nombre, el correo y la contraseña (para iniciar sesión después); la
confirmación y la casilla no.

## RegistrationResult (dominio, unión discriminada)

| Variante | Origen |
|---|---|
| `success` | La simulación terminó |
| `email-taken` | El correo ya es de una cuenta de demostración o registrada en la sesión (FR-030) |
| `unavailable` | El puerto falló o lanzó una excepción (FR-028) |

## RegisterFormState (UI, máquina de estados)

```text
             submit (con errores) ─┐
                                   ▼
 ┌──────────┐  submit (válido)  ┌────────────┐  success   ┌───────────────────────┐
 │ editing  │──────────────────▶│ submitting │───────────▶│ registrado → onRegistered() │
 └──────────┘                   └─────┬──────┘            └───────────────────────┘
      ▲                               │ unavailable
      │   cambio en cualquier campo   ▼
      └───────────────────────── ┌────────────┐
                                 │ failure    │  (mensaje global, datos conservados)
                                 └────────────┘
```

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | `'editing' \| 'submitting' \| 'failure'` | Estado actual. Tras `success` el componente sale de pantalla. |
| `values` | `{ fullName, email, password, confirmPassword }` | Valores de texto; se conservan siempre ante errores (FR-010) |
| `acceptedTerms` | boolean | Estado de la casilla; se conserva ante errores |
| `touched` | `Record<campo \| 'acceptedTerms', boolean>` | Control visitado. La casilla solo se marca como tocada al enviar (su error aparece solo al enviar). |
| `fieldErrors` | `RegistrationErrors` | Errores visibles: los de controles tocados |
| `failure` | boolean | Muestra "No pudimos completar el registro. Intenta más tarde." (`role=alert`) |
| `emailTaken` | boolean | Muestra "Ya existe una cuenta con este correo" en el correo hasta editarlo (FR-030) |

Fuera de este estado, por ser locales de su componente: la visibilidad de cada contraseña
(`PasswordField`) y la ventana de términos abierta o cerrada (`Modal`).

**Transiciones clave**:

- `change(campo, valor)`: actualiza el valor y recalcula los errores visibles de los controles
  tocados. Así, cambiar `password` revalida `confirmPassword` si ya se tocó (US2-9). Desde
  `failure` vuelve a `editing`.
- `blur(campo)`: marca el campo como tocado y muestra su error.
- `toggleTerms(checked)`: actualiza la casilla y, si ya tenía error, lo recalcula (US2-8).
- `submit`: si está en `submitting`, se ignora (envíos repetidos). Si no, marca todo como tocado.
  Con errores, queda en `editing` y la vista enfoca el primer control con error, en el orden
  nombre → correo → contraseña → confirmación → casilla. Sin errores, pasa a `submitting`.
- `result(success)`: la vista llama a `onRegistered()` (sin datos). `result(unavailable)` pasa a
  `failure` sin borrar ningún valor. `result(email-taken)` vuelve a `editing` con `emailTaken`;
  la vista enfoca el correo. Editar el correo (no otro campo) o enviar de nuevo lo apaga.

## Aviso de registro completado (UI, `App`)

| Campo | Tipo | Descripción |
|---|---|---|
| `signupCompleted` | boolean (estado de `App`) | `true` entre `onRegistered()` y el primer render del login. Se consume en ese render: el login lo recibe como `initialNotice` y `App` lo vuelve a `false`. |

No contiene datos personales y no se guarda en la URL, el historial ni el almacenamiento
(FR-013, FR-027).

## Ruta (UI, navegación)

| Valor de `location.pathname` | Pantalla | Título del documento |
|---|---|---|
| `/login` | Login | "KynWallet · Iniciar sesión" |
| `/registro` | Registro | "KynWallet · Crear cuenta" |
| cualquier otro (incluido `/`) | redirección con reemplazo a `/login` | — |

## Cambios en el login (solo los necesarios)

| Elemento | Cambio | Motivo |
|---|---|---|
| `LoginState` | Nuevo campo `successNotice: string \| null`, con valor inicial desde `initialNotice` | R3 |
| `loginReducer` `change` | Pone `successNotice = null` (el aviso `notice` existente no cambia) | FR-013 |
| `loginReducer` `logout` | Sin cambios (`initialLoginState` ya tiene `successNotice: null`) | — |
| "Regístrate" | Deja de llamar a `showNotice`; es un `Link` a `/registro` | FR-021 |
