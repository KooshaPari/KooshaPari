# Portfolio implementation handoff

## Preview status

Local preview verified at `http://127.0.0.1:4173/index.html`. Non-production Vercel preview is ready at `https://koosha-phenotype-fq7j17mjj-koosha-paridehpours-projects.vercel.app` (`dpl_FPuX9q4xCM9tKZkR1KXLD4Zgcenv`). No DNS change, redirect activation, or legacy retirement occurred.

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
- The prior hosted 404 was caused by Vercel auto-selecting the image-only `public/` directory as its output. `vercel.json` now explicitly deploys the repository root; local Vercel build verification confirms the static output includes `index.html`, scripts, and styles. Preview protection still returns unauthenticated users to Vercel SSO (HTTP 302, `x-robots-tag: noindex`), so hosted metadata/Lighthouse review requires authenticated access or disabling Deployment Protection.
