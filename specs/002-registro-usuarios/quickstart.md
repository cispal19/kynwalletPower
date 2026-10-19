# Quickstart: Registro de Usuarios de KynWallet

Guía para ejecutar y validar el registro de punta a punta. La configuración del login
(`.env.local`, `VITE_DEMO_USERS`) sigue igual que en el
[quickstart de 001](../001-login-billetera/quickstart.md); el registro no la necesita.

## Prerrequisitos

- Node.js ≥ 22.22.2 (o ≥ 24.15.0); el repositorio incluye `.nvmrc` con `22` (D1, [research.md](./research.md#decisiones-pendientes)).
  Con la versión actual de las dependencias, Node **22.22.2 o superior**; con Node 20 las
  pruebas no arrancan.
- npm 10 o superior.

## Ejecutar y verificar

```bash
npm install
npm run dev        # http://localhost:5173/login y http://localhost:5173/registro
npm test           # pruebas unitarias, de componentes y de integración
npm run verify     # todos los controles de la Constitución 9.4
```

Resultado esperado: todas las pruebas pasan, incluidas las 111 previas del login, y la cobertura
es ≥ 80 %.

## Escenarios de validación manual

Ejecútalos en un navegador real (las dos últimas versiones de Chrome, Firefox, Safari o Edge).

| # | Acción | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir `/registro` | Pantalla "Crea tu cuenta"; título del documento "KynWallet · Crear cuenta" | US3-4 |
| 2 | Completar "Ana Pérez", `ana@example.com`, `Clave-segura1!`, `Clave-segura1!`, marcar términos y presionar "Crear cuenta" | "Creando cuenta…" ~1 s; luego `/login` con "Registro completado (demostración). Ya puedes iniciar sesión con tu nueva cuenta." enfocado | US1-1, US1-2, US1-3 |
| 3 | Tras el escenario 2, presionar "atrás" en el navegador | No vuelve al formulario enviado (la entrada de `/registro` se reemplazó) | R3 |
| 4 | Tras el escenario 2, escribir en el correo del login | El mensaje de éxito desaparece | FR-013 |
| 5 | Tras el escenario 2, recargar la página | `/login` sin mensaje de éxito | US1-4 |
| 6 | Tras el escenario 2 y sin recargar, iniciar sesión con `ana@example.com` / `Clave-segura1!` (también sin `.env.local`) | "¡Bienvenido, Ana Pérez!". Tras recargar, la cuenta ya no existe | US1-6, FR-014 |
| 6b | Tras el escenario 2, volver a `/registro` y registrar otra vez `ana@example.com` (o el correo de una cuenta de `.env.local`) | Tras ~1 s, "Ya existe una cuenta con este correo" en el correo, con el foco en él; sigue en `/registro` | US2-12, FR-030 |
| 7 | En `/registro`, presionar "Crear cuenta" sin datos | Cinco mensajes junto a cada control; sigue en `/registro`; foco en "Nombre completo" | US2-1 |
| 8 | Nombre "   " (solo espacios) y salir del campo | "Ingresa tu nombre completo" | US2-2 |
| 9 | Correo "usuario@" y salir del campo | "Ingresa un correo electrónico válido" | US2-3 |
| 10 | Contraseña "1234567"; luego "12345678"; luego "Abcdefg!"; luego "Abcdefg1"; luego "Abcdefg1!" | "La contraseña debe tener al menos 8 caracteres"; después "La contraseña debe incluir al menos una letra mayúscula"; después "La contraseña debe incluir al menos un número"; después "La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %)"; con "Abcdefg1!" el mensaje desaparece | US2-4, US2-11 |
| 11 | Confirmación distinta de la contraseña y salir del campo | "Las contraseñas no coinciden" | US2-5 |
| 12 | Todo válido, términos sin marcar, "Crear cuenta" | "Debes aceptar los términos y condiciones"; sin redirección; datos intactos | US2-6, US2-7 |
| 13 | Presionar "Google" y luego "Apple" | Diálogo del navegador "Próximamente"; al cerrarlo, foco en el botón y datos intactos | US4 |
| 14 | Activar "términos y condiciones" | Ventana "Términos y condiciones"; Tab no sale de ella; Escape la cierra y el foco vuelve al enlace; la casilla queda marcada (si ya lo estaba, sigue igual) | US5 |
| 15 | Activar "Inicia sesión" | `/login` sin mensaje de éxito; "atrás" vuelve a `/registro` vacío | US3-1, US3-3 |
| 16 | En `/login`, activar "Regístrate" | `/registro` con el formulario vacío | US3-2, FR-021 |
| 17 | Abrir `/` y `/otra` | Redirección a `/login` | FR-018 |
| 18 | Repetir los escenarios 1–16 del [quickstart de 001](../001-login-billetera/quickstart.md#escenarios-de-validación-manual), salvo "Regístrate" en el escenario 10 | Mismo resultado que antes | FR-022 |

## Comprobación de teclado

Desde la barra de direcciones, recorre `/registro` solo con Tab, Mayús+Tab, Enter, Espacio y
Escape:

- [ ] El orden coincide con [contracts/ui-register.md](./contracts/ui-register.md#teclado)
- [ ] El foco es visible en todos los controles, incluidos el enlace de términos y los iconos de visibilidad
- [ ] Enter en un campo envía; Espacio marca la casilla
- [ ] Se completa un registro válido y se llega al mensaje de éxito sin usar el ratón
- [ ] La ventana de términos retiene el foco y Escape la cierra

## Revisión visual

| Ancho | Referencia | Qué comprobar |
|---|---|---|
| 1440 × 1024 | Captura del frame `04 · Registro` (Figma, nodo `31:2`) | Textos, orden, jerarquía, columna de 400px, 16px entre campos, botones sociales lado a lado (SC-006). Diferencias aceptadas: colores accesibles (D4); degradado y SVG según D2/D3 |
| 1024 | Sin referencia | Dos paneles (43 % / resto) sin solapamientos |
| 375 y 320 | **Sin frame móvil en Figma** | Solo la franja del logo y el formulario; sin scroll horizontal; nada recortado (FR-019, FR-020, SC-007). No se valida contra un diseño inexistente. |

Registra el resultado, con capturas, en la descripción del pull request.
