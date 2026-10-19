import { useId, type ReactNode, type Ref } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  /** Contenido interactivo tras la etiqueta (p. ej. un enlace); no cambia la casilla. */
  labelSuffix?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

export function Checkbox({ label, checked, onChange, error, labelSuffix, ref }: CheckboxProps) {
  const id = useId();
  const textId = `${id}-text`;
  const errorId = `${id}-error`;
  const labelElement = (
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
  );
  return (
    <div className={styles.field}>
      <div className={[styles.wrapper, labelSuffix && styles.withSuffix].filter(Boolean).join(' ')}>
        <input
          id={id}
          ref={ref}
          type="checkbox"
          className={styles.box}
          checked={checked}
          // HTML no admite un botón dentro de <label>: el nombre se compone con aria-labelledby.
          aria-labelledby={labelSuffix ? textId : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(event.target.checked)}
        />
        {labelSuffix ? (
          <span id={textId} className={styles.text}>
            {labelElement} {labelSuffix}
          </span>
        ) : (
          labelElement
        )}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
