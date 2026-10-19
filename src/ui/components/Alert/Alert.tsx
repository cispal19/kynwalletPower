import type { ReactNode, Ref } from 'react';
import styles from './Alert.module.css';

type AlertProps = {
  tone: 'error' | 'info';
  /** Permite mover el foco al mensaje para garantizar su lectura (002 research R3). */
  ref?: Ref<HTMLDivElement>;
  tabIndex?: number;
  children: ReactNode;
};

/** Mensaje global anunciado por tecnologías de asistencia (FR-015). */
export function Alert({ tone, ref, tabIndex, children }: AlertProps) {
  return (
    <div
      ref={ref}
      tabIndex={tabIndex}
      role={tone === 'error' ? 'alert' : 'status'}
      className={`${styles.alert} ${styles[tone]}`}
    >
      {children}
    </div>
  );
}
