// CAE tool glyphs carried over from the original site's icon.html.
type P = { className?: string };
const base = { viewBox: '0 0 512 512', fill: 'none', stroke: 'currentColor', 'aria-hidden': true } as const;

export const Ansa = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M256 16 L16 464 H496 Z" strokeWidth="48" strokeLinejoin="round" />
    <path d="M136 240 H376 M76 352 H436 M256 16 V464 M136 240 L256 464 M376 240 L256 464" strokeWidth="32" strokeLinejoin="round" />
  </svg>
);
export const Meta = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M32 464 V128 L176 320 L336 96 L480 352" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M32 464 H480" strokeWidth="48" strokeLinecap="round" />
    <circle cx="176" cy="320" r="32" fill="currentColor" />
    <circle cx="336" cy="96" r="32" fill="currentColor" />
    <circle cx="480" cy="352" r="32" fill="currentColor" />
  </svg>
);
export const Primer = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M112 32 V480" strokeWidth="48" strokeLinecap="round" />
    <path d="M112 32 H336 C424.4 32 496 103.6 496 192 C496 280.4 424.4 352 336 352 H112" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="288" cy="192" r="40" fill="currentColor" />
    <path d="M112 192 H248" strokeWidth="32" />
  </svg>
);
export const LsDyna = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M128 224 L320 224 L320 448 L128 448 Z M224 64 L416 64 L416 288 L224 288 Z" strokeWidth="40" strokeLinejoin="round" />
    <path d="M128 224 L224 64 M320 224 L416 64 M320 448 L416 288 M128 448 L224 288" strokeWidth="40" strokeLinecap="round" />
  </svg>
);
/** Generic hex-node mark for tools without a custom glyph. */
export const Node = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M256 40 L448 152 V360 L256 472 L64 360 V152 Z" strokeWidth="40" strokeLinejoin="round" />
    <circle cx="256" cy="256" r="56" fill="currentColor" />
  </svg>
);

export const toolIcon = (name: string) =>
  ({ 'LS-Dyna': LsDyna, ANSA: Ansa, META: Meta, Primer })[name] ?? Node;

// Contact glyphs for the hero, drawn in the same stroke style on a 24px grid.
const social = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;
export const Mail = ({ className }: P) => (
  <svg {...social} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>
);
export const LinkedIn = ({ className }: P) => (
  <svg {...social} className={className}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10.5V16.5M12 16.5v-3.5a2.5 2.5 0 0 1 5 0v3.5M12 10.5v6" /><circle cx="8" cy="7.6" r=".4" fill="currentColor" /></svg>
);
export const Instagram = ({ className }: P) => (
  <svg {...social} className={className}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".5" fill="currentColor" /></svg>
);
