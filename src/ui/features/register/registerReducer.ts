import { MESSAGES } from '@/domain/messages';
import {
  validateRegistration,
  type RegistrationErrors,
  type RegistrationResult,
} from '@/domain/registration';

export type RegisterField = 'fullName' | 'email' | 'password' | 'confirmPassword';
type RegisterControl = RegisterField | 'acceptedTerms';

export type RegisterState = {
  status: 'editing' | 'submitting' | 'failure';
  values: Record<RegisterField, string>;
  acceptedTerms: boolean;
  touched: Record<RegisterControl, boolean>;
  fieldErrors: RegistrationErrors;
  failure: boolean;
  /** US2-12: el último envío usó un correo ya registrado; se mantiene hasta editar el correo. */
  emailTaken: boolean;
};

export type RegisterAction =
  | { type: 'change'; field: RegisterField; value: string }
  | { type: 'blur'; field: RegisterField }
  | { type: 'toggleTerms'; checked: boolean }
  | { type: 'submit' }
  | { type: 'result'; result: RegistrationResult };

const UNTOUCHED: RegisterState['touched'] = {
  fullName: false,
  email: false,
  password: false,
  confirmPassword: false,
  acceptedTerms: false,
};

export const initialRegisterState: RegisterState = {
  status: 'editing',
  values: { fullName: '', email: '', password: '', confirmPassword: '' },
  acceptedTerms: false,
  touched: UNTOUCHED,
  fieldErrors: {},
  failure: false,
  emailTaken: false,
};

/** Errores visibles: solo los de controles ya tocados. */
function visibleErrors(
  state: Pick<RegisterState, 'values' | 'acceptedTerms' | 'touched' | 'emailTaken'>,
): RegistrationErrors {
  const errors = validateRegistration({ ...state.values, acceptedTerms: state.acceptedTerms });
  const visible: RegistrationErrors = {};
  for (const control of Object.keys(state.touched) as RegisterControl[]) {
    if (state.touched[control] && errors[control]) visible[control] = errors[control];
  }
  if (state.emailTaken && !visible.email) visible.email = MESSAGES.EMAIL_TAKEN;
  return visible;
}

/** Máquina de estados del formulario de registro (data-model.md, RegisterFormState). */
export function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'change': {
      const next = {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        emailTaken: state.emailTaken && action.field !== 'email',
      };
      return {
        ...next,
        status: state.status === 'failure' ? 'editing' : state.status,
        failure: false,
        fieldErrors: visibleErrors(next),
      };
    }

    case 'blur': {
      const next = { ...state, touched: { ...state.touched, [action.field]: true } };
      return { ...next, fieldErrors: visibleErrors(next) };
    }

    case 'toggleTerms': {
      const next = { ...state, acceptedTerms: action.checked };
      return { ...next, fieldErrors: visibleErrors(next) };
    }

    case 'submit': {
      if (state.status === 'submitting') return state;
      const touched = {
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
        acceptedTerms: true,
      };
      const fieldErrors = visibleErrors({ ...state, touched, emailTaken: false });
      // FR-009: no se registra mientras existan errores de validación.
      const status = Object.keys(fieldErrors).length > 0 ? 'editing' : 'submitting';
      return { ...state, status, touched, fieldErrors, failure: false, emailTaken: false };
    }

    case 'result':
      // Con success la pantalla se sustituye por el login; el estado no cambia.
      if (action.result.kind === 'success') return state;
      if (action.result.kind === 'email-taken') {
        const next = { ...state, status: 'editing' as const, emailTaken: true };
        return { ...next, fieldErrors: visibleErrors(next) };
      }
      return { ...state, status: 'failure', failure: true };
  }
}
