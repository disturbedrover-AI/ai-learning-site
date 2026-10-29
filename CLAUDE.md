# AI Learning Site

## Purpose

A website that helps non-technical people learn about artificial intelligence:
plain-English lessons, a glossary, curated news, a directory of AI tools, and
(later) a members-only Lab for hands-on experiments. The owner is not a
developer, so explain changes in simple terms.

## Stack

- **Next.js 16** (App Router, Cache Components enabled) + **TypeScript**
- **Tailwind CSS v4** (configured in CSS, no `tailwind.config` file)
- **Framer Motion** for animation
- **next-themes** for theme switching and persistence (stored in `localStorage` under `theme`)
- **gray-matter** for reading Markdown frontmatter
- **@mdx-js/mdx** for lesson files (Markdown + lesson blocks), compiled on the server

This Next.js version differs from older ones. Read `AGENTS.md` and the docs in
`node_modules/next/dist/docs/` before using unfamiliar Next.js APIs.

Commands: `npm run dev` (local site at http://localhost:3000), `npm run build`, `npm run lint`.

## Folder structure

```
app/                  Pages. Each folder is a web address (app/learn → /learn).
  layout.tsx          Wraps every page: header, footer, theme provider.
  globals.css         Tailwind setup; maps theme variables to Tailwind colours.
  themes.css          ALL theme colour definitions (one block per theme).
  page.tsx            Home page.
  learn/              Learning path (page.tsx), lesson pages ([slug]/), glossary (glossary/).
  news/ tools/ lab/   One folder per section.
components/
  layout/             Header, Footer, Logo.
  theme/              Theme provider and theme switcher.
  motion/             Reveal, Stagger/StaggerItem, Lift: the only animation wrappers.
  ui/                 Small shared building blocks (Card, Tag, PageHeader, Button).
  learn/              Learning path, lesson page parts, glossary browser, progress tracking.
    blocks/           Lesson blocks: Definition, Term, Example, TryIt, KeyPoint, Quiz, Explainer.
    lesson.css        Reading styles for lesson text.
  explainers/         Interactive animated explainers + registry.ts (name → component).
content/              ALL site content as files (see content/README.md for schemas).
  lessons/            MDX, one file per lesson, plus _levels.json (the path's levels).
  glossary/           JSON, one file per term.
  news/               Markdown, one file per post.
  tools/              JSON, one file per tool.
lib/
  site.ts             Site name, description, navigation items.
  themes.ts           List of themes shown in the switcher.
  motion.ts           ALL animation presets (timings, easing, variants, theme cross-fade).
  content.ts          Reads and validates the files in content/.
  headings.ts         Heading ids and the lesson table of contents.
public/               Static files (images, favicon).
```

## Theme rules

- Themes are CSS variables in `app/themes.css`, selected by `data-theme` on `<html>`.
- Every theme defines the same variables: `--background`, `--surface`, `--foreground`,
  `--muted`, `--border`, `--accent`, `--accent-foreground`.
- Themes may also override the shared defaults in the `:root` block at the top of
  `themes.css`: `--font-body`, `--font-heading`, `--hero-gradient`, `--hero-opacity`,
  `--hero-animation`, `--page-gradient`, `--page-animation`. The hero variables cover
  only the top section of the home page; the page variables are a full-screen layer
  behind the whole home page. Keep animations slow and subtle; they are switched off
  for visitors who turn on "reduce motion".
  Fonts must be loaded with `next/font` in `app/layout.tsx` (with `preload: false`
  if only some themes use them) and referenced by their CSS variable.
- Don't use `color-mix()` inside theme variables: the CSS build step rewrites it
  into a plain colour. Use a separate opacity variable instead.
- Adding a theme = one new CSS block in `themes.css` + one line in `lib/themes.ts`.
  No component changes.
- Components must only use the theme-aware Tailwind classes (`bg-background`,
  `bg-surface`, `text-foreground`, `text-muted`, `border-border`, `bg-accent`,
  `text-accent-foreground`). Never hard-code colours like `bg-white` or `#fff`.
- If a new variable is needed, add it to **every** theme block and to `@theme` in `globals.css`.
- Check new UI in all themes (Light, Dark, Warm Sand, Mist) before finishing.

## Motion rules

- Every animation uses the presets in `lib/motion.ts`. Don't invent new timings,
  easings or springs in components; add a preset there if one is truly missing.
- Use the wrappers in `components/motion/`:
  - `<Reveal>`: fade up the first time a block scrolls into view (`still` = fade only).
  - `<Stagger>` + `<StaggerItem>`: lists and grids whose items appear one after another.
  - `<Lift>`: gentle hover lift for linked cards. Buttons: `Button` / `ButtonLink` in `components/ui/Button.tsx`.
- Reveals happen once, never on every scroll. Durations stay between 0.2s and 0.5s.
- No parallax, no 3D, no page-wide transitions. The only whole-page effect is
  the theme cross-fade (`crossFade` in `lib/motion.ts`, used by the theme switcher).
- "Reduce motion" is handled globally (`skipAnimations` in `ThemeProvider.tsx`,
  plus a CSS rule in `globals.css`), so new components get it for free.
  CSS animations still need `motion-reduce:[animation:none]`.

## Learn section

Content schemas (lesson frontmatter, levels, blocks, glossary) are documented in
`content/README.md`. Keep it in sync with `lib/content.ts`.

**Add a lesson**
1. Create `content/lessons/<slug>.mdx` with the frontmatter from `content/README.md`
   (`title`, `slug`, `level`, `order`, `duration`, `summary`, `tags`, `prerequisites`).
2. Write the text in Markdown with `##` section headings; use blocks
   (`Definition`, `Term`, `Example`, `TryIt`, `KeyPoint`, `Quiz`, `Explainer`) where they help.
3. It appears on the learning path automatically, in its level, sorted by `order`.
   Prerequisites and levels are checked: a typo shows an error naming the file.

**Add a glossary term**
1. Create `content/glossary/<term-name>.json` with `term`, `definition`, and optional
   `aliases` and `related`.
2. `<Definition term="…">` and `<Term>` in lessons link to it automatically
   (matched by file name, term or alias).

**Add an explainer**
1. Create `components/explainers/<Name>.tsx`: starts with `"use client"`, default export,
   uses theme classes and `lib/motion.ts` presets.
2. Add one line to `components/explainers/registry.ts`: `name: () => import("./<Name>"),`.
3. Use it in any lesson: `<Explainer name="name" />`.

**Lesson blocks** live in `components/learn/blocks/` and are registered in
`components/learn/LessonBody.tsx`. A new block = a new file there + one entry in
that list + a row in `content/README.md`.

**Progress** ("Mark as complete") is stored in the visitor's browser
(`localStorage`, key `completed-lessons`) via `components/learn/progress.ts`.
Replace that file's internals when real accounts arrive.

## Standing rules

1. **Content is file-based.** New lessons, glossary terms, news, and tools are
   added as files in `content/`, never by editing code. Keep `content/README.md`
   in sync with `lib/content.ts` when a schema changes.
2. **Never break existing themes when adding features.** Follow the theme rules above.
3. **New features go in their own folders** (e.g. `app/<feature>/` and
   `components/<feature>/`), not mixed into existing ones.
4. **Keep the design clean and motion-based.** Generous spacing, restrained colour,
   subtle Framer Motion (short fades/slides, use `components/motion/`). Nothing flashy;
   respect reduced-motion (already set globally via `MotionConfig`).
5. **Ask before changing architecture** (new frameworks or libraries, routing,
   data storage, auth approach, folder layout, rendering/caching strategy).

## Notes

- The Lab page is a placeholder; login and permissions will be added later.
- News items are listed but don't yet have their own detail pages.

@AGENTS.md
