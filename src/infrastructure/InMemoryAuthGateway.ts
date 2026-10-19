import type { AuthGateway } from '@/application/ports/AuthGateway';
import type { AuthResult, DemoAccount, LoginCredentials } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';
import type { InMemoryAccountStore } from './InMemoryAccountStore';

const DEFAULT_DELAY_MS = 1000;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Autenticación simulada en memoria (contracts/auth-gateway.md, research.md R5). Acepta las
 * cuentas de demostración y las registradas en la sesión (002 FR-014).
 */
export class InMemoryAuthGateway implements AuthGateway {
  private readonly accounts: readonly DemoAccount[] | null;
  private readonly delayMs: number;
  private readonly registered: InMemoryAccountStore | undefined;

  constructor(
    accounts: readonly DemoAccount[] | null,
    options: { delayMs?: number; registered?: InMemoryAccountStore } = {},
  ) {
    this.accounts = accounts;
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
    this.registered = options.registered;
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    await wait(this.delayMs);
    try {
      const email = normalizeEmail(credentials.email);
      const registered = this.registered?.find(email);
      // Sin configuración de demostración solo funcionan las cuentas registradas en la sesión.
      if (!registered && !this.accounts) return { kind: 'unavailable' };
      const account =
        registered ?? this.accounts?.find((candidate) => normalizeEmail(candidate.email) === email);
      // Correo inexistente y contraseña incorrecta producen el mismo resultado (FR-010).
      if (!account || account.password !== credentials.password) {
        return { kind: 'invalid-credentials' };
      }
      return { kind: 'success', displayName: account.displayName };
    } catch {
      return { kind: 'unavailable' };
    }
  }
}
