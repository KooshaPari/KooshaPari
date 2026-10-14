# NetWeave specimen integration

Final preview: https://koosha-phenotype-bu9x6jl07-koosha-paridehpours-projects.vercel.app/work/netweave (`dpl_5G8aJBuxSy7oBTfYVyDXwyb4WCWN`, READY).

The previous preview returned the generic HTML SPA fallback for a missing `.blend` path, not scene bytes. Added `asset-sources/` to the catch-all rewrite exclusion in `vercel.json`, rebuilt, passed 33 tests and deployed the final preview. Final hosted browser assertions verify State 3 pressed state, selected poster decoding, private scene/doc paths returning 404 and route noindex. Final screenshot: `output/netweave-local-rules-v1/hosted-final-mobile-state3.png`.

September 5, 2026. Implemented six original WebP state images under `public/projects/netweave`, responsive picture selection, explicit state buttons with aria-pressed and polite state descriptions, and image failure explanation in `scripts/media/netweave-field.js`. Static HTML in `work/netweave.html` provides a poster and explanation without JavaScript. No motion loop, video download, WebGL dependency or automatic state changes are introduced.

Visible text identifies the amber block as a following vehicle and the rightmost blue block as stationary. The artwork is explicitly illustrative and does not claim measured NetWeave output or congestion-aware rerouting.

Local verification: Vercel preview build passed; npm test 33/33; npm run check passed. Browser exercised State 3, keyboard Enter on State 1, 390x844 reduced-motion display, and a separate JavaScript-disabled page context. Screenshots are `output/netweave-local-rules-v1/integration-mobile.png` and `integration-nojs.png`. Mobile screenshot was opened: all image content and three controls fit the narrow layout. The portrait has substantial internal negative space, retained from the reviewed composition. This is not a measured performance or user-task-success claim.

Local Python server does not implement clean-URL fallback; interactive review mounted the actual project view after setting its expected pathname. Hosted clean-route acceptance subsequently passed at the preview below. The optional film is retained offline and was not integrated or accepted for playback.

Sources, scene and verification records remain outside public output; only six WebP derivatives were added to publication. No production or DNS changes were made.

## Preview evidence, September 5 at 04:53 PDT

Deployment `dpl_5u6yhpbgyNRtsTaE4aFUzRmPW5tP` is READY at https://koosha-phenotype-np1e530hx-koosha-paridehpours-projects.vercel.app . `vercel deploy --prebuilt -y` exited 0. Authenticated CLI HTTP checks returned 200 for `/work/netweave`, 200 image/webp for `/public/projects/netweave/mobile-03.webp` (12,398 bytes), and 404 for this private documentation path. Responses carry `x-robots-tag: noindex`.

Real browser navigation to hosted `/work/netweave` produced the correct NetWeave page title. State 3 click, its pressed state, and decoding the selected 03.webp image were checked with explicit throwing assertions. Hosted mobile screenshot: `output/netweave-local-rules-v1/hosted-mobile-state3.png`. A first source-exclusion request used an invalid relative API URL and was retried with the absolute preview URL; this did not affect completed state/image assertions.
