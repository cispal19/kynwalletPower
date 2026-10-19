import type { RegistrationData, RegistrationResult } from '@/domain/registration';
import { normalizeEmail } from '@/domain/validation';
import type { RegistrationGateway } from './ports/RegistrationGateway';

export type Register = (data: RegistrationData) => Promise<RegistrationResult>;

/** Caso de uso: registra delegando en el puerto, sin entregarle la confirmación. */
export function createRegister(gateway: RegistrationGateway): Register {
  return async ({ fullName, email, password }) => {
    try {
      // La contraseña va tal cual: el login la compara de forma exacta (001 FR-010).
      return await gateway.register({
        fullName: fullName.trim(),
        email: normalizeEmail(email),
        password,
      });
    } catch {
      return { kind: 'unavailable' };
    }
  };
}
