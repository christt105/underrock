# Underrock

Underrock is an Obsidian plugin for exporting notes to PDF, in the spirit of Overleaf: a paginated preview next to the note, fine control over typography, and a well-defined, reproducible result.

It is in early development. On desktop, the *Export current note to PDF* command renders the active note with Obsidian's own renderer (math, callouts, diagrams and other plugins' output included), paginates it and saves a PDF wherever you choose. Page size, orientation, margins, language and how links to other notes appear are set in the plugin settings. *Show installed version* tells you which build BRAT installed.

## Install with BRAT

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) community plugin.
2. In BRAT, choose *Add beta plugin* and enter `christt105/underrock`.
3. Enable Underrock under Settings → Community plugins.

### Testing a pull request

Every pull request publishes a preview pre-release tagged `X.Y.Z-beta.<run>.pr<number>`, and a bot comment on the pull request shows the current tag. In BRAT, choose *Add beta plugin with frozen version*, enter `christt105/underrock` and that tag. Each push to the pull request replaces the preview, and closing the pull request deletes it.

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

### Page breaks

Headings stay with the content that follows them, and short code blocks, images, display math and table rows are not split. To force a page break, put `<div class="page-break"></div>` on its own line in the note (`<div style="page-break-after: always;"></div>` works too).

### Layout

- `src/main.ts`: plugin entry point.
- `src/render/`: the render pipeline, from a note to standalone HTML with its own stylesheet.
- `src/pagination/`: page setup, page-break rules and the Paged.js document.
- `src/engines/`: PDF engines behind the `PdfEngine` interface. `html/` prints the paged document with Electron; a Typst engine can come later.
- `src/export/`: the export command, and the `DocumentBuilder` shared with the preview.
- `src/pdf/`: PDF post-processing with pdf-lib.
- `src/settings/`: plugin settings, on Obsidian's declarative settings API.
- `src/preview/`: the paginated preview view.

### Releasing

`npm version <x.y.z>` bumps `manifest.json` and `versions.json`, commits and creates the tag. Pushing the tag runs the release workflow, which attaches `main.js`, `manifest.json` and `styles.css` to a GitHub Release. Tags with `-alpha` or `-beta` are published as pre-releases.

## License

[MIT](LICENSE)
