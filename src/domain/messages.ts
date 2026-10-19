/** Textos visibles para el usuario. Fuente única (Constitución, Principio IV). */
export const MESSAGES = {
  EMAIL_REQUIRED: 'Ingresa tu correo electrónico',
  EMAIL_INVALID: 'Ingresa un correo electrónico válido',
  PASSWORD_REQUIRED: 'Ingresa tu contraseña',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres',
  PASSWORD_TOO_LONG: 'La contraseña no puede superar 128 caracteres',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos',
  UNAVAILABLE: 'Servicio de acceso no disponible. Intenta más tarde.',
  FEATURE_UNAVAILABLE: 'Función no disponible en esta demostración',
  FULL_NAME_REQUIRED: 'Ingresa tu nombre completo',
  FULL_NAME_TOO_LONG: 'El nombre no puede superar 100 caracteres',
  PASSWORD_NEEDS_UPPERCASE: 'La contraseña debe incluir al menos una letra mayúscula',
  PASSWORD_NEEDS_LOWERCASE: 'La contraseña debe incluir al menos una letra minúscula',
  PASSWORD_NEEDS_NUMBER: 'La contraseña debe incluir al menos un número',
  PASSWORD_NEEDS_SPECIAL:
    'La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %)',
  CONFIRM_PASSWORD_REQUIRED: 'Confirma tu contraseña',
  PASSWORDS_MISMATCH: 'Las contraseñas no coinciden',
  TERMS_REQUIRED: 'Debes aceptar los términos y condiciones',
  SIGNUP_SUCCESS:
    'Registro completado (demostración). Ya puedes iniciar sesión con tu nueva cuenta.',
  EMAIL_TAKEN: 'Ya existe una cuenta con este correo',
  SIGNUP_UNAVAILABLE: 'No pudimos completar el registro. Intenta más tarde.',
  COMING_SOON: 'Próximamente',
  TERMS_TITLE: 'Términos y condiciones',
  TERMS_TEXT: [
    'Documento de demostración sin valor legal. KynWallet es una aplicación ficticia creada para mostrar un flujo de registro; no ofrece servicios financieros reales.',
    'Al marcar la casilla aceptas que esta demostración guarde tu cuenta solo en la memoria de esta pestaña: sirve para iniciar sesión mientras no recargues ni cierres la página, y no se envía a ningún servidor.',
    'Este texto es un marcador de posición y será sustituido por los términos definitivos si el producto llega a existir.',
  ],
} as const;
