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
- **lucide-react** for icons
- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) for accounts and synced progress

This Next.js version differs from older ones. Read `AGENTS.md` and the docs in
`node_modules/next/dist/docs/` before using unfamiliar Next.js APIs.

Commands: `npm run dev` (local site at http://localhost:3000; `SHOW_DRAFTS=true npm run dev` to include draft courses), `npm run build`, `npm run lint`. After adding or moving route folders, `npx next typegen` refreshes route types.

## Folder structure

```
app/                  Pages. Each folder is a web address (app/learn → /learn).
  layout.tsx          Wraps every page: header, footer, theme provider.
  globals.css         Tailwind setup; maps theme variables to Tailwind colours.
  themes.css          ALL theme colour definitions (one block per theme).
  page.tsx            Home page.
  login/              Sign-in page (email link, Google, LinkedIn when enabled).
  account/            Name, avatar, sign out, delete my data.
  auth/callback/      Where sign-in links and Google/LinkedIn return to; finishes sign-in.
  learn/              Course catalogue (page.tsx), glossary (glossary/), and
    [course]/         a course's "choose your path" page,
      [track]/        a track's level path,
        [lesson]/     a lesson page.
  news/ tools/ lab/   One folder per section.
components/
  layout/             Header, Footer, Logo.
  auth/               AuthProvider (who's signed in), LoginForm, AccountView, AccountMenu, Avatar.
  theme/              Theme provider and theme switcher.
  motion/             Reveal, Stagger/StaggerItem, Lift, Counter: the only animation wrappers.
  brand/              The site's visual motif (Constellation).
  ui/                 Small shared building blocks (Card, Tag, PageHeader, Button).
  learn/              Catalogue, learning path, lesson page parts, glossary browser, progress tracking.
    blocks/           Lesson blocks: Definition, Term, Example, TryIt, KeyPoint, Quiz, Explainer.
    lesson.css        Reading styles for lesson text.
  explainers/         Interactive animated explainers + registry.ts (name → component).
content/              ALL site content as files (see content/README.md for schemas).
  courses/            One folder per course with course.json (details + tracks), plus _levels.json.
  lessons/            MDX, one file per lesson (a shared pool used by tracks).
  glossary/           JSON, one file per term.
  news/               Markdown, one file per post.
  tools/              JSON, one file per tool.
lib/
  supabase/           config.ts (env keys), client.ts (browser), server.ts (server; reads cookies).
  auth/               providers.ts (sign-in options), roles.ts (role names, hasRole),
                      server.ts (getUser, getRole, requireRole – server only).
  site.ts             Site name, description, navigation items.
  themes.ts           List of themes shown in the switcher.
  motion.ts           ALL animation presets (timings, easing, variants, theme cross-fade).
  content.ts          Reads and validates lessons, glossary, news and tools.
  courses.ts          Reads and validates courses and tracks; links them to lessons.
  headings.ts         Heading ids and the lesson table of contents.
  levels.ts           levelStyle() / hueStyle(): pick a level or course colour for an element.
supabase/migrations/  SQL to set up the database (run in the Supabase SQL editor).
proxy.ts              Runs before each request: keeps the Supabase sign-in fresh.
public/               Static files (images, favicon).
```

## Theme rules

- Themes are CSS variables in `app/themes.css`, selected by `data-theme` on `<html>`.
- Every theme defines the same variables: `--background`, `--surface`, `--foreground`,
  `--muted`, `--border`, `--accent`, `--accent-foreground`.
- Themes may also override the shared defaults in the `:root` block at the top of
  `themes.css`: `--font-body`, `--font-heading`, `--level-0`…`--level-3`, `--success`,
  `--hero-gradient`, `--hero-opacity`,
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

## Design rules

**Fonts.** Headings, big numbers and watermarks use the display font
(Bricolage Grotesque, `--font-heading`, Tailwind class `font-display`); `h1`–`h3`
get it automatically. Body text uses `--font-body` (Geist; Inter in Mist).
Headings are bold (`font-bold`), tight and large; don't fall back to small,
`font-semibold` body-font headings.

**Level colours.** Each learning level has its own hue: `--level-0` teal,
`--level-1` blue, `--level-2` amber, `--level-3` rose (defaults in the `:root`
block of `themes.css`; Dark and Warm Sand override them for contrast).
- Set the colour for an element and everything inside it with
  `style={levelStyle(n)}` from `lib/levels.ts`, then use `text-level`,
  `bg-level/10`, `border-level/40`, `ring-level/15`, etc.
- Use them consistently for a level: the badge, the big level number, the lesson
  number ring, the line between lessons, hover border-glow, and progress segments.
  The lesson page sets the lesson's level colour for the whole page.
- The same four hues are the palette for lesson blocks and explainers
  (`levelStyle(i)` wraps around for any number).
- Small text in these colours must stay at 4.5:1 or better on `--background`
  and `--surface` in every theme. `--success` is only for "correct" feedback.

**Lesson blocks.** Each block has a fixed hue, look and lucide icon (see
`components/learn/blocks/Block.tsx`), so they're recognisable at a glance:
| Block | Hue | Look | Icon |
| ----- | --- | ---- | ---- |
| Definition | 1 (blue) | `rule`: thick left border, plain panel | BookOpen |
| Example | 2 (amber) | `tint`: soft tint, dashed outline | Lightbulb |
| TryIt | 0 (teal) | `panel`: soft tint, solid outline | FlaskConical |
| KeyPoint | accent | `quote`: left border, fading tint, large display text | Sparkles |
| Quiz | 3 (rose) | `card`: coloured outline | CircleQuestionMark |
| Explainer | accent | `grid`: dotted "instrument" background | MousePointerClick |
A new block gets its own unused hue/look combination and an icon.

**Motif.** `components/brand/Constellation.tsx` is the "AI" motif (drifting
connected nodes in the level colours). It's used in the Home hero and behind the
Learn header. Reuse it rather than adding other decorative graphics; keep it faint
behind text, and put any opacity on the motif itself, not on its animated wrapper.

**Layout and rhythm.** Generous spacing: page headers `pt-16 sm:pt-24`, levels
and sections separated by `space-y-20` or more. Use size to show importance
(e.g. the big Learn card on Home, large level numbers); avoid grids of identical
cards when one item matters more. Rounded corners: `rounded-3xl` for big panels
and cards, `rounded-2xl` for list cards, `rounded-xl` for small controls.

**Lesson icons.** Each lesson can set `icon` in its frontmatter to any
lucide.dev icon name (e.g. `brain-circuit`); it's rendered by `LessonIcon`.

## Motion rules

- Every animation uses the presets in `lib/motion.ts`. Don't invent new timings,
  easings or springs in components; add a preset there if one is truly missing.
- Use the wrappers in `components/motion/`:
  - `<Reveal>`: fade up the first time a block scrolls into view (`still` = fade only).
  - `<Stagger>` + `<StaggerItem>`: lists and grids whose items appear one after another.
  - `<Lift>`: gentle hover lift for linked cards. Buttons: `Button` / `ButtonLink` in `components/ui/Button.tsx`.
- `<Counter>`: numbers that count to their new value (scores, percentages, token counts).
- Reveals happen once, never on every scroll. Durations stay between 0.2s and 0.5s.
  The one exception is the `ambient` preset: the constellation's slow, continuous drift.
- Feedback presets: `shake` (wrong answer), `pulse` (right answer), `pop` + `cascade`
  (chips appearing one after another).
- No parallax and no page-wide transitions. The only 3D motion is the tokenizer's
  chip `flip`. The only whole-page effect is the theme cross-fade (`crossFade` in
  `lib/motion.ts`, used by the theme switcher).
- "Reduce motion" is handled globally (`skipAnimations` in `ThemeProvider.tsx`,
  plus a CSS rule in `globals.css`), so new components get it for free.
  CSS animations still need `motion-reduce:[animation:none]`.

## Learn section

**Hierarchy: Course → Track → Level (0–3) → Lesson.**
- A course (`content/courses/<course>/course.json`) has details (title, description,
  icon, accent colour, tags, status) and one or more tracks.
- A track lists, for each level 0–3, the slugs of its lessons in order.
- Lessons (`content/lessons/*.mdx`) are a shared pool. Their level and position come
  from the tracks that list them, never from the lesson file.
- A course without `tracks` gets one track, `main`, named after the course; its course
  page redirects straight to that track.
- Addresses: `/learn` (catalogue), `/learn/<course>` (choose a track), `/learn/<course>/<track>`
  (the level path), `/learn/<course>/<track>/<lesson>`. Previous/next and the lesson
  number follow the track. Old `/learn/<lesson>` addresses redirect to the lesson's
  first published track. "glossary" can't be used as a course slug.
- `status: "draft"` courses are hidden (catalogue, Home, their pages) unless the
  environment setting `SHOW_DRAFTS=true` is on, e.g. `SHOW_DRAFTS=true npm run dev`.
  The catalogue's status filter only appears then.

Schemas (course.json, levels, lesson frontmatter, blocks, glossary) are documented in
`content/README.md`. Keep it in sync with `lib/courses.ts` and `lib/content.ts`.

**Add a course**
1. Copy a folder in `content/courses/` (e.g. `ai-from-zero`), rename it to the new
   course's slug, and edit `course.json`: title, description, icon, accent, tags, status.
2. One path through it: keep `levels`. Several: use `tracks` (see `claude-certification`).
3. It appears in the catalogue automatically (published courses also appear on Home).

**Add a track** to a course: add an entry to its `tracks` list with `slug`, `title`,
`description` and `levels` 0–3. (A one-track course: move its `levels` into a first
track, since a course uses either `levels` or `tracks`.)

**Add a lesson**
1. Create `content/lessons/<slug>.mdx` with the frontmatter from `content/README.md`
   (`title`, `slug`, `duration`, `summary`, `tags`, `prerequisites`, `icon`).
2. Write the text in Markdown with `##` section headings; use blocks
   (`Definition`, `Term`, `Example`, `TryIt`, `KeyPoint`, `Quiz`, `Explainer`) where they help.
3. **Assign it to a track**: add its slug to a level's `lessons` list in a
   `course.json`, at the position it should appear. Until a track lists it, it has no page.

**Share a lesson between tracks**: list the same slug in each track's level (it can
sit at a different level or position in each). Progress is kept separately per track.

