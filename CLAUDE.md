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
- **rss-parser** for reading RSS/Atom feeds (the news Radar)

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
  news/               News: Posts and Radar tabs (page.tsx), item pages ([slug]/), RSS feed (rss.xml/).
  api/radar/          GET /api/radar: the Radar headlines as JSON.
  api/keep-alive/     GET /api/keep-alive: daily Supabase keep-alive (Vercel Cron, needs CRON_SECRET).
  tools/              Tool directory (page.tsx) and tool pages ([slug]/).
  lab/                The private Lab: home (page.tsx), entries ([slug]/), editor (new/, [slug]/edit/),
                      members (members/), server actions (actions.tsx).
  robots.ts sitemap.ts  /robots.txt and /sitemap.xml (public pages only; the Lab is excluded).
components/
  layout/             Header, Footer, Logo.
  lab/                LabHome, LabEditor, MembersManager, LabGate, PromoteToLesson, badges, lab.css.
  auth/               AuthProvider (who's signed in), LoginForm, AccountView, AccountMenu, Avatar.
  theme/              Theme provider and theme switcher.
  motion/             Reveal, Stagger/StaggerItem, Lift, Counter: the only animation wrappers.
  brand/              The site's visual motif (Constellation).
  ui/                 Small shared building blocks (Card, Tag, PageHeader, Button).
  learn/              Catalogue, learning path, lesson page parts, glossary browser, progress tracking.
    blocks/           Lesson blocks: Definition, Term, Example, TryIt, KeyPoint, Quiz, Explainer, ToolCard.
    lesson.css        Reading styles for lesson text.
  explainers/         Interactive animated explainers + registry.ts (name → component).
  news/               NewsCard (with type badge), NewsBrowser (filters, month groups),
                      NewsTabs (Posts/Radar), RadarList, MakePostDialog.
  tools/              ToolParts (logo, badges, platform icons, compact card), ToolsBrowser (filters).
content/              ALL site content as files (see content/README.md for schemas).
  courses/            One folder per course with course.json (details + tracks), plus _levels.json.
  lessons/            MDX, one file per lesson (a shared pool used by tracks).
  glossary/           JSON, one file per term.
  news/               Markdown, one file per item: <yyyy-mm-dd>-<slug>.md.
  news-sources.json   Feeds the Radar reads (see "News Radar" below).
  tools/              Markdown, one file per tool: <slug>.md.
lib/
  supabase/           config.ts (env keys), client.ts (browser), server.ts (server; reads cookies).
  auth/               providers.ts (sign-in options), roles.ts (role names, hasRole),
                      server.ts (getUser, getRole, requireRole – server only),
                      permissions.ts (canDraftPosts: who sees "Make this a post").
  lab/                model.ts (kinds, statuses, types, experiment template),
                      server.ts (getLabAccess, requireLabOwner, entry/member queries).
  site.ts             Site name, description, navigation items.
  themes.ts           List of themes shown in the switcher.
  motion.ts           ALL animation presets (timings, easing, variants, theme cross-fade).
  content.ts          Reads and validates lessons, glossary, news and tools.
  taxonomy.ts         Fixed lists for news and tools (types, categories, pricing…) with labels and colours.
  related.ts          Links between news, tools and lessons (and checks they exist).
  radar.ts            Fetches, cleans and caches the Radar feeds (server only).
  courses.ts          Reads and validates courses and tracks; links them to lessons.
  headings.ts         Heading ids and the lesson table of contents.
  levels.ts           levelStyle() / hueStyle(): pick a level or course colour for an element.
supabase/migrations/  SQL to set up the database (run in the Supabase SQL editor).
proxy.ts              Runs before each request: keeps the Supabase sign-in fresh.
vercel.json           Vercel settings: the daily keep-alive cron job.
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
   (`Definition`, `Term`, `Example`, `TryIt`, `KeyPoint`, `Quiz`, `Explainer`, `ToolCard`) where they help.
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

## News and tools

Both are file-based, like lessons. Full field lists: `content/README.md`.

**Add a news item**
1. Create `content/news/<yyyy-mm-dd>-<slug>.md` (e.g. `2026-11-02-new-model.md`).
2. Fill in the frontmatter: `title`, `date`, `source`, `sourceUrl`, `type`
   (`model | tool | research | policy | tutorial | other`), `tags`, `summary`,
   `whyItMatters`, and optionally `relatedLesson`, `relatedTool`, `featured: true`.
3. Optionally write longer text below the frontmatter (shown on its page).
It appears on /news (grouped by month), in the RSS feed, and the newest three show on Home.

**Add a tool**
1. Create `content/tools/<slug>.md`.
2. Fill in: `name`, `url`, `category`, `pricing`, `openSource`, `platforms`, `tagline`,
   `goodFor`, optional `notGoodFor`, `difficulty`, `tags`, `featured`, `ownerNote`, `dateAdded`.
3. Optionally write a description below the frontmatter (shown under "About").
Featured tools show on Home. Its page automatically lists news that names it
(`relatedTool`) or shares a tag, and lessons that mention its name.

**Show a tool inside a lesson**: `<ToolCard slug="ollama" />` (a compact card linking to
the tool's page; a wrong slug shows an error listing the valid ones).

**Colours**: each news type and tool category has a palette colour, set in
`lib/taxonomy.ts` (the logo placeholder uses the category colour). Adding a type or
category means adding it there; content files are checked against those lists.

**Links**: `relatedLesson` / `relatedTool` are checked when the site builds; a typo
shows an error naming the file. Set `NEXT_PUBLIC_SITE_URL` to the live address so
links in the RSS feed are correct.

## News Radar

The Radar tab on /news shows automatic headlines from AI blogs and feeds, next to the
curated Posts. It's handled by `lib/radar.ts`:
- All enabled sources are fetched in parallel on the server, 5 seconds each at most
  (a source can allow more with `timeout`).
  A source that fails or doesn't parse is skipped and logged (`[radar] Skipped …` in the
  terminal); the others still show. If every source fails, the tab says so and Posts work as usual.
- Items are cleaned up to title, link, source, date, category and a snippet of at most
  200 characters (no HTML), de-duplicated by link, newest first. Full article text is
  never stored or shown.
- Results are cached and refreshed at most once an hour (`"use cache"` + `cacheLife`).
  `GET /api/radar` returns the same data as JSON for reuse (e.g. the Lab).
- Home's News card shows the 2 latest Posts and the newest Radar headline.

**Add a source**: add an entry to `content/news-sources.json`:
```json
{
  "name": "Example Lab",
  "url": "https://example.com/blog/rss.xml",
  "homepage": "https://example.com/blog",
  "category": "official",
  "enabled": true,
  "limit": 15
}
```
- `url` must be an RSS or Atom feed (check it opens as XML in a browser).
- `category`: `official` (company and lab blogs), `community`, or `research` (papers).
- Optional: `limit` (keep only the newest N), `keywords` (keep only items whose title or
  snippet contains one of the words; used for Hacker News), `snippets: false` (hide feed
  text that's only boilerplate), `timeout` (seconds to wait, default 5; Hacker News has 10),
  `note` (a reminder for you; not shown on the site).
- Changes show within the hour, or straight away after restarting `npm run dev` or rebuilding.

**Remove a source**: set `"enabled": false` (keeps it for later), or delete its entry.

Current sources: OpenAI, Google DeepMind, Hugging Face, Engineering at Meta (AI research),
Anthropic, Hacker News front page (AI keywords only), and arXiv cs.AI + cs.LG (newest 10).
Anthropic publishes no official feed, so its entry uses a community-made copy of
anthropic.com/news (github.com/Olshansk/rss-feeds); if that copy stops updating, disable it.
Meta's ai.meta.com blog has no feed either, so its official engineering feed is used.

**"Make this a post"** appears on each Radar item for the site owner only (`canDraftPosts()`
in `lib/auth/permissions.ts`). It opens a dialog with a ready-to-save news file (summary
and why-it-matters left blank) and its suggested file name, with copy buttons.

## Accounts (Supabase)

The site works without accounts: until the keys are set, there's no "Sign in"
button and progress stays in the browser.

**Environment variables** (in `.env.local`, never committed; `.env.example` lists them):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: from the Supabase dashboard
  (Project Settings → API). The anon key is safe in the browser; row level security protects data.
- `NEXT_PUBLIC_AUTH_GOOGLE`: Google sign-in is shown unless this is `false`.
- `NEXT_PUBLIC_AUTH_LINKEDIN`: LinkedIn is hidden until this is `true`.
- `SHOW_DRAFTS`: show draft courses (and the Draft/Published filter on /learn).
- `SUPABASE_SECRET_KEY`: the server-side Supabase key (server only, never `NEXT_PUBLIC_`).
  Used by the daily keep-alive; optional.
- `CRON_SECRET`: protects `/api/keep-alive` (see "Keep-alive" below). Required on Vercel.
- `NEXT_PUBLIC_SITE_URL`: the site's public address (used in the RSS feed). Optional on
  Vercel: without it, Vercel's own production address is used (`lib/site.ts`).
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

**Keep-alive**: free Supabase projects pause after a week without activity. `vercel.json`
has a Vercel Cron job that calls `GET /api/keep-alive` once a day at 06:00 UTC; the route
(`app/api/keep-alive/route.ts`) does one tiny read on `profiles` (a count, no rows) with
`SUPABASE_SECRET_KEY` (or the public key if that isn't set). It only answers requests carrying
`Authorization: Bearer <CRON_SECRET>`, which Vercel adds automatically when `CRON_SECRET` is
set in the project's environment variables; anything else gets 401. Check runs in Vercel →
project → Settings → Cron Jobs. To test locally:
`curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/keep-alive`.

**Data rules** (enforced by the database, not just the site): each user can read and change only
their own profile and progress. Users can change their profile's name and avatar, never its role.

**Roles**: `user` (everyone, the default) < `member` < `owner`, stored in `profiles.role`.
- Client: `useAuth().profile?.role`, and `hasRole(role, "member")` from `lib/auth/roles.ts`.
- Server: `getRole()` and `requireRole("member", "/lab")` from `lib/auth/server.ts`. Signed out →
  sent to /login (and back afterwards); signed in without the role → /account explains.
  These read cookies, so use them inside `<Suspense>` (Cache Components).
- Roles change through /lab/members (owner only; see "The Lab") or the SQL editor. Users can
  never change their own role. To make yourself the owner (do this once, after running both
  migrations), run in the SQL editor:
  ```sql
  -- Put your sign-in email in both places.
  insert into public.lab_allowlist (email, role, accepted, accepted_at)
  values (lower('you@example.com'), 'owner', true, now())
  on conflict (email) do update set role = 'owner';

  update public.profiles
  set role = 'owner'
  where id = (select id from auth.users where lower(email) = lower('you@example.com'));
  ```
  If you haven't signed in yet, the first part is enough: you'll become owner on first sign-in.
  You see it after your next page load.

## The Lab

A private workspace (`/lab`) for the owner and invited members. Its content lives in
Supabase, not in `content/`, because it's private. Set up by
`supabase/migrations/20261030120000_lab.sql` (run it in the SQL editor after the accounts
migration, the same way).

**Who sees what** (checked on the server and again by the database's row level security):
| Visitor | /lab shows |
| --- | --- |
| Signed out | "Members only" and a Sign in button |
| Signed in, role `user` | "Access is by invitation" and a Request access form |
| `member` | The Lab, read-only (everything except drafts) |
| `owner` | The Lab with editing, plus /lab/new, edit pages and /lab/members |

**Data** (Supabase tables):
- `lab_entries`: `id`, `owner_id`, `kind` (`experiment | tip | note | snippet`), `title`,
  `slug` (unique, from the title), `body` (Markdown), `status` (`draft | active | done | archived`),
  `tags` (list), `collection` (optional group, e.g. "Prompting"), `pinned`, `created_at`,
  `updated_at`, and `search` (full-text index over title, tags and body).
- `lab_entry_links`: `entry_id`, `url`, `label`, `position` (external references).
- `lab_allowlist`: `email`, `role` (`member | owner`), `invited_at`, `invited_by`, `accepted`, `accepted_at`.
- `lab_access_requests`: `user_id`, `email`, `message`, `status` (`pending | approved | declined`).
- Functions: `lab_invite`, `lab_remove`, `lab_decide_request` (owner only; keep the allowlist and
  `profiles.role` in step), `lab_request_access` (signed-in users). The sign-up trigger gives
  invited emails their role automatically.

**Add a member**: /lab/members → enter their email, pick Member (read-only) or Owner (can edit)
→ Add. If they already have an account it applies at once; otherwise when they first sign in
with that email. Change a role with the dropdown; Remove sends them back to a plain user.
Access requests appear at the top with Approve (adds them as a member) and Decline.
You can't remove or downgrade yourself (so the Lab always has an owner).

**Writing entries** (owner): /lab → New entry. Markdown on the left, live preview on the right;
it saves automatically a few seconds after you stop typing, and Ctrl/Cmd+S saves straight away.
New entries start as drafts (members don't see drafts). Experiments start with the template
sections Goal, Setup, What I tried, Result, Learnings, Next (buttons above the editor insert them).
Lab text can use the lesson blocks `Definition`, `Example`, `TryIt`, `KeyPoint`, `Explainer`,
`Term` and `ToolCard` with plain values (`name="…"`), but not `Quiz`, `{…}` code, imports or HTML
tags: Lab text is stored in the database, so it isn't allowed to run code
(`components/learn/safeMdx.ts`). Problems show as a notice naming the line.

**Promote to lesson** (owner, on an entry): a ready-to-save `content/lessons/<slug>.mdx` file
from the entry; then list the slug in a track in a `course.json`.

**Privacy**: Lab pages are rendered per request (never prerendered with content), marked
`noindex` (page metadata and an `X-Robots-Tag` header from `proxy.ts`), blocked in
`robots.txt`, and never in the sitemap or RSS feed.

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

- The six news items are samples (each file says so in a comment); replace them with real news.

@AGENTS.md
