import { validateRegistration, type RegistrationData } from './registration';

const valid: RegistrationData = {
  fullName: 'Ana Pérez',
  email: 'ana@example.test',
  password: 'Clave-segura-1',
  confirmPassword: 'Clave-segura-1',
  acceptedTerms: true,
};

const errorsFor = (overrides: Partial<RegistrationData>) =>
  validateRegistration({ ...valid, ...overrides });

describe('validateRegistration (data-model.md, RegistrationData)', () => {
  it('FR-002: datos completos y válidos → {}', () => {
    expect(validateRegistration(valid)).toEqual({});
  });

  it('US2-1: envío vacío → errores en las 5 claves', () => {
    expect(
      validateRegistration({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false,
      }),
    ).toEqual({
      fullName: 'Ingresa tu nombre completo',
      email: 'Ingresa tu correo electrónico',
      password: 'Ingresa tu contraseña',
      confirmPassword: 'Confirma tu contraseña',
      acceptedTerms: 'Debes aceptar los términos y condiciones',
    });
  });

  it.each(['', '   '])('US2-2: nombre %j → "Ingresa tu nombre completo"', (fullName) => {
    expect(errorsFor({ fullName }).fullName).toBe('Ingresa tu nombre completo');
  });

  it('FR-003: nombre de 100 caracteres tras trim es válido; 101 no', () => {
    expect(errorsFor({ fullName: ` ${'a'.repeat(100)} ` }).fullName).toBeUndefined();
    expect(errorsFor({ fullName: 'a'.repeat(101) }).fullName).toBe(
      'El nombre no puede superar 100 caracteres',
    );
  });

  it('FR-003: nombre con espacios periféricos es válido', () => {
    expect(errorsFor({ fullName: '  Ana  ' })).toEqual({});
  });

  it('FR-004: correo vacío → "Ingresa tu correo electrónico"', () => {
    expect(errorsFor({ email: '' }).email).toBe('Ingresa tu correo electrónico');
  });

  it.each(['usuario@', 'usuario.com', 'a@b.c', `${'a'.repeat(243)}@example.com`])(
    'US2-3: correo %j → "Ingresa un correo electrónico válido"',
    (email) => {
      expect(errorsFor({ email }).email).toBe('Ingresa un correo electrónico válido');
    },
  );

  it('FR-004: correo con mayúsculas y espacios periféricos es válido', () => {
    expect(errorsFor({ email: '  Ana@Example.com ' })).toEqual({});
  });

  it('FR-005: contraseña vacía → "Ingresa tu contraseña"', () => {
    expect(errorsFor({ password: '', confirmPassword: '' }).password).toBe('Ingresa tu contraseña');
  });

  it('US2-4: 7 caracteres → error; exactamente 8 (con mayúscula, minúscula y especial) → válida', () => {
    expect(errorsFor({ password: 'Abcde1!', confirmPassword: 'Abcde1!' }).password).toBe(
      'La contraseña debe tener al menos 8 caracteres',
    );
    expect(errorsFor({ password: 'Abcdef1!', confirmPassword: 'Abcdef1!' })).toEqual({});
  });

  it.each([
    ['solo dígitos', '12345678', 'La contraseña debe incluir al menos una letra mayúscula'],
    ['sin mayúscula', 'abcdefg!', 'La contraseña debe incluir al menos una letra mayúscula'],
    ['sin minúscula', 'ABCDEFG1!', 'La contraseña debe incluir al menos una letra minúscula'],
    ['sin número', 'Abcdefg!', 'La contraseña debe incluir al menos un número'],
    [
      'sin carácter especial',
      'Abcdefg1',
      'La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %)',
    ],
    [
      'con un espacio como único símbolo',
      'Abcdef1 ',
      'La contraseña debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %)',
    ],
  ])('US2-11: contraseña %s → mensaje de complejidad', (_c, password, message) => {
    expect(errorsFor({ password, confirmPassword: password }).password).toBe(message);
  });

  it('US2-11: letras acentuadas cuentan como mayúscula o minúscula', () => {
    expect(errorsFor({ password: 'ÁRBOLñ#1', confirmPassword: 'ÁRBOLñ#1' })).toEqual({});
  });

  it('FR-005: 128 caracteres válida; 129 → error', () => {
    const max = `Aa1!${'a'.repeat(124)}`;
    const over = `Aa1!${'a'.repeat(125)}`;
    expect(errorsFor({ password: max, confirmPassword: max })).toEqual({});
    expect(errorsFor({ password: over, confirmPassword: over }).password).toBe(
      'La contraseña no puede superar 128 caracteres',
    );
  });

  it('FR-005: la contraseña no se recorta (los espacios cuentan para la longitud)', () => {
    const withSpaces = 'Aa1!    ';
    expect(errorsFor({ password: withSpaces, confirmPassword: withSpaces })).toEqual({});
  });

  it('FR-006: confirmación vacía → "Confirma tu contraseña"', () => {
    expect(errorsFor({ confirmPassword: '' }).confirmPassword).toBe('Confirma tu contraseña');
  });

  it.each([
    ['distinta', 'Clave-segura-1', 'otra-clave-22'],
    ['distinta solo en mayúsculas', 'Clave123', 'clave123'],
    ['con un espacio final', 'clave 123', 'clave 123 '],
  ])('US2-5: confirmación %s → "Las contraseñas no coinciden"', (_c, password, confirm) => {
    expect(errorsFor({ password, confirmPassword: confirm }).confirmPassword).toBe(
      'Las contraseñas no coinciden',
    );
  });

  it('US2-6: términos sin aceptar → "Debes aceptar los términos y condiciones"', () => {
    expect(errorsFor({ acceptedTerms: false })).toEqual({
      acceptedTerms: 'Debes aceptar los términos y condiciones',
    });
  });
});
