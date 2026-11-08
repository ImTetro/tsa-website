import type { ImageMetadata } from 'astro';
import manifest from '../../assets/images.json';
import details from '../data/projects.json';
import team from '../data/team.json';
import clients from '../data/clients.json';
import { groupProjects, type ManifestEntry, type ProjectDetails, type RawProject } from './group';
import { CATEGORIES, type Category } from './categories';

export { CATEGORIES, categoryByKey, type Category, type CategoryInfo } from './categories';
export { slugify, groupProjects } from './group';

const photos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/**/*.{jpg,jpeg,png,JPG,PNG,webp}', { eager: true });

/** "src/assets/photos/x/y.jpg" → imported image */
export function photo(path: string): ImageMetadata {
  const key = '/' + path.replace(/^\/+/, '');
  const mod = photos[key];
  if (!mod) throw new Error(`Missing image: ${path}`);
  return mod.default;
}

export interface Project extends Omit<RawProject, 'cover' | 'images'> {
  cover: ImageMetadata;
  images: ImageMetadata[];
  categoryLabel: string;
  url: string;
}

let cache: Project[] | null = null;

export function getProjects(): Project[] {
  if (cache) return cache;
  const { projects, dropped } = groupProjects(manifest as ManifestEntry[], details as Record<string, ProjectDetails>);
  // team/clients/home/brand images live in the manifest too; anything else that was dropped is probably a typo
  const odd = dropped.filter((f) => !/\/(team|clients|home|projects|brand)\//.test(f));
  if (odd.length) console.warn(`[content] ${odd.length} image(s) in assets/images.json have an unknown category and are not shown: ${odd.join(', ')}`);
  cache = projects
    .map((p) => ({
      ...p,
      cover: photo(p.cover),
      images: p.images.map(photo),
      categoryLabel: CATEGORIES.find((c) => c.key === p.category)!.label,
      url: `/projects/${p.category}/${p.slug}`,
    }))
    .sort((a, b) => a.order - b.order || Number(b.featured) - Number(a.featured) || b.images.length - a.images.length);
  return cache;
}

export const getProject = (category: string, slug: string) => getProjects().find((p) => p.category === category && p.slug === slug);
export const projectsIn = (category: Category) => getProjects().filter((p) => p.category === category);
export const featuredProjects = () => getProjects().filter((p) => p.featured);
export const urbanRenewalProjects = () => getProjects().filter((p) => p.urbanRenewal);
/** number of images (not projects) per category, used for the "N images" badges */
export const imageCount = (category: Category) => projectsIn(category).reduce((n, p) => n + p.images.length, 0);

export interface Person { name: string; role: string; photo: ImageMetadata | null; bio?: string[] }
export function getTeam() {
  const map = (m: { name: string; role: string; photo: string | null; bio?: string[] }): Person => ({ ...m, photo: m.photo ? photo(m.photo) : null });
  return { partners: team.partners.map(map), staff: team.staff.map(map), closing: team.closing };
}

export interface Client { name: string; logo: ImageMetadata }
export const getClients = (): Client[] => clients.map((c) => ({ name: c.name, logo: photo(c.logo) }));
