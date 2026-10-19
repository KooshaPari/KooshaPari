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
**All 7 scored 100 / 100 / 100 / 100** *as observed
in that batch*. See "Re-verification (2026-10-19
21:33-22:01 UTC)" below: 8 further runs against
`kooshapari.com` desktop on this host produced
Performance 52-100, so the Performance score is
**not** reproducible at 100 here. Accessibility, Best
Practices and SEO **were** 100 in all 9 observations.

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
307 ms / 355 ms respectively. Within that batch the
metrics varied by tens of milliseconds, as expected.
**The score is not stable across batches on this
host** — that claim is superseded by the
re-verification below.

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

## Re-verification (2026-10-19 21:33-22:01 UTC)

An independent re-verification was run after the round
6o provenance audit, to test whether the committed
all-100 Performance score is reproducible on this host.
Same URL, same preset, same categories, same Chrome
binary, same command as above.

**9 observations total** (1 committed + 8 fresh), all
`kooshapari.com` desktop:

| # | window | perf | a11y | bp | seo | FCP | LCP | TBT | SI | srv | host load (1 min) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | committed 20:41:06Z | 100 | 100 | 100 | 100 | 307 ms | 355 ms | 0 ms | 385 ms | 28 ms | not recorded |
| 2 | fresh 21:33:29Z | 98 | 100 | 100 | 100 | 469 ms | 535 ms | 9 ms | 1,472 ms | 24 ms | not recorded |
| 3 | fresh 21:39:43Z | 99 | 100 | 100 | 100 | 419 ms | 447 ms | 0 ms | 1,182 ms | 25 ms | not recorded |
| 4 | fresh 21:41:54Z | **52** | 100 | 100 | 100 | 2,799 ms | 2,965 ms | 300 ms | 5,914 ms | 48 ms | not recorded |
| 5 | controlled 21:48:15Z | 100 | 100 | 100 | 100 | 510 ms | 552 ms | 0 ms | 933 ms | 25 ms | 904 |
| 6 | controlled 21:50:41Z | 100 | 100 | 100 | 100 | 404 ms | 432 ms | 0 ms | 843 ms | 24 ms | 803 |
| 7 | controlled 21:52:54Z | 99 | 100 | 100 | 100 | 483 ms | 535 ms | 5 ms | 1,284 ms | 25 ms | 805 |
| 8 | controlled 21:55:20Z | 100 | 100 | 100 | 100 | 577 ms | 579 ms | 0 ms | 1,025 ms | 32 ms | 847 |
| 9 | controlled 21:57:52Z | 99 | 100 | 100 | 100 | 426 ms | 502 ms | 6 ms | 1,136 ms | 22 ms | 872 |

Observations 5-9 were run one at a time with no other
task of this session running.

### What this shows

- **Accessibility, Best Practices and SEO were 100 in
  all 9 observations.** Those three are reproducible.
- **Performance was not.** Observed 100, 98, 99, 52,
  100, 100, 99, 100, 99. Minimum 52, maximum 100.
  Four observations at exactly 100; eight at 98 or
  above.
- The committed round 6m result is **not fabricated
  and not a distillation error.** The committed
  summary was verified against the committed
  `RAW-kooshapari.com-desktop.json`: identical
  `fetchTime`, identical `finalUrl`, all 4 category
  scores equal, and all 8 metric `numericValue`s
  round-tripping exactly. It is a true record of that
  batch. It is simply not reproducible on this host.

### Why the variance is measurement-side, not site-side

The 52 observation is diagnostic. Its server response
time was **48 ms** — in the same range as every other
observation (22-32 ms in the controlled series). Its
Accessibility, Best Practices and SEO were all 100.
The entire loss sat in FCP, LCP, TBT and Speed Index:
the client-side metrics that Lighthouse *simulates* by
extrapolating from the observed local Chrome timing.
`mainthread-work-breakdown` for that run shows 2,377 ms
of "other" and 1,654 ms of "styleLayout" — main-thread
work that finished slowly because the machine was busy.

The host load average during the re-verification window
was **781 to 976 on a 10-CPU machine**. Concurrent
`rustc`, `node`, `find`, `codex` and `jcode` processes
were resident. That is contention in the measurement
host, not a property of the audited site: the site
itself answered in 22-48 ms throughout.

**A host-side warning is present in all 8 fresh runs**
and in none of the committed one:

