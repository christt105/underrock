# Underrock

Underrock is an Obsidian plugin for exporting notes to PDF, in the spirit of Overleaf: a paginated preview next to the note, fine control over typography, and a well-defined, reproducible result.

It is in early development. *Open PDF preview* (command or ribbon icon) shows the active note as paginated pages in a split next to it, refreshed as you type. On desktop, *Export current note to PDF* (or the preview's export button) renders the active note with Obsidian's own renderer (math, callouts, diagrams and other plugins' output included), paginates it and saves a PDF wherever you choose. Page size, orientation, margins, fonts (including your own font files), sizes per heading level, line height, colours, page numbers, header and footer, language and how links to other notes appear are set in the plugin settings, and can be overridden per note. *Show installed version* tells you which build BRAT installed.

## Install with BRAT

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) community plugin.
2. In BRAT, choose *Add beta plugin* and enter `christt105/underrock`.
3. Enable Underrock under Settings → Community plugins.

### Testing a pull request

Every pull request publishes a preview pre-release tagged `X.Y.Z-beta.<run>.pr<number>`, and a bot comment on the pull request shows the current tag. In BRAT, choose *Add beta plugin with frozen version*, enter `christt105/underrock` and that tag. Each push to the pull request replaces the preview, and closing the pull request deletes it.

## Per-note settings

Any setting can be overridden for a single note with an `underrock` property in its frontmatter, using the same structure as the plugin settings. Unknown keys and invalid values are ignored.

```yaml
---
lang: es
underrock:
  page:
    size: Letter
    landscape: true
  typography:
    bodyFont: Literata
    bodySize: 12
    h1Size: 24
    lineHeight: 1.4
---
```

`page` takes `size` (`A4`, `A5`, `Letter`, `Legal`), `landscape` and `marginTopMm`, `marginRightMm`, `marginBottomMm`, `marginLeftMm`. `typography` takes `bodyFont`, `headingFont`, `codeFont`, `bodySize`, `h1Size` to `h6Size` (points), `lineHeight`, `textColor`, `headingColor` (`#rrggbb`) and `fontsFolder`. `headerFooter` takes `pageNumbers`, `pageNumberPosition` (`top-left` to `bottom-right`), `pageNumberFormat`, `header`, `headerPosition`, `footer`, `footerPosition` (`left`, `center`, `right`) and `onFirstPage`. Header, footer and page number accept `{page}`, `{pages}`, `{title}`, `{date}` (the note's `date` property, or today) and `{section}` (the current level 1 or 2 heading).
`template` and `templatesFolder` take a template name and a vault folder. `toc` takes `enabled`, `depth` (1 to 6) and `title`, and `bookmarks` is `true` or `false`.

## Templates

A template sets the base look of the document, like a LaTeX document class. Three come with the plugin: *Article* (the default), *Report* (each level 1 heading starts a new page, justified text, larger headings) and *Minimal* (sans-serif, compact, plain callouts). Choose one in the settings, or per note with `template` in the `underrock` property:

```yaml
underrock:
  template: report
```

To make your own, set a *Templates folder* and put CSS files in it. Each file becomes a template named after the file, so `Thesis.css` is used with `template: Thesis`. A file with the same name as a built-in template replaces it. Relative URLs in the CSS, such as fonts or images, resolve from the file's folder. A template is applied before the typography settings: settings left at their default follow the template, and the ones you change win.

A template can override any CSS rule of the document, and these variables:

| Variable | Default | Use |
|---|---|---|
| `--ur-font-body` | Charter, Georgia, serif | Body text |
| `--ur-font-heading` | the body font | Headings |
| `--ur-font-code` | JetBrains Mono, monospace | Code |
| `--ur-size-body` | `11pt` | Body text size |
| `--ur-size-h1` to `--ur-size-h6` | `22pt`, `17pt`, `14pt`, `12pt`, `11pt`, `11pt` | Heading sizes |
| `--ur-size-code` | `0.88em` | Code size, relative to the text around it |
| `--ur-line-height` | `1.5` | Line height |
| `--ur-paragraph-spacing` | `0.6em` | Space after paragraphs, lists, tables and blocks |
| `--ur-color-text` | `#1a1a1a` | Text |
| `--ur-color-heading` | the text colour | Headings |
| `--ur-color-muted` | `#5c5c5c` | Quotes, finished tasks, footnotes, header and footer |
| `--ur-color-accent` | `#2b5797` | Links |
| `--ur-color-border` | `#d0d0d0` | Rules, quote and embed bars, table borders |
| `--ur-color-code-bg` | `#f5f5f5` | Code and table header background |

Page size and margins come from the page settings, not from the template.

## Table of contents and bookmarks

Turn on *Table of contents* to open the document with a page that lists the note's headings, down to the chosen depth, with the page each one starts on. Each entry links to its heading. Exported PDFs also get a bookmark for every heading, nested by level, unless *PDF bookmarks* is off.

## Page breaks

Headings and callout titles stay with the content that follows them, and short code blocks, images, display math and table rows are not split. To force a page break, put `<div class="page-break"></div>` on its own line in the note (`<div style="page-break-after: always;"></div>` works too).

## Development

Requires Node.js 22 or later.

```sh
npm install
npm run dev          # rebuild main.js on every change
npm run lint
npm run typecheck
npm test             # unit tests
npm run test:layout  # pagination tests in headless Chromium
npm run build        # typecheck and production bundle
```

To try it in a vault, clone the repository into `<vault>/.obsidian/plugins/underrock/`, run `npm run dev` there and enable the plugin. The [Hot Reload](https://github.com/pjeby/hot-reload) plugin reloads it on every rebuild.

Unit tests use [Vitest](https://vitest.dev) and live next to the code as `*.test.ts`. The `obsidian` package only ships type definitions, so tested modules must not import it at runtime. Layout tests (`*.layout.test.ts`) paginate documents with Paged.js in Chromium through Playwright and check page breaks and the printed PDF; run `npx playwright install chromium` once before the first run.

### Layout

- `src/main.ts`: plugin entry point.
- `src/render/`: the render pipeline, from a note to standalone HTML with its own stylesheet.
- `src/pagination/`: page setup, page-break rules and the Paged.js document.
- `src/engines/`: PDF engines behind the `PdfEngine` interface. `html/` prints the paged document with Electron; a Typst engine can come later.
- `src/export/`: the export command, and the `DocumentBuilder` shared with the preview.
- `src/pdf/`: PDF post-processing with pdf-lib.
- `src/settings/`: plugin settings, on Obsidian's declarative settings API, and the per-note overrides.
- `src/typography/`: typography settings turned into CSS variables and `@font-face` rules.
- `src/running/`: page numbers, header and footer as `@page` margin boxes.
- `src/preview/`: the paginated preview view, which loads the same document as the export into an iframe.

### Releasing

`npm version <x.y.z>` bumps `manifest.json` and `versions.json`, commits and creates the tag. Pushing the tag runs the release workflow, which attaches `main.js`, `manifest.json` and `styles.css` to a GitHub Release. Tags with `-alpha` or `-beta` are published as pre-releases.

## License

[MIT](LICENSE)
