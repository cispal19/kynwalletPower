import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRegisterStub } from '@/test/registerStub';
import { RegisterForm } from './RegisterForm';

const VALID = {
  fullName: 'Ana Pérez',
  email: 'ana@example.test',
  password: 'Clave-segura-1',
};

function setup(stub = createRegisterStub()) {
  const user = userEvent.setup();
  const onRegistered = vi.fn();
  render(<RegisterForm register={stub.register} onRegistered={onRegistered} />);
  const fullName = screen.getByLabelText('Nombre completo');
  const email = screen.getByLabelText('Correo electrónico');
  const password = screen.getByLabelText('Contraseña');
  const confirm = screen.getByLabelText('Confirmar contraseña');
  const terms = screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' });
  const submit = () => user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  const fillValid = async ({ acceptTerms = true } = {}) => {
    await user.type(fullName, VALID.fullName);
    await user.type(email, VALID.email);
    await user.type(password, VALID.password);
    await user.type(confirm, VALID.password);
    if (acceptTerms) await user.click(terms);
  };
  return { user, stub, onRegistered, fullName, email, password, confirm, terms, submit, fillValid };
}

describe('RegisterForm · contrato (contracts/ui-register.md)', () => {
  it('muestra los elementos del diseño con sus atributos', () => {
    const { fullName, email, password, confirm, terms } = setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Completa tus datos para comenzar')).toBeInTheDocument();
    expect(fullName).toHaveAttribute('autocomplete', 'name');
    expect(fullName).toHaveAttribute('placeholder', 'Ej: Diego Martínez');
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(email).toHaveAttribute('placeholder', 'tucorreo@ejemplo.com');
    for (const field of [password, confirm]) {
      expect(field).toHaveAttribute('type', 'password');
      expect(field).toHaveAttribute('autocomplete', 'new-password');
    }
    expect(terms).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toHaveAttribute('type', 'submit');
  });
});

