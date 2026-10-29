# Content

All site content lives here as files. To add content, add a file to the right
folder. No code changes are needed: the site picks up new files automatically.

- The file name (without extension) becomes the item's ID / web address,
  so use lowercase words separated by hyphens: `what-is-machine-learning.md`.
- Files or folders starting with `_` are ignored (handy for drafts).
- If a required field is missing, the site shows an error naming the file.

---

## How Learn is organised

**Course → Track → Level (0–3) → Lesson.**

- A **course** is one file: `courses/<course-slug>/course.json`.
- A course has one or more **tracks** (paths through it).
- Each track has **levels 0–3** (Foundations, Core Concepts, Hands-on, Build Things),
  and each level lists its **lessons** in order, by slug.
- **Lessons** live in `lessons/`, as one shared pool. A lesson doesn't say where it
  belongs: tracks list it. The same lesson can appear in several tracks or courses.

Web addresses: `/learn/<course>/<track>/<lesson>`.

## courses/ — JSON (`course.json` in a folder per course)

The folder name is the course's slug (web address). To add a course, copy
another course's folder, rename it, and edit the file.

**Course with several tracks** (shows a "choose your path" page):

```json
{
  "title": "Claude Certification Prep",
  "description": "One or two sentences.",
  "icon": "badge-check",
  "accent": "blue",
  "tags": ["claude", "certification"],
  "status": "draft",
  "tracks": [
    {
      "slug": "mcp",
      "title": "Model Context Protocol",
      "description": "One sentence about this track.",
      "levels": [
        { "level": 0, "lessons": ["lesson-slug", "another-lesson-slug"] },
        { "level": 1, "lessons": [] },
        { "level": 2, "lessons": [] },
        { "level": 3, "lessons": [] }
      ]
    }
  ]
}
```

**Course with one track**: leave out `tracks` and put `levels` directly in the
course. It gets a single track called `main`, named after the course, and the
course page goes straight to it.

```json
{
  "title": "AI from Zero",
  "description": "…",
  "icon": "sparkles",
  "accent": "teal",
  "tags": ["beginner"],
  "status": "published",
  "levels": [{ "level": 0, "lessons": ["what-is-ai", "how-language-models-work"] }]
}
```

