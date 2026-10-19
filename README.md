# KynWallet · Inicio de sesión y registro (demo)

Demostración funcional, solo del lado del cliente, de las pantallas de inicio de sesión y de
registro de la billetera virtual KynWallet. Reproduce los diseños de Figma
([01 · Login](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=2-2)
y [04 · Registro](https://www.figma.com/design/q3svEn6CvsilMMj61UrFks/?node-id=31-2)), valida
los campos y simula la autenticación y el registro, sin backend ni base de datos.

Especificación, plan y tareas: [`specs/001-login-billetera/`](specs/001-login-billetera/) y
[`specs/002-registro-usuarios/`](specs/002-registro-usuarios/).

## Requisitos

- Node.js 22.22.2 o superior dentro de la línea 22, o 24.15.0 o superior (lo exige `jsdom`, que
  usan las pruebas), y npm 10 o superior. Con nvm: `nvm use` (lee `.nvmrc`).

## Rutas

| Dirección   | Pantalla                                |
| ----------- | --------------------------------------- |
| `/login`    | Inicio de sesión                        |
| `/registro` | Registro                                |
| otra (`/`)  | Se reemplaza por `/login` (redirección) |

"Regístrate" (login) e "Inicia sesión" (registro) navegan entre ambas sin recargar; atrás y
adelante del navegador funcionan. `npm run dev` y `npm run preview` ya sirven `index.html` para
cualquier ruta. **Hosting estático**: hay que configurar el servidor para que devuelva
`index.html` en las rutas desconocidas (p. ej. `/registro`); si no, recargar en ellas da 404.

## Registro simulado

- Tras "Crear cuenta" se espera 1 s y se vuelve a `/login` con el mensaje "Registro completado
  (demostración)…". La cuenta nueva sirve para iniciar sesión **mientras no recargues ni cierres
  la pestaña**: vive solo en memoria, también sin `.env.local`.
- No modifica `VITE_DEMO_USERS` ni guarda nada en el almacenamiento del navegador, la URL o la red.
- Un correo ya registrado (o de una cuenta de demostración) se rechaza con "Ya existe una cuenta
  con este correo".
- Google y Apple muestran el aviso nativo "Próximamente".
- Los términos y condiciones son un texto ficticio sin valor legal.

## Configuración

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta **ficticia** en `VITE_DEMO_USERS`:

```dotenv
VITE_DEMO_USERS=[{"email":"tu.correo@example.com","password":"minimo-8-caracteres","displayName":"Tu Nombre"}]
```

- `password`: de 8 a 128 caracteres. `displayName`: de 1 a 80 caracteres. Los correos no se pueden repetir.
- `.env.local` no se versiona: la Constitución del proyecto (regla 5.3) prohíbe credenciales en el
  código fuente o en archivos versionados.
- ⚠️ Al ser una aplicación solo-cliente, el valor de `VITE_DEMO_USERS` queda incluido en el bundle
  compilado. Usa únicamente cuentas ficticias.
- Si la variable falta o es inválida, la pantalla muestra "Servicio de acceso no disponible".

## Scripts

| Comando                           | Descripción                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en <http://localhost:5173>                                                                                                     |
| `npm run build`                   | Typecheck y build de producción en `dist/`                                                                                                            |
| `npm run preview`                 | Sirve el build de producción                                                                                                                          |
| `npm test`                        | Ejecuta las pruebas una vez                                                                                                                           |
| `npm run test:watch`              | Pruebas en modo observación                                                                                                                           |
| `npm run test:coverage`           | Pruebas con cobertura (umbral: 80 %)                                                                                                                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                                     |
| `npm run verify`                  | Todos los controles de cumplimiento: lint, formato, tipos, pruebas con cobertura, build, auditoría de dependencias y licencias, y escaneo de secretos |

## Arquitectura

Clean Architecture ligera. Las dependencias apuntan hacia el dominio y ESLint lo verifica:

```text
src/
├── domain/          # Tipos, reglas de validación y textos. Sin React.
├── application/     # Casos de uso `authenticate` y `register`; puertos `AuthGateway` y `RegistrationGateway`
├── infrastructure/  # `InMemoryAuthGateway`, `SimulatedRegistrationGateway` (simulaciones, 1 s) y `loadDemoAccounts`
├── ui/
│   ├── styles/      # Tokens de Figma (`tokens.css`) y estilos globales
│   ├── components/  # Button, TextField, PasswordField, Checkbox, SocialButton, Divider, Alert, Modal
│   ├── layout/      # AuthLayout (dos paneles) y BrandPanel
│   ├── navigation/  # Rutas, `navigate`, `useCurrentPath` y `Link` (History API, sin router)
│   ├── features/login/     # LoginForm, WelcomeView, reducer y hook
│   └── features/register/  # RegisterForm, TermsDialog, reducer y hook
├── App.tsx
└── main.tsx         # Raíz de composición (inyección de dependencias)
```

Las pruebas viven junto al código (`*.test.ts(x)`). Cada caso se nombra con el escenario o
requisito que verifica (por ejemplo, `US2-1`, `FR-012`) para mantener la trazabilidad.

## Notas de diseño

- **Contraste (pendiente de aprobación de diseño):** varios colores de Figma no alcanzan
  WCAG 2.1 AA (botón 2.83:1, enlaces 3.56:1, textos secundarios 3.28:1, bordes 1.40:1). Se
  usan variantes más oscuras del mismo tono (`--brand-700`, `--neutral-600`, `--neutral-border`
  en `src/ui/styles/tokens.css`). Detalle en `specs/001-login-billetera/research.md` (R3).
- Los iconos de Google, Apple y del control de visibilidad son los marcadores de posición del
  diseño de Figma.
- Fuera de alcance: recuperar contraseña, acceso con Google/Apple, persistencia de
  "Recordarme" y bloqueo por intentos fallidos. Al activarlos se muestra un aviso. El registro
  es una simulación (ver "Registro simulado").
