import { act, renderHook } from '@testing-library/react';
import { navigate, useCurrentPath } from './navigation';
import { DOCUMENT_TITLES, resolveRoute, ROUTES } from './routes';

describe('routes (R2)', () => {
  it('FR-018: rutas de login y registro', () => {
    expect(ROUTES.login).toBe('/login');
    expect(ROUTES.register).toBe('/registro');
  });

  it.each([
    ['/login', 'login'],
    ['/registro', 'register'],
    ['/', null],
    ['/otra', null],
  ])('FR-018: resolveRoute(%j) → %j', (pathname, expected) => {
    expect(resolveRoute(pathname)).toBe(expected);
  });

  it('FR-024: títulos del documento por ruta', () => {
    expect(DOCUMENT_TITLES).toEqual({
      login: 'KynWallet · Iniciar sesión',
      register: 'KynWallet · Crear cuenta',
    });
  });
});

describe('navigate y useCurrentPath (R2)', () => {
  afterEach(() => {
    history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('FR-016: navigate usa pushState', () => {
    const pushState = vi.spyOn(history, 'pushState');
    navigate('/registro');
    expect(pushState).toHaveBeenCalledWith(null, '', '/registro');
    expect(location.pathname).toBe('/registro');
  });

  it('R3: navigate con replace usa replaceState', () => {
    const replaceState = vi.spyOn(history, 'replaceState');
    navigate('/login', { replace: true });
    expect(replaceState).toHaveBeenCalledWith(null, '', '/login');
    expect(location.pathname).toBe('/login');
  });

  it('useCurrentPath se actualiza tras navigate', () => {
    history.replaceState(null, '', '/login');
    const { result } = renderHook(() => useCurrentPath());
    expect(result.current).toBe('/login');
    act(() => navigate('/registro'));
    expect(result.current).toBe('/registro');
  });

  it('US3-3: useCurrentPath se actualiza con popstate (atrás/adelante)', () => {
    history.replaceState(null, '', '/login');
    const { result } = renderHook(() => useCurrentPath());
    act(() => {
      history.replaceState(null, '', '/registro');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current).toBe('/registro');
  });
});
