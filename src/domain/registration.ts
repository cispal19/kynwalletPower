import { MESSAGES } from './messages';
import { validateEmail, validatePassword } from './validation';

export const FULL_NAME_MAX_LENGTH = 100;

export type RegistrationData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type RegistrationErrors = Partial<Record<keyof RegistrationData, string>>;

export type RegistrationResult =
  { kind: 'success' } | { kind: 'email-taken' } | { kind: 'unavailable' };

function validateFullName(fullName: string): string | undefined {
  const trimmed = fullName.trim();
  if (trimmed === '') return MESSAGES.FULL_NAME_REQUIRED;
  if (trimmed.length > FULL_NAME_MAX_LENGTH) return MESSAGES.FULL_NAME_TOO_LONG;
  return undefined;
}

const UPPERCASE = /\p{Lu}/u;
const LOWERCASE = /\p{Ll}/u;
const NUMBER = /\p{N}/u;
/** Cualquier carácter que no sea letra, número ni espacio. */
const SPECIAL = /[^\p{L}\p{N}\s]/u;

/**
 * Contraseña nueva: la regla de longitud del login más complejidad (US2-11). El login no la
 * exige, para no rechazar contraseñas ya existentes.
 */
function validateNewPassword(password: string): string | undefined {
  const lengthError = validatePassword(password);
  if (lengthError) return lengthError;
  if (!UPPERCASE.test(password)) return MESSAGES.PASSWORD_NEEDS_UPPERCASE;
  if (!LOWERCASE.test(password)) return MESSAGES.PASSWORD_NEEDS_LOWERCASE;
  if (!NUMBER.test(password)) return MESSAGES.PASSWORD_NEEDS_NUMBER;
  if (!SPECIAL.test(password)) return MESSAGES.PASSWORD_NEEDS_SPECIAL;
  return undefined;
}

function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (confirmPassword === '') return MESSAGES.CONFIRM_PASSWORD_REQUIRED;
  // Comparación exacta: distingue mayúsculas y espacios (FR-006).
  if (confirmPassword !== password) return MESSAGES.PASSWORDS_MISMATCH;
  return undefined;
}

/** Reglas de FR-002 a FR-008 y FR-029. Devuelve {} si los datos son válidos. */
export function validateRegistration(data: RegistrationData): RegistrationErrors {
  const errors: RegistrationErrors = {};
  const checks: [keyof RegistrationData, string | undefined][] = [
    ['fullName', validateFullName(data.fullName)],
    ['email', validateEmail(data.email)],
    ['password', validateNewPassword(data.password)],
    ['confirmPassword', validateConfirmPassword(data.password, data.confirmPassword)],
    ['acceptedTerms', data.acceptedTerms ? undefined : MESSAGES.TERMS_REQUIRED],
  ];
  for (const [field, error] of checks) {
    if (error) errors[field] = error;
  }
  return errors;
}
