import { CATEGORIES, type Category } from './categories';

/** One row of assets/images.json */
export interface ManifestEntry {
  file: string;
  original_name: string;
  wix_id: string;
  source_page: string;
  /** folder / old page the image came from */
  category: string;
  /** project name; empty → category placeholder */
  project: string;
  /** "skip" hides the image */
  use: string;
  kb: number;
}

/** Hand-written details in src/data/projects.json, keyed by project name */
export interface ProjectDetails {
  category?: Category;
  urbanRenewal?: boolean;
  city?: string;
  year?: string;
  status?: string;
  size?: string;
  client?: string;
  description?: string;
  /** path of the image to use as cover (must be one of the project's images) */
  cover?: string;
  featured?: boolean;
  order?: number;
}

export interface RawProject {
  slug: string;
  title: string;
  category: Category;
  urbanRenewal: boolean;
  city?: string;
  year?: string;
  status?: string;
  size?: string;
  client?: string;
  description?: string;
  cover: string;
  images: string[];
  featured: boolean;
  placeholder: boolean;
  order: number;
}

const PAGE_TO_CATEGORY: Record<string, { category: Category; urbanRenewal: boolean }> = {
  towers: { category: 'towers', urbanRenewal: false },
  commercial: { category: 'commercial', urbanRenewal: false },
  offices: { category: 'offices', urbanRenewal: false },
  villas: { category: 'villas', urbanRenewal: false },
  synagogues: { category: 'synagogues', urbanRenewal: false },
  'urban-renewal': { category: 'towers', urbanRenewal: true },
};

const WORDS: Record<string, string> = {
  'בית': 'beit', 'בתי': 'batei', 'כנסת': 'kneset', 'עיר': 'ir', 'ימים': 'yamim', 'מרינה': 'marina', 'לגונה': 'laguna',
  'נתניה': 'netanya', 'וילת': 'villa', 'וילה': 'villa', 'וילות': 'villas', 'סגל': 'segal', 'טיטניום': 'titanium', 'בוטיק': 'boutique',
  'פריים': 'prime', 'סנטר': 'center', 'פתח': 'petah', 'תקווה': 'tikva', 'הרצל': 'herzl', 'גד': 'gad', 'מכנס': 'machnes',
  'הרי': 'harei', 'גרינטל': 'grintal', 'נט': 'net', 'מנשרוב': 'menashrov', 'פרויקט': 'project', 'יהלום': 'yahalom',
  'מלון': 'hotel', 'שדרות': 'sderot', 'ירושלים': 'yerushalayim', 'סמילנסקי': 'smilansky', 'בן': 'ben', 'יהודה': 'yehuda',
  'אוסישקין': 'ussishkin', 'דנקנר': 'dankner', 'פרויקטים': 'projects', 'נוספים': 'more', 'מגדל': 'migdal', 'מגדלים': 'migdalim',
  'ומגורים': 'umegurim', 'מגורים': 'megurim', 'מסחר': 'mischar', 'משרדים': 'misradim',
};
const LETTERS: Record<string, string> = {
  'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'ch',
  'ל': 'l', 'מ': 'm', 'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'f', 'צ': 'tz', 'ץ': 'tz', 'ק': 'k',
  'ר': 'r', 'ש': 'sh', 'ת': 't',
};

/** Hebrew title → readable ascii URL slug */
export function slugify(title: string): string {
  return title
    .replace(/[–—_]/g, ' ')
    .split(/[\s\-]+/)
    .filter(Boolean)
    .map((w) => WORDS[w] ?? [...w].map((ch) => LETTERS[ch] ?? ch).join(''))
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

const placeholderTitle = (c: Category) => `פרויקטים נוספים – ${CATEGORIES.find((x) => x.key === c)!.label}`;

/** Pure: groups manifest rows into projects and merges hand-written details. */
export function groupProjects(manifest: ManifestEntry[], details: Record<string, ProjectDetails>): { projects: RawProject[]; dropped: string[] } {
  const dropped: string[] = [];
  const groups = new Map<string, { title: string; placeholder: boolean; images: string[]; first: { category: Category; urbanRenewal: boolean } }>();

  for (const e of manifest) {
    const page = PAGE_TO_CATEGORY[e.category];
    if (!page) { dropped.push(e.file); continue; }
    if (e.use === 'skip') continue;
    const placeholder = !e.project.trim();
    const key = placeholder ? `__more:${page.category}` : e.project.trim();
    if (!groups.has(key)) groups.set(key, { title: placeholder ? placeholderTitle(page.category) : key, placeholder, images: [], first: page });
    groups.get(key)!.images.push(e.file);
  }

  const used = new Set<string>();
  const projects: RawProject[] = [];
  for (const g of groups.values()) {
    if (!g.images.length) continue;
    const d = g.placeholder ? {} : details[g.title] ?? {};
    const category = d.category ?? g.first.category;
    let slug = g.placeholder ? 'more' : slugify(g.title);
    if (used.has(`${category}/${slug}`)) { let n = 2; while (used.has(`${category}/${slug}-${n}`)) n++; slug = `${slug}-${n}`; }
    used.add(`${category}/${slug}`);
    projects.push({
      slug, title: g.title, category,
      urbanRenewal: d.urbanRenewal ?? g.first.urbanRenewal,
      city: d.city, year: d.year, status: d.status, size: d.size, client: d.client, description: d.description,
      cover: d.cover && g.images.includes(d.cover) ? d.cover : g.images[0],
      images: g.images,
      featured: d.featured ?? false,
      placeholder: g.placeholder,
      order: d.order ?? (g.placeholder ? 999 : 100),
    });
  }
  return { projects, dropped };
}
