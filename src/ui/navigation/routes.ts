/** Rutas de la aplicación (research.md R2). Fuente única. */
export const ROUTES = {
  login: '/login',
  register: '/registro',
} as const;

export type Route = keyof typeof ROUTES;

/** Título del documento por ruta (WCAG 2.4.2). */
export const DOCUMENT_TITLES: Record<Route, string> = {
  login: 'KynWallet · Iniciar sesión',
  register: 'KynWallet · Crear cuenta',
};

/** Pantalla correspondiente a una dirección; null si no existe (se redirige a /login). */
export function resolveRoute(pathname: string): Route | null {
  if (pathname === ROUTES.login) return 'login';
  if (pathname === ROUTES.register) return 'register';
  return null;
}