**Add a glossary term**
1. Create `content/glossary/<term-name>.json` with `term`, `definition`, and optional
   `aliases` and `related`.
2. `<Definition term="…">` and `<Term>` in lessons link to it automatically
   (matched by file name, term or alias). The glossary's course filter comes from these.

**Add an explainer**
1. Create `components/explainers/<Name>.tsx`: starts with `"use client"`, default export,
   uses theme classes and `lib/motion.ts` presets.
2. Add one line to `components/explainers/registry.ts`: `name: () => import("./<Name>"),`.
3. Use it in any lesson: `<Explainer name="name" />`.

**Lesson blocks** live in `components/learn/blocks/` and are registered in
`components/learn/LessonBody.tsx`. A new block = a new file there + one entry in
that list + a row in `content/README.md`.

**Progress**: components only ever use `useProgress()` from `components/learn/progress.tsx`
(completed ids, last-opened per course, `setComplete`, `markOpened`, `percent`, `clearAll`).
Lesson ids are `course/track/lesson`, so each track keeps its own progress.
- Signed out: kept in the browser (`localStorage` keys `learn-completed` and `learn-last-opened`).
- Signed in: kept in the Supabase table `lesson_progress`.
- On sign-in, browser progress is merged into the account (nothing is overwritten or
  lost), then cleared from the browser, only after the save succeeds.
