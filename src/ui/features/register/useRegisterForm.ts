import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { Register } from '@/application/register';
import { validateRegistration, type RegistrationErrors } from '@/domain/registration';
import { initialRegisterState, registerReducer, type RegisterField } from './registerReducer';

export function useRegisterForm(register: Register, onRegistered: () => void) {
  const [state, dispatch] = useReducer(registerReducer, initialRegisterState);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const change = useCallback((field: RegisterField, value: string) => {
    dispatch({ type: 'change', field, value });
  }, []);

  const blur = useCallback((field: RegisterField) => dispatch({ type: 'blur', field }), []);

  const toggleTerms = useCallback(
    (checked: boolean) => dispatch({ type: 'toggleTerms', checked }),
    [],
  );

  /** Valida y, si procede, registra. Devuelve los errores para que la vista gestione el foco. */
  const submit = useCallback((): RegistrationErrors => {
    if (inFlight.current) return {};
    const data = { ...state.values, acceptedTerms: state.acceptedTerms };
    const errors = validateRegistration(data);
    dispatch({ type: 'submit' });
    if (Object.keys(errors).length > 0) return errors;

    inFlight.current = true;
    void register(data).then((result) => {
      inFlight.current = false;
      if (!mounted.current) return;
      dispatch({ type: 'result', result });
      if (result.kind === 'success') onRegistered();
    });
    return {};
  }, [register, onRegistered, state.values, state.acceptedTerms]);

  return { state, change, blur, toggleTerms, submit };
}
