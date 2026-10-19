import { useRef, useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { Modal } from './Modal';

function Harness({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button type="button" ref={openerRef} onClick={() => setOpen(true)}>
        Abrir
      </button>
      <Modal
        open={open}
        title="Términos y condiciones"
        returnFocusRef={openerRef}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      >
        <p>Contenido</p>
      </Modal>
    </>
  );
}

describe('Modal (002 research.md R9)', () => {
  it('US5-1: abierto muestra un dialog con nombre igual al título', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const dialog = screen.getByRole('dialog', { name: 'Términos y condiciones' });
    expect(screen.getByRole('heading', { level: 2, name: 'Términos y condiciones' })).toBeVisible();
    expect(showModal).toHaveBeenCalledOnce();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    showModal.mockRestore();
  });

  it('US5-2: "Cerrar" llama a onClose y el foco vuelve al que la abrió', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();
  });

  it('US5-2: Escape (evento cancel) llama a onClose y cancela el cierre nativo', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    const cancel = new Event('cancel', { cancelable: true });
    fireEvent(screen.getByRole('dialog'), cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus();
  });

  it('FR-025: sin violaciones de accesibilidad estando abierto', async () => {
    const { container } = render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await expectNoA11yViolations(container);
  });
});