To change where progress lives, change that one file; pages don't need to change.

## Accounts (Supabase)

The site works without accounts: until the keys are set, there's no "Sign in"
button and progress stays in the browser.

**Environment variables** (in `.env.local`, never committed; `.env.example` lists them):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: from the Supabase dashboard
  (Project Settings → API). The anon key is safe in the browser; row level security protects data.
- `NEXT_PUBLIC_AUTH_GOOGLE`: Google sign-in is shown unless this is `false`.
- `NEXT_PUBLIC_AUTH_LINKEDIN`: LinkedIn is hidden until this is `true`.
- `SHOW_DRAFTS`: show draft courses.
Restart `npm run dev` after changing `.env.local`.

**One-time setup in the Supabase dashboard**
1. *Database*: SQL Editor → New query → paste all of
   `supabase/migrations/20261029120000_accounts.sql` → Run. It creates `profiles` and
   `lesson_progress` with row level security, the sign-up trigger, and `delete_my_account()`.
   It's safe to run again. Future migrations: run each new file in that folder the same way, in name order.
2. *URLs*: Authentication → URL Configuration. Site URL: your site's address
   (`http://localhost:3000` while developing). Redirect URLs: add
   `http://localhost:3000/auth/callback` (and later `https://<your-domain>/auth/callback`).
3. *Email*: works out of the box (magic link). Supabase's built-in email sender is
   rate-limited (a few emails per hour); set up custom SMTP under Authentication → Emails for real use.
4. *Google*: Authentication → Sign In / Providers → Google → enable, and paste a Client ID and
   Secret from Google Cloud (APIs & Services → Credentials → OAuth client ID, type "Web").
   In Google Cloud, the authorised redirect URI is the callback URL Supabase shows on that screen
   (`https://<project>.supabase.co/auth/v1/callback`).
5. *LinkedIn (later)*: enable "LinkedIn (OIDC)" in the same place with keys from a LinkedIn app,
   then set `NEXT_PUBLIC_AUTH_LINKEDIN=true`.

**Data rules** (enforced by the database, not just the site): each user can read and change only
their own profile and progress. Users can change their profile's name and avatar, never its role.

**Roles**: `user` (everyone, the default) < `member` < `owner`, stored in `profiles.role`.
- Client: `useAuth().profile?.role`, and `hasRole(role, "member")` from `lib/auth/roles.ts`.
- Server: `getRole()` and `requireRole("member", "/lab")` from `lib/auth/server.ts`. Signed out →
  sent to /login (and back afterwards); signed in without the role → /account explains.
  These read cookies, so use them inside `<Suspense>` (Cache Components).
- Roles change only through the SQL editor (or the service role). To make someone the owner:
  ```sql
  update public.profiles
  set role = 'owner'
  where id = (select id from auth.users where email = 'you@example.com');
  ```
  Use `'member'` or `'user'` the same way. They see it after their next page load.

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

- The Lab page is a placeholder; it isn't gated yet (next step: `requireRole("member")`).
- News items are listed but don't yet have their own detail pages.

@AGENTS.md
