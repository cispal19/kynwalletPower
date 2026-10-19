import { useEffect, useRef } from 'react';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

const brand = { title: 'Titular', description: 'Texto' };

describe('AuthLayout (research.md R5, R11)', () => {
  it('muestra el panel de marca y el contenido en main', () => {
    render(
      <AuthLayout brand={brand}>
        <h1>Pantalla</h1>
      </AuthLayout>,
    );
    expect(screen.getByText('Titular')).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1 }));
  });

  it('FR-024: con focusHeadingOnMount enfoca el h1 de main', () => {
    render(
      <AuthLayout brand={brand} focusHeadingOnMount>
        <h1>Pantalla</h1>
        <input aria-label="Campo" />
      </AuthLayout>,
    );
    const heading = screen.getByRole('heading', { level: 1, name: 'Pantalla' });
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(heading).toHaveFocus();
  });

  it('FR-024: no mueve el foco si ya está dentro de main', () => {
    // Como el login con el aviso de éxito: el hijo enfoca antes que el layout.
    function FocusOnMount() {
      const ref = useRef<HTMLInputElement>(null);
      useEffect(() => ref.current?.focus(), []);
      return <input aria-label="Campo" ref={ref} />;
    }
    render(
      <AuthLayout brand={brand} focusHeadingOnMount>
        <h1>Pantalla</h1>
        <FocusOnMount />
      </AuthLayout>,
    );
    expect(screen.getByLabelText('Campo')).toHaveFocus();
  });

  it('sin focusHeadingOnMount no mueve el foco', () => {
    render(
      <AuthLayout brand={brand}>
        <h1>Pantalla</h1>
      </AuthLayout>,
    );
    expect(document.body).toHaveFocus();
  });
});
