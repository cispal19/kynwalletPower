import type { RegistrationGateway } from '@/application/ports/RegistrationGateway';
import { TEST_ACCOUNT } from '@/test/fixtures';
import { InMemoryAccountStore } from './InMemoryAccountStore';
import { SimulatedRegistrationGateway } from './SimulatedRegistrationGateway';

const request = { fullName: 'Ana Pérez', email: 'ana@example.test', password: 'Clave-segura-1' };

// Se usa a través del puerto, como lo hace el caso de uso.
const gateway = (
  store = new InMemoryAccountStore(),
  options?: { delayMs?: number; reservedEmails?: readonly string[] },
): RegistrationGateway => new SimulatedRegistrationGateway(store, options);

describe('SimulatedRegistrationGateway (contracts/registration-gateway.md)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('S1: espera 1000 ms por defecto y responde success', async () => {
    const onResolve = vi.fn();
    void gateway().register(request).then(onResolve);
    await vi.advanceTimersByTimeAsync(999);
    expect(onResolve).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onResolve).toHaveBeenCalledWith({ kind: 'success' });
  });

  it('S1: delayMs es configurable', async () => {
    const onResolve = vi.fn();
    void gateway(undefined, { delayMs: 10 }).register(request).then(onResolve);
    await vi.advanceTimersByTimeAsync(10);
    expect(onResolve).toHaveBeenCalledWith({ kind: 'success' });
  });

  it('S2: no usa el almacenamiento del navegador ni la red', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const pending = gateway().register(request);
    await vi.runAllTimersAsync();
    await pending;
    expect(setItem).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
  });

  it('S3: con success la cuenta queda en el almacén en memoria (FR-014)', async () => {
    const store = new InMemoryAccountStore();
    const pending = gateway(store).register(request);
    await vi.runAllTimersAsync();
    await pending;
    expect(store.find('ana@example.test')).toEqual({
      email: 'ana@example.test',
      password: 'Clave-segura-1',
      displayName: 'Ana Pérez',
    });
  });

  it('S4: correo ya registrado → email-taken sin sobrescribir la cuenta', async () => {
    const store = new InMemoryAccountStore();
    store.add({ email: request.email, password: 'Primera-clave-1', displayName: 'Primera' });
    const pending = gateway(store).register(request);
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toEqual({ kind: 'email-taken' });
    expect(store.find(request.email)?.password).toBe('Primera-clave-1');
  });

  it('S4: correo de una cuenta de demostración → email-taken', async () => {
    const store = new InMemoryAccountStore();
    const pending = gateway(store, { reservedEmails: [TEST_ACCOUNT.email] }).register({
      ...request,
      email: TEST_ACCOUNT.email,
    });
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toEqual({ kind: 'email-taken' });
    expect(store.find(TEST_ACCOUNT.email)).toBeUndefined();
  });
});
