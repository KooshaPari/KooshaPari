# Production cutover plan (not executed)

1. Confirm human approval and final content/evidence review.
2. Attach `kooshapari.com` to the approved Vercel project; do not reuse the preview alias as canonical.
3. Set DNS records at the current DNS provider using Vercel's supplied values and preserve a rollback snapshot.
4. Activate only redirect-map rows marked READY after destination parity passes.
5. Keep `projects.kooshapari.com` and `phenotype.space` live until their roles are explicitly resolved.
6. Recheck TLS, canonical tags, sitemap, robots, deep links, assets, and contact/resume paths.
7. Retire Adobe/Ram Designs only after a separate preservation and rollback review.

Rollback: remove the Vercel domain attachment, restore the prior DNS records and redirect configuration, and keep all legacy origins live while validation is repeated.
