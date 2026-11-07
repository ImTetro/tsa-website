# TSA Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete tsa.co.il replacement. It is a Hebrew, right-to-left Astro site. Every page in the old hierarchy is real and working, and the animation follows the approved prototype.

**Architecture:**
- Astro produces a static build.
- **Content** lives in JSON data files:
  - `assets/images.json` assigns each image to a project.
  - `src/data/*.json` holds the written details.
  - `src/lib/content.ts` joins them at build time.
- **Shared layout:**
  - `src/layouts/Base.astro` carries the header, footer, mobile bar and page transition.
  - Page sections are Astro components.
  - Animation is plain GSAP modules in `src/scripts/`, loaded per page.
  - Content is visible without JS. Animations only run when `html.js` is set and reduced motion is off.

**Tech Stack:** Astro 5, TypeScript, GSAP 3.12 (ScrollTrigger, Flip), Lenis, @fontsource (Frank Ruhl Libre, IBM Plex Sans Hebrew), Vitest for data logic, Playwright (`playwright-core` with the installed Edge) for whole-site checks.

**Spec:** `docs/superpowers/specs/2026-11-07-tsa-website-design.md`

**Visual reference:** `.superpowers/brainstorm/812-1794079204/content/site-v4.html`. Port its CSS and motion; do not reinvent them.

## Global Constraints

- `<html lang="he" dir="rtl">` on every page. Every layout must work right-to-left, including sliders, the horizontal scroll and the marquee.
- **Colour tokens:**
  - `--ink:#0F2C3F` `--line:#9CC3E6` `--sand:#CDB28A`
  - `--plaster:#F7F7F4` `--stone:#E9E7E1` `--concrete:#6E757B`
- **Fonts:**
  - Frank Ruhl Libre (300/400/700) for headings.
  - IBM Plex Sans Hebrew (300/400/600) for body text.
  - Both self-hosted.
- **Logo:**
  - `logo-light.png` over photos and dark backgrounds.
  - `logo-dark.png` on the solid light header.
  - Height: 66/48 px on desktop, 48/40 px on mobile.
- **Phones:** 09-8820022 and 09-8871126.
- **Address:** אוסישקין 40, נתניה.
- **Footer:** `© {current year} טטרו שחר אדריכלים בע״מ`.
- **Not a landing page:**
  - All navigation goes to real routes, with no `#anchor` menu links.
  - Every home section ends with a link to its full page (spec §6).
  - The header, the mobile menu and the footer all list every page, including `/team`.
- **Motion:**
  - Every animation has a `prefers-reduced-motion` fallback (show the end state).
  - No content is hidden unless JS has added the `js` class.
- **Readability:**
  - Every text-over-photo element uses a scrim or a plate (spec §8).
  - Contrast meets AA.
- **Images:**
  - Served only through Astro `<Image>`/`<Picture>` (AVIF and WebP, responsive).
  - Never serve the originals.
- **Old URLs** 301-redirect as listed in spec §6.
- **Copy:**
  - Hebrew, taken from tsa.co.il where it exists (see `.superpowers/scrape/*.txt`).
  - Otherwise new, plain and professional.
  - No invented facts. A placeholder is a visible placeholder, never a guess.

## Review Focus

1. **JS fails or the CDN is blocked:** every heading, card and paragraph must still be visible. Test: in Task 9, load each page with JS disabled and assert the `h1` is visible and every `.card` has non-zero opacity.
2. **An image has an empty or unknown `project` or category:** the build must not crash. The image lands in the category's placeholder project. Test: in Task 2, unit tests on `groupProjects`.
3. **Old Hebrew Wix URLs, percent-encoded or not:** they redirect to the new pages. Test: in Task 8, assert the `_redirects` file contains both the encoded and the raw form of each old path.
4. **Form submission fails (offline, or the service returns 4xx/5xx):** the visitor sees a Hebrew error message and the data stays in the fields. Test: in Task 7, a Playwright route that fails the POST, then assert the error text appears and the inputs keep their values.
5. **Deep-linked filter `/projects?f=villas`, or a category URL, when JS has failed:** the right projects show. Test: in Task 4, category pages are rendered server-side with only that category's cards.

