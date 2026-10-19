import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { Checkbox } from './Checkbox';

function Controlled() {
  const [checked, setChecked] = useState(false);
  return <Checkbox label="Recordarme" checked={checked} onChange={setChecked} />;
}

describe('Checkbox', () => {
  it('US5-2: casilla con etiqueta que alterna su estado', async () => {
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Recordarme' });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(screen.getByText('Recordarme'));
    expect(checkbox).not.toBeChecked();
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Controlled />);
    await expectNoA11yViolations(container);
  });

  it('US2-6: con error la casilla es inválida y lo describe', () => {
    render(
      <Checkbox
        label="Acepto"
        checked={false}
        onChange={() => {}}
        error="Debes aceptar los términos y condiciones"
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto' });
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
    expect(screen.getByText('Debes aceptar los términos y condiciones')).toBeVisible();
  });

  it('acepta ref sobre el input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="Acepto" checked={false} onChange={() => {}} ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('checkbox'));
  });

  describe('con labelSuffix (002 R10)', () => {
    function WithSuffix({ onSuffix = () => {} }: { onSuffix?: () => void }) {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          label="Acepto los"
          checked={checked}
          onChange={setChecked}
          labelSuffix={
            <button type="button" onClick={onSuffix}>
              términos y condiciones
            </button>
          }
        />
      );
    }

    it('FR-017: el nombre accesible es la etiqueta más el sufijo', () => {
      render(<WithSuffix />);
      expect(
        screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
      ).toBeInTheDocument();
    });

    it('FR-017: clic en la etiqueta la marca; clic en el sufijo no', async () => {
      const onSuffix = vi.fn();
      render(<WithSuffix onSuffix={onSuffix} />);
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(screen.getByText('Acepto los'));
      expect(checkbox).toBeChecked();
      await userEvent.click(screen.getByRole('button', { name: 'términos y condiciones' }));
      expect(onSuffix).toHaveBeenCalledOnce();
      expect(checkbox).toBeChecked();
    });

    it('FR-025: sin violaciones de accesibilidad, también con error', async () => {
      const { container } = render(
        <>
          <WithSuffix />
          <Checkbox label="Otra" checked={false} onChange={() => {}} error="Error" />
        </>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
