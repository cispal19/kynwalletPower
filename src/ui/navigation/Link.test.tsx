import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from './Link';

describe('Link (R2)', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/login');
  });

  it('renderiza un enlace con su href, className y contenido', () => {
    render(
      <Link href="/registro" className="extra">
        Regístrate
      </Link>,
    );
    const link = screen.getByRole('link', { name: 'Regístrate' });
    expect(link).toHaveAttribute('href', '/registro');
    expect(link).toHaveClass('extra');
  });

  it('FR-016: un clic simple navega sin recargar', async () => {
    render(<Link href="/registro">Regístrate</Link>);
    const link = screen.getByRole('link', { name: 'Regístrate' });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    fireEvent(link, click);
    expect(click.defaultPrevented).toBe(true);
    expect(location.pathname).toBe('/registro');
  });

  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'])(
    'con %s no intercepta el clic',
    (modifier) => {
      render(<Link href="/registro">Regístrate</Link>);
      const click = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 0,
        [modifier]: true,
      });
      let preventedByLink: boolean | undefined;
      // Último oyente: registra si Link interceptó y evita que jsdom intente navegar de verdad.
      const lastListener = (event: Event) => {
        preventedByLink = event.defaultPrevented;
        event.preventDefault();
      };
      window.addEventListener('click', lastListener);
      fireEvent(screen.getByRole('link', { name: 'Regístrate' }), click);
      window.removeEventListener('click', lastListener);
      expect(preventedByLink).toBe(false);
      expect(location.pathname).toBe('/login');
    },
  );

  it('FR-023: se activa con Enter desde el teclado', async () => {
    const user = userEvent.setup();
    render(<Link href="/registro">Regístrate</Link>);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Regístrate' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(location.pathname).toBe('/registro');
  });
});