---

### Task 1: Scaffold, design tokens, base layout and site chrome

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/styles/global.css`, which holds the tokens and base styles plus the `.w` word-reveal and `.btn` styles from the prototype
- Create: `src/layouts/Base.astro`, with props `{ title: string; description: string; heroDark?: boolean }`
- Create: `src/components/Header.astro`, `MobileMenu.astro`, `Footer.astro`, `StickyContact.astro`, `Curtain.astro`
- Create: `src/scripts/core.ts`, which adds the `js` class, sets up Lenis and ScrollTrigger, and exports `reduced(): boolean`
- Create: `src/scripts/header.ts`. The header is `position:fixed` and **always visible**, with no hide on scroll. It goes solid after the hero, or immediately on pages without a dark hero. and `src/scripts/curtain.ts` (blueprint curtain on internal link clicks, using Astro `ClientRouter` view transitions)
- Create: `src/site.ts`, which exports `SITE = { phones, address, wazeUrl, mapsUrl, whatsapp: '' , email: '' }` and `NAV` (the menu tree from spec §6)
- Copy: `assets/images/logo-light.png` and `logo-dark.png` → `src/assets/brand/`

**Interfaces:**
- Produces:
  - The `Base` layout. Every page wraps its content in it.
  - `SITE` and `NAV` from `src/site.ts`.
  - `reduced()` and `onPage(fn: () => void)` (runs on load and after every view transition) from `src/scripts/core.ts`.

- [ ] Step 1: `git init`. Create the Astro project (minimal template, TypeScript strict). Install `gsap lenis @fontsource/frank-ruhl-libre @fontsource/ibm-plex-sans-hebrew`, plus dev dependencies `vitest playwright-core`.
- [ ] Step 2: Build `Base.astro`:
  - head meta, fonts, `<html lang="he" dir="rtl">`
  - Header, slot, Footer, StickyContact, Curtain
  - `heroDark` starts the header transparent over a hero. Otherwise the header starts solid.
- [ ] Step 3: Build the mobile menu: a full-screen ink overlay with links that stagger in, and the "פרויקטים" item expanding to show the categories. On desktop, "פרויקטים" opens a dropdown of the categories on hover and on focus.
- [ ] Step 3b: Footer: columns for Projects (all categories), the office pages (אודות, הצוות, לקוחות, התחדשות עירונית, צור קשר), and contact details. Add the accessibility link.
- [ ] Step 4: Make a temporary `src/pages/index.astro` using `Base`. Run `npm run build`. Expected: the build succeeds and `dist/index.html` contains `dir="rtl"`.
- [ ] Step 5: Commit: `feat: scaffold Astro site with RTL layout and chrome`.

### Task 2: Image pipeline and the content model

**Files:**
- Create: `scripts/prepare-images.py`
  - Downscales `assets/images/**` to at most 2560 px on the long edge (JPEG q85, PNG kept) into `src/assets/photos/<category>/`.
  - Moves the originals to `assets/originals/`, which is gitignored.
  - Rewrites the `file` paths in `assets/images.json` to `src/assets/photos/...`.
- Create: `scripts/seed-projects.py`
  - Fills empty `project` fields in `assets/images.json` from the filename rules below.
  - Never overwrites a field that already has a value.
- Create: `src/data/projects.json` (written details keyed by project name), `src/data/team.json`, `src/data/clients.json`
- Create: `src/lib/content.ts`
- Test: `tests/content.test.ts`

**Seeding rules.** The filename contains → project name, category:

| Filename contains | Project | Category |
|---|---|---|
| `lagoon` | לגונה | commercial |
| `marina-408`, `Untitled-4` in commercial | מרינה 408 | commercial |
| `טיטניום בוטיק` | טיטניום בוטיק | offices |
| `פריים סנטר` | פריים סנטר פתח תקווה | offices |
| `הרצל 17` | הרצל 17 | offices |
| `עיר ימים` | בית כנסת עיר ימים | synagogues |
| `בית כנסת נתניה` | בית כנסת נתניה | synagogues |
| `גד מכנס` | גד מכנס | towers, urbanRenewal |
| `הרי גרינטל` | הרי גרינטל 4 | towers |
| `segal` | וילת סגל | villas |
| `נט 600` | נט 600 | villas |
| `מנשרוב` | וילת מנשרוב | villas |
| `פרוייקט יהלום` | פרויקט יהלום | commercial |
| `מלון` | מלון | commercial |

- Each of the 7 urban-renewal images becomes its own project, "התחדשות עירונית N", with `urbanRenewal:true`.
- Everything else stays empty, so it lands in the category placeholder "פרויקטים נוספים – <category label>".
- When an image appears in several categories, the first category wins, and the duplicates are marked `"use":"skip"`.

**Interfaces:**
- Produces, from `src/lib/content.ts`:
  - `type Category = 'towers'|'commercial'|'offices'|'villas'|'synagogues'`
  - `CATEGORIES: { key: Category; label: string; slug: string; oldPath: string }[]`, with these labels:
    - towers = מגדלים ומגורים
    - commercial = מסחר
    - offices = משרדים
    - villas = וילות
    - synagogues = בתי כנסת
  - `type Project = { slug: string; title: string; category: Category; urbanRenewal: boolean; city?: string; year?: string; status?: string; size?: string; description?: string; cover: ImageMetadata; images: ImageMetadata[]; featured: boolean; placeholder: boolean }`
  - `groupProjects(manifest: ManifestEntry[], details: Record<string, Partial<Project>>): RawProject[]`. This is pure: it works on paths, not imports, so it can be tested.
  - `getProjects(): Promise<Project[]>`, which resolves paths with `import.meta.glob('/src/assets/photos/**/*', { eager: true })`.
  - `getProject(category, slug)`
  - `slugify(title: string): string`, which transliterates Hebrew to Latin ASCII and lowercases with hyphens, for example `לגונה` → `laguna`.
  - `getTeam()` and `getClients()`.

