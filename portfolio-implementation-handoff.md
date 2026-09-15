# Portfolio implementation handoff

## Career context import complete (2026-09-05)

Read [Anduril career context](docs/CAREER_CONTEXT_ANDURIL_2026-09-05.md) before
changing resume/profile positioning. It pins the exact downloaded conversation,
hash, tracked reading coverage, historical corrections and tentative ownership
boundary. The source is fully read at 39,449/39,449 lines; direct user facts
remain distinct from historical assistant recommendations and unverified
claims. This internal document is excluded from publication with the rest of
`docs/`.

## Evidence-gated terminal playback (2026-09-06)

[`docs/TERMINAL_PLAYBACK_EVIDENCE_2026-09-06.md`](docs/TERMINAL_PLAYBACK_EVIDENCE_2026-09-06.md)
records a no-go for presenting a historical terminal recording. Available
ShareCLI CLI-help and headless-Ratatui fixtures support only a labelled static
reference; they do not prove an interactive capture. Real playback remains
blocked until an attributable capture or reproducible recorded run is supplied.

## Preview status

Local preview verified at `http://127.0.0.1:4173/index.html`. Non-production Vercel preview is ready at `https://koosha-phenotype-fq7j17mjj-koosha-paridehpours-projects.vercel.app` (`dpl_FPuX9q4xCM9tKZkR1KXLD4Zgcenv`). No DNS change, redirect activation, or legacy retirement occurred.

### Latest review preview (2026-09-05)

The current authenticated review preview is `https://koosha-phenotype-by318kyrh-koosha-paridehpours-projects.vercel.app` (deployment `dpl_7121kBU5ChY2SChRhvoFE6J9zpss`; [inspection](https://vercel.com/koosha-paridehpours-projects/koosha-phenotype/7121kBU5ChY2SChRhvoFE6J9zpss)). It was deployed with `npx vercel deploy --prebuilt --yes`; no `--prod` flag, domain attachment, DNS update, redirect activation, legacy mutation, or source-evidence mutation was used.

Hosted verification on that deployment recorded: `/`, `/work/sharecli`, and `/resume` return `200`; `/work/sharecli.html` returns `308` to `/work/sharecli`; `/not-a-real-route` returns the SPA document for its explicit client 404; and `/public/projects/witf/hero-01.jpg` returns `200 image/jpeg`. All inspected preview responses include `x-robots-tag: noindex`. `/EVIDENCE_LEDGER.md`, `/tests/router.test.js`, and `/docs/superpowers/plans/2026-09-01-technical-atelier-redesign.md` return Vercel `404`, while the staged output contains none of the excluded tests, docs, output artifacts, browser artifacts, or internal status/evidence documents. OmniRoute's static OpenGraph title was verified as `OmniRoute — Koosha Paridehpour`.

## Implemented routes/views

- Home (`#home`)
- Engineering (`#engineering`)
- Product (`#product`)
- Work with accessible filters (`#work`)
- Project details (`#work/<slug>`)
- Resume (`#resume`)
- Contact (`#contact`)

## Implemented content

Shared records cover GMK Arch, WITF, ShareCLI, Substrate, phenotype-omlx, **NetWeave**, BytePort, Tracera, DSS Cipher, attributed forks, and archive entries. GMK Arch, WITF, and DSS Cipher use local archived assets. NetWeave is a full engineering case-study candidate with a dedicated narrative, explicit future-work boundaries, experimental image-to-network workflow framing, and AI-assistance disclosure.

## Local publication boundary (2026-09-05)

`vercel.json` builds `dist/` through `npm run stage:publication`. The staging script allowlists only deployable HTML routes, runtime scripts, CSS, data, public media, favicon, robots, and sitemap. It deliberately excludes `tests/`, `docs/`, `output/`, `.playwright-cli/`, implementation reports, and evidence ledgers from `.vercel/output/static`; those files remain preserved in the repository. Local `vercel build --yes` and the static-output contract passed with this boundary. No preview was redeployed.

Resume remains an HTML selection because no canonical resume PDF was supplied; the public page does not advertise a nonexistent download. Resume links to the Engineering and Product/Program routes. Contact retains direct mail, GitHub, and LinkedIn anchors. Unknown top-level paths and unknown project slugs use a navigable 404 view. OmniRoute renders the approved contribution record and its existing evidence/provenance qualifiers; it does not claim ownership, maintainer status, or an internal audit integration.

## Verification artifacts

- `output/playwright/home-desktop.png`
- `output/playwright/home-mobile.png`
- `output/playwright/engineering.png`
- `output/playwright/product.png`
- `output/playwright/work.png`
- `output/playwright/gmk-arch.png`
- `output/review-final/` contains the final desktop/mobile review screenshot pack, including NetWeave and resume.
- JavaScript syntax checks pass with `node --check`.
- Static server smoke checks return HTTP 200 for the app and used assets.
- Browser snapshots confirm navigation, filters, project detail routing, metric cards, and responsive mobile layout.
- Browser snapshot confirms `#work/netweave` renders the full narrative sections, evidence-status caveat, and AI-assistance disclosure; Engineering/selected-work ordering includes NetWeave above compact entries.
- NetWeave also renders a text architecture diagram for the graph/automata/WebSocket boundary.
- Explicit 404 state for unknown project slugs and static `robots.txt`/`sitemap.xml` are implemented.

## Remaining work before production review

- Review/attach timestamped NetWeave Doc, MP4, screenshots, simulation output, and ControlNet artifacts before public publication; the supplied brief remains canonical user evidence until then.
- Expand remaining generic detail copy into final reviewed case-study narratives.
- Add canonical resume PDF links when artifacts are approved.
- Run Lighthouse and a dedicated accessibility audit.
- Verify metadata/canonical tags and redirect parity in a deployed preview.
- Obtain human approval before DNS or production redirect changes.
- The prior hosted 404 was caused by Vercel auto-selecting the image-only `public/` directory as its output. `vercel.json` now uses an explicit allowlisted staging output; local Vercel build verification confirms the static output includes the required routes, scripts, styles, data, and public media without internal review material. Preview protection still returns unauthenticated users to Vercel SSO (HTTP 302, `x-robots-tag: noindex`), so hosted metadata/Lighthouse review requires authenticated access or disabling Deployment Protection.
