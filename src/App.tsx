import { useCallback, useEffect, useState } from 'react';
import type { Authenticate } from '@/application/authenticate';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { LoginForm } from '@/ui/features/login/LoginForm';
import { RegisterForm } from '@/ui/features/register/RegisterForm';
import { AuthLayout } from '@/ui/layout/AuthLayout/AuthLayout';
import { navigate, useCurrentPath } from '@/ui/navigation/navigation';
import { DOCUMENT_TITLES, resolveRoute, ROUTES } from '@/ui/navigation/routes';

type AppProps = {
  authenticate: Authenticate;
  register: Register;
};

const LOGIN_BRAND = {
  title: (
    <>
      Tu dinero,
      <br />
      sin fronteras.
    </>
  ),
  description: 'Envía, recibe y paga en segundos. Una billetera pensada para tu día a día.',
};

const REGISTER_BRAND = {
  title: (
    <>
      Comienza tu
      <br />
      camino financiero.
    </>
  ),
  description:
    'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
};

export function App({ authenticate, register }: AppProps) {
  const route = resolveRoute(useCurrentPath());
  // Aviso de un solo uso entre el registro y el login; sin datos personales (research.md R3).
  const [signupCompleted, setSignupCompleted] = useState(false);
  const [previousRoute, setPreviousRoute] = useState(route);
  // En la carga inicial (y su redirección) el foco no se mueve; tras navegar, sí (R11).
  const [navigated, setNavigated] = useState(false);

  if (route !== previousRoute) {
    setPreviousRoute(route);
    if (previousRoute !== null) setNavigated(true);
    // El login guarda el aviso en su estado inicial; al salir de él se consume para no repetirlo.
    if (route !== 'login') setSignupCompleted(false);
  }

  // WCAG 2.4.2: el título del documento identifica la pantalla.
  useEffect(() => {
    if (route) document.title = DOCUMENT_TITLES[route];
  }, [route]);

  // FR-018: cualquier otra dirección (incluida /) se reemplaza por /login.
  useEffect(() => {
    if (route === null) navigate(ROUTES.login, { replace: true });
  }, [route]);

  const handleRegistered = useCallback(() => {
    setSignupCompleted(true);
    // Reemplaza /registro para que "atrás" no vuelva a un formulario ya enviado.
    navigate(ROUTES.login, { replace: true });
  }, []);

  if (route === 'register') {
    return (
      <AuthLayout key={route} brand={REGISTER_BRAND} focusHeadingOnMount={navigated}>
        <RegisterForm register={register} onRegistered={handleRegistered} />
      </AuthLayout>
    );
  }

  if (route === 'login') {
    return (
      <AuthLayout key={route} brand={LOGIN_BRAND} focusHeadingOnMount={navigated}>
        <LoginForm
          authenticate={authenticate}
          initialNotice={signupCompleted ? MESSAGES.SIGNUP_SUCCESS : undefined}
        />
      </AuthLayout>
    );
  }

  return null;
}