describe('RegisterForm · US1 Crear una cuenta con datos válidos', () => {
  it('US1-1: datos válidos → register con los 5 valores y después onRegistered', async () => {
    const { stub, onRegistered, submit, fillValid } = setup();
    await fillValid();
    await submit();
    expect(stub.register).toHaveBeenCalledOnce();
    expect(stub.register).toHaveBeenCalledWith({
      fullName: VALID.fullName,
      email: VALID.email,
      password: VALID.password,
      confirmPassword: VALID.password,
      acceptedTerms: true,
    });
    expect(onRegistered).toHaveBeenCalledOnce();
    expect(onRegistered).toHaveBeenCalledWith();
  });

  it('US1-2: durante la espera el botón está ocupado y no admite reenvíos', async () => {
    const { user, stub, onRegistered, submit, fillValid } = setup();
    stub.defer();
    await fillValid();
    await submit();
    const busy = screen.getByRole('button', { name: 'Creando cuenta…' });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    await user.click(busy);
    await user.type(screen.getByLabelText('Confirmar contraseña'), '{Enter}');
    expect(stub.register).toHaveBeenCalledOnce();
    expect(onRegistered).not.toHaveBeenCalled();
    await act(async () => stub.release());
    expect(onRegistered).toHaveBeenCalledOnce();
  });

  it('US1-5: Enter en "Confirmar contraseña" envía el formulario', async () => {
    const { user, stub, fullName, email, password, confirm, terms } = setup();
    await user.type(fullName, VALID.fullName);
    await user.type(email, VALID.email);
    await user.type(password, VALID.password);
    await user.click(terms);
    await user.type(confirm, `${VALID.password}{Enter}`);
    expect(stub.register).toHaveBeenCalledOnce();
  });

  it('FR-009: con la casilla sin marcar no se registra', async () => {
    const { stub, onRegistered, submit, fillValid } = setup();
    await fillValid({ acceptTerms: false });
    await submit();
    expect(stub.register).not.toHaveBeenCalled();
    expect(onRegistered).not.toHaveBeenCalled();
  });

  it('FR-028: fallo inesperado → alerta, datos conservados y sin redirección', async () => {
    const { stub, onRegistered, fullName, email, password, confirm, terms, submit, fillValid } =
      setup(createRegisterStub({ kind: 'unavailable' }));
    await fillValid();
    await submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No pudimos completar el registro. Intenta más tarde.',
    );
    expect(stub.register).toHaveBeenCalledOnce();
    expect(onRegistered).not.toHaveBeenCalled();
    expect(fullName).toHaveValue(VALID.fullName);
    expect(email).toHaveValue(VALID.email);
    expect(password).toHaveValue(VALID.password);
    expect(confirm).toHaveValue(VALID.password);
    expect(terms).toBeChecked();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });

  it('FR-028: editar un campo oculta la alerta de fallo', async () => {
    const { user, fullName, submit, fillValid } = setup(
      createRegisterStub({ kind: 'unavailable' }),
    );
    await fillValid();
    await submit();
    await screen.findByRole('alert');
    await user.type(fullName, 'a');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('RegisterForm · US2-12 correo ya registrado', () => {
  it('US2-12: email-taken → error en el correo con el foco en él y sin redirección', async () => {
    const { onRegistered, email, password, submit, fillValid } = setup(
      createRegisterStub({ kind: 'email-taken' }),
    );
    await fillValid();
    await submit();
    expect(await screen.findByText('Ya existe una cuenta con este correo')).toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Ya existe una cuenta con este correo');
    expect(email).toHaveFocus();
    expect(password).toHaveValue(VALID.password);
    expect(onRegistered).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert', { name: /No pudimos/ })).not.toBeInTheDocument();
  });
});

describe('RegisterForm · US2 Corregir datos inválidos antes de registrarse', () => {
  it('US2-1: envío vacío → los 5 mensajes enlazados, sin registrar y foco en el nombre', async () => {
    const { stub, fullName, email, password, confirm, terms, submit } = setup();
    await submit();
    const expected: [HTMLElement, string][] = [
      [fullName, 'Ingresa tu nombre completo'],
      [email, 'Ingresa tu correo electrónico'],
      [password, 'Ingresa tu contraseña'],
      [confirm, 'Confirma tu contraseña'],
      [terms, 'Debes aceptar los términos y condiciones'],
    ];
    for (const [control, message] of expected) {
      expect(control).toHaveAttribute('aria-invalid', 'true');
      // US2-10: el error forma parte de la descripción accesible del control.
      expect(control).toHaveAccessibleDescription(message);
    }
    expect(stub.register).not.toHaveBeenCalled();
    expect(fullName).toHaveFocus();
  });

  it('US2-2: nombre con solo espacios y salir del campo → "Ingresa tu nombre completo"', async () => {
    const { user, fullName } = setup();
    await user.type(fullName, '   ');
    await user.tab();
    expect(fullName).toHaveAccessibleDescription('Ingresa tu nombre completo');
  });

  it('US2-3: "usuario@" y salir del campo → "Ingresa un correo electrónico válido"', async () => {
    const { user, email } = setup();
    await user.type(email, 'usuario@');
    await user.tab();
    expect(email).toHaveAccessibleDescription('Ingresa un correo electrónico válido');
  });

  it('US2-4: 7 caracteres → error; el octavo lo oculta', async () => {
    const { user, password } = setup();
    await user.type(password, 'Abcde1!');
    await user.tab();
    expect(password).toHaveAccessibleDescription('La contraseña debe tener al menos 8 caracteres');
    await user.type(password, '8');
    expect(password).not.toHaveAttribute('aria-invalid');
    expect(
      screen.queryByText('La contraseña debe tener al menos 8 caracteres'),
    ).not.toBeInTheDocument();
  });

  it('US2-11: "12345678" y salir del campo → pide una letra mayúscula', async () => {
    const { user, password } = setup();
    await user.type(password, '12345678');
    await user.tab();
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password).toHaveAccessibleDescription(
      'La contraseña debe incluir al menos una letra mayúscula',
    );
  });

  it('US2-11: "Abcdefg!" y salir del campo → pide un número', async () => {
    const { user, password } = setup();
    await user.type(password, 'Abcdefg!');
    await user.tab();
    expect(password).toHaveAccessibleDescription('La contraseña debe incluir al menos un número');
  });

  it('US2-11: con "12345678" en ambos campos no se registra y el foco va a la contraseña', async () => {
    const { user, stub, fullName, email, password, confirm, terms, submit } = setup();
    await user.type(fullName, VALID.fullName);
    await user.type(email, VALID.email);
    await user.type(password, '12345678');
    await user.type(confirm, '12345678');
    await user.click(terms);
    await submit();
    expect(stub.register).not.toHaveBeenCalled();
    expect(password).toHaveFocus();
  });

  it('US2-5: confirmación distinta y salir del campo → "Las contraseñas no coinciden"', async () => {
    const { user, password, confirm } = setup();
    await user.type(password, VALID.password);
    await user.type(confirm, 'otra-clave-22');
    await user.tab();
    expect(confirm).toHaveAccessibleDescription('Las contraseñas no coinciden');
  });

  it('US2-6: todo válido sin términos → error junto a la casilla y foco en ella', async () => {
    const { stub, terms, submit, fillValid } = setup();
    await fillValid({ acceptTerms: false });
    await submit();
    expect(terms).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
    expect(terms).toHaveFocus();
    expect(stub.register).not.toHaveBeenCalled();
  });

  it('US2-7: tras un error se conservan los 4 valores y la casilla', async () => {
    const { user, fullName, email, password, confirm, terms, submit } = setup();
    await user.type(fullName, VALID.fullName);
    await user.type(email, 'usuario@');
    await user.type(password, VALID.password);
    await user.type(confirm, VALID.password);
    await user.click(terms);
    await submit();
    expect(fullName).toHaveValue(VALID.fullName);
    expect(email).toHaveValue('usuario@');
    expect(password).toHaveValue(VALID.password);
    expect(confirm).toHaveValue(VALID.password);
    expect(terms).toBeChecked();
    expect(email).toHaveFocus();
  });

  it('US2-8: corregir un control oculta solo su mensaje', async () => {
    const { user, fullName, email, submit } = setup();
    await submit();
    await user.type(fullName, VALID.fullName);
    expect(fullName).not.toHaveAttribute('aria-invalid');
    expect(email).toHaveAccessibleDescription('Ingresa tu correo electrónico');
    expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeInTheDocument();
  });

  it('US2-8: marcar la casilla tras el envío oculta su mensaje', async () => {
    const { user, terms, submit } = setup();
    await submit();
    await user.click(terms);
    expect(terms).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText('Debes aceptar los términos y condiciones')).not.toBeInTheDocument();
  });

  it('US2-9: cambiar la contraseña tras una confirmación coincidente → error al enviar', async () => {
    const { user, stub, password, confirm, submit, fillValid } = setup();
    await fillValid();
    await user.type(password, 'x');
    await submit();
    expect(confirm).toHaveAccessibleDescription('Las contraseñas no coinciden');
    expect(confirm).toHaveFocus();
    expect(stub.register).not.toHaveBeenCalled();
  });
});

describe('RegisterForm · US3 Moverse entre login y registro', () => {
  it('US3-1: "¿Ya tienes cuenta?" + enlace "Inicia sesión" a /login', async () => {
    history.replaceState(null, '', '/registro');
    const { user } = setup();
    const link = screen.getByRole('link', { name: 'Inicia sesión' });
    expect(link).toHaveAttribute('href', '/login');
    expect(link.parentElement).toHaveTextContent(/^¿Ya tienes cuenta\?\s*Inicia sesión$/);
    await user.click(link);
    expect(location.pathname).toBe('/login');
  });
});

describe('RegisterForm · US4 Opciones de registro con Google y Apple', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('US4-1: Google y Apple muestran "Próximamente" sin red ni ventanas', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { user } = setup();
    expect(screen.getByText('o regístrate con')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Google' }));
    await user.click(screen.getByRole('button', { name: 'Apple' }));
    expect(alert).toHaveBeenCalledTimes(2);
    expect(alert).toHaveBeenNthCalledWith(1, 'Próximamente');
    expect(alert).toHaveBeenNthCalledWith(2, 'Próximamente');
    screen.getByRole('button', { name: 'Google' }).focus();
    await user.keyboard('{Enter}');
    expect(alert).toHaveBeenCalledTimes(3);
    expect(alert).toHaveBeenLastCalledWith('Próximamente');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('US4-2: los datos escritos no cambian y no aparecen errores', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    history.replaceState(null, '', '/registro');
    const { user, stub, fullName, email, terms, fillValid } = setup();
    await fillValid();
    await user.click(screen.getByRole('button', { name: 'Google' }));
    await user.click(screen.getByRole('button', { name: 'Apple' }));
    expect(fullName).toHaveValue(VALID.fullName);
    expect(email).toHaveValue(VALID.email);
    expect(terms).toBeChecked();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(document.querySelectorAll('[aria-invalid="true"]')).toHaveLength(0);
    expect(stub.register).not.toHaveBeenCalled();
    expect(location.pathname).toBe('/registro');
  });
});

describe('RegisterForm · US5 Consultar los términos y condiciones', () => {
  const termsLink = () => screen.getByRole('button', { name: 'términos y condiciones' });

  it('US5-1: abre la ventana con el texto ficticio y el foco dentro', async () => {
    const { user } = setup();
    await user.click(termsLink());
    const dialog = screen.getByRole('dialog', { name: 'Términos y condiciones' });
    expect(dialog).toHaveTextContent('Documento de demostración sin valor legal');
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('US5-2: "Cerrar" la cierra y el foco vuelve al enlace', async () => {
    const { user } = setup();
    await user.click(termsLink());
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(termsLink()).toHaveFocus();
  });

  it('US5-2: Escape la cierra y el foco vuelve al enlace', async () => {
    const { user } = setup();
    await user.click(termsLink());
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(termsLink()).toHaveFocus();
  });

  it.each([
    ['"Cerrar"', 'button'],
    ['Escape', 'escape'],
  ])('US5-4: cerrar con %s marca la casilla sin cambiar los datos', async (_label, how) => {
    const { user, stub, fullName, terms, fillValid } = setup();
    await fillValid({ acceptTerms: false });
    expect(terms).not.toBeChecked();
    await user.click(termsLink());
    if (how === 'button') await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    else fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(terms).toBeChecked();
    expect(fullName).toHaveValue(VALID.fullName);
    expect(document.querySelectorAll('[aria-invalid="true"]')).toHaveLength(0);
    expect(stub.register).not.toHaveBeenCalled();
  });

  it('US5-4: con la casilla ya marcada, abrir y cerrar la mantiene marcada', async () => {
    const { user, terms, fillValid } = setup();
    await fillValid();
    await user.click(termsLink());
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(terms).toBeChecked();
  });

  it('US5-4: abrir la ventana no marca la casilla hasta cerrarla', async () => {
    const { user, terms } = setup();
    await user.click(termsLink());
    expect(terms).not.toBeChecked();
  });

  it('US5-4: cerrar la ventana quita el error de términos', async () => {
    const { user, terms, submit } = setup();
    await submit();
    expect(terms).toHaveAttribute('aria-invalid', 'true');
    await user.click(termsLink());
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(terms).toBeChecked();
    expect(screen.queryByText('Debes aceptar los términos y condiciones')).not.toBeInTheDocument();
  });

  it('FR-017: la casilla sigue llamándose "Acepto los términos y condiciones"', () => {
    setup();
    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).toBeInTheDocument();
  });
});

describe('RegisterForm · teclado y seguridad', () => {
  it('FR-023: orden de tabulación según contracts/ui-register.md', async () => {
    const { user, fullName, email, password, confirm, terms } = setup();
    const [showPassword, showConfirm] = screen.getAllByRole('button', {
      name: 'Mostrar contraseña',
    });
    const expected = [
      fullName,
      email,
      password,
      showPassword,
      confirm,
      showConfirm,
      terms,
      screen.getByRole('button', { name: 'términos y condiciones' }),
      screen.getByRole('button', { name: 'Crear cuenta' }),
      screen.getByRole('button', { name: 'Google' }),
      screen.getByRole('button', { name: 'Apple' }),
      screen.getByRole('link', { name: 'Inicia sesión' }),
    ];
    for (const element of expected) {
      await user.tab();
      expect(element).toHaveFocus();
    }
  });

  it('FR-023: Espacio marca y desmarca la casilla', async () => {
    const { user, terms } = setup();
    terms.focus();
    await user.keyboard(' ');
    expect(terms).toBeChecked();
    await user.keyboard(' ');
    expect(terms).not.toBeChecked();
  });

  it('FR-027: las contraseñas no aparecen en el DOM, la URL, la consola ni el almacenamiento', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const consoleSpies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((method) =>
      vi.spyOn(console, method),
    );
    const { submit, fillValid } = setup(createRegisterStub({ kind: 'unavailable' }));
    await fillValid();
    await submit();
    await screen.findByRole('alert');

    const serialized = [
      document.body.textContent ?? '',
      window.location.href,
      ...setItem.mock.calls.flat(),
      ...consoleSpies.flatMap((spy) => spy.mock.calls.flat().map(String)),
    ].join('\n');
    expect(serialized).not.toContain(VALID.password);
    expect(setItem).not.toHaveBeenCalled();

    setItem.mockRestore();
    consoleSpies.forEach((spy) => spy.mockRestore());
  });
});
