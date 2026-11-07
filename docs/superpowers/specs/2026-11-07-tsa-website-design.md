# TSA website redesign: design

**Client:** Tetro Shachar Architects Ltd. (טטרו שחר אדריכלים בע״מ), Netanya. Founded 1978, about 25 staff.
**Current site:** tsa.co.il, built on Wix in about 2021.
**Date:** 2026-11-07
**Status:** draft for approval

## 1. Intent

Replace the old Wix site with a modern, animated, fast site that works on desktop and mobile.

The site has two jobs, in this order:
1. **Let visitors browse the firm's work.** This covers residential towers and urban renewal, commercial, offices, villas and synagogues.
2. **Make it easy to contact the firm,** by form, phone or WhatsApp.

The owner wants it to feel "cool": rich motion and a memorable first impression. The look builds on direction A from the visual exploration (coast and sandstone, a full-bleed photo slider), with a construction animation as the intro.

## 2. Goals, non-goals, anti-goals

**Goals**
- Keep the information hierarchy of tsa.co.il: Home, About, Urban Renewal, Clients, Team, Projects (with categories), Contact.
- Add a full **portfolio page** with filters, as well as **individual project pages**, which the old site never had.
- Use animation throughout the site, not only in the hero (see §7).
- White text must stay readable over any photo (see §8).
- Make contacting the firm one tap away on mobile.
- Keep it fast. Lighthouse should score at least 90 for performance on mobile, and the image originals (513 MB) must never be served as they are.

**Non-goals (for launch)**
- A content-management admin panel. Decap CMS can be added later on top of the same data files.
- An English version. The site is Hebrew-only and right-to-left.
- A blog or news section.

**Anti-goals (it would count as a failure even if it technically works)**
- Animation that blocks content, such as a long intro without a skip button, or scroll-jacking that fights the user.
- Text that is unreadable on bright renders.
- A slow mobile experience.
- Losing the firm's Google ranking because old URLs break.

## 3. Constraints

- Hebrew, right-to-left throughout, including sliders, the horizontal scroll and filters.
- Accessibility in line with the Israeli standard IS 5568 (WCAG 2.0 AA):
  - Keyboard focus is visible.
  - Contrast meets AA.
  - The site respects the "reduced motion" setting: the intro jumps to its end state and continuous motion stops.
  - The site needs an accessibility statement page (הצהרת נגישות).
- Assets come from the old site, **154 images** in `assets/images/<category>/`. They are listed in `assets/images.json`, where each image has empty `project` and `use` fields that the owner will fill in later.
- Until the owner fills those fields in, the site places images by category, in random order.
- No admin panel. Content is edited in data files by the owner or by Claude.

## 4. Approaches considered

| Approach | Trade-off | Decision |
|---|---|---|
| **1. Static site (Astro) with content in data files** | The fastest, free hosting, full control over the animation. No admin screen. | **Chosen by the owner** |
| 2. The same site plus an admin panel (Decap CMS) | Staff could edit content in a browser, but it adds about a day of setup and a GitHub account. | Deferred. It can be added later on the same files. |
| 3. WordPress with a theme | Familiar, but slower, needs paid hosting and plugin upkeep, and custom animation would mean fighting the theme. | Rejected |

## 5. Decided "how"

- **Framework:** Astro, the latest stable version, with static output.
- **Images:** Astro's built-in image pipeline produces responsive AVIF and WebP files from the originals in `assets/images/`.
- **Animation:** GSAP with ScrollTrigger and Flip. All three are free.
- **Smooth scrolling:** Lenis, applied lightly and kept in sync with ScrollTrigger.
- **Fonts:** Frank Ruhl Libre for headings and IBM Plex Sans Hebrew for body text, self-hosted.
- **Palette:**

  | Name | Hex | Use |
  |---|---|---|
  | ink | `#0F2C3F` | primary colour, dark sections |
  | line | `#9CC3E6` | blueprint lines |
  | sand | `#CDB28A` | accent, CTAs |
  | plaster | `#F7F7F4` | light background |
  | stone | `#E9E7E1` | alternate section background |
  | concrete | `#6E757B` | — |
- **Logo:**
  - `logo-light.png` (the original, with white lettering) over photos and dark backgrounds.
  - `logo-dark.png` (the same logo with "טטרו שחר" recoloured to ink) on the light menu bar after scrolling.
  - Both are derived from the Wix logo. If the owner supplies a vector file it replaces them.
- **Hosting:** Netlify or Cloudflare Pages, free tier. The domain tsa.co.il moves its DNS away from Wix at launch.
- **Contact form:** a form service that emails the submission to the firm, either Web3Forms or Netlify Forms, chosen to match the host. It needs spam protection: a honeypot field, plus the service's own filtering.
- **The reference prototype** is `.superpowers/brainstorm/812-1794079204/content/site-v3.html`. The build should match its look and motion.

## 6. Sitemap and pages

The hierarchy is kept from tsa.co.il, and the URLs are cleaned up. Old Wix URLs get **301 redirects**.

