import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom no implementa <dialog> modal (002 research.md R9). Sustituto mínimo: abre y cierra con
// el atributo `open` y emite `close`. La inercia del fondo y la retención del foco dependen del
// navegador y se verifican a mano (quickstart).
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

afterEach(() => {
  cleanup();
  // Ninguna prueba debe depender de la ruta o el título que dejó otra (Constitución 1.4).
  history.replaceState(null, '', '/');
  document.title = 'KynWallet · Iniciar sesión';
});
