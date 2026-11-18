import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

/** "Brake into place": arrives fast, overshoots slightly, settles. Direction varies per use. */
export function Brake({
  from = 'bottom',
  delay = 0,
  children,
  ...rest
}: { from?: 'bottom' | 'left' | 'right'; delay?: number; children: ReactNode } & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion();
  const offset = { bottom: { y: 70 }, left: { x: -90 }, right: { x: 90 } }[from];
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={reduce ? { duration: 0.3 } : { type: 'spring', stiffness: 170, damping: 17, mass: 0.9, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Atelier-style section header: index + small labels over a hairline rule, then a giant title. */
export function SectionHead({ index, title, labels, id }: { index: string; title: string; labels: string[]; id: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative px-[var(--bar-l)] pt-[clamp(72px,12vw,160px)]">
      <div className="small flex justify-between gap-4">
        <span className="mono text-mute">{index}</span>
        {labels.map(l => <span key={l} className="hidden text-mute sm:inline">{l}</span>)}
      </div>
      <motion.div className="mt-3" initial="off" whileInView="on" viewport={{ once: true }}>
        <motion.div
          className="rule-line origin-left"
          variants={{ off: { scaleX: reduce ? 1 : 0 }, on: { scaleX: 1 } }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        />
      </motion.div>
      <h2 id={id} className="display m-0 mt-[clamp(16px,3vw,40px)] overflow-hidden text-[clamp(36px,11vw,168px)]">
        <motion.span
          className="block"
          initial={reduce ? { opacity: 0 } : { y: '100%' }}
          whileInView={reduce ? { opacity: 1 } : { y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.span>
      </h2>
    </div>
  );
}

export const Kerb = () => <div className="kerb" aria-hidden="true" />;
