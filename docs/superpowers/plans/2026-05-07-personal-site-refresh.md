# Personal Site Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `slesaad.github.io` as an Astro static site with a sketchbook-editorial aesthetic, dual audience/reading toggles, theme toggle, chapter-based long-scroll layout, and an inline `/resume` route.

**Architecture:** Astro 4.x static site. Content in markdown collections; visual presentation via Astro components and vanilla CSS with CSS custom properties for theming. Three orthogonal toggles (audience, reading density, theme) controlled by a small vanilla-JS module that syncs `data-*` attributes on `<html>`, URL search params, and `localStorage`. Plain mode is pure CSS so toggling is instant.

**Tech Stack:** Astro 4, TypeScript, Vitest (for the toggle module), vanilla CSS, GitHub Actions, GitHub Pages.

---

## Pre-flight

This plan assumes:
- Working directory: `/Users/sadhikar/repo/slesaad/slesaad.github.io`
- The spec is at `docs/superpowers/specs/2026-05-07-personal-site-refresh-design.md`
- The current `index.html`, `css/`, `js/`, `stylesheets/`, `img/` are the legacy site to be replaced.
- `Resume.md`, `Resume.pdf`, `favicon.ico`, `claude.md` are kept untouched until Task 18.

---

## File Structure Overview

```
.
├── astro.config.mjs               (Task 1)
├── package.json                   (Task 1)
├── tsconfig.json                  (Task 1)
├── vitest.config.ts               (Task 10)
├── public/
│   ├── favicon.ico                (kept from current repo)
│   └── Resume.pdf                 (moved from root in Task 18)
├── src/
│   ├── content/
│   │   ├── config.ts              (Task 1)
│   │   └── chapters/              (Task 8 — 10 markdown files)
│   ├── data/
│   │   └── selected.ts            (Task 6)
│   ├── layouts/
│   │   └── BaseLayout.astro       (Task 2)
│   ├── components/
│   │   ├── SquiggleDivider.astro  (Task 3)
│   │   ├── Sketch.astro           (Task 3)
│   │   ├── Chapter.astro          (Task 4)
│   │   ├── Hero.astro             (Task 5)
│   │   ├── WorkList.astro         (Task 6)
│   │   ├── Footer.astro           (Task 7)
│   │   └── Toggles.astro          (Task 12)
│   ├── pages/
│   │   ├── index.astro            (Task 9, then revised in Task 13)
│   │   └── resume.astro           (Task 15)
│   ├── scripts/
│   │   └── toggleState.ts         (Task 10)
│   ├── styles/
│   │   ├── global.css             (Task 2)
│   │   ├── theme.css              (Task 2)
│   │   ├── plain.css              (Task 14)
│   │   └── print.css              (Task 15)
│   └── assets/
│       └── sketches/              (Task 3 — 5 placeholder SVGs)
├── tests/
│   └── toggleState.test.ts        (Task 10)
└── .github/workflows/
    └── deploy.yml                 (Task 19)
```

---

## Task 1: Bootstrap Astro project

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/content/config.ts`
- Create: `.gitignore` updates

- [ ] **Step 1: Initialize package.json**

Create `package.json`:

```json
{
  "name": "slesaad-personal-site",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "astro": "^4.16.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 3: Create astro.config.mjs**

Create `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://slesaad.github.io',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
});
```

- [ ] **Step 4: Create tsconfig.json**

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src/**/*", "tests/**/*", "vitest.config.ts"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 5: Create content collection schema**

Create `src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const chapters = defineCollection({
  type: 'content',
  schema: z.object({
    mode: z.enum(['work', 'offclock']),
    num: z.number().int().min(0).max(99),
    slug: z.string(),
    title: z.string(),
    lede: z.string().optional(),
  }),
});

export const collections = { chapters };
```

- [ ] **Step 6: Update .gitignore**

Replace contents of `.gitignore`:

```
# Build
dist/
.astro/

# Node
node_modules/
.npm

# Editor / OS
.DS_Store
.vscode/
*.log

# Brainstorming workspace
.superpowers/
```

- [ ] **Step 7: Verify Astro skeleton boots**

Run:
```bash
npm run build
```

Expected: Astro reports `0 page(s) built` (no pages yet) and no errors. The `dist/` directory may or may not be created — that's fine.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/content/config.ts .gitignore
git commit -m "feat: bootstrap Astro project with content collection schema"
```

---

## Task 2: Base layout, theme variables, and global styles

**Files:**
- Create: `src/styles/theme.css`
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write theme.css with light/dark CSS variables**

Create `src/styles/theme.css`:

```css
:root,
[data-theme="light"] {
  --paper: #fbf8f1;
  --paper-offclock: #f3f0e3;
  --ink: #1a1a1a;
  --ink-soft: #4a4a4a;
  --mono: #6a5a3a;
  --accent: #c23616;
  --rule: #d8cda8;
  --control-bg: #ffffff;
  --control-border: #d8cda8;
}

[data-theme="dark"] {
  --paper: #1a1814;
  --paper-offclock: #1a1c16;
  --ink: #e6dfc8;
  --ink-soft: #b8b09c;
  --mono: #a89878;
  --accent: #e84118;
  --rule: #3a342a;
  --control-bg: #2a2620;
  --control-border: #3a342a;
}

[data-mode="offclock"] {
  --paper-current: var(--paper-offclock);
}
[data-mode="work"],
:root {
  --paper-current: var(--paper);
}
```

- [ ] **Step 2: Write global.css with reset, typography, and font imports**

Create `src/styles/global.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300..900;1,8..60,300..900&family=IBM+Plex+Mono:wght@400;500&family=Caveat:wght@400;600&display=swap');
@import './theme.css';

*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
}

html {
  background: var(--paper-current, var(--paper));
  color: var(--ink);
  transition: background 250ms ease;
  font-family: 'Source Serif 4', Georgia, serif;
  font-size: 18px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: text-decoration-thickness 150ms ease;
}

a:hover {
  text-decoration-thickness: 2px;
}

h1, h2, h3, h4, h5 {
  font-weight: 500;
  line-height: 1.15;
  margin: 0;
}

p {
  margin: 0 0 1em;
}

.mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--mono);
}

.handwritten {
  font-family: 'Caveat', cursive;
  color: var(--accent);
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0ms !important;
    animation-duration: 0ms !important;
  }
}
```

- [ ] **Step 3: Create BaseLayout.astro with theme bootstrap script**

Create `src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
}

const {
  title = 'Slesa Adhikari',
  description = 'Computer scientist building earth-observation platforms. Founder, Saano Labs.',
} = Astro.props;
---

