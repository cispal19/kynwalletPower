import type { RegistrationResult } from '@/domain/registration';

/**
 * Datos que recibe el puerto. La contraseña es necesaria para poder iniciar sesión con la cuenta
 * nueva; la confirmación no sale de la vista (Constitución 5.4: minimización).
 */
export type RegistrationRequest = {
  fullName: string;
  email: string;
  password: string;
};

/** Puerto de registro (contracts/registration-gateway.md). */
export interface RegistrationGateway {
  register(request: RegistrationRequest): Promise<RegistrationResult>;
}
