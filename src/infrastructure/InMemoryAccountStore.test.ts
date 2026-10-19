import { InMemoryAccountStore } from './InMemoryAccountStore';

const account = { email: ' Ana@Example.test ', password: 'Clave-segura-1', displayName: 'Ana' };

describe('InMemoryAccountStore (contracts/registration-gateway.md)', () => {
  it('M1: guarda la cuenta con el correo normalizado y la encuentra sin distinguir mayúsculas', () => {
    const store = new InMemoryAccountStore();
    expect(store.add(account)).toBe(true);
    expect(store.find('ANA@example.TEST')).toEqual({
      email: 'ana@example.test',
      password: 'Clave-segura-1',
      displayName: 'Ana',
    });
  });

  it('M2: un correo ya guardado no se sobrescribe', () => {
    const store = new InMemoryAccountStore();
    store.add(account);
    expect(store.add({ ...account, password: 'Otra-clave-2', displayName: 'Otra' })).toBe(false);
    expect(store.find(account.email)?.password).toBe('Clave-segura-1');
  });

  it('M3: correo desconocido → undefined', () => {
    expect(new InMemoryAccountStore().find('nadie@example.test')).toBeUndefined();
  });

  it('M4: solo vive en memoria: no usa el almacenamiento del navegador', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    new InMemoryAccountStore().add(account);
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});
