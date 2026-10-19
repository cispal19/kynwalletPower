import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { createAuthStub } from '@/test/authStub';
import { TEST_ACCOUNT } from '@/test/fixtures';
import { createRegisterStub } from '@/test/registerStub';
import { createAuthenticate } from '@/application/authenticate';
import { createRegister } from '@/application/register';
import { InMemoryAccountStore } from '@/infrastructure/InMemoryAccountStore';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { SimulatedRegistrationGateway } from '@/infrastructure/SimulatedRegistrationGateway';
import { App } from './App';

function renderAt(path: string) {
  history.replaceState(null, '', path);
  return render(
    <App authenticate={createAuthStub().authenticate} register={createRegisterStub().register} />,
  );
}

describe('App · rutas', () => {
  it.each(['/', '/otra'])('FR-018: %s redirige a /login y muestra el login', (path) => {
    renderAt(path);
    expect(location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });

  it('FR-018: /login muestra el login', () => {
    renderAt('/login');
    expect(location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });
});

describe('App · US1 registro válido', () => {
  async function registerValid() {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave-segura-1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave-segura-1');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  }

  it('US1-1: registro válido → /login con el mensaje de éxito (reemplazando la entrada)', async () => {
    renderAt('/registro');
    const replaceState = vi.spyOn(history, 'replaceState');
    await registerValid();
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Registro completado (demostración). Ya puedes iniciar sesión con tu nueva cuenta.',
    );
    expect(location.pathname).toBe('/login');
    expect(replaceState).toHaveBeenCalledWith(null, '', '/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
    replaceState.mockRestore();
  });

  it('US1-4: volver a entrar en /login no muestra el mensaje', async () => {
    const { unmount } = renderAt('/registro');
    await registerValid();
    await screen.findByRole('status');
    unmount();
    renderAt('/login');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('FR-027: los datos no quedan en la URL ni en el almacenamiento', async () => {
    renderAt('/registro');
    await registerValid();
    await screen.findByRole('status');
    expect(location.href).not.toContain('Ana');
    expect(location.href).not.toContain('ana%40example.test');
    expect(location.href).not.toContain('ana@example.test');
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
  });
});

describe('App · US1-6 iniciar sesión con la cuenta recién registrada', () => {
  // Mismo cableado que main.tsx, sin esperas: el registro y el login comparten el almacén.
  function renderWired(demoAccounts: (typeof TEST_ACCOUNT)[] | null) {
    const registered = new InMemoryAccountStore();
    const authenticate = createAuthenticate(
      new InMemoryAuthGateway(demoAccounts, { delayMs: 0, registered }),
    );
    const register = createRegister(
      new SimulatedRegistrationGateway(registered, {
        delayMs: 0,
        reservedEmails: (demoAccounts ?? []).map((account) => account.email),
      }),
    );
    history.replaceState(null, '', '/registro');
    return render(<App authenticate={authenticate} register={register} />);
  }

  it.each([
    ['con cuentas de demostración', [TEST_ACCOUNT]],
    ['sin configuración de demostración', null],
  ])('US1-6: registrarse y luego iniciar sesión %s → bienvenida', async (_label, demo) => {
    renderWired(demo);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave-segura-1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave-segura-1');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await screen.findByRole('status');

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave-segura-1');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(
      await screen.findByRole('heading', { name: /Bienvenido, Ana Pérez/ }),
    ).toBeInTheDocument();
  });
});

describe('App · US2 errores sin redirección', () => {
  it('FR-009: con errores se queda en /registro y sin mensaje de éxito', async () => {
    renderAt('/registro');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(location.pathname).toBe('/registro');
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('App · US3 navegación', () => {
  const waitForPopstate = () =>
    new Promise<void>((resolve) =>
      window.addEventListener('popstate', () => resolve(), { once: true }),
    );

  it('US3-2: "Regístrate" lleva a /registro con los campos vacíos y el foco en el título', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await user.click(screen.getByRole('link', { name: 'Regístrate' }));
    expect(location.pathname).toBe('/registro');
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
    expect(screen.getByRole('heading', { level: 1, name: 'Crea tu cuenta' })).toHaveFocus();
    expect(document.title).toBe('KynWallet · Crear cuenta');
  });

  it('US3-1: "Inicia sesión" lleva a /login sin mensaje de éxito', async () => {
    const user = userEvent.setup();
    renderAt('/registro');
    await user.click(screen.getByRole('link', { name: 'Inicia sesión' }));
    expect(location.pathname).toBe('/login');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Bienvenido de nuevo' })).toHaveFocus();
    expect(document.title).toBe('KynWallet · Iniciar sesión');
  });

  it('US3-3: atrás y adelante del navegador', async () => {
    const user = userEvent.setup();
    renderAt('/login');
    await user.click(screen.getByRole('link', { name: 'Regístrate' }));
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana');
    await user.click(screen.getByRole('link', { name: 'Inicia sesión' }));

    let popped = waitForPopstate();
    await act(async () => {
      history.back();
      await popped;
    });
    expect(location.pathname).toBe('/registro');
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');

    popped = waitForPopstate();
    await act(async () => {
      history.forward();
      await popped;
    });
    expect(location.pathname).toBe('/login');
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeInTheDocument();
  });

  it('US3-4: /registro directo muestra el registro sin mover el foco', () => {
    renderAt('/registro');
    expect(screen.getByRole('heading', { level: 1, name: 'Crea tu cuenta' })).not.toHaveFocus();
    expect(document.body).toHaveFocus();
    expect(document.title).toBe('KynWallet · Crear cuenta');
  });

  it('US1-3: tras un registro válido el foco está en el mensaje de éxito', async () => {
    const user = userEvent.setup();
    renderAt('/registro');
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave-segura-1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave-segura-1');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByRole('status')).toHaveFocus();
    expect(document.title).toBe('KynWallet · Iniciar sesión');
  });
});

describe('App · accesibilidad de la pantalla completa (FR-015, SC-005)', () => {
  it('vista de login sin violaciones', async () => {
    const { container } = render(
      <App authenticate={createAuthStub().authenticate} register={createRegisterStub().register} />,
    );
    await expectNoA11yViolations(container);
  });

  it('vista de login con errores visibles sin violaciones', async () => {
    const { container } = render(
      <App authenticate={createAuthStub().authenticate} register={createRegisterStub().register} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await userEvent.click(screen.getByRole('button', { name: 'Google' }));
    await expectNoA11yViolations(container);
  });

  it('vista de bienvenida sin violaciones', async () => {
    const { container } = render(
      <App authenticate={createAuthStub().authenticate} register={createRegisterStub().register} />,
    );
    await userEvent.type(screen.getByLabelText('Correo electrónico'), TEST_ACCOUNT.email);
    await userEvent.type(screen.getByLabelText('Contraseña'), TEST_ACCOUNT.password);
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    await screen.findByRole('heading', { name: /Bienvenido,/ });
    await expectNoA11yViolations(container);
  });
});

describe('App · accesibilidad (FR-025, SC-005)', () => {
  it('/registro vacío sin violaciones', async () => {
    const { container } = renderAt('/registro');
    await expectNoA11yViolations(container);
  });

  it('/registro con todos los errores visibles sin violaciones', async () => {
    const { container } = renderAt('/registro');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(container.querySelectorAll('[aria-invalid="true"]')).toHaveLength(5);
    await expectNoA11yViolations(container);
  });

  it('/registro con la ventana de términos abierta sin violaciones', async () => {
    const { container } = renderAt('/registro');
    await userEvent.click(screen.getByRole('button', { name: 'términos y condiciones' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('/login con el mensaje de éxito sin violaciones', async () => {
    const user = userEvent.setup();
    const { container } = renderAt('/registro');
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Clave-segura-1');
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave-segura-1');
    await user.click(screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await screen.findByRole('status');
    await expectNoA11yViolations(container);
  });
});
