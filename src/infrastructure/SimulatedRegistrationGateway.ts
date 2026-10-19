import type {
  RegistrationGateway,
  RegistrationRequest,
} from '@/application/ports/RegistrationGateway';
import type { RegistrationResult } from '@/domain/registration';
import { normalizeEmail } from '@/domain/validation';
import type { InMemoryAccountStore } from './InMemoryAccountStore';

const DEFAULT_DELAY_MS = 1000;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Registro simulado: espera y guarda la cuenta en el almacén en memoria compartido con el login
 * (research.md R7, FR-014). Sin red ni almacenamiento del navegador.
 */
export class SimulatedRegistrationGateway implements RegistrationGateway {
  private readonly store: InMemoryAccountStore;
  private readonly delayMs: number;
  private readonly reservedEmails: ReadonlySet<string>;

  constructor(
    store: InMemoryAccountStore,
    options: { delayMs?: number; reservedEmails?: readonly string[] } = {},
  ) {
    this.store = store;
    this.delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
    // Correos de las cuentas de demostración: no se pueden registrar de nuevo.
    this.reservedEmails = new Set((options.reservedEmails ?? []).map(normalizeEmail));
  }

  async register({ fullName, email, password }: RegistrationRequest): Promise<RegistrationResult> {
    await wait(this.delayMs);
    if (this.reservedEmails.has(normalizeEmail(email))) return { kind: 'email-taken' };
    const added = this.store.add({ email, password, displayName: fullName });
    return added ? { kind: 'success' } : { kind: 'email-taken' };
  }
}
