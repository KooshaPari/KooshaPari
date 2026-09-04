# Human review

## Preview

- Local: `http://127.0.0.1:4173/index.html`
- Vercel preview: `https://koosha-phenotype-fq7j17mjj-koosha-paridehpours-projects.vercel.app`
- Deployment: `dpl_FPuX9q4xCM9tKZkR1KXLD4Zgcenv`

## What changed

- Replaced generic priority detail copy with project-specific narratives.
- Added NetWeave as a full engineering candidate; its evidence attachments are explicitly deferred and non-blocking.
- Added skip link, reduced-motion support, dynamic SPA metadata, and final screenshot pack under `output/review-final/`.

## Review pages

Home, Engineering, Product, Work, GMK Arch, WITF, ShareCLI, Substrate, phenotype-omlx, NetWeave, Resume, Contact, and 404.

## Caveats and decisions

- NetWeave Doc/MP4/screenshots/simulation/ControlNet artifacts remain deferred.
- Resume PDFs are not present locally; HTML selection cards remain.
- Vercel preview is deployed but currently SSO-protected. Unauthenticated requests return a 302 to Vercel SSO; the deployment itself is Ready. Independent public-host metadata checks require a Vercel team member session or disabling Deployment Protection in the project settings. The previous 404 was fixed by explicitly deploying the repository root rather than the image-only `public/` directory.
- No DNS, production redirects, or legacy retirement were changed.

## Gate

STATUS: READY FOR HUMAN PRODUCTION REVIEW
