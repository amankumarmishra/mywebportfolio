import { projects } from '../content';
import CountUp from './rb/CountUp';
import SpotlightCard from './rb/SpotlightCard';
import TiltedCard from './rb/TiltedCard';
import { Brake, SectionHead } from './ui';

type Item = (typeof projects.items)[number];

const TAG = {
  result: { label: 'Result', className: 'bg-pb-deep text-white', badge: 'var(--pb)' },
  'in progress': { label: 'In progress', className: 'bg-improved text-black', badge: 'var(--improved)' },
  upcoming: { label: 'Upcoming', className: 'border border-white/25 text-mute', badge: 'var(--sector)' },
} as const;

function ResultCard({ item, tall }: { item: Item; tall?: boolean }) {
  const tag = TAG[item.status as keyof typeof TAG] ?? TAG.result;
  const upcoming = item.status === 'upcoming';
  return (
    <TiltedCard
      containerHeight="var(--card-h)"
      imageHeight="100%"
      imageWidth="100%"
      rotateAmplitude={7}
      scaleOnHover={1.02}
      showTooltip={false}
      radius={2}
      gyroscope={false}
      glare={0.25}
      intro={false}
    >
      <SpotlightCard
        className={`!h-full !rounded-[2px] !p-[clamp(20px,2.4vw,36px)] ${upcoming ? 'opacity-85' : ''}`}
        spotlightColor="var(--livery)"
        intensity={0.22}
        spotlightSize={320}
        style={{ ['--spotlight-card-surface' as string]: '#16100b' }}
      >
        <article className="relative flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <span className={`display text-[clamp(56px,7vw,112px)] leading-[0.8] ${upcoming ? 'text-white/25 [-webkit-text-stroke:1px_rgba(255,255,255,.5)]' : 'text-livery'}`}>
              {item.position}
            </span>
            <span className={`mono px-2 py-1 text-[11px] uppercase tracking-[0.1em] ${tag.className}`}>
              {tag.label}
            </span>
          </div>
          <h3 className="display condensed m-0 mt-auto pt-6 text-[clamp(26px,2.8vw,44px)]">{item.title}</h3>
          <p className="m-0 mt-2 text-[15px] text-livery">{item.role}</p>
          <p className={`m-0 mt-4 shrink-0 text-[14px] leading-[1.55] text-white/72 ${tall ? '' : 'line-clamp-5 lg:line-clamp-3'}`}>{item.body}</p>
          <p className="mono m-0 mt-5 border-t border-rule pt-3 text-[11px] uppercase tracking-[0.1em]" style={{ color: tag.badge }}>
            ◆ {item.badge}
          </p>
        </article>
      </SpotlightCard>
    </TiltedCard>
  );
}

export default function TrackRecords() {
  const [p1, ...others] = projects.items;
  return (
    <section id="projects" aria-labelledby="proj-title" className="relative isolate pb-[clamp(80px,10vw,140px)]">
      <div className="hairgrid" />
      <SectionHead id="proj-title" index="05 / Results" title={projects.title} labels={['Classification', 'Fastest laps', 'Grid']} />

      {/* fastest-lap style headline numbers */}
      <dl className="mt-12 grid grid-cols-1 border-y border-rule sm:grid-cols-3">
        {projects.stats.map((s, i) => (
          <Brake key={s.label} delay={i * 0.08} className="border-rule px-[var(--bar-l)] py-8 sm:border-r sm:last:border-r-0">
            <dt className="mono order-2 mt-3 text-[11px] uppercase tracking-[0.1em] text-mute">{s.label}</dt>
            <dd className="display m-0 whitespace-nowrap text-[clamp(56px,7.6vw,124px)] text-pb">
              <CountUp to={s.value} suffix={s.suffix} duration={1.8} easing="expo" />
            </dd>
          </Brake>
        ))}
      </dl>

      <div className="mt-[clamp(40px,6vw,80px)] grid gap-6 px-[var(--bar-l)] lg:grid-cols-12">
        {/* card heights grow with vw because the P numerals and titles do; P1 = two side cards + gap */}
        <Brake from="left" className="[--card-h:560px] lg:col-span-7 lg:[--card-h:calc(2*(210px+14vw)+24px)]"><ResultCard item={p1} tall /></Brake>
        <div className="flex flex-col gap-6 lg:col-span-5">
          {others.map((it, i) => (
            <Brake key={it.title} from="right" delay={i * 0.1} className="[--card-h:440px] sm:[--card-h:380px] lg:[--card-h:calc(210px+14vw)]"><ResultCard item={it} /></Brake>
          ))}
        </div>
      </div>
    </section>
  );
}
