# Content

All site content lives here as files. To add content, add a file to the right
folder. No code changes are needed: the site picks up new files automatically.

- The file name (without extension) becomes the item's ID / web address,
  so use lowercase words separated by hyphens: `what-is-machine-learning.md`.
- Files or folders starting with `_` are ignored (handy for drafts).
- If a required field is missing, the site shows an error naming the file.

---

## lessons/ — MDX (`.mdx`)

Each lesson is one `.mdx` file: Markdown, plus the lesson blocks below. The
part between the `---` lines is the lesson's details ("frontmatter"); the
lesson text goes below it. Use `##` for section headings: they appear in the
lesson's "On this page" list.

```mdx
---
title: What is AI, really?
slug: what-is-ai
level: 0
order: 1
duration: 9
summary: One or two sentences shown on the learning path.
tags: [basics, introduction]
prerequisites: []
---

## First section

Plain Markdown text…
```

| Field           | Required | Type                                                      | Example                 |
| --------------- | -------- | --------------------------------------------------------- | ----------------------- |
| `title`         | yes      | text                                                      | `What is AI, really?`   |
| `slug`          | no       | the lesson's web address; defaults to the file name       | `what-is-ai`            |
| `level`         | yes      | a level number from `lessons/_levels.json`                | `0`                     |
| `order`         | yes      | number; position within its level                         | `1`                     |
| `duration`      | yes      | reading time in minutes                                   | `9`                     |
| `summary`       | yes      | text (one or two sentences)                               | `A plain-English intro` |
| `tags`          | no       | list of text                                              | `[basics, history]`     |
| `prerequisites` | no       | list of other lessons' slugs to read first                | `[what-is-ai]`          |
| `draft`         | no       | `true` hides the lesson from the site                     | `false`                 |

### Levels — `lessons/_levels.json`

The learning path's levels, in order. Each has a `level` number, a `title`
and a `description`. Levels without lessons show as "coming soon".

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
