import { describe, it, test, expect } from 'vitest';
import { groupProjects, slugify, type ManifestEntry } from '../src/lib/group';

const img = (file: string, category: string, project = '', use = ''): ManifestEntry =>
  ({ file, original_name: file.split('/').pop()!, wix_id: 'x', source_page: '', category, project, use, kb: 1 });

describe('groupProjects', () => {
  it('puts images with empty project into the category placeholder', () => {
    const { projects } = groupProjects([img('a.jpg', 'villas'), img('b.jpg', 'villas')], {});
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe('פרויקטים נוספים – וילות');
    expect(projects[0].placeholder).toBe(true);
    expect(projects[0].images).toEqual(['a.jpg', 'b.jpg']);
  });

  it('ignores entries with use:"skip"', () => {
    const { projects } = groupProjects([img('a.jpg', 'villas', 'וילה'), img('b.jpg', 'villas', 'וילה', 'skip')], {});
    expect(projects[0].images).toEqual(['a.jpg']);
  });

  it('merges details by project name and keeps image order', () => {
    const { projects } = groupProjects(
      [img('2.jpg', 'commercial', 'לגונה'), img('1.jpg', 'towers', 'לגונה')],
      { 'לגונה': { category: 'commercial', city: 'נתניה', description: 'תיאור' } },
    );
    expect(projects[0]).toMatchObject({ title: 'לגונה', category: 'commercial', city: 'נתניה', description: 'תיאור', placeholder: false });
    expect(projects[0].images).toEqual(['2.jpg', '1.jpg']);
    expect(projects[0].cover).toBe('2.jpg');
  });

  it('maps urban-renewal page images to towers with urbanRenewal:true', () => {
    const { projects } = groupProjects([img('u.jpg', 'urban-renewal', 'דנקנר 9')], {});
    expect(projects[0]).toMatchObject({ category: 'towers', urbanRenewal: true });
  });

  it('does not throw on unknown category; drops and reports such entries', () => {
    const { projects, dropped } = groupProjects([img('t.jpg', 'team'), img('v.jpg', 'villas', 'וילה')], {});
    expect(projects.map((p) => p.title)).toEqual(['וילה']);
    expect(dropped).toEqual(['t.jpg']);
  });

  it('does not emit a project whose images are all skipped', () => {
    const { projects } = groupProjects([img('a.jpg', 'villas', 'וילה', 'skip')], {});
    expect(projects).toHaveLength(0);
  });

  it('uses the cover named in details when present', () => {
    const { projects } = groupProjects([img('a.jpg', 'villas', 'וילה'), img('b.jpg', 'villas', 'וילה')], { 'וילה': { cover: 'b.jpg' } });
    expect(projects[0].cover).toBe('b.jpg');
  });

  it('gives slugs that are unique within a category', () => {
    const { projects } = groupProjects([img('a.jpg', 'villas', 'וילה א'), img('b.jpg', 'villas', 'וילה-א')], {});
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(2);
    expect(slugs[1]).toBe(slugs[0] + '-2');
  });
});

describe('slugify', () => {
  it('transliterates Hebrew to ascii', () => {
    expect(slugify('בית כנסת עיר ימים')).toBe('beit-kneset-ir-yamim');
  });
  it('keeps latin and digits', () => {
    expect(slugify('מרינה 408')).toBe('marina-408');
  });
});

describe('hand-edited data does not crash the build', () => {
  const row = (o: Partial<ManifestEntry>): ManifestEntry => ({ file: 'f.jpg', original_name: 'f', wix_id: 'x', source_page: '', category: 'villas', project: '', use: '', kb: 1, ...o });
  test('missing or null project goes to the placeholder', () => {
    const { projects } = groupProjects([row({ project: undefined as any }), row({ file: 'g.jpg', project: null as any })], {});
    expect(projects).toHaveLength(1);
    expect(projects[0].placeholder).toBe(true);
  });
  test('unknown category in details falls back to the image folder category', () => {
    const { projects } = groupProjects([row({ project: 'X' })], { X: { category: 'vilas' as any } });
    expect(projects[0].category).toBe('villas');
  });
});