<!doctype html>
<html lang="en-US" data-theme="light" data-mode="work" data-reading="designed">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" href="/favicon.ico" />
    <title>{title}</title>
    <script is:inline>
      // Theme bootstrap: prevent flash by setting data-theme before paint.
      // Read localStorage first, then prefers-color-scheme, then default to light.
      (function () {
        try {
          var saved = localStorage.getItem('theme');
          var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          var theme = saved || (prefersDark ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', theme);
        } catch (e) { /* localStorage may be unavailable; default to light */ }
      })();
    </script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 4: Verify build still passes**

Run:
```bash
npm run build
```

Expected: Build succeeds with no errors. Still 0 pages built (no pages yet).

- [ ] **Step 5: Commit**

```bash
git add src/styles/ src/layouts/
git commit -m "feat: add base layout with theme variables and global styles"
```

---

## Task 3: SquiggleDivider and Sketch components + placeholder SVGs

**Files:**
- Create: `src/components/SquiggleDivider.astro`
- Create: `src/components/Sketch.astro`
- Create: `src/assets/sketches/signature.svg`
- Create: `src/assets/sketches/satellite.svg`
- Create: `src/assets/sketches/plant.svg`
- Create: `src/assets/sketches/tools.svg`
- Create: `src/assets/sketches/workspace.svg`

- [ ] **Step 1: Create placeholder signature.svg**

Create `src/assets/sketches/signature.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none">
  <path d="M10 50 Q22 18 38 38 T70 32" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
  <circle cx="44" cy="56" r="4" fill="currentColor" opacity="0.4" />
  <path d="M52 50 L62 70" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
</svg>
```

- [ ] **Step 2: Create placeholder satellite.svg**

Create `src/assets/sketches/satellite.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <rect x="80" y="80" width="40" height="40" stroke="currentColor" stroke-width="2.2" />
  <rect x="40" y="90" width="35" height="20" stroke="currentColor" stroke-width="1.8" />
  <rect x="125" y="90" width="35" height="20" stroke="currentColor" stroke-width="1.8" />
  <line x1="100" y1="120" x2="100" y2="150" stroke="currentColor" stroke-width="1.8" />
  <circle cx="100" cy="100" r="6" fill="currentColor" opacity="0.4" />
  <path d="M30 30 Q60 10 90 30" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5" stroke-dasharray="2,3" />
</svg>
```

- [ ] **Step 3: Create placeholder plant.svg**

Create `src/assets/sketches/plant.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <path d="M100 180 Q100 130 100 90" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
  <path d="M100 130 Q70 110 50 80" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  <path d="M100 110 Q130 90 155 75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  <ellipse cx="55" cy="75" rx="14" ry="22" stroke="currentColor" stroke-width="1.8" transform="rotate(-25 55 75)" />
  <ellipse cx="155" cy="70" rx="14" ry="22" stroke="currentColor" stroke-width="1.8" transform="rotate(30 155 70)" />
  <ellipse cx="100" cy="50" rx="14" ry="26" stroke="currentColor" stroke-width="2" />
  <rect x="80" y="180" width="40" height="14" stroke="currentColor" stroke-width="1.8" rx="2" />
</svg>
```

- [ ] **Step 4: Create placeholder tools.svg (wide divider motif)**

Create `src/assets/sketches/tools.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80" fill="none">
  <path d="M2 40 Q30 20 60 40 T120 40 T180 40 T240 40 T298 40" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
  <circle cx="150" cy="40" r="6" fill="currentColor" opacity="0.5" />
  <path d="M120 25 L130 55" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
  <path d="M170 25 L180 55" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
</svg>
```

- [ ] **Step 5: Create placeholder workspace.svg**

Create `src/assets/sketches/workspace.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" fill="none">
  <rect x="40" y="100" width="170" height="100" stroke="currentColor" stroke-width="2" rx="3" />
  <line x1="40" y1="180" x2="210" y2="180" stroke="currentColor" stroke-width="1.6" />
  <line x1="125" y1="200" x2="125" y2="220" stroke="currentColor" stroke-width="1.6" />
  <rect x="80" y="220" width="90" height="6" stroke="currentColor" stroke-width="1.6" rx="2" />
  <path d="M55 95 Q75 80 100 90" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.6" />
  <circle cx="170" cy="135" r="4" fill="currentColor" opacity="0.5" />
</svg>
```

- [ ] **Step 6: Create SquiggleDivider component**

Create `src/components/SquiggleDivider.astro`:

```astro
---
// Decorative SVG between chapters. Hidden in plain mode via CSS.
---

<svg
  class="squiggle-divider designed-only"
  viewBox="0 0 300 16"
  preserveAspectRatio="none"
  aria-hidden="true"
  focusable="false"
>
  <path
    d="M2 8 Q30 1 60 8 T120 8 T180 8 T240 8 T298 8"
    stroke="currentColor"
    stroke-width="1.2"
    fill="none"
    stroke-linecap="round"
    opacity="0.7"
  />
</svg>

<style>
  .squiggle-divider {
    display: block;
    width: 100%;
    max-width: 480px;
    height: 16px;
    margin: 32px auto;
    color: var(--accent);
  }
</style>
```

- [ ] **Step 7: Create Sketch component**

Create `src/components/Sketch.astro`:

```astro
---
type Placement = 'inline' | 'corner-top-right' | 'side-right' | 'side-left';

interface Props {
  svg: string;          // raw SVG string (use `?raw` import in caller)
  alt: string;
  placement?: Placement;
  size?: number;        // px
}

const { svg, alt, placement = 'inline', size = 200 } = Astro.props;
---

<figure
  class={`sketch designed-only sketch--${placement}`}
  style={`--sketch-size: ${size}px;`}
  aria-label={alt}
  role="img"
>
  <Fragment set:html={svg} />
</figure>

<style>
  .sketch {
    margin: 0;
    color: var(--accent);
    width: var(--sketch-size);
    height: var(--sketch-size);
  }
  .sketch :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }
  .sketch--inline {
    margin: 16px auto;
  }
  .sketch--corner-top-right {
    position: absolute;
    top: 28px;
    right: 28px;
  }
  .sketch--side-right {
    float: right;
    margin: 0 0 16px 24px;
  }
  .sketch--side-left {
    float: left;
    margin: 0 24px 16px 0;
  }

  @media (max-width: 720px) {
    .sketch--side-right, .sketch--side-left {
      float: none;
      margin: 16px auto;
      width: 140px;
      height: 140px;
    }
  }
</style>
```

> The SVG sources use `stroke="currentColor"` so they pick up the figure's `color` (which is `var(--accent)`). Inlining via `set:html` means the SVG inherits `currentColor`, so theme switches recolor strokes automatically. Callers import the SVG with `?raw`:
>
> ```typescript
> import signatureSvg from '../assets/sketches/signature.svg?raw';
> ```

- [ ] **Step 8: Verify build still passes**

Run:
```bash
npm run build
```

Expected: Build succeeds. No pages built yet.

- [ ] **Step 9: Commit**

```bash
git add src/components/SquiggleDivider.astro src/components/Sketch.astro src/assets/
git commit -m "feat: add squiggle divider, sketch component, and placeholder sketch SVGs"
```

---

## Task 4: Chapter component

**Files:**
- Create: `src/components/Chapter.astro`

- [ ] **Step 1: Write Chapter.astro**

Create `src/components/Chapter.astro`:

```astro
---
interface Props {
  num: number | string;
  slug: string;
  title: string;
  label?: string; // e.g. "what i do" — appears above title; defaults to slug humanized
  lede?: string;
  mode?: 'work' | 'offclock' | 'both'; // controls which audience sees this chapter
}

const { num, slug, title, label, lede, mode = 'both' } = Astro.props;

const num2 = typeof num === 'number' ? String(num).padStart(2, '0') : num;
const displayLabel = label ?? slug.replace(/-/g, ' ');
---

<section
  class="chapter"
  data-chapter-mode={mode}
  data-slug={slug}
  id={`ch-${slug}`}
>
  <div class="chapter-head">
    <div class="mono chapter-num">CH. {num2} · {displayLabel}</div>
    <h2 class="chapter-title">{title}</h2>
    {lede && <p class="chapter-lede">{lede}</p>}
  </div>
  <div class="chapter-body">
    <slot />
  </div>
</section>

<style>
  .chapter {
    padding: 32px 0;
    position: relative;
  }
  .chapter-head {
    margin-bottom: 16px;
  }
  .chapter-num {
    color: var(--accent);
    margin-bottom: 6px;
  }
  .chapter-title {
    font-size: 1.6rem;
    font-style: italic;
    margin: 0 0 8px;
  }
  .chapter-lede {
    color: var(--ink-soft);
    font-size: 1rem;
  }

  /* Audience mode visibility: a chapter with mode="work" only shows when html[data-mode=work] */
  :global(html[data-mode="offclock"]) .chapter[data-chapter-mode="work"] { display: none; }
  :global(html[data-mode="work"]) .chapter[data-chapter-mode="offclock"] { display: none; }
</style>
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Chapter.astro
git commit -m "feat: add Chapter component with mode-aware visibility"
```

---

## Task 5: Hero component (Chapter 00)

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Write Hero.astro**

Create `src/components/Hero.astro`:

```astro
---
import Sketch from './Sketch.astro';
import signatureSvg from '../assets/sketches/signature.svg?raw';
---

<header class="hero">
  <div class="hero-meta mono">slesa adhikari · portfolio · 2026</div>

  <Sketch svg={signatureSvg} alt="signature mark" placement="corner-top-right" size={68} />

  <!-- Work intro -->
  <div class="hero-content" data-chapter-mode="work">
    <h1 class="hero-name">
      Slesa <span class="handwritten">Adhikari</span>
    </h1>
    <p class="hero-tag">
      Computer scientist building <em>earth-observation platforms</em>.
      NASA Comet Award. Founder, Saano Labs.
    </p>
  </div>

  <!-- Off-clock intro -->
  <div class="hero-content" data-chapter-mode="offclock">
    <h1 class="hero-name">
      Slesa <span class="handwritten">after hours</span>
    </h1>
    <p class="hero-tag">
      Comics, clay, native-plant gardens, interior projects.
      The visual side of the same brain.
    </p>
  </div>
</header>

<style>
  .hero {
    position: relative;
    padding: 56px 0 24px;
  }
  .hero-meta {
    margin-bottom: 12px;
  }
  .hero-name {
    font-size: 2.6rem;
    font-weight: 500;
    margin: 0 0 12px;
    line-height: 1.05;
  }
  .hero-name .handwritten {
    font-style: normal; /* override em behavior */
  }
  .hero-tag {
    font-size: 1.1rem;
    color: var(--ink-soft);
    max-width: 540px;
  }
  .hero-tag em {
    font-style: italic;
    color: var(--ink);
  }

  /* Audience-mode visibility for hero variants */
  :global(html[data-mode="offclock"]) .hero-content[data-chapter-mode="work"] { display: none; }
  :global(html[data-mode="work"]) .hero-content[data-chapter-mode="offclock"] { display: none; }

  /* Plain-mode swaps handwritten for italic serif */
  :global(html[data-reading="plain"]) .handwritten {
    font-family: 'Source Serif 4', Georgia, serif;
    font-style: italic;
    color: var(--ink);
  }

  @media (max-width: 720px) {
    .hero-name { font-size: 2rem; }
    .hero-tag { font-size: 1rem; }
  }
</style>
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: add Hero component with mode-aware variants"
```

---

## Task 6: WorkList component and selected items data

**Files:**
- Create: `src/data/selected.ts`
- Create: `src/components/WorkList.astro`

- [ ] **Step 1: Create selected.ts data file**

Create `src/data/selected.ts`:

```typescript
export type SelectedItem = {
  title: string;
  year: string;       // e.g. "2023→" or "2024"
  blurb: string;      // 1–2 sentences
  role?: string;      // e.g. "led design + impl"
  stack?: string[];   // e.g. ["React", "Deck.gl"]
  image?: string;     // optional path under /src/assets/projects/
  link?: string;
};

export const selectedWork: SelectedItem[] = [
  {
    title: 'U.S. Greenhouse Gas Center',
    year: '2023→',
    blurb: 'Public NASA platform for cataloging and visualizing U.S. greenhouse gas datasets across satellite, airborne, and in-situ sources.',
    role: 'Lead engineer · UI + data pipelines',
    stack: ['React', 'Deck.gl', 'STAC', 'AWS', 'CDK'],
    link: 'https://earth.gov/ghgcenter',
  },
  {
    title: 'VEDA · NASA EarthData',
    year: '2022→',
    blurb: 'Open-source visualization, exploration, and data analysis platform for NASA earth science.',
    role: 'Platform engineer',
    stack: ['React', 'Mapbox GL', 'TiTiler', 'COG'],
    link: 'https://www.earthdata.nasa.gov/dashboard',
  },
  {
    title: 'MAAP biomass platform',
    year: '2021→',
    blurb: 'Multi-mission Algorithm and Analysis Platform — interactive 3D visualization of global biomass datasets.',
    stack: ['Cesium', 'Python', 'FastAPI'],
    link: 'https://maap-project.org',
  },
  {
    title: 'Saano Labs',
    year: '2025→',
    blurb: 'Founded to build earth-science data systems — cataloging, ingestion, and analytics on large-scale geospatial datasets.',
    role: 'Founder · CEO',
  },
];

export const selectedMakes: SelectedItem[] = [
  {
    title: "'Small Things' — comic series",
    year: '2024',
    blurb: 'Pen-and-watercolor short-form comics about everyday observations.',
    link: 'https://www.instagram.com/saanostory/',
  },
  {
    title: 'Hand-built clay vessels',
    year: '2023→',
    blurb: 'Slab and coil-built ceramics. Cone 6 stoneware, mostly utilitarian.',
  },
  {
    title: 'Native-plant patch · zone 7b',
    year: '2022→',
    blurb: 'Slowly converting a Huntsville lawn into a southeast US native-plant garden. Emphasis on pollinator support.',
  },
  {
    title: 'Interior projects',
    year: '2020→',
    blurb: 'Spatial planning, DIY builds, lighting design across apartments and a home.',
  },
];
```

- [ ] **Step 2: Create WorkList component**

Create `src/components/WorkList.astro`:

```astro
---
import type { SelectedItem } from '../data/selected.ts';

interface Props {
  items: SelectedItem[];
}

const { items } = Astro.props;
---

<ol class="worklist">
  {items.map((item) => (
    <li class="work-item">
      <div class="work-header">
        <h3 class="work-title">
          {item.link ? <a href={item.link} target="_blank" rel="noopener">{item.title}</a> : item.title}
        </h3>
        <span class="mono work-year">{item.year}</span>
      </div>
      <p class="work-blurb">{item.blurb}</p>
      {item.role && <p class="mono work-role">{item.role}</p>}
      {item.stack && (
        <ul class="work-stack mono designed-only">
          {item.stack.map((s) => <li>{s}</li>)}
        </ul>
      )}
    </li>
  ))}
</ol>

<style>
  .worklist {
    list-style: none;
    padding: 0;
    margin: 16px 0 0;
  }
  .work-item {
    padding: 14px 0;
    border-bottom: 1px dashed var(--rule);
  }
  .work-item:last-child {
    border-bottom: 0;
  }
  .work-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
  }
  .work-title {
    font-size: 1.1rem;
    margin: 0;
    font-weight: 500;
  }
  .work-title a {
    text-decoration-color: var(--accent);
  }
  .work-year {
    color: var(--mono);
    white-space: nowrap;
  }
  .work-blurb {
    color: var(--ink-soft);
    font-size: 0.95rem;
    margin: 6px 0 4px;
  }
  .work-role {
    margin: 0;
    color: var(--accent);
  }
  .work-stack {
    list-style: none;
    padding: 0;
    margin: 6px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    color: var(--mono);
    font-size: 0.65rem;
  }
  .work-stack li::before { content: '· '; }
  .work-stack li:first-child::before { content: ''; }

  :global(html[data-reading="plain"]) .work-stack { display: flex; }
</style>
```

- [ ] **Step 3: Verify build**

Run:
```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/data/ src/components/WorkList.astro
git commit -m "feat: add selected work/makes data and WorkList component"
```

---

## Task 7: Footer component

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Write Footer.astro**

Create `src/components/Footer.astro`:

```astro
---
const links = [
  { label: 'github', url: 'https://github.com/slesaad' },
  { label: 'linkedin', url: 'https://www.linkedin.com/in/slesaad/' },
  { label: 'email', url: 'mailto:slesaad@gmail.com' },
  { label: 'instagram', url: 'https://www.instagram.com/saanostory/' },
  { label: 'the squiggly lines blog →', url: 'https://squiggles.slesa.com.np' },
];
---

<footer class="site-footer">
  <ul class="footer-links">
    {links.map((l) => (
      <li><a href={l.url} target="_blank" rel="noopener">{l.label}</a></li>
    ))}
  </ul>
  <p class="mono footer-meta">© Slesa Adhikari · {new Date().getFullYear()} · Huntsville, AL</p>
</footer>

<style>
  .site-footer {
    border-top: 1px dashed var(--rule);
    padding: 32px 0 48px;
    margin-top: 48px;
  }
  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0 0 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
    font-size: 0.95rem;
  }
  .footer-meta {
    color: var(--mono);
    margin: 0;
  }
</style>
```

- [ ] **Step 2: Verify build**

Run:
```bash
npm run build
```

Expected: succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: add Footer with social links"
```

---

## Task 8: Chapter content (markdown files)

**Files:**
- Create: `src/content/chapters/work-01-what-i-do.md`
- Create: `src/content/chapters/work-03-principles.md`
- Create: `src/content/chapters/offclock-01-what-i-make.md`
- Create: `src/content/chapters/offclock-03-field-notes.md`

> Note: Chapters 00 (Hero) and 02 (Selected) and 04 (Elsewhere) don't need markdown — they render via dedicated components. Only Ch 01 and Ch 03 are pure prose, so only those become content files. This keeps the content collection minimal but real.

- [ ] **Step 1: Create work-01-what-i-do.md**

Create `src/content/chapters/work-01-what-i-do.md`:

```markdown
---
mode: work
num: 1
slug: what-i-do
title: Earth science, at scale.
lede: Cloud-native platforms for cataloging, ingesting, and visualizing huge geospatial datasets — for NASA, and now for Saano Labs.
---

I lead engineering for several public NASA-funded platforms — the U.S. Greenhouse Gas Center, VEDA, and MAAP — building the front-end visualization layer (React, Deck.gl, Mapbox, Cesium) and the AWS-based pipelines that make Earth observation data discoverable and analyzable.

The work spans system design, technical decision-making, mentoring, and partnering with NASA stakeholders on roadmap. Recognized by NASA Comet (2023) and Marshall Innovation Team Awards (2021).
```

- [ ] **Step 2: Create work-03-principles.md**

Create `src/content/chapters/work-03-principles.md`:

```markdown
---
mode: work
num: 3
slug: principles
title: How I think.
---

A few things I keep coming back to:

- **Prefer durable interfaces over clever ones.** Optimize for the engineer who'll inherit this in three years.
- **Visualizations are arguments.** Every viz makes a claim; design for the claim, then for the pixels.
- **Move from bespoke to platform deliberately.** Build a pattern twice before extracting it; build it three times before naming it.
- **Cross-team work is most of the work.** The hardest thing in geospatial isn't the tile server; it's getting science, infra, and design teams to converge.
```

- [ ] **Step 3: Create offclock-01-what-i-make.md**

Create `src/content/chapters/offclock-01-what-i-make.md`:

```markdown
---
mode: offclock
num: 1
slug: what-i-make
title: With my hands, with ink, with dirt.
lede: Comics, clay sculpture, sketches, native-plant gardens — the work that doesn't get billed.
---

I draw short-form comics in pen and watercolor under [@saanostory](https://www.instagram.com/saanostory/), build slab-and-coil ceramics on weekends, and slowly convert a Huntsville lawn into a southeast-US native plant garden.

The visual sense in the engineering work — how a map should breathe, how a chart's typography lands — comes from this side. They're the same brain.
```

- [ ] **Step 4: Create offclock-03-field-notes.md**

Create `src/content/chapters/offclock-03-field-notes.md`:

```markdown
---
mode: offclock
num: 3
slug: field-notes
title: Field notes & squigglies.
lede: Long-form documentation of the personal projects.
---

Ongoing on the [squiggly lines blog →](https://squiggles.slesa.com.np). It's a digital garden where I write up makes, sketches, plant notes, and the occasional tutorial.
```

- [ ] **Step 5: Verify content collection validates**

Run:
```bash
npm run build
```

Expected: Astro reports content collection is valid; no schema errors.

- [ ] **Step 6: Commit**

```bash
git add src/content/chapters/
git commit -m "feat: add chapter markdown content"
```

---

## Task 9: Home page (initial render — no toggles yet)

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Write index.astro**

Create `src/pages/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import Chapter from '../components/Chapter.astro';
import SquiggleDivider from '../components/SquiggleDivider.astro';
import Sketch from '../components/Sketch.astro';
import WorkList from '../components/WorkList.astro';
import Footer from '../components/Footer.astro';
import { selectedWork, selectedMakes } from '../data/selected.ts';

import satelliteSvg from '../assets/sketches/satellite.svg?raw';
import plantSvg from '../assets/sketches/plant.svg?raw';

const chapters = await getCollection('chapters');
const byKey = (mode: 'work' | 'offclock', slug: string) =>
  chapters.find((c) => c.data.mode === mode && c.data.slug === slug);

const workWhatIDo = byKey('work', 'what-i-do');
const workPrinciples = byKey('work', 'principles');
const offclockWhatIMake = byKey('offclock', 'what-i-make');
const offclockFieldNotes = byKey('offclock', 'field-notes');

if (!workWhatIDo || !workPrinciples || !offclockWhatIMake || !offclockFieldNotes) {
  throw new Error('Missing required chapter content. Check src/content/chapters/.');
}

const { Content: WorkWhatIDoBody } = await workWhatIDo.render();
const { Content: WorkPrinciplesBody } = await workPrinciples.render();
const { Content: OffclockWhatIMakeBody } = await offclockWhatIMake.render();
const { Content: OffclockFieldNotesBody } = await offclockFieldNotes.render();
---

<BaseLayout>
  <main class="container">
    <Hero />
    <SquiggleDivider />

    <!-- Chapter 01 — what i do / what i make -->
    <Chapter
      mode="work"
      num={1}
      slug="what-i-do"
      title={workWhatIDo.data.title}
      label="what i do"
      lede={workWhatIDo.data.lede}
    >
      <Sketch svg={satelliteSvg} alt="hand-drawn satellite" placement="side-right" size={180} />
      <WorkWhatIDoBody />
    </Chapter>

    <Chapter
      mode="offclock"
      num={1}
      slug="what-i-make"
      title={offclockWhatIMake.data.title}
      label="what i make"
      lede={offclockWhatIMake.data.lede}
    >
      <Sketch svg={plantSvg} alt="hand-drawn plant" placement="side-right" size={180} />
      <OffclockWhatIMakeBody />
    </Chapter>

    <SquiggleDivider />

    <!-- Chapter 02 — selected -->
    <Chapter mode="work" num={2} slug="selected" title="Three pieces I'm proud of." label="selected work">
      <WorkList items={selectedWork} />
    </Chapter>

    <Chapter mode="offclock" num={2} slug="selected" title="Things that came out of evenings." label="selected makes">
      <WorkList items={selectedMakes} />
    </Chapter>

    <SquiggleDivider />

    <!-- Chapter 03 -->
    <Chapter mode="work" num={3} slug="principles" title={workPrinciples.data.title} label="how i think">
      <WorkPrinciplesBody />
    </Chapter>

    <Chapter mode="offclock" num={3} slug="field-notes" title={offclockFieldNotes.data.title} label="field notes" lede={offclockFieldNotes.data.lede}>
      <OffclockFieldNotesBody />
    </Chapter>

    <SquiggleDivider />

    <!-- Chapter 04 — elsewhere -->
    <Chapter mode="both" num={4} slug="elsewhere" title="Find me on the rest of the internet." label="elsewhere">
      <ul class="elsewhere-list">
        <li><a href="/resume">resume</a> · also as a <a href="/Resume.pdf">PDF</a></li>
        <li><a href="https://github.com/slesaad" target="_blank" rel="noopener">github</a></li>
        <li><a href="https://www.linkedin.com/in/slesaad/" target="_blank" rel="noopener">linkedin</a></li>
        <li><a href="https://www.instagram.com/saanostory/" target="_blank" rel="noopener">instagram</a></li>
        <li><a href="https://squiggles.slesa.com.np" target="_blank" rel="noopener">the squiggly lines blog →</a></li>
      </ul>
    </Chapter>

    <Footer />
  </main>
</BaseLayout>

<style>
  main.container { padding-top: 24px; padding-bottom: 0; }
  .elsewhere-list { list-style: none; padding: 0; margin: 16px 0 0; font-size: 1.05rem; }
  .elsewhere-list li { padding: 4px 0; }
</style>
```

- [ ] **Step 2: Run dev server**

Run:
```bash
npm run dev
```

Expected: Astro reports server running on `http://localhost:4321`.

- [ ] **Step 3: Manually verify in browser**

Open `http://localhost:4321` and confirm:
- Hero with name + tagline shows
- Chapters 01–04 visible (only the work versions, since `data-mode="work"` is the default on `<html>`)
- Squiggle dividers between chapters
- Footer at bottom
- No console errors

Then change the html attr in DevTools: `document.documentElement.setAttribute('data-mode', 'offclock')` and confirm chapters swap to off-clock variants.

- [ ] **Step 4: Stop dev server (Ctrl+C) and commit**

```bash
git add src/pages/index.astro
git commit -m "feat: render home page with chapters, hero, sketches, and footer"
```

---

## Task 10: Toggle state module (TDD)

**Files:**
- Create: `src/scripts/toggleState.ts`
- Create: `tests/toggleState.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Write vitest.config.ts**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Install happy-dom for DOM-like tests**

Run:
```bash
npm install --save-dev happy-dom
```

Expected: package installs successfully.

- [ ] **Step 3: Write the failing test**

Create `tests/toggleState.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseInitialState,
  buildSearchString,
  type ToggleState,
} from '../src/scripts/toggleState';

describe('parseInitialState', () => {
  it('defaults to work + designed + light', () => {
    const state = parseInitialState({
      search: '',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state).toEqual({ mode: 'work', reading: 'designed', theme: 'light' });
  });

  it('reads ?mode=offclock from URL', () => {
    const state = parseInitialState({
      search: '?mode=offclock',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.mode).toBe('offclock');
  });

  it('reads ?reading=plain from URL', () => {
    const state = parseInitialState({
      search: '?reading=plain',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.reading).toBe('plain');
  });

  it('combines mode and reading params', () => {
    const state = parseInitialState({
      search: '?mode=offclock&reading=plain',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.mode).toBe('offclock');
    expect(state.reading).toBe('plain');
  });

  it('ignores invalid mode values', () => {
    const state = parseInitialState({
      search: '?mode=garbage',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.mode).toBe('work');
  });

  it('respects prefers-color-scheme when no saved theme', () => {
    const state = parseInitialState({ search: '', savedTheme: null, prefersDark: true });
    expect(state.theme).toBe('dark');
  });

  it('saved theme takes precedence over prefers-color-scheme', () => {
    const state = parseInitialState({ search: '', savedTheme: 'light', prefersDark: true });
    expect(state.theme).toBe('light');
  });

  it('rejects invalid saved theme values', () => {
    const state = parseInitialState({ search: '', savedTheme: 'neon', prefersDark: false });
    expect(state.theme).toBe('light');
  });
});

describe('buildSearchString', () => {
  it('returns empty string when state matches defaults', () => {
    const out = buildSearchString({ mode: 'work', reading: 'designed', theme: 'light' });
    expect(out).toBe('');
  });

  it('includes only non-default keys', () => {
    const out = buildSearchString({ mode: 'offclock', reading: 'designed', theme: 'light' });
    expect(out).toBe('?mode=offclock');
  });

  it('includes both mode and reading when both non-default', () => {
    const out = buildSearchString({ mode: 'offclock', reading: 'plain', theme: 'dark' });
    // theme is NOT in URL — only mode and reading
    expect(out).toContain('mode=offclock');
    expect(out).toContain('reading=plain');
    expect(out).not.toContain('theme');
  });
});
```

- [ ] **Step 4: Run tests (expect failure)**

Run:
```bash
npm test
```

Expected: All tests fail with `Cannot find module '../src/scripts/toggleState'`.

- [ ] **Step 5: Implement toggleState.ts**

Create `src/scripts/toggleState.ts`:

```typescript
export type Mode = 'work' | 'offclock';
export type Reading = 'designed' | 'plain';
export type Theme = 'light' | 'dark';

export interface ToggleState {
  mode: Mode;
  reading: Reading;
  theme: Theme;
}

interface InitialInputs {
  search: string;          // window.location.search
  savedTheme: string | null; // localStorage.getItem('theme')
  prefersDark: boolean;    // matchMedia result
}

const VALID_MODES: Mode[] = ['work', 'offclock'];
const VALID_READING: Reading[] = ['designed', 'plain'];
const VALID_THEMES: Theme[] = ['light', 'dark'];

function isValid<T extends string>(allowed: readonly T[], value: string | null): value is T {
  return value != null && (allowed as readonly string[]).includes(value);
}

export function parseInitialState(inputs: InitialInputs): ToggleState {
  const params = new URLSearchParams(inputs.search);
  const rawMode = params.get('mode');
  const rawReading = params.get('reading');

  const mode: Mode = isValid(VALID_MODES, rawMode) ? rawMode : 'work';
  const reading: Reading = isValid(VALID_READING, rawReading) ? rawReading : 'designed';

  let theme: Theme;
  if (isValid(VALID_THEMES, inputs.savedTheme)) {
    theme = inputs.savedTheme;
  } else {
    theme = inputs.prefersDark ? 'dark' : 'light';
  }

  return { mode, reading, theme };
}

export function buildSearchString(state: ToggleState): string {
  const params = new URLSearchParams();
  if (state.mode !== 'work') params.set('mode', state.mode);
  if (state.reading !== 'designed') params.set('reading', state.reading);
  const s = params.toString();
  return s ? `?${s}` : '';
}

/**
 * Apply state to <html> by setting data-* attributes.
 * Only writes — caller is responsible for reading current state.
 */
export function applyState(html: HTMLElement, state: ToggleState): void {
  html.setAttribute('data-mode', state.mode);
  html.setAttribute('data-reading', state.reading);
  html.setAttribute('data-theme', state.theme);
}
```

- [ ] **Step 6: Run tests (expect pass)**

Run:
```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/scripts/toggleState.ts tests/toggleState.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: add toggle state module with URL parsing and validation (TDD)"
```

---

## Task 11: Inline theme bootstrap (avoid flash on load)

> The theme bootstrap added to BaseLayout in Task 2 is naive — it doesn't read URL params for mode/reading and doesn't validate. Replace it with the real one now that `toggleState.ts` exists.

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Replace the inline bootstrap script**

Open `src/layouts/BaseLayout.astro`. Replace the existing `<script is:inline>...</script>` block with:

```astro
<script is:inline>
  // Pre-paint state bootstrap. Inlined (not imported) so it runs before first paint.
  // Mirrors logic in src/scripts/toggleState.ts — keep them in sync.
  (function () {
    try {
      var params = new URLSearchParams(window.location.search);
      var mode = params.get('mode');
      var reading = params.get('reading');
      if (mode !== 'work' && mode !== 'offclock') mode = 'work';
      if (reading !== 'designed' && reading !== 'plain') reading = 'designed';

      var saved = null;
      try { saved = localStorage.getItem('theme'); } catch (e) {}
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = (saved === 'light' || saved === 'dark') ? saved : (prefersDark ? 'dark' : 'light');

      var html = document.documentElement;
      html.setAttribute('data-mode', mode);
      html.setAttribute('data-reading', reading);
      html.setAttribute('data-theme', theme);
    } catch (e) { /* fail open with defaults already set on <html> */ }
  })();
</script>
```

- [ ] **Step 2: Verify dev server reflects URL params**

Run:
```bash
npm run dev
```

Open `http://localhost:4321/?mode=offclock` — confirm off-clock chapters render.
Open `http://localhost:4321/?reading=plain` — confirm `data-reading="plain"` is set on `<html>` (visible in DevTools; no visible CSS effect yet — that's Task 14).
Stop server (Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: inline pre-paint bootstrap reads URL params for mode/reading"
```

---

## Task 12: Toggles component

**Files:**
- Create: `src/components/Toggles.astro`

- [ ] **Step 1: Write Toggles.astro**

Create `src/components/Toggles.astro`:

```astro
<aside class="toggles" aria-label="Page settings">
  <div class="seg" role="group" aria-label="Audience">
    <button type="button" class="seg-btn" data-toggle="mode" data-value="work" aria-pressed="true">Work</button>
    <button type="button" class="seg-btn" data-toggle="mode" data-value="offclock" aria-pressed="false">Off-clock</button>
  </div>
  <button
    type="button"
    class="icon-btn"
    data-toggle="reading"
    aria-pressed="false"
    aria-label="Toggle plain reading mode"
    title="Plain reading mode"
  >
    <span class="aa-big">A</span><span class="aa-small">a</span>
  </button>
  <button
    type="button"
    class="icon-btn"
    data-toggle="theme"
    aria-pressed="false"
    aria-label="Toggle dark mode"
    title="Toggle dark mode"
  >
    <svg class="theme-icon-light" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" fill="currentColor" />
      <g stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
        <line x1="8" y1="1.5" x2="8" y2="3.2" />
        <line x1="8" y1="12.8" x2="8" y2="14.5" />
        <line x1="1.5" y1="8" x2="3.2" y2="8" />
        <line x1="12.8" y1="8" x2="14.5" y2="8" />
        <line x1="3.4" y1="3.4" x2="4.6" y2="4.6" />
        <line x1="11.4" y1="11.4" x2="12.6" y2="12.6" />
        <line x1="3.4" y1="12.6" x2="4.6" y2="11.4" />
        <line x1="11.4" y1="4.6" x2="12.6" y2="3.4" />
      </g>
    </svg>
    <svg class="theme-icon-dark" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M13 9.6 A6 6 0 1 1 6.4 3 A4.6 4.6 0 0 0 13 9.6 z" fill="currentColor" />
    </svg>
  </button>
</aside>

<script>
  import { parseInitialState, buildSearchString, applyState, type ToggleState } from '../scripts/toggleState';

  function init() {
    const html = document.documentElement;
    const root = document.querySelector<HTMLElement>('.toggles');
    if (!root) return;

    const state: ToggleState = parseInitialState({
      search: window.location.search,
      savedTheme: (() => { try { return localStorage.getItem('theme'); } catch { return null; } })(),
      prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    });
    applyState(html, state);
    syncButtonsToState();

    function syncButtonsToState() {
      // Audience pill
      root!.querySelectorAll<HTMLButtonElement>('[data-toggle="mode"]').forEach((btn) => {
        const active = btn.dataset.value === state.mode;
        btn.setAttribute('aria-pressed', String(active));
        btn.classList.toggle('active', active);
      });
      // Reading mode (Aa)
      const reading = root!.querySelector<HTMLButtonElement>('[data-toggle="reading"]');
      if (reading) {
        const active = state.reading === 'plain';
        reading.setAttribute('aria-pressed', String(active));
        reading.classList.toggle('active', active);
      }
      // Theme
      const theme = root!.querySelector<HTMLButtonElement>('[data-toggle="theme"]');
      if (theme) {
        const isDark = state.theme === 'dark';
        theme.setAttribute('aria-pressed', String(isDark));
        theme.classList.toggle('active', isDark);
      }
    }

    function syncUrl() {
      const newSearch = buildSearchString(state);
      const url = window.location.pathname + newSearch + window.location.hash;
      window.history.replaceState(null, '', url);
    }

    root.addEventListener('click', (e) => {
      const target = e.target instanceof HTMLElement ? e.target.closest<HTMLButtonElement>('button') : null;
      if (!target) return;
      const toggle = target.dataset.toggle;
      const value = target.dataset.value;

      if (toggle === 'mode' && value) {
        state.mode = value as ToggleState['mode'];
      } else if (toggle === 'reading') {
        state.reading = state.reading === 'plain' ? 'designed' : 'plain';
      } else if (toggle === 'theme') {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('theme', state.theme); } catch {}
      } else {
        return;
      }
      applyState(html, state);
      syncButtonsToState();
      syncUrl();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
</script>

<style>
  .toggles {
    position: fixed;
    top: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: var(--control-bg);
    border: 1px solid var(--control-border);
    border-radius: 999px;
    z-index: 100;
    backdrop-filter: blur(6px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  .seg {
    display: inline-flex;
    background: transparent;
    border-radius: 999px;
    padding: 0;
    gap: 0;
  }
  .seg-btn {
    border: 0;
    background: transparent;
    padding: 5px 12px;
    border-radius: 999px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;
  }
  .seg-btn.active {
    background: var(--ink);
    color: var(--paper);
  }
  .icon-btn {
    border: 0;
    background: transparent;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink-soft);
    padding: 0;
    transition: background 150ms ease, color 150ms ease;
  }
  .icon-btn:hover {
    background: rgba(0,0,0,0.05);
  }
  :global(html[data-theme="dark"]) .icon-btn:hover {
    background: rgba(255,255,255,0.05);
  }
  .icon-btn.active {
    background: var(--ink);
    color: var(--paper);
  }
  .icon-btn[data-toggle="reading"] {
    font-family: 'Source Serif 4', Georgia, serif;
    line-height: 1;
  }
  .aa-big { font-size: 15px; }
  .aa-small { font-size: 10px; margin-left: 1px; }

  .icon-btn[data-toggle="theme"] svg { width: 14px; height: 14px; }
  .theme-icon-dark { display: none; }
  :global(html[data-theme="dark"]) .theme-icon-light { display: none; }
  :global(html[data-theme="dark"]) .theme-icon-dark { display: block; }

  /* Mobile: collapse to icon button + popover handled in Task 16 */
  @media (max-width: 720px) {
    .toggles { top: 12px; right: 12px; }
  }
</style>
```

- [ ] **Step 2: Add Toggles to BaseLayout**

Open `src/layouts/BaseLayout.astro`. Add the import and component after the `<body>` tag opening.

Replace the `<body>` block with:

```astro
  <body>
    <Toggles />
    <slot />
  </body>
```

And add to the frontmatter (between `---` markers at the top):

```astro
import Toggles from '../components/Toggles.astro';
```

- [ ] **Step 3: Run dev server and manually verify**

Run:
```bash
npm run dev
```

Open `http://localhost:4321`. Verify:
- Three toggles visible in top-right
- Click `Off-clock` → chapters swap, URL becomes `/?mode=offclock`
- Click `Aa` → URL becomes `/?reading=plain` (no visible CSS effect yet — that's Task 14)
- Click theme icon → background flips light/dark, localStorage `theme` set

Stop server.

- [ ] **Step 4: Run tests to ensure nothing broke**

Run:
```bash
npm test
```

Expected: All toggleState tests still pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Toggles.astro src/layouts/BaseLayout.astro
git commit -m "feat: add Toggles component wired to URL/localStorage"
```

---

## Task 13: Verify content swap works for both modes (no code change — manual checkpoint)

> This task is a manual verification gate. Skip the commit.

- [ ] **Step 1: Run dev server**

Run:
```bash
npm run dev
```

- [ ] **Step 2: Walk through 4 states**

For each state, verify the content matches the spec:

1. `http://localhost:4321/` — Work + Designed
   - Hero says "Slesa Adhikari · Computer scientist building earth-observation platforms..."
   - Ch 01: "Earth science, at scale." with satellite sketch
   - Ch 02: 4 work items (GHG, VEDA, MAAP, Saano)
   - Ch 03: Principles list
   - Ch 04: Elsewhere

2. Click `Off-clock` → URL is `/?mode=offclock`
   - Hero says "Slesa after hours · Comics, clay..."
   - Ch 01: "With my hands, with ink, with dirt." with plant sketch
   - Ch 02: 4 makes (comics, clay, plants, interior)
   - Ch 03: Field notes
   - Ch 04: Elsewhere (same as Work)

3. Click `Aa` → URL has `reading=plain` but no visible change yet (Task 14)
4. Click theme → background flips, sketches and squiggles still visible

If anything is wrong, fix in this task before proceeding. Otherwise stop server.

---

## Task 14: Plain reading mode CSS

**Files:**
- Create: `src/styles/plain.css`
- Modify: `src/styles/global.css` (add import)

- [ ] **Step 1: Write plain.css**

Create `src/styles/plain.css`:

```css
/* Plain reading mode — flat typographic. Activated by html[data-reading="plain"]. */
html[data-reading="plain"] .designed-only {
  display: none !important;
}

html[data-reading="plain"] .handwritten {
  font-family: 'Source Serif 4', Georgia, serif;
  font-style: italic;
  color: var(--ink);
}

html[data-reading="plain"] .chapter {
  padding: 20px 0;
}

html[data-reading="plain"] .chapter-title {
  font-style: normal;
  font-size: 1.35rem;
}

html[data-reading="plain"] .chapter-num {
  color: var(--ink);
}

html[data-reading="plain"] .hero {
  padding: 32px 0 12px;
}

html[data-reading="plain"] .hero-name {
  font-size: 1.8rem;
}

/* Tighter dividers / borders */
html[data-reading="plain"] .work-item {
  padding: 8px 0;
}
```

- [ ] **Step 2: Import plain.css from global.css**

Open `src/styles/global.css`. Add this line after the `@import './theme.css';` line:

```css
@import './plain.css';
```

- [ ] **Step 3: Run dev server and verify**

Run:
```bash
npm run dev
```

Open `http://localhost:4321/?reading=plain`. Confirm:
- All squiggle dividers gone
- Sketches gone
- Stack tags gone
- Headlines no longer italic
- "Adhikari" in hero is now italic serif (not handwriting)
- Same content otherwise

Click `Aa` again → returns to designed mode, all decorative elements come back.

- [ ] **Step 4: Commit**

```bash
git add src/styles/plain.css src/styles/global.css
git commit -m "feat: add plain reading mode CSS"
```

---

## Task 15: Resume page from resume.md + print stylesheet

**Files:**
- Move: `Resume.md` → `src/content/resume.md` (or alternative — see Step 1)
- Create: `src/styles/print.css`
- Create: `src/pages/resume.astro`
- Move: `Resume.pdf` → `public/Resume.pdf`

- [ ] **Step 1: Move and reformat resume.md**

Move and rename `Resume.md` to `src/content/resume.md`:

```bash
mkdir -p src/content
git mv Resume.md src/content/resume.md
```

(If `Resume.md` is currently untracked, just `mv` it.)

This file remains the source of truth. We'll render it via Astro's `Markdown` import.

- [ ] **Step 2: Move Resume.pdf into public/**

Run:
```bash
mkdir -p public
git mv Resume.pdf public/Resume.pdf 2>/dev/null || mv Resume.pdf public/Resume.pdf
```

- [ ] **Step 3: Move favicon into public/**

Run:
```bash
git mv favicon.ico public/favicon.ico 2>/dev/null || mv favicon.ico public/favicon.ico
```

- [ ] **Step 4: Move me.jpeg into src/assets/**

Run:
```bash
mkdir -p src/assets
[ -f img/me.jpeg ] && (git mv img/me.jpeg src/assets/me.jpeg 2>/dev/null || mv img/me.jpeg src/assets/me.jpeg) || echo "me.jpeg not found, skip"
```

- [ ] **Step 5: Write print.css**

Create `src/styles/print.css`:

```css
/* Print stylesheet — optimized for /resume to print on a single US-Letter page. */
@media print {
  @page {
    size: letter;
    margin: 0.5in;
  }

  html, body {
    background: white !important;
    color: black !important;
    font-size: 10pt;
    line-height: 1.35;
  }

  .toggles, .site-footer, .resume-controls, .designed-only {
    display: none !important;
  }

  a {
    color: black !important;
    text-decoration: none !important;
  }

  a[href^="http"]::after,
  a[href^="mailto"]::after {
    content: " (" attr(href) ")";
    font-size: 8pt;
    color: #555;
  }

  h1, h2, h3 {
    page-break-after: avoid;
    break-after: avoid;
  }

  .resume-content {
    max-width: 100%;
    padding: 0;
    margin: 0;
  }

  .resume-content h1 {
    font-size: 18pt;
    margin-bottom: 4px;
  }

  .resume-content h2 {
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-bottom: 1px solid black;
    padding-bottom: 2px;
    margin: 14px 0 6px;
  }

  .resume-content h3 {
    font-size: 11pt;
    margin: 8px 0 2px;
  }

  .resume-content ul {
    padding-left: 18px;
    margin: 4px 0;
  }

  .resume-content li {
    margin-bottom: 2px;
  }
}
```

- [ ] **Step 6: Write resume.astro**

Create `src/pages/resume.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import resumeMarkdown from '../content/resume.md';

const { Content } = resumeMarkdown;
---

<BaseLayout title="Slesa Adhikari · Resume" description="Resume of Slesa Adhikari">
  <main class="container resume-page">
    <nav class="resume-controls" aria-label="Resume actions">
      <a href="/">← back</a>
      <a href="/Resume.pdf" download>download PDF</a>
      <button type="button" onclick="window.print()">print / save as PDF</button>
    </nav>

    <article class="resume-content">
      <Content />
    </article>
  </main>
</BaseLayout>

<style>
  .resume-page {
    padding-top: 56px;
    padding-bottom: 64px;
    max-width: 760px;
  }
  .resume-controls {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 24px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono);
  }
  .resume-controls button {
    border: 1px solid var(--rule);
    background: transparent;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font: inherit;
    color: inherit;
  }
  .resume-controls a, .resume-controls button {
    text-decoration: none;
  }
  .resume-content {
    line-height: 1.55;
  }
  .resume-content :global(h1) {
    font-size: 1.8rem;
    margin: 0 0 4px;
  }
  .resume-content :global(h2) {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--accent);
    border-bottom: 1px solid var(--rule);
    padding-bottom: 4px;
    margin: 28px 0 10px;
  }
  .resume-content :global(h3) {
    font-size: 1rem;
    margin: 12px 0 2px;
  }
  .resume-content :global(p) {
    margin: 4px 0 8px;
  }
  .resume-content :global(ul) {
    padding-left: 24px;
    margin: 4px 0 8px;
  }
  .resume-content :global(li) {
    margin-bottom: 3px;
  }
  .resume-content :global(strong) {
    color: var(--ink);
  }
  .resume-content :global(em) {
    color: var(--ink-soft);
  }
</style>
```

- [ ] **Step 7: Import print.css from global.css**

Open `src/styles/global.css`. Add this line after `@import './plain.css';`:

```css
@import './print.css';
```

- [ ] **Step 8: Run dev server and verify**

Run:
```bash
npm run dev
```

- Open `http://localhost:4321/resume`. Confirm the resume renders with name, sections, work history, education, skills.
- Click "print / save as PDF" → verify the print preview is a clean, single-page-targeted layout (controls hidden, single column, black text on white).
- Open `http://localhost:4321/Resume.pdf` → confirm the PDF still downloads.
- Stop server.

- [ ] **Step 9: Commit**

```bash
git add src/content/resume.md public/Resume.pdf public/favicon.ico src/assets/me.jpeg src/styles/print.css src/styles/global.css src/pages/resume.astro
git commit -m "feat: add /resume page rendered from resume.md with print stylesheet"
```

---

## Task 16: Mobile responsive — collapse toggles into popover

**Files:**
- Modify: `src/components/Toggles.astro`

- [ ] **Step 1: Update Toggles.astro markup to add a mobile trigger button**

Open `src/components/Toggles.astro`. Replace the `<aside class="toggles" ...>` block with:

```astro
<aside class="toggles" aria-label="Page settings" data-mobile-open="false">
  <button type="button" class="mobile-trigger" aria-label="Open page settings" aria-expanded="false">
    <svg viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
      <circle cx="3" cy="8" r="1.6" fill="currentColor"/>
      <circle cx="8" cy="8" r="1.6" fill="currentColor"/>
      <circle cx="13" cy="8" r="1.6" fill="currentColor"/>
    </svg>
  </button>
  <div class="toggle-row">
    <div class="seg" role="group" aria-label="Audience">
      <button type="button" class="seg-btn" data-toggle="mode" data-value="work" aria-pressed="true">Work</button>
      <button type="button" class="seg-btn" data-toggle="mode" data-value="offclock" aria-pressed="false">Off-clock</button>
    </div>
    <button
      type="button"
      class="icon-btn"
      data-toggle="reading"
      aria-pressed="false"
      aria-label="Toggle plain reading mode"
      title="Plain reading mode"
    >
      <span class="aa-big">A</span><span class="aa-small">a</span>
    </button>
    <button
      type="button"
      class="icon-btn"
      data-toggle="theme"
      aria-pressed="false"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <svg class="theme-icon-light" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="3.2" fill="currentColor" />
        <g stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
          <line x1="8" y1="1.5" x2="8" y2="3.2" />
          <line x1="8" y1="12.8" x2="8" y2="14.5" />
          <line x1="1.5" y1="8" x2="3.2" y2="8" />
          <line x1="12.8" y1="8" x2="14.5" y2="8" />
          <line x1="3.4" y1="3.4" x2="4.6" y2="4.6" />
          <line x1="11.4" y1="11.4" x2="12.6" y2="12.6" />
          <line x1="3.4" y1="12.6" x2="4.6" y2="11.4" />
          <line x1="11.4" y1="4.6" x2="12.6" y2="3.4" />
        </g>
      </svg>
      <svg class="theme-icon-dark" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M13 9.6 A6 6 0 1 1 6.4 3 A4.6 4.6 0 0 0 13 9.6 z" fill="currentColor" />
      </svg>
    </button>
  </div>
</aside>
```

- [ ] **Step 2: Add mobile-trigger handler at top of `init()` function**

In the `<script>` block of `Toggles.astro`, find the `init()` function. Inside it, after `if (!root) return;`, add:

```typescript
    const trigger = root.querySelector<HTMLButtonElement>('.mobile-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = root.getAttribute('data-mobile-open') === 'true';
        root.setAttribute('data-mobile-open', String(!open));
        trigger.setAttribute('aria-expanded', String(!open));
      });
      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!root.contains(e.target as Node)) {
          root.setAttribute('data-mobile-open', 'false');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }
```

- [ ] **Step 3: Update CSS for mobile collapse**

In the `<style>` block of `Toggles.astro`, replace the entire `@media (max-width: 720px)` block with:

```css
  .mobile-trigger {
    display: none;
    border: 0;
    background: transparent;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink-soft);
    padding: 0;
  }

  @media (max-width: 720px) {
    .toggles {
      top: 12px;
      right: 12px;
      padding: 4px;
      flex-direction: column;
      align-items: flex-end;
      gap: 0;
    }
    .toggle-row {
      display: none;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: var(--control-bg);
      border-radius: 12px;
      margin-top: 6px;
    }
    .toggles[data-mobile-open="true"] .toggle-row {
      display: flex;
    }
    .mobile-trigger {
      display: inline-flex;
    }
  }

  @media (min-width: 721px) {
    .toggle-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
```

- [ ] **Step 4: Run dev server**

Run:
```bash
npm run dev
```

Open `http://localhost:4321`. Resize browser to 600px wide:
- Toggle bar collapses to a single dots-icon button
- Click it → toggle row appears below
- Toggles work the same way as desktop
- Click outside → row closes

Resize back to desktop width — original layout returns.

Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/components/Toggles.astro
git commit -m "feat: collapse toggles into popover on mobile"
```

---

## Task 17: Accessibility pass — focus-visible styles

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Add focus-visible styles to global.css**

Open `src/styles/global.css`. Append:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

button:focus-visible {
  outline-offset: 3px;
}

a:focus-visible {
  outline-offset: 4px;
}
```

- [ ] **Step 2: Run dev server and verify keyboard navigation**

Run:
```bash
npm run dev
```

Verify:
- Tab through the page — focus rings visible on all interactive elements
- `Tab` to a toggle, `Enter` activates it; confirm `aria-pressed` updates in DevTools
- Confirm sketches recolor when switching theme (currentColor inheritance from Task 3)

Stop server.

- [ ] **Step 3: Run tests to ensure toggle module still passes**

Run:
```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add focus-visible outline styles for keyboard navigation"
```

---

## Task 18: Migration — remove legacy site files

**Files:**
- Remove: `index.html`
- Remove: `css/`
- Remove: `js/`
- Remove: `stylesheets/`
- Remove: `img/` (after confirming nothing referenced)

- [ ] **Step 1: Confirm new site renders without legacy files**

Run:
```bash
npm run build
```

Inspect `dist/`:
```bash
ls dist
```

Expected: `dist/index.html`, `dist/resume/index.html`, `dist/_astro/` (assets), `dist/Resume.pdf`, `dist/favicon.ico`.

- [ ] **Step 2: Remove legacy files**

Run:
```bash
git rm index.html
git rm -r css js stylesheets img
```

If any of these are untracked rather than tracked, use `rm` instead of `git rm`.

- [ ] **Step 3: Build again to confirm nothing breaks**

Run:
```bash
npm run build
```

Expected: build still succeeds. `dist/` re-generated.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove legacy static site files (replaced by Astro build)"
```

---

## Task 19: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Confirm Pages source is set to "GitHub Actions"**

This step is a manual GitHub.com action (cannot be done via CLI without a token):
1. Go to repo Settings → Pages.
2. Under "Build and deployment" → "Source", select **GitHub Actions** (not "Deploy from a branch").
3. If a custom domain is desired, add `slesa.com.np` in the "Custom domain" field. (See Spec §7 — confirm with user before doing this.)

> Note this in the commit message but don't block on it; the workflow file works either way once Pages source is set.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow to build and deploy to GitHub Pages

After merging, set repo Settings → Pages → Source to 'GitHub Actions'.
Custom domain (slesa.com.np) requires user confirmation."
```

---

## Task 20: Final verification

> No code changes. End-to-end manual verification before declaring the work complete.

- [ ] **Step 1: Clean build**

Run:
```bash
rm -rf dist node_modules
npm install
npm test
npm run build
```

Expected: install OK, all tests pass, build emits clean `dist/`.

- [ ] **Step 2: Preview the production build**

Run:
```bash
npm run preview
```

Open `http://localhost:4321` (or whatever port preview reports).

- [ ] **Step 3: Walk the spec's success criteria**

Verify each of these against the running preview:

1. **Recruiter scan at `/?reading=plain`** — open it. Within 30 seconds, can you read: name, role, employer, key projects, contact links? They must all be visible without scrolling more than once.

2. **Creative-tech reviewer at `/`** — open it. Above the fold, do you see: signature sketch, hero name + tagline, the satellite sketch (in Ch 01)? The visual care should be immediate.

3. **Friend at `/?mode=offclock`** — open it. Confirm the off-clock content is visible: comics, clay, plants, garden — and no NASA platform language.

4. **`/resume` prints clean** — open `/resume`, hit cmd+P (or click "print / save as PDF"). Print preview should be one US-Letter page; controls hidden; black text on white; consistent typographic hierarchy.

5. **Total page weight under 200KB excluding sketches** — open DevTools Network tab, hard reload `/`, confirm total transfer is < 200KB excluding sketch SVGs (the SVG strokes themselves are small; the real weight is fonts, which Google CDN serves).

If any criterion fails, file a follow-up task in this plan or fix inline before declaring done.

- [ ] **Step 4: Lighthouse smoke test (optional)**

In Chrome DevTools, run Lighthouse on `/` (mobile, performance + accessibility). Expected:
- Accessibility ≥ 95
- Performance ≥ 90 (subject to font-loading on cold cache)

If Accessibility < 95, inspect issues — usually contrast or label issues. Fix before committing.

- [ ] **Step 5: Final commit (no code; closes the plan)**

If all checks passed and no further changes were needed, no commit is required. If small fixes were applied during this task, commit with a descriptive message.

---

## Self-Review Notes

The following spec sections are addressed by:

- §2 Aesthetic Direction → Tasks 2 (theme variables, fonts), 3 (sketches), 5 (hero), 14 (plain mode)
- §3.1 Three controls → Tasks 10, 11, 12 (state module, bootstrap, component)
- §3.2 Mobile → Task 16
- §3.3 Chapter structure → Tasks 4, 8, 9
- §3.4 Routes → Tasks 9 (`/`), 15 (`/resume`)
- §4 Components → Tasks 2, 3, 4, 5, 6, 7, 12, 15
- §4.1 Content collection → Task 1, 8
- §4.2 Plain mode → Task 14
- §5 Sketches → Task 3 (placeholders), with later replacement of `src/assets/sketches/*.svg` once Slesa delivers final art
- §6 Migration → Tasks 15 (move kept assets), 18 (delete legacy)
- §7 Tech stack → Tasks 1, 19 (Astro + GitHub Actions); domain decision flagged in Task 19 Step 2
- §8.1 Toggle persistence → Tasks 10, 11, 12
- §8.2 Animation — handled via `transition: 250ms ease` in component styles; reduced-motion in global.css
- §8.3 Accessibility → Tasks 3 (sketch alt + role=img), 12 (aria-pressed), 17 (focus-visible)
- §10 Success criteria → Task 20 verification
