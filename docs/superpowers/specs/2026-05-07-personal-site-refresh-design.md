# Personal Site Refresh — Design

**Date:** 2026-05-07
**Owner:** Slesa Adhikari
**Status:** Spec, ready for implementation planning

## 1. Purpose

Refresh `slesaad.github.io` so it functions as a job-application portfolio that flexes across three audiences:

- **Senior IC / staff / platform engineer** — geospatial, climate-tech, infra
- **Design-engineer / data-viz / creative-tech** — where visual + storytelling abilities are part of the pitch
- **Founder / partnership / leadership** — credibility surface for Saano Labs and NASA-adjacent work

The site must read as polished and substantive to a recruiter scanning it in 8 seconds, *and* convey that Slesa is a creative thinker with design sense and unique craft. The personal blog at `squiggly-lines` continues to live separately; the personal site links out to it.

## 2. Aesthetic Direction

**Sketchbook-editorial.** Editorial-magazine backbone (refined serif body, mono captions, generous whitespace) with intentional hand-drawn accents (sketch dividers, marginalia in handwriting font, and a small set of original sketches by Slesa).

Visually distinct from the blog (which is fully handwritten / Schoolbell-cursive / squiggle-heavy) while clearly part of the same person — the shared accent color (`#c23616`) is the connective tissue.

### 2.1 Color palette

**Light theme (default — the warmth is the identity):**
| Role | Value |
|---|---|
| `--paper` | `#fbf8f1` (cream paper) |
| `--paper-offclock` | `#f3f0e3` (slightly greener tint when in Off-clock mode) |
| `--ink` | `#1a1a1a` (body text) |
| `--ink-soft` | `#4a4a4a` (secondary text) |
| `--mono` | `#6a5a3a` (caption / mono color) |
| `--accent` | `#c23616` (sketch lines, marginalia, hover states) |
| `--rule` | `#d8cda8` (dividers) |

**Dark theme (warm-ink, not pure black):**
| Role | Value |
|---|---|
| `--paper` | `#1a1814` (deep warm ink) |
| `--paper-offclock` | `#1a1c16` |
| `--ink` | `#e6dfc8` (warm cream text) |
| `--ink-soft` | `#b8b09c` |
| `--mono` | `#a89878` |
| `--accent` | `#e84118` (slightly brighter for legibility) |
| `--rule` | `#3a342a` |

### 2.2 Typography

- **Display / body serif:** Source Serif 4 (Google Fonts) — variable, refined editorial workhorse. Fallback: Georgia, serif.
- **Mono / caption:** IBM Plex Mono — chapter labels, year stamps, technical metadata.
- **Handwriting / accent:** Caveat — used sparingly for marginalia and italic emphasis on a few key words (e.g., the surname in the hero). Replaces the blog's Schoolbell to keep the two sites distinct but related.
- **System sans** (`-apple-system, sans-serif`) — only for UI controls (toggles, buttons), never for body content.

## 3. Information Architecture

Single long-scroll home page with three sticky controls in the top-right and a footer.

### 3.1 Controls

Three orthogonal toggles, sticky in the top-right corner of the page:

1. **Audience** — segmented pill: `Work` ↔ `Off-clock`. Swaps the content of every chapter. Default: `Work`. URL param: `?mode=offclock`.
2. **Reading density** — `Aa` icon button. Flips between Designed and Plain. In Plain, sketches, squiggle dividers, and handwriting-font accents are removed; layout reduces to a typographic editorial column with the same content. Default: `Designed`. URL param: `?reading=plain`.
3. **Theme** — `☾` / `☀` icon button. Light ↔ Dark. Default: respects `prefers-color-scheme`; user choice persists in `localStorage` under key `theme`.

All three states are encoded in URL params (audience, reading) and localStorage (theme), so a recruiter can be deep-linked: `slesaad.github.io/?reading=plain` for the resume-style read.

### 3.2 Mobile