- [ ] Step 1: Run `python scripts/prepare-images.py`. Expected: 153 files under `src/assets/photos/`, `du -sh` under 120 MB, and every `file` in the JSON exists.
- [ ] Step 2: Run `python scripts/seed-projects.py`. Expected: the script prints how many images it assigned to each project and the number left empty.
- [ ] Step 3: Write the failing tests in `tests/content.test.ts`:
  - `groupProjects puts images with empty project into "פרויקטים נוספים – וילות" with placeholder:true`
  - `groupProjects ignores entries with use:"skip"`
  - `groupProjects merges details from projects.json by project name and keeps image order`
  - `groupProjects does not throw on unknown category; such entries are dropped and reported`
  - `slugify("בית כנסת עיר ימים") === "beit-kneset-ir-yamim"` and slugs are unique within a category (a `-2` suffix on collision)
  - `a project with zero non-skipped images is not emitted`
- [ ] Step 4: Run `npx vitest run`. Expected: FAIL (module missing).
- [ ] Step 5: Implement `content.ts`.
- [ ] Step 6: Fill in the data files:
  - **`team.json`** from `.superpowers/scrape/team.txt`. Entries are `{ name, role, bio?, photo? }`, with photos matched by Wix ID:
    | Person | Wix ID | Role |
    |---|---|---|
    | גבי טטרו | b86139b7 | אדריכל מייסד ושותף |
    | גדי שחר | 665bc3da | אדריכל, מנכ״ל ושותף |
    | בני פרדו | d61c3e09 | |
    | דיאגו סילבר | 66bf79e9 | |
    | מיכאל פיצ'חדזה | 224a8309 | |
    | אירינה קורצקי | 7c4110be | |
    | דניאל דבוש | 92196d68 | |
    | ולדימיר דוצנקו | 0b2f70ff | |
    | וסילי לוקטב | eac8f3b3 | |
    | מליסה ג׳ורנו | 8538f95f | |
    | גלית דיאמנט | 1fc8c997 | |
    | שלומי טפירו | df345f8e | |
    - Gabi and Gadi also carry their bios.
    - Roles for the rest come from the scrape text that follows each name. Michael's role is "תיאום תכנון ורישוי".
    - נטלי וייצמן, אפק טטרו and אלכסנדרה רוזנבוים get `photo: null` (shown as initials). The 3 unassigned photos are listed in `team.json` under `"unassignedPhotos"`.
  - **`clients.json`:** the 28 logos with their names from the old filenames.
