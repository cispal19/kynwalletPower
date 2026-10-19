import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { Button } from '../Button/Button';
import styles from './Modal.module.css';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Elemento que recibe el foco al cerrar (normalmente el que abrió la ventana). */
  returnFocusRef: RefObject<HTMLElement | null>;
  children: ReactNode;
};

/** Ventana modal sobre <dialog> nativo: fondo inerte y Escape los aporta el navegador (R9). */
export function Modal({ open, title, onClose, returnFocusRef, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // El navegador ya enfoca dentro de la ventana; si no lo hizo, se enfoca "Cerrar".
      if (!dialog.contains(document.activeElement)) closeRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [open, returnFocusRef]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape: el cierre lo controla el estado de React para devolver el foco.
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <div className={styles.body}>{children}</div>
      <Button variant="secondary" ref={closeRef} onClick={onClose}>
        Cerrar
      </Button>
    </dialog>
  );
}
