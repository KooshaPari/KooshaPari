# Link audit

## Local checks

- Navigation hash routes: PASS.
- Project detail links: PASS for all records in `data/projects.js`.
- Static `robots.txt` and `sitemap.xml`: HTTP 200 locally.
- Retained local project assets: HTTP 200 locally.
- Contact mailto, GitHub, LinkedIn, and source-page links are intentionally external.

## Deferred external checks

Vercel preview is SSO-protected from this environment, so authenticated external-link and social-preview checks remain pending. No internal broken link was observed in browser smoke testing.
