# Content

All site content lives here as files. To add content, add a file to the right
folder. No code changes are needed: the site picks up new files automatically.

- The file name (without extension) becomes the item's ID / web address,
  so use lowercase words separated by hyphens: `what-is-machine-learning.md`.
- Files or folders starting with `_` are ignored (handy for drafts).
- If a required field is missing, the site shows an error naming the file.

---

## lessons/ — Markdown (`.md`)

The part between the `---` lines is the lesson's details ("frontmatter");
the lesson text goes below it.

| Field         | Required | Type                                         | Example                 |
| ------------- | -------- | -------------------------------------------- | ----------------------- |
| `title`       | yes      | text                                         | `What is AI?`           |
| `summary`     | yes      | text (one or two sentences)                  | `A plain-English intro` |
| `level`       | yes      | `beginner` / `intermediate` / `advanced`     | `beginner`              |
| `order`       | yes      | number (lessons are sorted by this)          | `1`                     |
| `duration`    | no       | minutes, number                              | `8`                     |
| `tags`        | no       | list of text                                 | `[basics, history]`     |
| `draft`       | no       | `true` hides the lesson from the site        | `false`                 |

## glossary/ — JSON (`.json`)

| Field        | Required | Type                                    |
| ------------ | -------- | --------------------------------------- |
| `term`       | yes      | text                                    |
| `definition` | yes      | text                                    |
| `aliases`    | no       | list of other names for the term        |
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
