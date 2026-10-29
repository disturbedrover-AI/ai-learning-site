# AI Learning Site

A calm, friendly website that helps non-technical people learn about artificial
intelligence:

- **Learn**: courses made of short lessons, climbing four levels from Foundations to
  building things, with interactive explainers, quizzes and a glossary.
- **News**: curated posts that explain why each story matters, plus a **Radar** of
  fresh headlines pulled automatically from AI blogs and feeds.
- **Tools**: a hand-picked directory of AI tools, focused on free and open-source ones.
- **Lab**: a private workspace for the owner and invited members (experiments, tips,
  notes and snippets), stored in Supabase.

Four themes (Light, Dark, Warm Sand, Mist), optional accounts with Supabase, and all
content kept as plain files in `content/`.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Framer Motion,
next-themes, MDX and Supabase.

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

- Settings go in `.env.local` (copy `.env.example`; every variable is explained there).
  All are optional: without them the site runs with no accounts, and progress is
  saved in the browser.
- To preview draft courses, run
  `SHOW_DRAFTS=true npm run dev` (or set `SHOW_DRAFTS=true` in `.env.local`).
- Other commands: `npm run build` (production build), `npm run lint`.

## Adding content

Everything is a file in `content/`; no code changes needed. Full field lists and
examples are in [`content/README.md`](content/README.md); step-by-step guides are in
[`CLAUDE.md`](CLAUDE.md).

| To add… | Do this | Guide in CLAUDE.md |
| --- | --- | --- |
| A lesson | Add `content/lessons/<slug>.mdx`, then list its slug in a track's level in a `course.json` | "Learn section" → Add a lesson |
| A course or track | Copy a folder in `content/courses/` and edit `course.json` | "Learn section" → Add a course / Add a track |
| A glossary term | Add `content/glossary/<term>.json` | "Learn section" → Add a glossary term |
| An interactive explainer | Add a component in `components/explainers/` and one line in `registry.ts` | "Learn section" → Add an explainer |
| A news post | Add `content/news/<yyyy-mm-dd>-<slug>.md` | "News and tools" → Add a news item |
| A Radar source | Add an entry to `content/news-sources.json` | "News Radar" → Add a source |
| A tool | Add `content/tools/<slug>.md` | "News and tools" → Add a tool |
| A theme | Add a block to `app/themes.css` and one line to `lib/themes.ts` | "Theme rules" |

## Deploying

The site deploys to Vercel as a standard Next.js project. Add the environment
variables you use from `.env.example` in Vercel (Project → Settings → Environment
Variables). Accounts need the one-time Supabase setup described in `CLAUDE.md`
under "Accounts (Supabase)".

See [`CLAUDE.md`](CLAUDE.md) for the full project guide and its rules.
