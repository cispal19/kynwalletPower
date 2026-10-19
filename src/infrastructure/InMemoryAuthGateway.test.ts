import { TEST_ACCOUNT } from '@/test/fixtures';
import { InMemoryAccountStore } from './InMemoryAccountStore';
import { InMemoryAuthGateway } from './InMemoryAuthGateway';

const gateway = (accounts = [TEST_ACCOUNT]) => new InMemoryAuthGateway(accounts, { delayMs: 0 });

describe('InMemoryAuthGateway (contracts/auth-gateway.md)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('C1: correo con mayúsculas y espacios + contraseña exacta → success', async () => {
    const result = await gateway().authenticate({
      email: '  STEVEN.Luna@Example.test ',
      password: TEST_ACCOUNT.password,
    });
    expect(result).toEqual({ kind: 'success', displayName: 'Steven Luna' });
  });

  it.each([
    ['contraseña distinta', 'otra-clave-99'],
    ['diferencia de mayúsculas', 'FIXTURE-PASS-01'],
    ['espacios periféricos', ' fixture-pass-01 '],
  ])('C2: correo existente con %s → invalid-credentials', async (_label, password) => {
    const result = await gateway().authenticate({ email: TEST_ACCOUNT.email, password });
    expect(result).toEqual({ kind: 'invalid-credentials' });
  });

  it('C3: correo inexistente → resultado idéntico a C2', async () => {
    const unknown = await gateway().authenticate({
      email: 'nadie@example.test',
      password: TEST_ACCOUNT.password,
    });
    const wrongPassword = await gateway().authenticate({
      email: TEST_ACCOUNT.email,
      password: 'otra-clave-99',
    });
    expect(unknown).toEqual(wrongPassword);
  });

  it('C4: configuración ausente → unavailable', async () => {
    const result = await new InMemoryAuthGateway(null, { delayMs: 0 }).authenticate({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
    });
    expect(result).toEqual({ kind: 'unavailable' });
  });

  it('C5: una excepción interna → unavailable sin rechazar la promesa', async () => {
    const broken = [
      {
        get email(): string {
          throw new Error('boom');
        },
        password: 'x',
        displayName: 'x',
      },
    ];
    await expect(
      gateway(broken).authenticate({ email: 'a@b.co', password: 'whatever1' }),
    ).resolves.toEqual({ kind: 'unavailable' });
  });

  it('C6: el resultado nunca contiene la contraseña', async () => {
    const result = await gateway().authenticate({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
    });
    expect(JSON.stringify(result)).not.toContain(TEST_ACCOUNT.password);
  });

  it('FR-008: espera delayMs antes de responder (1000 ms por defecto)', async () => {
    vi.useFakeTimers();
    const onResolve = vi.fn();
    new InMemoryAuthGateway([TEST_ACCOUNT])
      .authenticate({ email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password })
      .then(onResolve);
    await vi.advanceTimersByTimeAsync(999);
    expect(onResolve).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onResolve).toHaveBeenCalledOnce();
  });
});

describe('InMemoryAuthGateway · cuentas registradas (002 FR-014)', () => {
  const registeredAccount = {
    email: 'ana@example.test',
    password: 'Clave-segura-1',
    displayName: 'Ana Pérez',
  };

  function withRegistered(accounts: (typeof TEST_ACCOUNT)[] | null = [TEST_ACCOUNT]) {
    const registered = new InMemoryAccountStore();
    registered.add(registeredAccount);
    return new InMemoryAuthGateway(accounts, { delayMs: 0, registered });
  }

  it('US1-6 (002): una cuenta registrada en la sesión inicia sesión', async () => {
    const result = await withRegistered().authenticate({
      email: ' ANA@example.test ',
      password: 'Clave-segura-1',
    });
    expect(result).toEqual({ kind: 'success', displayName: 'Ana Pérez' });
  });

  it('US1-6 (002): cuenta registrada con contraseña distinta → invalid-credentials', async () => {
    const result = await withRegistered().authenticate({
      email: registeredAccount.email,
      password: 'clave-segura-1',
    });
    expect(result).toEqual({ kind: 'invalid-credentials' });
  });

  it('US1-6 (002): sin configuración de demostración la cuenta registrada sigue funcionando', async () => {
    const registered = await withRegistered(null).authenticate({
      email: registeredAccount.email,
      password: registeredAccount.password,
    });
    expect(registered).toEqual({ kind: 'success', displayName: 'Ana Pérez' });
    const other = await withRegistered(null).authenticate({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
    });
    expect(other).toEqual({ kind: 'unavailable' });
  });

  it('las cuentas de demostración siguen funcionando junto a las registradas', async () => {
    const result = await withRegistered().authenticate({
      email: TEST_ACCOUNT.email,
      password: TEST_ACCOUNT.password,
    });
    expect(result).toEqual({ kind: 'success', displayName: 'Steven Luna' });
  });
});
