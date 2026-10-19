import type { RefObject } from 'react';
import { MESSAGES } from '@/domain/messages';
import { Modal } from '@/ui/components/Modal/Modal';

type TermsDialogProps = {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
};

/** Términos ficticios de la demostración (US5). */
export function TermsDialog({ open, onClose, returnFocusRef }: TermsDialogProps) {
  return (
    <Modal
      open={open}
      title={MESSAGES.TERMS_TITLE}
      onClose={onClose}
      returnFocusRef={returnFocusRef}
    >
      {MESSAGES.TERMS_TEXT.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </Modal>
  );
}
