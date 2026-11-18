import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { lockScroll } from '../lib/scroll';

const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

/** Accessible dialog: focus trap, Escape and backdrop close, focus returns to the opener. */
/** `sheet`: wide reading dialog that goes full-screen on phones. */
export default function Modal({ label, onClose, children, wide, sheet }: { label: string; onClose: () => void; children: ReactNode; wide?: boolean; sheet?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    lockScroll(true);
    (box.current?.querySelector<HTMLElement>('[data-autofocus]') ?? box.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !box.current) return;
      const f = [...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) (e.preventDefault(), f[f.length - 1].focus());
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) (e.preventDefault(), f[0].focus());
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <motion.div
      className={`fixed inset-0 z-[80] grid place-items-center bg-black/75 backdrop-blur-[2px] ${sheet ? 'max-sm:p-0 sm:p-4' : 'p-4'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative w-full overflow-auto border border-rule bg-[#120d08] ${sheet ? 'h-[100svh] max-w-[760px] sm:h-auto sm:max-h-[88svh] max-sm:border-0' : `max-h-[92svh] ${wide ? 'max-w-[560px]' : 'max-w-[520px]'}`}`}
        initial={reduce ? { opacity: 0 } : { y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0.2 } : { type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div className="kerb !h-[6px]" aria-hidden="true" />
        <button onClick={onClose} aria-label="Close" className="small absolute right-3 top-4 z-10 bg-menu px-2 py-[2px] text-menu-ink">
          Close
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