| Page | New URL | Old URL (redirect from) |
|---|---|---|
| דף הבית (Home) | `/` | `/` |
| אודות (About) | `/about` | `/about` |
| הצוות (Team) | `/team` | `/meet-the-team` |
| התחדשות עירונית (Urban renewal) | `/urban-renewal` | `/copy-of-התחדשות-עירונית` |
| בין לקוחותינו (Our clients) | `/clients` | `/clients` |
| פרויקטים (all projects: portfolio index) | `/projects` | `/projects` |
| ↳ מגדלים ומגורים (Towers and residential) | `/projects/towers` | `/מגדלים` |
| ↳ מסחר (Commercial) | `/projects/commercial` | `/מסחר` |
| ↳ משרדים (Offices) | `/projects/offices` | `/משרדים` |
| ↳ וילות (Villas) | `/projects/villas` | `/וילות` |
| ↳ בתי כנסת (Synagogues) | `/projects/synagogues` | `/copy-of-משרדים` |
| ↳ project page | `/projects/<category>/<slug>` | — |
| צור קשר (Contact) | `/contact` | `/contact` |
| הצהרת נגישות (Accessibility statement) | `/accessibility` | — |
| 404 | — | — |

**Main menu:** פרויקטים (Projects, a dropdown of the categories), התחדשות עירונית (Urban renewal), אודות (About), הצוות (Team), לקוחות (Clients), צור קשר (Contact).

**Not a landing page (owner requirement):**
- Every menu item links to its own real page with its own URL. No menu link is an in-page `#anchor`.
- The home page is only an overview. Each home section ends with a link to the full page:
  - featured projects → `/projects`
  - categories → `/projects/<category>`
  - sketch-to-render → `/urban-renewal`
  - statement → `/about`
  - clients → `/clients`
  - contact block → `/contact`
  - a team teaser → `/team`
- The Team page (`/team`) is built from the content of tsa.co.il/meet-the-team, adapted to the new design. It is linked from the main menu, the mobile menu, the footer, the About page and the home page.

### Page anatomy

**Home.** Matches the prototype, from top to bottom:
1. **Construction-intro hero:**
   - Blueprint lines draw the wavy tower, a crane rises, and the floors count up.
   - The real rendering is then revealed bottom-up behind a scan line.
   - A headline follows, then a slider that auto-advances through featured projects with progress bars.
   - Skip button.
   - The intro plays once per session. After that the page opens on its end state.
2. **Statement:** a paragraph whose words fill in as you scroll, then three counting facts.
3. **Selected projects:** a grid with filter chips that animate the rearranging. Each card links to its project page.
4. **Our planning fields (תחומי התכנון שלנו):** a pinned horizontal scroll on desktop and a swipe row on mobile. Each panel links to its category.
5. **From sketch to building (מהשרטוט לבניין):** urban renewal teaser. A drag slider compares a drawing with the rendering, followed by four steps and a CTA.
6. **Clients:** a two-row logo marquee.
7. **Contact:** the form and the contact details.

**Projects index and category pages.** The same page template:
- Headline, filter chips, and a toggle between grid and list view.
- A category URL opens with its filter pre-selected.
- Filtering uses a Flip animation and updates the URL.
- Cards reveal bottom-up with inner parallax, and show a "צפייה" (View) cursor on desktop.

**Project page.**
- A hero image with the title.
- A facts box: city, type, status, year, size. Each field is optional and hidden when empty.
- Short text.
- A full-screen gallery: swipeable, keyboard-navigable, with a counter.
- Next and previous project.
- An inquiry form that carries the project name.

**Urban renewal.**
- "What is pinui-binui" text, carried over from the old page and rewritten.
- The sketch-to-render slider.
- A step timeline that animates as you scroll.
- An FAQ accordion.
- Urban renewal projects.
- A "residents' committee: book a meeting" form.

**About.**
- History (Gabi Tetro founded the firm in 1978, and Gadi Shachar became a partner in 2010).
- Departments: planning, local plans (TBA), licensing, renderings.
- Facts.
- Links to Team and Clients.

**Team.**
- The two partners with bios and portraits.
- A grid of staff portraits that turn from grey to colour on hover.
- Source: the 16 people listed on the old Team page.

**Clients.** A grid of all client logos (grey to colour on hover) and the marquee.

**Contact.**
- Form fields: name, phone, project type, message.
- Phones 09-8820022 and 09-8871126.
- Address: Ussishkin 40, Netanya, with Waze and Google Maps links.
- A map embed loaded only on click, so it doesn't slow the page.

**On every page:**
- **Header:** **sticky, always visible on every page, never hides** (owner requirement). Transparent over a dark hero, solid after scrolling past it. The logo shrinks when the header turns solid.
- **Mobile menu:** full-screen, with staggered links.
- **Footer:** contact details, menu, accessibility statement link, and © with the current year.
- **Mobile sticky bar:** call and WhatsApp buttons.
- **Page transitions:** a blueprint curtain, done with Astro view transitions or an equivalent.

## 7. Animation inventory

