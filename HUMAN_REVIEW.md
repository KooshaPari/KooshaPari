# Human review

## Preview

- Local: `http://127.0.0.1:4173/index.html`
- Vercel preview: `https://koosha-phenotype-m9yccemn8-koosha-paridehpours-projects.vercel.app`
- Deployment: `dpl_6L8ySBj7X8qu3t8gzr1KNsuYYDzo` (preview target, Ready)

## What changed

- Replaced generic priority detail copy with project-specific narratives.
- Added NetWeave as a full engineering candidate; its evidence attachments are explicitly deferred and non-blocking.
- Added skip link, reduced-motion support, dynamic SPA metadata, and a refreshed final screenshot pack under `output/technical-atelier-review/final/`.
- The local review gate was refreshed on 2026-09-04: 28/28 Node tests, JavaScript checks, and the Vercel static-output parity contract pass after `vercel build --yes`. Local rewrite-capable browser review covers Home, Engineering, Product, Work, GMK Arch, WITF, ShareCLI, phenotype-omlx, NetWeave, Resume, mobile views, project-detail paths, and the Work filter focus restoration.

## Review pages

Home, Engineering, Product, Work, GMK Arch, WITF, ShareCLI, Substrate, phenotype-omlx, NetWeave, Resume, Contact, and 404.

## Caveats and decisions

- NetWeave Doc/MP4/screenshots/simulation/ControlNet artifacts remain deferred.
- Resume PDFs are not present locally; HTML selection cards remain.
- The current preview is the locally rebuilt static output, deployed with `vercel deploy --prebuilt --yes --target=preview`. Hosted `/`, `/work`, `/work/sharecli`, and `/resume` return 200; Home and ShareCLI titles were checked in a browser. An unknown project path returns a hosted 404. The previous 404 was fixed by explicitly deploying the repository root rather than the image-only `public/` directory.
- No DNS, production redirects, or legacy retirement were changed.

## Gate

STATUS: READY FOR HUMAN PRODUCTION REVIEW
