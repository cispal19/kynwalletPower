import { useEffect, useRef, type ReactNode } from 'react';
import { BrandPanel } from '@/ui/layout/BrandPanel/BrandPanel';
import styles from './AuthLayout.module.css';

type AuthLayoutProps = {
  brand: { title: ReactNode; description: string };
  /** Tras navegar, lleva el foco al h1 de la pantalla (research.md R11). */
  focusHeadingOnMount?: boolean;
  children: ReactNode;
};

/** Composición de dos paneles compartida por el login y el registro (research.md R5). */
export function AuthLayout({ brand, focusHeadingOnMount = false, children }: AuthLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    // Si la pantalla ya movió el foco (p. ej. al mensaje de éxito), se respeta.
    if (!focusHeadingOnMount || !main || main.contains(document.activeElement)) return;
    const heading = main.querySelector('h1');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }, [focusHeadingOnMount]);

  return (
    <div className={styles.screen}>
      <BrandPanel title={brand.title} description={brand.description} />
      <main ref={mainRef} className={styles.formPanel}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
