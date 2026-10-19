# Contract: Interfaz de usuario del registro

Contrato observable por la persona usuaria y por las pruebas: Testing Library busca los elementos
por rol y nombre accesible. Los textos son exactos, tomados del frame `04 · Registro` (nodo `31:2`)
y de la spec.

## Pantalla `/registro`

| Elemento | Rol / nombre accesible | Atributos y comportamiento |
|---|---|---|
| Título | `heading` nivel 1 "Crea tu cuenta" | `tabIndex=-1`; recibe el foco al llegar desde otra ruta |
| Subtítulo | texto "Completa tus datos para comenzar" | — |
| Nombre | `textbox` "Nombre completo" | `autocomplete=name`, placeholder "Ej: Diego Martínez" |
| Correo | `textbox` "Correo electrónico" | `type=email`, `autocomplete=email`, placeholder "tucorreo@ejemplo.com" |
| Contraseña | campo "Contraseña" | `type=password`, `autocomplete=new-password`, placeholder "••••••••" |
| Visibilidad | `button` "Mostrar contraseña" / "Ocultar contraseña" | `aria-pressed`; componente `PasswordField` existente |
| Confirmación | campo "Confirmar contraseña" | igual que la contraseña |
| Visibilidad de la confirmación | `button` "Mostrar contraseña" / "Ocultar contraseña" | uno por campo |
| Términos | `checkbox` "Acepto los términos y condiciones" | Nombre por `aria-labelledby`; clic en "Acepto los" la marca |
| Enlace de términos | `button` "términos y condiciones" | Abre la ventana de términos; al cerrarla ("Cerrar" o Escape) la casilla queda marcada |
| Enviar | `button` "Crear cuenta" (`type=submit`) | En carga: deshabilitado, `aria-busy=true`, texto "Creando cuenta…" |
| Divisor | texto "o regístrate con" | Decorativo |
| Google / Apple | `button` "Google", `button` "Apple" | `window.alert("Próximamente")`; sin red ni navegación |
| Ir al login | `link` "Inicia sesión" precedido por "¿Ya tienes cuenta?" | `href="/login"`; navega sin recargar |

**Errores por control**: texto bajo el control, con `id` enlazado mediante `aria-describedby`; el
control lleva `aria-invalid=true`. La casilla muestra su error debajo de la fila de términos.

| Control | Mensajes posibles |
|---|---|
| Nombre completo | "Ingresa tu nombre completo" · "El nombre no puede superar 100 caracteres" |
| Correo electrónico | "Ingresa tu correo electrónico" · "Ingresa un correo electrónico válido" |
| Contraseña | "Ingresa tu contraseña" · "La contraseña debe tener al menos 8 caracteres" · "La contraseña no puede superar 128 caracteres" · "La contraseña debe incluir al menos una letra mayúscula" · "La contraseña debe incluir al menos una letra minúscula" · "La contraseña debe incluir al menos un número" · "La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %)" (uno a la vez, FR-029) |
| Confirmar contraseña | "Confirma tu contraseña" · "Las contraseñas no coinciden" |
| Términos | "Debes aceptar los términos y condiciones" |

**Mensaje global** (encima de "Crear cuenta"):

| Caso | Rol | Texto |
|---|---|---|
| Fallo inesperado de la simulación | `alert` | "No pudimos completar el registro. Intenta más tarde." |

## Ventana de términos

| Elemento | Rol / nombre accesible | Comportamiento |
|---|---|---|
| Ventana | `dialog` "Términos y condiciones" (modal) | `aria-labelledby` apunta al título; el fondo queda inerte |
| Título | `heading` nivel 2 "Términos y condiciones" | — |
| Contenido | texto ficticio que incluye "Documento de demostración sin valor legal" | — |
| Cerrar | `button` "Cerrar" | Cierra; el foco vuelve a "términos y condiciones" |
| Escape | — | Igual que "Cerrar" |

## Login `/login` (solo cambios)

| Elemento | Antes (001) | Ahora |
|---|---|---|
| Registro | `button` "Regístrate" → aviso "Función no disponible en esta demostración" | `link` "Regístrate", `href="/registro"` |
| Mensaje de éxito | — | `status` "Registro completado (demostración). Ya puedes iniciar sesión con tu nueva cuenta." encima del título; recibe el foco (`tabIndex=-1`); desaparece al escribir en un campo |

Ningún otro elemento, texto, rol ni comportamiento del login cambia
([contrato 001](../../001-login-billetera/contracts/ui-login.md)).

## Navegación

| Situación | Resultado |
|---|---|
| Abrir `/login` o `/registro` directamente | Se muestra la pantalla correspondiente |
| Abrir `/` o una ruta desconocida | Se reemplaza la dirección por `/login` |
| Activar "Regístrate" / "Inicia sesión" | `pushState` a la otra ruta; atrás y adelante funcionan |
| Registro válido | `replaceState` a `/login` con el mensaje de éxito |
| Cambio de ruta | `document.title` se actualiza y el foco pasa al `h1` (o al mensaje de éxito) |

## Teclado

Orden de tabulación: nombre → correo → contraseña → visibilidad → confirmación → visibilidad →
casilla → "términos y condiciones" → "Crear cuenta" → Google → Apple → "Inicia sesión". Enter
en un campo envía el formulario; Espacio marca o desmarca la casilla. El foco es siempre visible
(`--focus-ring` existente).

## Distribución (referencia visual)

| Ancho | Distribución |
|---|---|
| ≥ 1280px | Panel de marca 620px + formulario de 400px centrado |
| 960–1279px | Panel de marca 43 % + formulario |
| < 960px | Franja con el logo + formulario (sin titular, texto ni tarjeta) |
| < 480px | Igual, con 16px de margen lateral |

Panel de marca del registro: titular "Comienza tu / camino financiero." y texto "Crea tu cuenta
en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar."
