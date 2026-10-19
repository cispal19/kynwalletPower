import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Button.module.css';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'link';
  loading?: boolean;
  loadingLabel?: string;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  loading = false,
  loadingLabel,
  type = 'button',
  disabled,
  className,
  ref,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
