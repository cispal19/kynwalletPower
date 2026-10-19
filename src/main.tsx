import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createAuthenticate } from '@/application/authenticate';
import { createRegister } from '@/application/register';
import { InMemoryAccountStore } from '@/infrastructure/InMemoryAccountStore';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { loadDemoAccounts } from '@/infrastructure/loadDemoAccounts';
import { SimulatedRegistrationGateway } from '@/infrastructure/SimulatedRegistrationGateway';
import '@/ui/styles/tokens.css';
import '@/ui/styles/global.css';
import { App } from './App';

// Raíz de composición: único lugar que conoce las implementaciones concretas (Constitución 2.5).
const accounts = loadDemoAccounts(import.meta.env.VITE_DEMO_USERS);
// Cuentas creadas con el registro: compartidas con el login y solo en memoria (002 FR-014).
const registered = new InMemoryAccountStore();
const authenticate = createAuthenticate(new InMemoryAuthGateway(accounts, { registered }));
const register = createRegister(
  new SimulatedRegistrationGateway(registered, {
    reservedEmails: (accounts ?? []).map((account) => account.email),
  }),
);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App authenticate={authenticate} register={register} />
    </StrictMode>,
  );
}
