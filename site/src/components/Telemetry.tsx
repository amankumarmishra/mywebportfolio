import { motion, useReducedMotion } from 'motion/react';
import { skills } from '../content';
import ScrollVelocity from './rb/ScrollVelocity';
import { toolIcon } from './icons';
import { Brake, Kerb, SectionHead } from './ui';

// Sector colours are decorative timing-screen styling, not a skill rating.
const SECTOR_PATTERN = [
  ['pb', 'improved', 'sector'],
  ['improved', 'pb', 'improved'],
  ['sector', 'improved', 'pb'],
  ['pb', 'sector', 'improved'],
  ['improved', 'improved', 'pb'],
  ['sector', 'pb', 'sector'],
] as const;

function Tools() {
  const half = Math.ceil(skills.software.length / 2);
  const row = (list: string[]) => (
    <span className="inline-flex items-center gap-[0.6em] pr-[0.6em]">
      {list.map(t => {
        const Icon = toolIcon(t);
        const logo = skills.softwareLogos[t];
        return (
          <span key={t} className="inline-flex items-center gap-[0.25em]">
            {logo ? (
              // white badge keeps dark and coloured brand marks readable on carbon
              <span className={`inline-flex items-center justify-center rounded-[0.08em] bg-white ${logo.wordmark ? 'h-[0.78em] px-[0.25em]' : 'h-[0.7em] min-w-[0.7em] px-[0.08em]'}`}>
                <img src={logo.src} alt="" loading="lazy" className={`block w-auto object-contain ${logo.wordmark ? 'h-[0.42em] max-w-[5em]' : 'h-[0.55em] max-w-[1.2em]'}`} />
              </span>
            ) : (
              <Icon className="size-[0.62em] text-livery" />
            )}
            {!logo?.wordmark && t}
            <span className="mx-[0.2em] text-white/20">/</span>
          </span>
        );
      })}
    </span>
  );
  return (
    <div aria-hidden="true">
      <ScrollVelocity
        texts={[row(skills.software.slice(0, half)), row(skills.software.slice(half))]}
        velocity={40}
        numCopies={4}
        skewWithVelocity={6}
        className="display condensed"
        scrollerClassName="!font-[inherit] !text-[clamp(44px,8vw,120px)] !leading-[1.05] !tracking-[-0.03em]"
        parallaxClassName="py-1"
      />
    </div>
  );
}

export default function Telemetry() {
  const reduce = useReducedMotion();
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative isolate pb-[clamp(80px,10vw,140px)]">
      <div className="hairgrid" />
      <SectionHead id="skills-title" index="04 / Telemetry" title={skills.title} labels={[skills.softwareTitle, skills.telemetryTitle, skills.certsTitle]} />

      <h3 className="eyebrow mx-[var(--bar-l)] mb-4 mt-14">{skills.softwareTitle}</h3>
      <ul className="sr-only">{skills.software.map(s => <li key={s}>{s}</li>)}</ul>
      <div className="carbon border-y border-rule py-6"><Tools /></div>

      <div className="mt-[clamp(48px,7vw,100px)] grid gap-12 px-[var(--bar-l)] lg:grid-cols-12">
        {/* timing screen */}
        <Brake from="left" className="lg:col-span-7">
          <h3 className="eyebrow mb-4">{skills.telemetryTitle}</h3>
          <div className="carbon border border-rule">
            <div className="mono grid grid-cols-[3rem_1fr_repeat(3,3.2rem)] gap-px border-b border-rule px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-mute sm:grid-cols-[3rem_1fr_repeat(3,4.5rem)]">
              <span>Pos</span><span>Discipline</span><span className="text-center">S1</span><span className="text-center">S2</span><span className="text-center">S3</span>
            </div>
            <ol className="m-0 list-none p-0">
              {skills.telemetry.map((t, i) => (
                <li key={t} className="grid grid-cols-[3rem_1fr_repeat(3,3.2rem)] items-center gap-px border-b border-rule/60 px-4 py-3 last:border-0 sm:grid-cols-[3rem_1fr_repeat(3,4.5rem)]">
                  <span className="mono text-[13px] text-mute">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[clamp(15px,1.4vw,19px)] font-semibold">{t}</span>
                  {SECTOR_PATTERN[i].map((c, j) => (
                    // observe the track, not the bar: a scaleX(0) bar has no area, so it never "enters" view
                    <motion.span key={j} className="mx-1 h-[10px] overflow-hidden bg-white/5" aria-hidden="true" initial="off" whileInView="on" viewport={{ once: true }}>
                      <motion.span
                        className="block h-full origin-left"
                        style={{ background: `var(--${c})` }}
                        variants={{ off: { scaleX: reduce ? 1 : 0 }, on: { scaleX: 1 } }}
                        transition={{ duration: 0.45, delay: reduce ? 0 : 0.15 + i * 0.12 + j * 0.18, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </motion.span>
                  ))}
                </li>
              ))}
            </ol>
            <p className="mono m-0 flex gap-4 border-t border-rule px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-mute" aria-hidden="true">
              <span><i className="mr-1 inline-block size-2 bg-pb" />Personal best</span>
              <span><i className="mr-1 inline-block size-2 bg-improved" />Improved</span>
              <span><i className="mr-1 inline-block size-2 bg-sector" />Sector</span>
            </p>
          </div>
        </Brake>

        <div className="flex flex-col gap-10 lg:col-span-4 lg:col-start-9">
          <h3 className="eyebrow -mb-6">{skills.certsTitle}</h3>
          {[skills.volunteering, skills.certifications].map((b, i) => (
            <Brake key={b.title} from="right" delay={i * 0.1}>
              <div className="border-t-2 border-livery pt-4">
                <h4 className="display condensed m-0 text-[clamp(28px,3vw,42px)]">{b.title}</h4>
                <ul className="m-0 mt-4 list-none space-y-3 p-0">
                  {b.items.map(it => (
                    <li key={it} className="flex items-start gap-3 text-[15px]">
                      <span className="mt-[6px] inline-block h-[8px] w-[18px] shrink-0 bg-sector" aria-hidden="true" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Brake>
          ))}
        </div>
      </div>
      <div className="mt-[clamp(64px,8vw,120px)]"><Kerb /></div>
    </section>
  );
}