- [ ] Step 7: Run `npx vitest run`. Expected: all tests PASS. `npm run build` succeeds.
- [ ] Step 8: Commit: `feat: image pipeline and content model`.

### Task 3: Home page

**Files:**
- Create: `src/components/home/HeroBuild.astro` (+ `src/scripts/hero.ts`), `Statement.astro`, `FeaturedGrid.astro`, `CategoryScroller.astro`, `SketchCompare.astro`, `ClientMarquee.astro`, `ContactBlock.astro`
- Create: `src/components/ProjectCard.astro`, with props `{ project: Project; wide?: boolean }`
- Create: `src/scripts/reveals.ts`, which handles `.split` headings, `.card` rise and parallax, the colour blend between sections marked `data-blend-from`/`data-blend-to`, and facts counters
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getProjects`, `getClients`, `CATEGORIES`, `Base`
- Produces:
  - `ProjectCard`, which links to `/projects/<category>/<slug>`
  - `ContactBlock`, with props `{ project?: string; variant?: 'general'|'residents' }`
  - `SketchCompare`, with props `{ sketch: ImageMetadata; render: ImageMetadata }`
  - `ClientMarquee`
  - `reveals.ts` auto-initialises on any page

- [ ] Step 1: Port the hero from the prototype.
  - The tower comes from `src/assets/photos/towers/05.jpg` through `getImage()`. Preload it.
  - Slides are the covers of projects marked `featured`, with their real names as captions.
  - The intro plays only when `sessionStorage['tsa-intro']` is unset, then sets it. Otherwise (and with reduced motion) the hero renders its end state.
- [ ] Step 2: Port the other sections in this order:
  1. Statement: copy adapted from the About text, with the facts 1978 / 25 / the client count from `clients.json`.
  2. Featured grid: up to 9 projects, one row per category, with filter chips. Flip is used here.
  3. Category scroller: counts come from the data.
  4. Sketch compare: `ur-render` and `ur-sketch`, moved to `src/assets/photos/urban-renewal/`.
  5. Client marquee.
  6. Contact block.
  - Include the stone-to-ink colour blend between the grid and the categories.
- [ ] Step 3: Run `npm run dev`. Screenshot with `node .superpowers/tools/shoot.js http://localhost:4321/ .superpowers/shots/home 1440 900` and at `390 844`. Expected: the shots match the prototype frames and the script prints `errors: none`.
- [ ] Step 4: Commit: `feat: home page`.

