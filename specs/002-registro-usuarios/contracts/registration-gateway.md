# Contract: Caso de uso y puerto de registro

Contrato interno entre capas (Constitución 3.4). Sigue la misma forma que
[`AuthGateway`](../../001-login-billetera/contracts/auth-gateway.md).

## Tipos de dominio (`src/domain/registration.ts`)

```ts
type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

type RegistrationErrors = Partial<Record<keyof RegistrationData, string>>;

type RegistrationResult =
  | { kind: 'success' }
  | { kind: 'email-taken' } // FR-030
  | { kind: 'unavailable' };

function validateRegistration(data: RegistrationData): RegistrationErrors; // pura, {} = válido
```

## Puerto (`src/application/ports/RegistrationGateway.ts`)

```ts
// La contraseña es necesaria para iniciar sesión con la cuenta nueva (FR-014); la confirmación
// y la casilla no salen de la vista (minimización, Const. 5.4).
type RegistrationRequest = { fullName: string; email: string; password: string };

interface RegistrationGateway {
  register(request: RegistrationRequest): Promise<RegistrationResult>;
}
```

## Caso de uso (`src/application/register.ts`)

```ts
type Register = (data: RegistrationData) => Promise<RegistrationResult>;
function createRegister(gateway: RegistrationGateway): Register;
```

| # | Entrada | Resultado esperado |
|---|---|---|
| C1 | Datos válidos; el gateway responde `success` | `{ kind: 'success' }` y el gateway recibe `{ fullName: trim, email: normalizado, password }` |
| C2 | El gateway lanza una excepción o rechaza la promesa | `{ kind: 'unavailable' }`, sin propagar la excepción |
| C3 | Cualquier entrada | `password` llega sin alterar (el login la compara de forma exacta); nunca recibe `confirmPassword` ni `acceptedTerms` |
| C4 | El gateway responde `email-taken` | Se devuelve tal cual |

La UI valida con `validateRegistration` antes de llamar al caso de uso, igual que el login con
`validateCredentials`.

## Adaptador (`src/infrastructure/SimulatedRegistrationGateway.ts`)

| # | Comportamiento |
|---|---|
| S1 | Espera `delayMs` (1000 por defecto, configurable en pruebas) y responde `{ kind: 'success' }` |
| S2 | No usa almacenamiento del navegador ni red, y no modifica las cuentas de demostración |
| S3 | Con `success`, guarda `{ email, password, displayName: fullName }` en el `InMemoryAccountStore` recibido |
| S4 | Correo en el almacén o en `reservedEmails` (cuentas de demostración) → `{ kind: 'email-taken' }`, sin sobrescribir |

## Almacén en memoria (`src/infrastructure/InMemoryAccountStore.ts`)

Compartido por el registro y el login. Solo vive en memoria: se pierde al recargar.

| # | Comportamiento |
|---|---|
| M1 | `add(account)` guarda con el correo normalizado; `find(email)` no distingue mayúsculas ni espacios |
| M2 | `add` de un correo existente devuelve `false` y no sobrescribe |
| M3 | `find` de un correo desconocido devuelve `undefined` |
| M4 | No usa el almacenamiento del navegador |

`InMemoryAuthGateway` (001) recibe el almacén en `options.registered` y busca primero ahí. Sin
configuración de demostración (`accounts = null`), una cuenta registrada inicia sesión y
cualquier otro correo sigue respondiendo `unavailable` (001 C4).

## Raíz de composición (`src/main.tsx`)

```ts
const registered = new InMemoryAccountStore();
const authenticate = createAuthenticate(new InMemoryAuthGateway(accounts, { registered }));
const register = createRegister(
  new SimulatedRegistrationGateway(registered, {
    reservedEmails: (accounts ?? []).map((account) => account.email),
  }),
);
<App authenticate={authenticate} register={register} />
```