| Where | Motion |
|---|---|
| Home hero | Construction intro, then a slider that wipes from right to left, with progress bars; parallax on scroll |
| Headings | Words rise in on entering the screen |
| Statement | Words darken one by one as you scroll |
| Facts | Count up; a line draws across above each one |
| Project cards | Reveal bottom-up; inner parallax; zoom on hover; "View" cursor |
| Filtering | Flip rearrange |
| Projects → Categories | No hard edge. Both backgrounds blend from stone to ink as you scroll; the heading fades from dark text to white; the grid above fades back; the panels rise in. Light-to-dark changes between other sections follow the same rule. |
| Category panels | Pinned horizontal scroll with inner parallax (desktop) |
| Sketch-to-render | Sweeps across once on its own, then the visitor drags |
| Clients | Two marquee rows in opposite directions, slowing on hover |
| Forms | Floating labels; underline draws in on focus; fields stagger in |
| Buttons | Fill on hover; follow the mouse slightly (desktop) |
| Header | Always sticky and visible; turns solid after the hero, and the logo shrinks |
| Page change | Blueprint curtain with the destination's title |
| Project gallery | Smooth swipe; image scales on open |

**Rules:**
- One orchestrated intro per session.
- Every animation has a reduced-motion fallback.
- No custom cursor replaces the real one. The "View" bubble is an addition only.
- No animation hides content from search engines. The content is in the HTML, and the animation only changes how it appears.

## 8. Readability over photos

- **Hero:** a scrim always sits between the photo and the text. It darkens the text side (the right side in RTL) and the bottom edge. On mobile it is a gradient from the bottom.
- Headline text gets a soft shadow.
- **Captions and badges** sit on a dark, translucent, blurred plate.
- **Cards** get a dark gradient in their bottom 55%, behind the title.
- **Menu over photos:** a soft dark gradient behind it. Once the menu turns solid, it switches to dark text on a light background.

## 9. Content and data

- **`src/data/projects.json`** is the single source for projects. Each entry has:
  - `slug`, `title`, `category` (`towers | commercial | offices | villas | synagogues`)
  - `urbanRenewal` (true or false)
  - `city`, `year`, `status`, `size`, `description`: all optional
  - `cover`
  - `images[]`: paths into `assets/images/`
  - `featured`, which puts the project on the home page
- **Seeding:**
  - Start from `assets/images.json`.
  - Group images into named projects where their filenames make this obvious: Lagoon, Marina 408, Titanium Boutique, Prime Center Petah Tikva, Herzl 17, the Ir Yamim and Netanya synagogues, Gad Machnes, Dankner 9, Har Grintal 4, Segal and Net 600.
  - Leftover images go into a placeholder project per category, in random order.
  - Images used on several category pages, such as Lagoon and Marina 408, are assigned to one project, which belongs to one primary category.
- **`src/data/team.json`** and **`src/data/clients.json`** are filled from the old site.
  - Team roles that the earlier scrape couldn't match to names are left for the owner to confirm.
- **Copy:** Hebrew copy is written fresh, in a plain professional tone. Text on the old site was minimal, so most of it is new.
- **Placeholders:** the facts, project names and counts in the prototype are placeholders. They are replaced by real data, or by values derived from it (for example, project counts per category).

### Calls made after the builder review
These are marked as Claude's calls, for the owner to check.

- **How images join projects:**
  - `assets/images.json` decides which images belong to which project, through its `project` field.
  - `src/data/projects.json` holds each project's written details, keyed by the same project name.
  - The site build joins the two files, so neither one overwrites the other.
  - An image with an empty `project` falls into its category's placeholder project.
  - A project named in `images.json` that has no entry in `projects.json` still gets a page, with its name and images only.
  - The first seeding run writes the obvious project names (listed under §9) into `images.json`. The owner can change them at any time.
- **Image originals:**
  - Before they go into the project, the originals are downscaled once to a maximum of 2560 px on the long edge, at good quality. This cuts the size from 513 MB to roughly 60 MB.
  - The untouched originals are kept outside the repository as a backup.
- **Lighthouse target:**
  - The ≥90 mobile score applies to inner pages and to repeat visits to the home page.
  - On a first visit with the intro playing, a lower LCP is accepted, but the hero image must start loading right away (preload) so the reveal never waits on the network.
- **Residents' meeting:** a plain request form (committee contact, address of the building, number of units, preferred times). There is no calendar booking.

## 10. Left to the builder

- Project structure, component breakdown and naming.
- Exactly how the form service and spam protection are wired up.
- How the "intro once per session" rule is implemented.
- The quality bar for the image pipeline: sizes and formats.
- SEO: page titles and descriptions, Open Graph images, `sitemap.xml`, `robots.txt`, and structured data (a schema.org `LocalBusiness` / `ArchitecturalFirm` entry).

## 11. Open items for the owner (they don't block the build)

- The email address that receives form submissions.
- The WhatsApp number.
- Which project the intro should "build" (the default is the wavy tower).
- Confirmation of team roles.
- Real project names and details in `images.json`.
- A vector logo file, if one exists.
- Access to the domain's DNS at launch.
