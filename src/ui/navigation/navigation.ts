import { useSyncExternalStore } from 'react';

/** Evento propio: pushState/replaceState no emiten popstate. */
const NAVIGATE_EVENT = 'kyn:navigate';

/** Cambia la dirección sin recargar (History API, research.md R2). */
export function navigate(path: string, { replace = false }: { replace?: boolean } = {}): void {
  if (replace) history.replaceState(null, '', path);
  else history.pushState(null, '', path);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

const getPathname = () => window.location.pathname;

/** Dirección actual; se vuelve a renderizar al navegar y con atrás/adelante. */
export function useCurrentPath(): string {
  return useSyncExternalStore(subscribe, getPathname);
}
