# Production construction-gate release identity

2026-09-09 18:46 Pacific. READ-ONLY PREFLIGHT; deployment awaits coordinator release after banner QA. User explicitly requested production deployment to kooshapari.com.

## Verified identity

| Field | Current observation |
| --- | --- |
| CLI identity | kooshapari |
| Team scope | koosha-paridehpours-projects |
| Local and remote project | koosha-phenotype |
| Project ID | prj_UMFNTyksVcChjBQ7ccXHMAQGdPZe |
| Local organization ID | team_uMfxKsua6PPiWqtcD93kzO5r |
| Current production deployment / rollback candidate | dpl_GtD6XSCDxVzyQjKeLhgiUXuD8wt6 |
| Current production URL | https://koosha-phenotype-hxencf6vr-koosha-paridehpours-projects.vercel.app |
| Production state | Ready, created2026-09-03 04:45:53 Pacific |
| Associated aliases | kooshapari.com, www.kooshapari.com, koosha-phenotype.vercel.app, koosha-phenotype-koosha-paridehpours-projects.vercel.app |
| Sites marker | .openai/hosting.json absent |

Evidence commands: `vercel whoami`; `vercel inspect https://kooshapari.com`; `vercel project inspect koosha-phenotype`; local `.vercel/project.json` selected identity fields. No environment or token values read or printed. No new project, domain attachment or configuration mutation performed.

## Concrete publication route

Existing `vercel.json` sets buildCommand `npm run stage:publication`, outputDirectory `dist`, and clean route rewrites. Production command after coordinator release:

`npx --no-install vercel deploy --prod --yes --scope koosha-paridehpours-projects`

Run from this linked workspace. This builds and deploys the current allowlisted portfolio plus the construction gate; it is NOT a banner-only patch to the September3 deployment. Root must explicitly account for that scope when releasing the current candidate. Do not use the existing preview-target prebuilt output as production output without rebuilding for production.

Rollback command if authorized/required:

`npx --no-install vercel rollback dpl_GtD6XSCDxVzyQjKeLhgiUXuD8wt6 --yes --scope koosha-paridehpours-projects`

The rollback target is preserved metadata, not a performed rollback. CLI help confirms deployment-ID rollback support.

## Remaining release gates

Construction overlay implementation and keyboard/mobile/fresh-session Continue QA belong to their assigned workers. Confirm allowlisted output, exact candidate and coordinator release before deployment. Local prior repair gate55unit/6browser is pre-banner evidence and must not stand in for banner acceptance. Current production identity is verified via Vercel control-plane metadata; no browser inspection of the September3 site was performed in this lane.

## 18:57 canonical Git routing assessment - production HOLD

New user question proposes personal work in `KooshaPari/KooshaPari` linked to Vercel. Read-only findings:

| Surface | Verified state |
| --- | --- |
| GitHub repository | PUBLIC, default main, current SHA c87c7b63c1ca9a426e491a9aeb194a6df5a03de9, commit2026-09-04T08:19:17Z |
| Existing root | Already contains the portfolio HTML, scripts, styles, data, public assets, work/blog routes, tests and vercel.json. Preserve this history; do not initialize a replacement repository. |
| Root README | Existing GitHub profile biography and selected work/contribution links. Do not overwrite with site build instructions or a local handoff README. |
| Current remote vercel.json | outputDirectory is `.` and no staging buildCommand; older route definitions. This would need replacement with reviewed staging config before Git-driven deployment. |
| Current Vercel Git link | Authenticated GET `/v9/projects/prj_UMFNTyksVcChjBQ7ccXHMAQGdPZe`: link=null, rootDirectory=null, buildCommand=null, outputDirectory=null. Existing deployment project is not presently connected to Git through this field. |
| Targeted local discovery | Parent directory glob `[Kk]oosha*` finds only `koosha-phenotype`; no sibling KooshaPari checkout found. This is not a global worktree search. |
| Existing public non-site material | Tree includes docs, output/review captures, evidence archive and recruiting-funnel. Paths prove presence only; private content was not inspected or asserted. Web build exclusion cannot make public Git contents private. |

Recommended layout: retain site at repository root because it already lives there. A new `website/` subtree would require relocating an existing app and changing the build root, adding migration risk without demonstrated benefit here. Keep the profile README at root as-is. Public personal biography/site may belong here; private ResVault, transcripts, recruiter exports, raw network data and private resume source do not.

Proposed preserve-first transfer, NOT executed:

1. Make a separate checkout of existing main, preserving remote ancestry and the local non-Git working directory as a source snapshot. Use a review branch; compare before copying.
2. Explicitly reconcile public HTML entrypoints, `scripts/`, `styles/`, `data/`, `public/`, `work/`, `blog/`, favicon/robots/sitemap, package manifests/lockfile, staged-build vercel.json and public-safe tests/config. Inspect content in each category; directory names alone are not privacy approval. Editable asset sources require rights/content review before inclusion.
3. Exclude local `docs/`, `output/`, `.playwright-cli/`, `.vercel/`, private source/memory/research files and raw career data from new publication. Preserve the remote profile README. Do not delete existing remote non-site material or rewrite history in this transfer; assess any public-data issue separately.
4. Review the exact diff and staged output; then, only with authorized release, connect THIS existing Vercel project to THIS existing repository/main, root `.`, with reviewed staging build/output config. Do not create a new project or domain.
5. Confirm trigger behavior before pushing/connecting because Git integration can start deployments. Retain the existing production rollback ID above.

No clone/init, commit, push, Git connection, deployment or remote configuration mutation was performed. Production remains held pending coordinator routing decision and banner QA.