### Task 4: Projects index and category pages

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[category]/index.astro`
- Create: `src/components/ProjectsBrowser.astro`, with props `{ projects: Project[]; active: Category|'all' }`, and `src/scripts/browser.ts`

**Interfaces:**
- Consumes: `ProjectCard`, `getProjects`, `CATEGORIES`

- [ ] Step 1: Build the page header (title, short Hebrew intro per category), the filter chips and a grid/list toggle.
  - List view is a table of title, category, city and year, with a hover image preview on desktop.
  - The category page renders only its own projects on the server. Its chips link to the other category URLs.
  - On `/projects`, filtering is done client-side with Flip, updates `?f=`, and reads `?f=` on load.
  - Placeholder projects sort last.
- [ ] Step 2: Add `getStaticPaths` for the 5 categories.
- [ ] Step 3: Run `npm run build`. Expected: `dist/projects/villas/index.html` contains only `data-c="villas"` cards. Check with `grep -c 'data-c="towers"' dist/projects/villas/index.html` → `0`.
- [ ] Step 4: Commit: `feat: projects index and category pages`.

### Task 5: Project page and gallery

**Files:**
- Create: `src/pages/projects/[category]/[slug].astro`
- Create: `src/components/Gallery.astro` and `src/scripts/lightbox.ts`

**Interfaces:**
- Consumes: `getProject`, `ProjectCard`, `ContactBlock` (with `project` set to the title)

- [ ] Step 1: Build the page in this order:
  1. Hero image with a scrim, the title and the category.
  2. Facts box. Each row renders only when it has a value.
  3. Description. If it's empty, show nothing; never invent text.
  4. Gallery grid.
  5. Next and previous project within the category.
  6. Three related projects.
  7. Inquiry form.
- [ ] Step 2: Build the lightbox:
  - A full-screen dialog (`<dialog>`) with an "N / total" counter.
  - Arrow keys work in RTL: ← is next. Esc closes it.
  - Swipe works.
  - Focus is trapped while it's open and returned to the clicked thumbnail on close.
- [ ] Step 3: Run `npm run build`. Expected: one page per project. Run `ls dist/projects/*/* -d | wc -l` and check it equals the number of projects that `getProjects()` reports, logged during the build.
- [ ] Step 4: Commit: `feat: project pages with lightbox gallery`.

### Task 6: About, Team, Clients and Urban Renewal pages

**Files:**
- Create: `src/pages/about.astro`, `team.astro`, `clients.astro`, `urban-renewal.astro`
- Create: `src/components/PageHero.astro`, with props `{ title: string; kicker?: string; image?: ImageMetadata }`. It renders a dark hero with a scrim, or a blueprint background when there is no image.
- Create: `src/components/Accordion.astro` (built on native `<details>`)

**Interfaces:**
- Consumes: `getTeam`, `getClients`, `getProjects`, `SketchCompare`, `ClientMarquee`, `ContactBlock`

- [ ] Step 1: **About.** Use the full text from `.superpowers/scrape/about.txt`, split into sections:
  1. History (1978 and Gabi Tetro).
  2. Partnership (2010 and Gadi Shachar).
  3. What we design: a list of project types.
  4. Departments: planning, תב״ע (local plans), licensing, renderings. Animate them as four blocks.
  5. Values: the quote "האומנות היא לא סטנדרטית היא רב גונית" ("art is not standard, it is many-coloured").
  6. Facts.
  7. CTA to Team and Contact.
  - Fix the spelling errors in the source: "מיקומו", "ליווי", "פונקציונלי".
- [ ] Step 2: **Team.**
  - The two partners, side by side, with bio and portrait.
  - A staff grid: portraits turn from grey to colour on hover, and names and roles stagger in.
  - Entries without a photo show initials on a stone background.
  - Closing line from the old page.
- [ ] Step 3: **Clients.**
  - A grid of all logos on white tiles, grey to colour on hover, staggered reveal.
  - The marquee on top.
  - A line about being "אדריכלי הבית" (the firm's "house architects") for leading developers, taken from the About text.
- [ ] Step 4: **Urban renewal.**
  - "מה זה פינוי ובינוי?": the old text, edited.
  - `SketchCompare`.
  - A 4-step timeline that draws a line as you scroll.
  - FAQ, 5 items:
    - Who initiates the project?
    - How long does it take?
    - What does a tenant receive?
    - What is the architect's role?
    - What does a residents' committee need to do?
    - The answers are general and factual, with no promises of specific figures.
  - Grid of `urbanRenewal` projects.
  - `ContactBlock variant="residents"`.
- [ ] Step 5: Screenshot each page at both sizes with `shoot.js` (pass `--sections none` to shoot only the top, and full-page). Expected: `errors: none`, and text over photos is readable.
- [ ] Step 6: Commit: `feat: about, team, clients, urban renewal pages`.

### Task 7: Contact page and form handling

**Files:**
- Create: `src/pages/contact.astro`
- Modify: `src/components/home/ContactBlock.astro`, extracting its form into `src/components/ContactForm.astro`
- Create: `src/scripts/form.ts`

**Interfaces:**
- `ContactForm` props: `{ variant: 'general'|'residents'; project?: string }`
- The form posts to `https://api.web3forms.com/submit` with `access_key` taken from `import.meta.env.PUBLIC_WEB3FORMS_KEY`. If the key is empty, the form shows a visible notice: "טופס בהגדרה – התקשרו 09-8820022" ("Form being set up – call 09-8820022").

- [ ] Step 1: Build the fields.
  - **General:** name (required), phone (required, Israeli format), email (optional), project type, message, and a hidden `project`.
  - **Residents:** committee contact name, phone, building address, number of apartments, message.
  - **Both:** a honeypot `botcheck` field.
- [ ] Step 2: Write the failing Playwright test `tests/e2e/form.spec.ts`:
  - `shows Hebrew validation for missing phone`
  - `on POST failure shows "השליחה נכשלה" and keeps field values` ("Sending failed"), using `page.route` to return 500
  - `on success shows "תודה! נחזור אליכם בהקדם" and resets` ("Thanks! We'll get back to you soon")
- [ ] Step 3: Run the tests. Expected: FAIL.
- [ ] Step 4: Implement `form.ts`: fetch with JSON, disable the button with "שולח…" ("Sending…") while sending, and an `aria-live` status region.
- [ ] Step 5: Build the contact page:
  - The form.
  - Phones as `tel:` links and the WhatsApp button (hidden while `SITE.whatsapp` is empty).
  - Address, with Waze and Google Maps links.
  - A map: a static image placeholder that loads the Google Maps iframe only on click.
  - Office hours are left out, because they are unknown.
- [ ] Step 6: Run the tests. Expected: PASS.
- [ ] Step 7: Commit: `feat: contact page and forms`.

### Task 8: Redirects, SEO, 404 and accessibility statement

**Files:**
- Create: `public/_redirects` (Netlify format), `src/pages/404.astro`, `src/pages/accessibility.astro`, `public/robots.txt`
- Modify: `astro.config.mjs` to set `site: 'https://www.tsa.co.il'` and add `@astrojs/sitemap`
- Modify: `Base.astro` to add the canonical URL, Open Graph tags, and JSON-LD `ArchitecturalFirm` (name, address, phones, `foundingDate` 1978)
- Test: `tests/redirects.test.ts`

- [ ] Step 1: Write the failing test. For each old path in spec §6, `_redirects` has a line for the raw Hebrew path and a line for the `encodeURI` form, both `301` to the new path. Also `/home` → `/`.
- [ ] Step 2: Run `npx vitest run tests/redirects.test.ts`. Expected: FAIL.
- [ ] Step 3: Write `_redirects` and generate it from a single array in `src/site.ts` (`OLD_URLS`) using `scripts/gen-redirects.mjs`, run as a `prebuild` step.
- [ ] Step 4: Build the 404 page: blueprint background, "הדף לא נמצא" ("Page not found"), links to Home and Projects.
- [ ] Step 5: Write the accessibility statement in the IS 5568 format: the standard, what is accessible, known limitations, and the accessibility coordinator's contact (the office phone). Link it in the footer.
- [ ] Step 6: Run the tests. Expected: PASS. `npm run build` produces `dist/sitemap-index.xml`.
- [ ] Step 7: Commit: `feat: redirects, SEO, 404, accessibility statement`.

### Task 9: Whole-site verification

**Files:**
- Create: `tests/e2e/site.spec.ts` and `scripts/check-site.mjs` (crawls `dist` through `astro preview`)

- [ ] Step 1: Write the tests:
  - `every internal link returns 200`: crawl from `/` and visit every `<a href>` on the same origin.
  - `every NAV page is reachable from the header on every page`, with no `href` starting with `#` in the header nav.
  - `header stays visible`: after scrolling 3000px down on `/` and `/team`, the header's bounding top is 0 and it is visible.
  - `no page has console errors` at 1440×900 and 390×844.
  - `with JS disabled every page shows its h1 and all .card elements have opacity 1` (Review Focus 1).
  - `reduced motion: home hero shows final state immediately` (the `#h1` is visible within 500 ms).
  - `no horizontal overflow at 390px`: `scrollWidth <= innerWidth` on every page.
  - `every <img> has alt (empty allowed for decorative)`.
- [ ] Step 2: Run `npm run build && npm run preview` in the background, then run the tests. Expected: all PASS. Fix and re-run until they do.
- [ ] Step 3: Take screenshots of every page at both sizes into `.superpowers/shots/final/` and review them by eye for readability and layout.
- [ ] Step 4: Commit: `test: whole-site verification`.
