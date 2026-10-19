import { initialRegisterState, registerReducer, type RegisterState } from './registerReducer';

const filled: RegisterState = {
  ...initialRegisterState,
  values: {
    fullName: 'Ana Pérez',
    email: 'ana@example.test',
    password: 'Clave-segura-1',
    confirmPassword: 'Clave-segura-1',
  },
  acceptedTerms: true,
};

describe('registerReducer (data-model.md, RegisterFormState)', () => {
  it('estado inicial: editing, valores vacíos, casilla sin marcar y sin fallo', () => {
    expect(initialRegisterState.status).toBe('editing');
    expect(initialRegisterState.values).toEqual({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(initialRegisterState.acceptedTerms).toBe(false);
    expect(initialRegisterState.failure).toBe(false);
  });

  it('change actualiza el valor del campo', () => {
    const next = registerReducer(initialRegisterState, {
      type: 'change',
      field: 'fullName',
      value: 'Ana',
    });
    expect(next.values.fullName).toBe('Ana');
  });

  it('toggleTerms actualiza la casilla', () => {
    expect(
      registerReducer(initialRegisterState, { type: 'toggleTerms', checked: true }).acceptedTerms,
    ).toBe(true);
  });

  it('US1-1: submit con datos válidos → submitting', () => {
    expect(registerReducer(filled, { type: 'submit' }).status).toBe('submitting');
  });

  it('FR-009: submit con errores sigue en editing', () => {
    const next = registerReducer({ ...filled, acceptedTerms: false }, { type: 'submit' });
    expect(next.status).toBe('editing');
    expect(next.fieldErrors.acceptedTerms).toBe('Debes aceptar los términos y condiciones');
  });

  it('US1-2: un segundo submit en submitting se ignora', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    expect(registerReducer(submitting, { type: 'submit' })).toBe(submitting);
  });

  it('FR-028: result unavailable → failure, conservando valores y casilla', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    const next = registerReducer(submitting, { type: 'result', result: { kind: 'unavailable' } });
    expect(next.status).toBe('failure');
    expect(next.failure).toBe(true);
    expect(next.values).toEqual(filled.values);
    expect(next.acceptedTerms).toBe(true);
  });

  it('FR-028: change desde failure → editing sin mensaje', () => {
    const failed: RegisterState = { ...filled, status: 'failure', failure: true };
    const next = registerReducer(failed, { type: 'change', field: 'email', value: 'x' });
    expect(next.status).toBe('editing');
    expect(next.failure).toBe(false);
  });
});

describe('registerReducer · US2-12 correo ya registrado', () => {
  it('US2-12: result email-taken → editing con el error en el correo, conservando valores', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    const next = registerReducer(submitting, { type: 'result', result: { kind: 'email-taken' } });
    expect(next.status).toBe('editing');
    expect(next.failure).toBe(false);
    expect(next.fieldErrors.email).toBe('Ya existe una cuenta con este correo');
    expect(next.values).toEqual(filled.values);
  });

  it('US2-12: editar el correo oculta el error de correo ya registrado', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    const taken = registerReducer(submitting, { type: 'result', result: { kind: 'email-taken' } });
    const next = registerReducer(taken, {
      type: 'change',
      field: 'email',
      value: 'otra@example.test',
    });
    expect(next.fieldErrors.email).toBeUndefined();
  });

  it('US2-12: editar otro campo mantiene el error de correo ya registrado', () => {
    const submitting = registerReducer(filled, { type: 'submit' });
    const taken = registerReducer(submitting, { type: 'result', result: { kind: 'email-taken' } });
    const next = registerReducer(taken, { type: 'change', field: 'fullName', value: 'Ana' });
    expect(next.fieldErrors.email).toBe('Ya existe una cuenta con este correo');
  });
});

describe('registerReducer · US2 errores por control', () => {
  it('US2-2: blur marca el campo como tocado y muestra solo su error', () => {
    const next = registerReducer(initialRegisterState, { type: 'blur', field: 'fullName' });
    expect(next.touched.fullName).toBe(true);
    expect(next.fieldErrors).toEqual({ fullName: 'Ingresa tu nombre completo' });
  });

  it('US2-1: submit marca todos los controles como tocados, incluida la casilla', () => {
    const next = registerReducer(initialRegisterState, { type: 'submit' });
    expect(Object.values(next.touched).every(Boolean)).toBe(true);
    expect(Object.keys(next.fieldErrors)).toHaveLength(5);
  });

  it('US2-6: el error de términos no aparece antes del primer envío', () => {
    let state = initialRegisterState;
    for (const field of ['fullName', 'email', 'password', 'confirmPassword'] as const) {
      state = registerReducer(state, { type: 'blur', field });
    }
    state = registerReducer(state, { type: 'toggleTerms', checked: true });
    state = registerReducer(state, { type: 'toggleTerms', checked: false });
    expect(state.fieldErrors.acceptedTerms).toBeUndefined();
  });

  it('US2-8: marcar la casilla tras el envío oculta su error', () => {
    const submitted = registerReducer(filled, { type: 'toggleTerms', checked: false });
    const failed = registerReducer(submitted, { type: 'submit' });
    expect(failed.fieldErrors.acceptedTerms).toBe('Debes aceptar los términos y condiciones');
    const next = registerReducer(failed, { type: 'toggleTerms', checked: true });
    expect(next.fieldErrors.acceptedTerms).toBeUndefined();
  });

  it('US2-9: cambiar la contraseña revalida la confirmación ya tocada (en ambos sentidos)', () => {
    const touched = registerReducer(filled, { type: 'blur', field: 'confirmPassword' });
    expect(touched.fieldErrors.confirmPassword).toBeUndefined();
    const changed = registerReducer(touched, {
      type: 'change',
      field: 'password',
      value: 'otra-clave-22',
    });
    expect(changed.fieldErrors.confirmPassword).toBe('Las contraseñas no coinciden');
    const restored = registerReducer(changed, {
      type: 'change',
      field: 'password',
      value: 'Clave-segura-1',
    });
    expect(restored.fieldErrors.confirmPassword).toBeUndefined();
  });
});