On viewports `< 720px`, the three controls collapse into a single icon button (top-right) that expands a small panel containing all three toggles stacked vertically.

### 3.3 Chapter structure

Both audience modes use the same five-chapter spine. Content swaps per mode.

| # | Slug | Work content | Off-clock content |
|---|------|---|---|
| 00 | `intro` | Name + role tagline; signature sketch motif | Name + creative tagline; same signature mark |
| 01 | `what-i-do` / `what-i-make` | Earth-observation platform work; satellite sketch | Comics/clay/plants narrative; plant/leaf sketch |
| 02 | `selected` | Featured work cards: GHG Center, VEDA, MAAP, Saano Labs | Featured makes: comics, ceramics, native-plant patch |
| 03 | `principles` / `field-notes` | 3–5 short principles ("how I think") | Pointer to the `squiggly-lines` blog |
| 04 | `elsewhere` | Resume · GitHub · LinkedIn · Instagram · Blog | Same |

Chapters are separated by hand-drawn squiggle SVG dividers.

### 3.4 Routes

- `/` — Home (long scroll, dual toggle, theme toggle)
- `/resume` — Resume rendered from `resume.md` as a clean typographic page. Includes a print stylesheet so `cmd+P` produces a single-page PDF. Existing `Resume.pdf` retained as a fallback download link.

No other routes. The blog stays at its own domain/site.

## 4. Components

Designed for isolation — each has one job, communicates via props/markdown frontmatter, can be reasoned about independently.

| Component | Purpose | Inputs |
|---|---|---|
| `BaseLayout.astro` | Page shell, font/CSS imports, theme bootstrap script | `title`, `description` |
| `Toggles.astro` | The three sticky controls (audience, reading, theme), URL/localStorage sync | none — reads URL on mount |
| `Hero.astro` | Chapter 00 — name + tagline, signature sketch, mode-aware | content slots: `work`, `offclock` |
| `Chapter.astro` | Generic chapter wrapper: number, title, lede, optional sketch slot | `num`, `slug`, content slots |
| `SquiggleDivider.astro` | Decorative SVG between chapters (hidden in plain mode) | none |
| `WorkList.astro` | Typeset list of selected items (work or makes) | array of `{ title, year, blurb, image?, link? }` |
| `Sketch.astro` | Wraps an inline SVG/PNG sketch with consistent sizing/positioning, hidden in plain mode | `src`, `alt`, `placement` |
| `Footer.astro` | Footer with social/contact links: GitHub (`@slesaad`), LinkedIn (`in/slesaad`), email (`slesaad@gmail.com`), Instagram (`@saanostory`), and the squiggly lines blog (`https://squiggles.slesa.com.np`) | none |
| `ResumePage.astro` | Renders `resume.md` to a print-friendly layout | reads `resume.md` via Astro content loader |

### 4.1 Content collection

Chapter copy lives in markdown files under `src/content/chapters/`. Frontmatter includes `mode` (`work` \| `offclock`), `num`, `slug`, `title`, `lede`. This means copy edits don't require touching components — important for keeping the site updateable.

### 4.2 Plain mode behavior

A `data-reading="plain"` attribute on `<html>` triggers CSS rules that:
- Hide all `Sketch`, `SquiggleDivider`, and any element with class `.designed-only`.
- Replace Caveat-font emphasis with italic Source Serif.
- Reduce chapter padding and remove decorative margins.
- Keep all body text, headings, work lists, and links visible and unchanged in content.

Plain mode is implemented purely via CSS — no DOM rebuild — to keep transitions instant.

## 5. Sketches (assets to be produced by Slesa)

Five hand-drawn sketches, scanned/photographed at 2x retina, exported as SVG (preferred) or PNG with transparent background:

1. **`signature.svg`** — small motif/mark used in the hero corner. ~80×80px.
2. **`satellite.svg`** — Work · Ch.01 illustration. ~200×200px.
3. **`plant.svg`** — Off-clock · Ch.01 illustration. ~200×200px.
4. **`tools.svg`** — divider/section break used between Ch.02 and Ch.03 in both modes. ~300×80px (wide).
5. **`workspace.svg`** — used in `/resume` header or Off-clock Ch.04. ~250×250px.

These are produced separately and dropped into `src/assets/sketches/`. The site renders gracefully without them (placeholder SVG squiggles fill the role), so implementation isn't blocked on sketch delivery.

## 6. Migration

**Keep:** `me.jpeg` (used on `/resume` and possibly Off-clock intro), `Resume.pdf` (fallback), `favicon.ico`, and `resume.md` (now the source of truth for resume content).

**Retire:** Old project grid items (Unity Crowd, Flipped, Yatra, Handsfree, Dimension223, BatSS) — these are pre-2017 student projects that no longer serve the pitch. They will not appear on the new site. The associated images in `/img` can be deleted.

**Replace:** All HTML/CSS/JS in `index.html`, `css/`, `js/`, `stylesheets/` is removed when the new Astro build replaces them. The `/img` directory is consolidated into Astro's asset pipeline.

## 7. Tech stack

- **Astro 4.x** — static-site framework. Matches the blog stack (familiarity), best-in-class for content-heavy static sites, ships ~zero JS by default.
- **Astro Content Collections** — typed markdown for chapters and resume.
- **Vanilla CSS** with CSS custom properties for theming. No Tailwind, no CSS-in-JS.
- **Vanilla JS** for the three toggles. Total client-side JS budget: < 5KB minified.
- **GitHub Pages** for hosting (existing). Astro builds to `dist/`; a GitHub Actions workflow deploys on push to `master`.
- **Domain:** Currently published at `slesaad.github.io`. The blog's `consts.ts` references `https://slesa.com.np` as the website — if that custom domain is intended for this site, add a `CNAME` file with `slesa.com.np` and configure DNS during deployment. Otherwise stay on `slesaad.github.io`. Decide during implementation.

## 8. Behavior details

### 8.1 Toggle persistence and URL sync

On page load:
1. Read `?mode=` and `?reading=` from URL. If present, use them.
2. Otherwise, default to `mode=work`, `reading=designed`.
3. For theme: read `localStorage.theme`. If absent, fall back to `prefers-color-scheme`.

When a toggle is clicked:
1. Update the relevant `data-*` attribute on `<html>`.
2. Update the URL (via `history.replaceState`) for audience/reading. No URL update for theme — theme is per-device.
3. Persist theme in `localStorage`.

### 8.2 Animation

Toggle transitions use a subtle 250ms cross-fade on opacity for elements that appear/disappear (sketches, dividers). No layout-shift animations — content jumping is worse than content swapping.

### 8.3 Accessibility

- All three toggles are real `<button>` elements with `aria-pressed` reflecting state.
- `prefers-reduced-motion` disables the cross-fade.
- Sketches have meaningful `alt` text.
- Color contrast: all text/background combinations meet WCAG AA in both themes.

## 9. Out of scope

- A separate "case study" page per featured project. The Selected Work chapter shows enough; deeper writeups can move to the blog.
- Search, tags, RSS — none needed for a personal landing page.
- Analytics. Optional later, but not part of this refresh.
- A CMS. Markdown-in-repo is the editing flow.

## 10. Success criteria

- A recruiter scanning at `/?reading=plain` can extract Slesa's role, employer, key projects, and contact info in under 30 seconds.
- A creative-tech reviewer at `/` (default) sees the visual sense, design care, and "extra-mile" sketch craft above the fold.
- A friend at `/?mode=offclock` finds the personal/creative side without having to dig through professional content.
- The `/resume` page prints to a single-page PDF that's indistinguishable from a hand-typeset CV.
- The site loads in under 1 second on broadband; total page weight under 200KB excluding sketches.
