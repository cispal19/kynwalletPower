import type { MouseEvent, ReactNode } from 'react';
import { navigate } from './navigation';
import styles from './Link.module.css';

type LinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** Enlace real que navega sin recargar; con teclas modificadoras deja actuar al navegador. */
export function Link({ href, className, children }: LinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    <a
      href={href}
      className={[styles.link, className].filter(Boolean).join(' ')}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
