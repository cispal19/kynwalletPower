import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/a11y';
import { Alert } from './Alert';

describe('Alert', () => {
  it('FR-015: tone="error" usa role="alert"', () => {
    render(<Alert tone="error">Falló</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló');
  });

  it('FR-015: tone="info" usa role="status"', () => {
    render(<Alert tone="info">Aviso</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Aviso');
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Alert tone="error">Falló</Alert>);
    await expectNoA11yViolations(container);
  });

  it('002 R3: acepta ref y tabIndex para recibir el foco programáticamente', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Alert tone="info" ref={ref} tabIndex={-1}>
        Aviso
      </Alert>,
    );
    expect(ref.current).toBe(screen.getByRole('status'));
    expect(ref.current).toHaveAttribute('tabindex', '-1');
    ref.current?.focus();
    expect(screen.getByRole('status')).toHaveFocus();
  });

  it('sin ref ni tabIndex no es enfocable', () => {
    render(<Alert tone="info">Aviso</Alert>);
    expect(screen.getByRole('status')).not.toHaveAttribute('tabindex');
  });
});
