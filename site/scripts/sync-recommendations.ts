// npm run sync:recs
// LinkedIn export (data/linkedin/Recommendations_Received.csv) -> src/data/testimonials.json,
// merged with the hand-edited src/data/testimonials.overrides.json (overrides always win).
// Photos: drop <id>.jpg/.png/.webp into public/testimonials/ and this resizes them to 160x160 WebP.
import { deepEqual, equal } from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const CSV = join(root, 'data/linkedin/Recommendations_Received.csv');
const OUT = join(root, 'src/data/testimonials.json');
const OVERRIDES = join(root, 'src/data/testimonials.overrides.json');
const PHOTOS = join(root, 'public/testimonials');
const ORIGINALS = join(root, 'data/photos'); // gitignored: raw photos are moved here so they never ship

type Override = {
  role?: string; company?: string; relationship?: string; image?: string;
  linkedinUrl?: string; featured?: boolean; order?: number | null; hidden?: boolean;
};

/** RFC 4180 CSV: quoted fields may hold commas, newlines and "" escapes. */
export function parseCsv(src: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c !== '"') field += c;
      else if (src[i + 1] === '"') (field += '"', i++);
      else quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === ',') (row.push(field), field = '');
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field), rows.push(row), row = [], field = '';
    } else field += c;
  }
  if (field || row.length) row.push(field), rows.push(row);
  return rows.filter(r => r.some(f => f.trim()));
}

/** LinkedIn writes US dates: "09/04/26, 01:27 PM" is 4 September 2026. */
export function isoDate(s: string): string {
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b/);
  if (!m) throw new Error(`Unrecognised date "${s}"`);
  const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  return `${year}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

// Wording is never changed: only line endings, per-line edges and runs of blank lines.
const cleanText = (s: string) => s.replace(/\r\n?/g, '\n').split('\n').map(l => l.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
const cleanLine = (s: string) => s.replace(/\s+/g, ' ').trim();
const slug = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const set = <T,>(v: T | '' | null | undefined): v is T => v !== undefined && v !== null && v !== '';

// self-check of the parsers on the awkward cases
deepEqual(parseCsv('﻿a,b\r\n"x, ""y""\nz",2\n\n'.replace('﻿', '')), [['a', 'b'], ['x, "y"\nz', '2']]);
equal(isoDate('09/04/26, 01:27 PM'), '2026-09-04');
equal(cleanText('  one\r\n\r\n\r\n two  '), 'one\n\ntwo');

if (!existsSync(CSV)) {
  console.error(`Missing ${CSV}\nExport it from LinkedIn (Settings > Data privacy > Get a copy of your data > Recommendations).`);
  process.exit(1);
}

const [header, ...body] = parseCsv(readFileSync(CSV, 'utf8').replace(/^﻿/, ''));
const col = (name: string) => {
  const i = header.findIndex(h => h.trim().toLowerCase() === name.toLowerCase());
  if (i < 0) throw new Error(`CSV has no "${name}" column. Columns: ${header.join(', ')}`);
  return i;
};
const C = { first: col('First Name'), last: col('Last Name'), company: col('Company'), title: col('Job Title'), text: col('Text'), date: col('Creation Date'), status: col('Status') };

const seen = new Map<string, number>();
const recs = body
  .filter(r => /^(visible|accepted)$/i.test(r[C.status]?.trim() ?? ''))
  .map(r => {
    const name = cleanLine(`${r[C.first]} ${r[C.last]}`);
    const base = slug(name);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return {
      id: n > 1 ? `${base}-${n}` : base,
      name,
      role: cleanLine(r[C.title]),
      company: cleanLine(r[C.company]),
      text: cleanText(r[C.text]),
      date: isoDate(r[C.date].trim()),
    };
  });

// overrides: create/extend with empty entries, never touch existing values
const overrides: Record<string, Override> = existsSync(OVERRIDES) ? JSON.parse(readFileSync(OVERRIDES, 'utf8')) : {};
mkdirSync(join(root, 'src/data'), { recursive: true });
const added = recs.filter(r => !(r.id in overrides));
for (const r of added) overrides[r.id] = { role: '', company: '', relationship: '', image: '', linkedinUrl: '', featured: false, order: null, hidden: false };
if (added.length) writeFileSync(OVERRIDES, JSON.stringify(overrides, null, 2) + '\n');

// photos: resize anything named <id>.* to a 160x160 WebP
mkdirSync(PHOTOS, { recursive: true });
const ids = new Set(recs.map(r => r.id));
const photos = readdirSync(PHOTOS).filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f) && ids.has(f.replace(/\.[^.]+$/, '')));
if (photos.length) {
  const { default: sharp } = await import('sharp');
  for (const f of photos) {
    const src = join(PHOTOS, f);
    const id = f.replace(/\.[^.]+$/, '');
    const meta = await sharp(src).metadata();
    if (meta.format === 'webp' && meta.width === 160 && meta.height === 160) continue;
    const out = await sharp(src).rotate().resize(160, 160, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toBuffer();
    if (extname(f).toLowerCase() !== '.webp') {
      mkdirSync(ORIGINALS, { recursive: true });
      renameSync(src, join(ORIGINALS, f));
    }
    writeFileSync(join(PHOTOS, `${id}.webp`), out);
    console.log(`photo: ${f} -> testimonials/${id}.webp (160x160)`);
  }
}

const merged = recs
  .map(r => {
    const o = overrides[r.id] ?? {};
    const local = existsSync(join(PHOTOS, `${r.id}.webp`)) ? `testimonials/${r.id}.webp` : null;
    return {
      ...r,
      role: set(o.role) ? o.role : r.role,
      company: set(o.company) ? o.company : r.company,
      ...(set(o.relationship) && { relationship: o.relationship }),
      image: set(o.image) ? o.image : local,
      ...(set(o.linkedinUrl) && { linkedinUrl: o.linkedinUrl }),
      ...(o.featured && { featured: true }),
      order: set(o.order) ? o.order : Infinity,
      hidden: !!o.hidden,
    };
  })
  .filter(r => !r.hidden)
  .sort((a, b) => a.order - b.order || b.date.localeCompare(a.date))
  .map(({ order: _o, hidden: _h, ...r }) => r);

writeFileSync(OUT, JSON.stringify(merged, null, 2) + '\n');
console.log(`${merged.length} testimonials -> src/data/testimonials.json` + (added.length ? `\n${added.length} new entries in testimonials.overrides.json, fill them in and re-run` : ''));
