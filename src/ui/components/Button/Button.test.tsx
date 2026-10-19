import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza su texto como botón con type="button" por defecto', () => {
    render(<Button>Iniciar sesión</Button>);
    const button = screen.getByRole('button', { name: 'Iniciar sesión' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('aplica la variante indicada', () => {
    render(
      <>
        <Button variant="primary">Uno</Button>
        <Button variant="secondary">Dos</Button>
        <Button variant="link">Tres</Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Tres' })).toHaveClass('link');
    expect(screen.getByRole('button', { name: 'Uno' })).toHaveClass('primary');
    expect(screen.getByRole('button', { name: 'Dos' })).toHaveClass('secondary');
  });

  it('FR-008: en carga está deshabilitado, aria-busy y muestra loadingLabel', () => {
    render(
      <Button loading loadingLabel="Iniciando sesión…">
        Iniciar sesión
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Iniciando sesión…' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('invoca onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ok</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Button>Ok</Button>);
    await expectNoA11yViolations(container);
  });

  it('acepta ref sobre el botón (002: devolver el foco al enlace de términos)', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ok</Button>);
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Ok' }));
  });
});
