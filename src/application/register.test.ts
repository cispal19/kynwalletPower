import type { RegistrationData } from '@/domain/registration';
import type { RegistrationGateway } from './ports/RegistrationGateway';
import { createRegister } from './register';

const data: RegistrationData = {
  fullName: '  Ana Pérez ',
  email: ' ANA@Example.com ',
  password: 'Clave-segura-1',
  confirmPassword: 'Clave-segura-1',
  acceptedTerms: true,
};

describe('createRegister (contracts/registration-gateway.md)', () => {
  it('C1: delega con el nombre recortado y el correo normalizado → success', async () => {
    const gateway: RegistrationGateway = {
      register: vi.fn().mockResolvedValue({ kind: 'success' }),
    };
    const result = await createRegister(gateway)(data);
    expect(gateway.register).toHaveBeenCalledWith({
      fullName: 'Ana Pérez',
      email: 'ana@example.com',
      password: 'Clave-segura-1',
    });
    expect(result).toEqual({ kind: 'success' });
  });

  it('C2: si el gateway rechaza devuelve unavailable sin propagar', async () => {
    const gateway: RegistrationGateway = { register: vi.fn().mockRejectedValue(new Error('x')) };
    await expect(createRegister(gateway)(data)).resolves.toEqual({ kind: 'unavailable' });
  });

  it('C2: si el gateway lanza de forma síncrona devuelve unavailable', async () => {
    const gateway: RegistrationGateway = {
      register: vi.fn(() => {
        throw new Error('boom');
      }),
    };
    await expect(createRegister(gateway)(data)).resolves.toEqual({ kind: 'unavailable' });
  });

  it('C3: la contraseña llega sin alterar y la confirmación nunca se envía', async () => {
    const gateway: RegistrationGateway = {
      register: vi.fn().mockResolvedValue({ kind: 'success' }),
    };
    await createRegister(gateway)({
      ...data,
      password: ' Clave-segura-1 ',
      confirmPassword: ' Clave-segura-1 ',
    });
    const [request] = vi.mocked(gateway.register).mock.calls[0] ?? [];
    expect(request?.password).toBe(' Clave-segura-1 ');
    expect(request).not.toHaveProperty('confirmPassword');
    expect(request).not.toHaveProperty('acceptedTerms');
  });

  it('C4: email-taken se devuelve tal cual', async () => {
    const gateway: RegistrationGateway = {
      register: vi.fn().mockResolvedValue({ kind: 'email-taken' }),
    };
    await expect(createRegister(gateway)(data)).resolves.toEqual({ kind: 'email-taken' });
  });
});
