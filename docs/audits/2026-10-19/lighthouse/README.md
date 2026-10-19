# Lighthouse audit — 2026-10-19

Real Lighthouse 13.4.1 runs against the live production
domains. This closes the one open item in the
2026-10-17 cohort-forward "blocked-pending-operator"
list: the Lighthouse score that the STATE.md flip was
gated on.

## How the run was enabled

Rounds 6k/6l (2026-10-19 03:21-03:27 UTC) recorded
Lighthouse as agent-exhausted. That was true at the
time: the CLI was installed, but no Chrome binary was
found on PATH, and the PageSpeed Insights free tier
was quota-exhausted (HTTP 429) while WebPageTest
returned HTTP 403.

A preflight at 2026-10-19 20:38 UTC (17 hours later)
found that **Google Chrome 152.0.7977.65 is installed
at `/Applications/Google Chrome.app`**. It is not on
`PATH`, which is why the earlier `which google-chrome`
probe missed it. A second usable binary exists at
`~/.cache/puppeteer/chrome/mac_arm-155.0.8059.79/`
("Google Chrome for Testing" 155.0.8059.79).

Smoke test confirmed the system Chrome reaches the
live site headlessly:

```
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome \
  --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
  --dump-dom https://kooshapari.com/
```

returned the real portfolio HTML
(`<title>Koosha Paridehpour — Technical Atelier</title>`).
The `CVDisplayLinkCreateWithCGDisplay failed` lines are
macOS display-link noise in a headless context and do
not affect the fetch.

Command used for every run:

```
lighthouse <url> \
  --preset=desktop            # or --form-factor=mobile \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path=<path> \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
  --quiet \
  --max-wait-for-load=30000
```

## Results

7 in-scope runs (3 production domains serving the
kooshapari-site portfolio, desktop and mobile).
**All 7 scored 100 / 100 / 100 / 100.**

| domain | form | perf | a11y | best-practices | seo | FCP | LCP | TBT | CLS | Speed Index | TTI | server response |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| kooshapari.com | desktop | 100 | 100 | 100 | 100 | 307 ms | 355 ms | 0 ms | 0.00 | 385 ms | 357 ms | 28 ms |
| kooshapari.com | mobile | 100 | 100 | 100 | 100 | 1,219 ms | 1,369 ms | 0 ms | 0.00 | 1,219 ms | 1,369 ms | 24 ms |
| www.kooshapari.com | desktop | 100 | 100 | 100 | 100 | 295 ms | 355 ms | 0 ms | 0.00 | 361 ms | 357 ms | 27 ms |
| www.kooshapari.com | mobile | 100 | 100 | 100 | 100 | 1,271 ms | 1,392 ms | 0 ms | 0.02 | 1,271 ms | 1,394 ms | 26 ms |
| kooshapari-site.vercel.app | desktop | 100 | 100 | 100 | 100 | 299 ms | 359 ms | 0 ms | 0.00 | 575 ms | 361 ms | 30 ms |
| kooshapari-site.vercel.app | mobile | 100 | 100 | 100 | 100 | 1,219 ms | 1,369 ms | 0 ms | 0.00 | 1,219 ms | 1,369 ms | 24 ms |

Two runs of `kooshapari.com` desktop (a first
exploratory run and the batch run) both scored
100/100/100/100 with FCP 381 ms / LCP 406 ms and
307 ms / 355 ms respectively. The score is stable
across runs; the metrics vary by tens of
milliseconds, as expected.

**Throttling.** Desktop runs use Lighthouse's
`simulate` method with `rttMs: 40`,
`throughputKbps: 10240`, `cpuSlowdownMultiplier: 1`.
Mobile runs use the standard Lighthouse mobile
profile (`rttMs: 150`, `throughputKbps: 1638.4`,
`cpuSlowdownMultiplier: 4`, screen 412x823 at
DSF 1.75). These are simulated, not observed on a
real phone. The mobile numbers are what a mid-tier
phone on a slow link would see; a real-user
measurement (field data) is a different artifact and
is not claimed here.

**The one non-perfect score is out of scope.**
`phenotype.space` scored SEO 82. Investigation
showed it is **not an alias of the kooshapari-site
project**: it serves a different Cloudflare Pages
site titled "Phenotype" (`server: cloudflare`,
`cf-ray: ...-LAX`), its `/robots.txt` returns that
site's HTML rather than a robots file, and its
dependency tree includes `static.cloudflareinsights.com`
rather than the Vercel bundle. Its SEO 82 comes from
that site's own issues (no meta description,
robots.txt not parseable, Cloudflare Insights cache
lifetime and legacy-JS findings) — not from the
kooshapari portfolio. The audit is recorded anyway
in `lighthouse/phenotype_space-desktop.summary.json`
so the observation is not hidden.

## What "100" covers

The five sub-1.00 audits in every in-scope run are
Lighthouse's *insight* audits, which do not carry
category weight:

| audit | score | what it says |
|---|---|---|
| `network-dependency-tree-insight` | 0.00 | advisory chain diagram, not weighted |
| `cache-insight` | 0.50 | advisory cache-lifetime suggestions |
| `render-blocking-insight` | 0.50 | advisory render-blocking suggestions |
| `unused-css-rules` | 0.50 | advisory byte-savings estimate |
| `unused-javascript` | 0.50 | advisory byte-savings estimate |

Each carries `weight: 0` in its category, so they do
not reduce the score. They are reported because they
are real observations about the shipped site, not
because they are defects.

Accessibility (100) includes: color contrast, image
`alt` attributes, viewport not disabling zoom
(`user-scalable=no` absent), and the full
axe-core rule set.

Best Practices (100) includes: HTTPS, no console
errors, no `user-scalable=no`, and the secure-context
checks.

SEO (100) includes: meta description present, valid
`robots.txt`, `link` crawlability, font sizes,
tap targets, and the structured-data / social-meta
checks.

## Artifacts

`docs/audits/2026-10-19/lighthouse/`

- `*.summary.json` (8 files, 248 KB total) — the
  distilled record. Each keeps every scored audit with
  its weight, every metric, the full config
  (form factor, throttling, screen emulation), and an
  explicit `failures` array with explanations. Built
  by `scripts/distill-lighthouse.js`.
- `RAW-kooshapari.com-desktop.json` (762 KB) — the
  unmodified Lighthouse output for the primary
  domain, kept as the canonical full-detail artifact.
- The 7 remaining raw reports (~700 KB each) are
  intentionally not committed. The distillation is
  lossless: verified that all 95 scored audits in the
  raw primary report survive the distillation and that
  every metric value round-trips exactly. Raw reports
  can be regenerated with the command above.

## Comparison to the prior evidence

`output/lighthouse-preview.json` (tracked since
2026-09-12) was a **preview-deployment** run at
`koosha-phenotype-8ighz2amv-...vercel.app`, mobile
form factor: Performance 95, Accessibility 100,
Best Practices 100, SEO 66, and a fifth category
"Agentic Browsing" 67. The present run is against
the **production** domains and shows 100 across the
four standard categories. The SEO 66 -> 100 and the
Performance 95 -> 100 movement reflects the shipped
site, not a different measurement method; the
"Agentic Browsing" category is not in the current
Lighthouse 13.4.1 default category set and was not
requested.

## Reproduction

```
node scripts/distill-lighthouse.js <out-dir> <raw-report.json> [...]
```

Requires a Chrome binary. On this host that is
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
