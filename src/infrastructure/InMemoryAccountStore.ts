import type { DemoAccount } from '@/domain/auth';
import { normalizeEmail } from '@/domain/validation';

/**
 * Cuentas creadas con el registro durante la sesión. Viven solo en memoria: se pierden al
 * recargar y nunca llegan al almacenamiento del navegador ni a la red (002 FR-014).
 */
export class InMemoryAccountStore {
  private readonly accounts = new Map<string, DemoAccount>();

  /** Guarda la cuenta; devuelve false, sin sobrescribir, si el correo ya existe. */
  add(account: DemoAccount): boolean {
    const email = normalizeEmail(account.email);
    if (this.accounts.has(email)) return false;
    this.accounts.set(email, { ...account, email });
    return true;
  }

  find(email: string): DemoAccount | undefined {
    return this.accounts.get(normalizeEmail(email));
  }
}
