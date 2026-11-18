import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { contact, socials, teamRadio } from '../content';
import Flag from './Flag';
import Modal from './Modal';
import TextType from './rb/TextType';
import { Brake, SectionHead } from './ui';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Radio waveform: busy while transmitting, flatlines into a confirmation once sent. */
function Waveform({ status }: { status: Status }) {
  const reduce = useReducedMotion();
  const path = (amp: number, phase: number) =>
    'M0 20 ' + Array.from({ length: 41 }, (_, i) => `L${i * 5} ${20 + Math.sin(i * 0.9 + phase) * amp * Math.sin((i / 40) * Math.PI)}`).join(' ');
  return (
    <svg viewBox="0 0 200 40" className="h-10 w-full" aria-hidden="true">
      <motion.path
        fill="none"
        stroke={status === 'error' ? '#ef4444' : status === 'sent' ? 'var(--improved)' : 'var(--livery)'}
        strokeWidth="1.6"
        animate={
          status === 'sending' && !reduce
            ? { d: [path(16, 0), path(9, 2), path(18, 4), path(16, 6.28)] }
            : { d: path(status === 'sent' ? 0 : 3, 0) }
        }
        transition={status === 'sending' ? { duration: 0.6, repeat: Infinity, ease: 'linear' } : { duration: 0.5 }}
      />
    </svg>
  );
}

function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    try {
      // Apps Script does not send CORS headers, so the response is opaque:
      // a resolved fetch means the request left; a rejected one means it did not.
      await fetch(contact.endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString(),
      });
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  };

  const field = 'w-full border-0 border-b border-white/20 bg-transparent px-0 py-2 text-[16px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-livery focus-visible:outline-none';

  return (
    <div className="p-6 pt-10 sm:p-8 sm:pt-12">
      <h3 className="display condensed m-0 text-[clamp(32px,5vw,44px)]">{contact.modalTitle}</h3>
      <p className="m-0 mt-2 text-[14px] text-mute">{contact.modalText}</p>
      <form onSubmit={submit} className="mt-6 grid gap-5" aria-describedby="form-status">
        <label className="grid gap-1"><span className="eyebrow">Name</span><input data-autofocus name="name" required autoComplete="name" className={field} /></label>
        <label className="grid gap-1"><span className="eyebrow">Email</span><input name="email" type="email" required autoComplete="email" className={field} /></label>
        <label className="grid gap-1"><span className="eyebrow">Phone (optional)</span><input name="phone" type="tel" autoComplete="tel" className={field} /></label>
        <label className="grid gap-1"><span className="eyebrow">Message</span><textarea name="message" rows={4} required className={`${field} resize-y`} /></label>
        <Waveform status={status} />
        <button type="submit" disabled={status === 'sending'} className="small h-11 bg-livery px-4 text-left uppercase text-on-livery transition-opacity disabled:opacity-60">
          {status === 'sending' ? contact.sending : contact.submit}
        </button>
        <p id="form-status" role="status" className="mono m-0 min-h-5 text-[12px] uppercase tracking-[0.08em]" style={{ color: status === 'error' ? '#f87171' : 'var(--improved)' }}>
          {status === 'sent' && `Transmission sent · ${contact.success}`}
          {status === 'error' && contact.error}
        </p>
      </form>
    </div>
  );
}

function Magnetic({ href, children, external }: { href: string; children: string; external?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
  };
  return (
    <a
      ref={ref}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      onPointerMove={move}
      onPointerLeave={() => ref.current && (ref.current.style.transform = '')}
      className="small inline-flex h-11 items-center border border-white/30 bg-black/40 px-5 uppercase transition-[transform,background-color,color] duration-300 ease-[var(--e-brake)] hover:bg-menu hover:text-menu-ink"
    >
      {children}
    </a>
  );
}

export default function Contact() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Flag className="absolute right-0 top-0 h-full w-full opacity-35 md:left-[35%] md:w-[65%] md:opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0d0905_0%,#0d0905_35%,rgba(13,9,5,.55)_70%,rgba(13,9,5,.2))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#130e09] to-transparent" />
      </div>
      <SectionHead id="contact-title" index={`${teamRadio.items.length ? '07' : '06'} / Finish`} title={contact.title} labels={['Radio', 'Parc fermé', 'Podium']} />
      <div className="px-[var(--bar-l)] pb-[clamp(96px,14vw,200px)] pt-8">
        <Brake><p className="m-0 max-w-[32ch] text-[clamp(20px,2.2vw,30px)] leading-tight">{contact.subtitle}</p></Brake>
        <button
          onClick={() => setOpen(true)}
          className="mono group mt-10 block text-left text-[clamp(32px,6vw,84px)] font-semibold leading-none tracking-tight"
          aria-haspopup="dialog"
        >
          <TextType text={contact.code} as="span" loop={false} startOnVisible typingSpeed={70} cursorCharacter="_" className="[&_span]:transition-colors group-hover:text-livery" />
        </button>
        <div className="mt-10 flex flex-wrap gap-4">
          <Magnetic href={socials.linkedin} external>{contact.linkedinLabel}</Magnetic>
          <Magnetic href={socials.email}>{contact.emailLabel}</Magnetic>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <Modal label={contact.modalTitle} onClose={close}>
            <ContactForm />
          </Modal>
        )}
      </AnimatePresence>
    </section>
  );
}