| Field         | Required | Type                                                                 |
| ------------- | -------- | -------------------------------------------------------------------- |
| `title`       | yes      | text                                                                 |
| `description` | yes      | text (one or two sentences)                                          |
| `status`      | yes      | `published`, or `draft` (hidden unless `SHOW_DRAFTS=true`)           |
| `icon`        | no       | an icon name from lucide.dev/icons                                   |
| `accent`      | no       | `teal`, `blue`, `amber`, `rose` or `accent` (the theme's own colour) |
| `tags`        | no       | list of text (used by the catalogue's topic filter)                  |
| `tracks`      | no       | list of tracks (see below); leave out for a one-track course         |
| `levels`      | no       | only for a one-track course, instead of `tracks`                     |

Each **track**: `slug` (required, lowercase-with-hyphens, unique in the course),
`title` (required), `description`, and `levels`.

Each **level**: `level` (0–3, required) and `lessons` (lesson slugs, in order).
Optionally `title` and `description` to rename that level for this track only.
Levels you leave out show as "coming soon". A lesson can be listed only once per track.

Errors name the file: an unknown lesson slug, a level that doesn't exist, a
duplicate track slug, a bad `status` or `accent`.

### Levels — `courses/_levels.json`

The default name and description of each level (0–3), used by every track
unless the track renames a level.

## lessons/ — MDX (`.mdx`)

Each lesson is one `.mdx` file: Markdown, plus the lesson blocks below. The
part between the `---` lines is the lesson's details ("frontmatter"); the
lesson text goes below it. Use `##` for section headings: they appear in the
lesson's "On this page" list.

```mdx
---
title: What is AI, really?
slug: what-is-ai
duration: 9
summary: One or two sentences shown on the learning path.
tags: [basics, introduction]
prerequisites: []
icon: sparkles
---

## First section

Plain Markdown text…
```

| Field           | Required | Type                                                      | Example                 |
| --------------- | -------- | --------------------------------------------------------- | ----------------------- |
| `title`         | yes      | text                                                      | `What is AI, really?`   |
| `slug`          | no       | the lesson's web address; defaults to the file name       | `what-is-ai`            |
| `duration`      | yes      | reading time in minutes                                   | `9`                     |
| `summary`       | yes      | text (one or two sentences)                               | `A plain-English intro` |
| `tags`          | no       | list of text                                              | `[basics, history]`     |
| `prerequisites` | no       | list of other lessons' slugs to read first                | `[what-is-ai]`          |
| `icon`          | no       | an icon name from lucide.dev/icons                        | `brain-circuit`         |
| `draft`         | no       | `true` hides the lesson from the site                     | `false`                 |

A lesson's level and position come from the tracks that list it (see `courses/`),
not from the lesson file. A lesson no track lists has no page.

### Lesson blocks

Put a blank line before and after each block. Text inside a block can use Markdown.

| Block | What it's for | How to write it |
| ----- | ------------- | --------------- |
| Definition | A term and its plain-English meaning. Links to the glossary automatically if the term (or an alias) is there. | `<Definition term="Token">A small piece of text…</Definition>` |
| Term | Links a word in a sentence to the glossary. | `<Term>tokens</Term>` or `<Term slug="large-language-model">LLMs</Term>` |
| Example | A concrete, worked example. | `<Example title="Teaching a spam filter">…</Example>` |
| TryIt | Step-by-step "do this yourself". Write the steps as a numbered list. Free/open-source tools only. | `<TryIt title="…">` then `1. …` `2. …` then `</TryIt>` |
| KeyPoint | The one takeaway to remember. | `<KeyPoint>…</KeyPoint>` |
| Quiz | 2–4 multiple-choice questions with instant feedback. `answer` is the right option's position, counting from 1. `explanation` is optional. | see below |
| Explainer | An interactive animation, by name (see `components/explainers/registry.ts`). | `<Explainer name="tokenization" />` |

```mdx
<Quiz
  questions={[
    {
      question: "What is a language model trained to do?",
      options: ["Look things up", "Predict the next token", "Understand the world"],
      answer: 2,
      explanation: "Everything it does is built on predicting what comes next.",
    },
    {
      question: "…",
      options: ["…", "…"],
      answer: 1,
    },
  ]}
/>
```

Inside lesson text, avoid the characters `{` `}` and `<` outside of blocks
(they have special meaning in MDX). Wrap them in backticks if you need them.

## glossary/ — JSON (`.json`)

The file name is the term's ID (used in links: `/learn/glossary#token`).

| Field        | Required | Type                                    |
| ------------ | -------- | --------------------------------------- |
| `term`       | yes      | text                                    |
| `definition` | yes      | text                                    |
| `aliases`    | no       | list of other names for the term (used for search and linking) |
| `related`    | no       | list of other glossary file names       |

## news/ — Markdown (`.md`)

| Field       | Required | Type                                        |
| ----------- | -------- | ------------------------------------------- |
| `title`     | yes      | text                                        |
| `summary`   | yes      | text                                        |
| `date`      | yes      | `"YYYY-MM-DD"` in quotes (newest shown first) |
| `source`    | no       | name of the original source                 |
| `sourceUrl` | no       | link to the original article                |
| `tags`      | no       | list of text                                |

## tools/ — JSON (`.json`)

| Field         | Required | Type                                  |
| ------------- | -------- | ------------------------------------- |
| `name`        | yes      | text                                  |
| `description` | yes      | text                                  |
| `url`         | yes      | full link, starting with `https://`   |
| `category`    | yes      | text, e.g. `Chat assistant`           |
| `pricing`     | no       | `free` / `freemium` / `paid`          |
| `tags`        | no       | list of text                          |
