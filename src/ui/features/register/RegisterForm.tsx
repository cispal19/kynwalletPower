import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Register } from '@/application/register';
import { MESSAGES } from '@/domain/messages';
import { Alert } from '@/ui/components/Alert/Alert';
import { Button } from '@/ui/components/Button/Button';
import { Checkbox } from '@/ui/components/Checkbox/Checkbox';
import { Divider } from '@/ui/components/Divider/Divider';
import { PasswordField } from '@/ui/components/PasswordField/PasswordField';
import { SocialButton } from '@/ui/components/SocialButton/SocialButton';
import { TextField } from '@/ui/components/TextField/TextField';
import { Link } from '@/ui/navigation/Link';
import { ROUTES } from '@/ui/navigation/routes';
import { TermsDialog } from './TermsDialog';
import { useRegisterForm } from './useRegisterForm';
import styles from './RegisterForm.module.css';

type RegisterFormProps = {
  register: Register;
  /** Se llama sin datos cuando el registro simulado termina (FR-027). */
  onRegistered: () => void;
};

export function RegisterForm({ register, onRegistered }: RegisterFormProps) {
  const { state, change, blur, toggleTerms, submit } = useRegisterForm(register, onRegistered);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const termsLinkRef = useRef<HTMLButtonElement>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  // US2-12: correo ya registrado → el foco vuelve al correo para corregirlo.
  useEffect(() => {
    if (state.emailTaken) emailRef.current?.focus();
  }, [state.emailTaken]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = submit();
    // US2-1: el foco va al primer control con error, en el orden visual.
    const firstInvalid = [
      [errors.fullName, fullNameRef],
      [errors.email, emailRef],
      [errors.password, passwordRef],
      [errors.confirmPassword, confirmPasswordRef],
      [errors.acceptedTerms, termsRef],
    ] as const;
    firstInvalid.find(([error]) => error)?.[1].current?.focus();
  };

  // US4-1: proveedores externos fuera del alcance de la demostración (research.md R8).
  const comingSoon = () => window.alert(MESSAGES.COMING_SOON);

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Crea tu cuenta</h1>
        <p className={styles.subtitle}>Completa tus datos para comenzar</p>
      </div>

      <TextField
        label="Nombre completo"
        name="fullName"
        autoComplete="name"
        placeholder="Ej: Diego Martínez"
        value={state.values.fullName}
        ref={fullNameRef}
        error={state.fieldErrors.fullName}
        onChange={(event) => change('fullName', event.target.value)}
        onBlur={() => blur('fullName')}
      />

      <TextField
        label="Correo electrónico"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="tucorreo@ejemplo.com"
        value={state.values.email}
        ref={emailRef}
        error={state.fieldErrors.email}
        onChange={(event) => change('email', event.target.value)}
        onBlur={() => blur('email')}
      />

      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={state.values.password}
        ref={passwordRef}
        error={state.fieldErrors.password}
        onChange={(event) => change('password', event.target.value)}
        onBlur={() => blur('password')}
      />

      <PasswordField
        label="Confirmar contraseña"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="••••••••"
        value={state.values.confirmPassword}
        ref={confirmPasswordRef}
        error={state.fieldErrors.confirmPassword}
        onChange={(event) => change('confirmPassword', event.target.value)}
        onBlur={() => blur('confirmPassword')}
      />

      <Checkbox
        label="Acepto los"
        labelSuffix={
          <Button variant="link" ref={termsLinkRef} onClick={() => setTermsOpen(true)}>
            términos y condiciones
          </Button>
        }
        ref={termsRef}
        checked={state.acceptedTerms}
        error={state.fieldErrors.acceptedTerms}
        onChange={toggleTerms}
      />

      {state.failure && <Alert tone="error">{MESSAGES.SIGNUP_UNAVAILABLE}</Alert>}

      <Button type="submit" loading={state.status === 'submitting'} loadingLabel="Creando cuenta…">
        Crear cuenta
      </Button>

      <Divider>o regístrate con</Divider>

      <div className={styles.social}>
        <SocialButton provider="Google" onClick={comingSoon} />
        <SocialButton provider="Apple" onClick={comingSoon} />
      </div>

      <p className={styles.footer}>
        ¿Ya tienes cuenta?
        <Link href={ROUTES.login}>Inicia sesión</Link>
      </p>

      <TermsDialog
        open={termsOpen}
        onClose={() => {
          setTermsOpen(false);
          // US5-4: haber abierto y cerrado los términos los da por aceptados.
          toggleTerms(true);
        }}
        returnFocusRef={termsLinkRef}
      />
    </form>
  );
}