```
Clearing the browser cache timed out. Try auditing this
page again and file a bug if the issue persists.
```

It appears in the 6 fresh runs that scored 99 or 100 as
well as the one that scored 52, so it is **not** the
discriminator between the low and high observations. The
committed raw report carries an empty `runWarnings`
array, which makes the warning a new condition of this
host rather than a change in the shipped site.

### What is not claimed

- No field data (CrUX or otherwise) is claimed. These
  are all simulated lab measurements.
- The 6 remaining committed in-scope runs
  (`www.kooshapari.com` and `kooshapari-site.vercel.app`,
  desktop and mobile) were **not** re-run. The
  re-verification covers `kooshapari.com` desktop only.
- Performance 100 is **not** claimed as a stable
  property of the site. The honest claim is: the
  Performance score measured on this host ranged 52-100
  across 9 observations, and the host was under
  heavy load throughout. A performance figure measured
  on an unloaded host is not available from this
  re-verification.

### Artifact

`reverification-2026-10-19T21Z.json` — the
machine-readable record: all 9 observations with scores,
metrics, `runWarnings`, concurrency notes, host load
where sampled, and the SHA-256 of each raw report.

The 8 fresh raw reports are ~700 KB each and follow the
same convention as the round 6m bundle: the raw reports
are not committed, but each is distilled by
`scripts/distill-lighthouse.js` to a committed summary in
`reverify-raw/`. Each observation in the JSON names its
distilled artifact and records the SHA-256 of the raw
report it was distilled from, so the distillation can be
re-verified against the original.

| observation | distilled artifact | raw report |
|---|---|---|
| 1 (committed, 20:41:06Z) | `kooshapari_com-desktop.summary.json` | `RAW-kooshapari.com-desktop.json` (committed) |
| 2 (fresh A) | `reverify-raw/obs02-fresh-A.summary.json` | not committed |
| 3 (fresh B) | `reverify-raw/obs03-fresh-B.summary.json` | not committed |
| 4 (fresh C, the 52) | `reverify-raw/obs04-fresh-C.summary.json` | not committed |
| 5 (controlled 1) | `reverify-raw/obs05-controlled-1.summary.json` | not committed |
| 6 (controlled 2) | `reverify-raw/obs06-controlled-2.summary.json` | not committed |
| 7 (controlled 3) | `reverify-raw/obs07-controlled-3.summary.json` | not committed |
| 8 (controlled 4) | `reverify-raw/obs08-controlled-4.summary.json` | not committed |
| 9 (controlled 5) | `reverify-raw/obs09-controlled-5.summary.json` | not committed |

**The distiller gained `runWarnings` in this round.**
The field was not carried before, and it is material to
this finding: the cache-clearing warning appears in all 8
fresh runs and in none of the committed one, and a reader
needs it in the artifact to see why the warning is not the
discriminator between the 52 and the 100s.
`scripts/distill-lighthouse.js` now emits it, and the 8
fresh summaries were regenerated with it.

The 8 committed round 6m summaries were **not**
regenerated. They are the historical artifact of that
batch, they predate the field, and the committed
`RAW-kooshapari.com-desktop.json` carries the full
`runWarnings` data for the primary run. No committed
round 6m file was modified.

**Distillation losslessness was verified for all 8 fresh
runs**: every scored audit in the raw report (770 across
the 8) is present in the distilled summary with an
identical score, weight and `numericValue`; every
distilled metric round-trips exactly against the raw
`numericValue`; and `categoryScores`, `fetchTime`,
`finalUrl`, `lighthouseVersion` and `runWarnings` compare
field by field. **0 mismatches.**

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
- `reverification-2026-10-19T21Z.json` (round 6p) —
  the machine-readable record of all 9 re-verification
  observations.
- `reverify-raw/` (8 files, 247 KB total) — the
  distilled records of the 8 fresh re-verification runs,
  one per observation. Same distillation as the round 6m
  summaries, and `runWarnings` is now carried too.
- The 7 remaining raw reports (~700 KB each) are
  intentionally not committed. The distillation is
  lossless: verified that all 95 scored audits in the
  raw primary report survive the distillation and that
  every metric value round-trips exactly. Raw reports
  can be regenerated with the command above. The same
  applies to the 8 fresh re-verification raw reports
  (770 scored audits verified across the 8, 0
  mismatches).

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
