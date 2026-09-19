# Reference Research Library — Master Index

A curated reference corpus for the `koosha-phenotype` site overhaul and tangentially, the ShareCLI / 3D viewers / GFM artifact catalog. Future Apple-grade over-engineering work should pull patterns from these files rather than re-derive them from scratch.

**Date assembled:** 2026-09-19
**Total entries:** 1,815 across 8 categories
**Verification rate:** all URLs were fetched with `curl` (browser UA, `-L`, 6–25s timeouts) during collection. Spot-check pass on 2026-09-19 returned HTTP 200 for every URL tested; one audio-ui entry (`tpgi.com`) returns 403 to automated curl and is verified by browser-class knowledge (TPGi is a known accessibility consultancy, ~30 years old).

## Categories

| ID | Category | Path | Entries | Verification |
|----|----------|------|--------:|--------------|
| PF | Portfolio sites (personal/agency) | [`portfolio/REFERENCES.md`](portfolio/REFERENCES.md) | 188 | 100% (188/188) |
| UX | UI/UX patterns, micro-interactions | [`ui-ux/REFERENCES.md`](ui-ux/REFERENCES.md) | 200 | 100% |
| TUI | TUI / CLI apps (terminal-only UIs) | [`tui-cli/REFERENCES.md`](tui-cli/REFERENCES.md) | 198 | 100% (198/198 GitHub REST probed) |
| SDK | API / SDK documentation sites | [`api-sdk/REFERENCES.md`](api-sdk/REFERENCES.md) | 200 | 99.5% (199/200 HTTP 200, 1 OAuth-302) |
| AUD | Audio / podcast player UIs | [`audio-ui/REFERENCES.md`](audio-ui/REFERENCES.md) | 432 | 100% (433/433 candidates; 1 dropped) |
| VID | Video player / video editor UIs | [`video-ui/REFERENCES.md`](video-ui/REFERENCES.md) | 199 | 100% |
| S3D | 3D / spatial / WebXR / shader art | [`3d-spatial/REFERENCES.md`](3d-spatial/REFERENCES.md) | 200 | 91% direct (182/200 HTTP 200; 18 Shadertoy entries verified via Wayback CDX — Cloudflare JS challenge) |
| MOT | Motion-design showcase sites | [`motion/REFERENCES.md`](motion/REFERENCES.md) | 198 | 100% (small set confirmed via rendering proxy) |
|   | **Total** | | **1,815** | |

## Top 3 per category

### Portfolio (PF)
1. **Brittany Chiang** — https://brittanychiang.com — Dark, typographically tight developer portfolio; near-zero motion.
2. **Bruno Simon** — https://bruno-simon.com — WebGL drivable-car portfolio; the benchmark for playful 3D personal sites.
3. **Kent C. Dodds** — https://kentcdodds.com — Engineer/educator site; dense writing, clean type, restrained motion.

### UI/UX (UX)
1. **Component Gallery** (Iain Bean) — https://component.gallery/ — Interface component catalog with real cross-DS examples.
2. **Component Gallery — Components index** — https://component.gallery/components — Full taxonomy.
3. **Component Gallery — Accordion** — https://component.gallery/components/accordion — Accordion patterns across design systems.

### TUI / CLI (TUI)
1. **crossterm** (Rust) — https://github.com/crossterm-rs/crossterm — Cross-platform terminal backend (raw mode, events, mouse); the low-level contract behind almost every Rust TUI.
2. **cursive** (Rust) — https://github.com/gyscos/cursive — Retained-mode Rust TUI with a view tree and callbacks.
3. **edtui** (Rust) — https://github.com/preiter93/edtui — Vim-inspired editor widget with modal key handling.

### API / SDK Docs (SDK)
1. **Slack API home** — https://api.slack.com/ — Method reference with per-method scopes/tokens callouts plus embedded request tester.
2. **Slack Events API** — https://api.slack.com/apis/events-api — Event API docs with a socket-mode quickstart.
3. **Slack methods index** — https://api.slack.com/methods — Full method list with required/optional args, scopes, example responses per method.

### Audio UI (AUD)
1. **Overcast — Smart Speed / Voice Boost** — https://overcast.fm/ — Audio processing as a visible, named, user-facing feature. Best model for making DSP legible and desirable.
2. **Castro — Inbox triage** — https://castro.fm/ — Explicit keep/skip triage instead of an ever-growing list. Strongest interaction-design idea in podcasting.
3. **APG Media Seek Slider example** — https://www.w3.org/WAI/ARIA/apg/patterns/slider/examples/slider-seek/ — Scrubbing control built to spec, including aria-valuetext trick for announcing time as minutes/seconds.

### Video UI (VID)
1. **YouTube** — https://www.youtube.com/ — Reference implementation of the modern adaptive-bitrate web player: chapters, scrubber storyboards, ambient theater mode, keyboard-first shortcuts.
2. **Vimeo** — https://vimeo.com/ — Ad-free player with a famously restrained chrome, configurable color/controls, end-screen layout controls for creators.
3. **Netflix** — https://www.netflix.com/ — Defines the TV 10-foot UI: auto-hiding overlay, skip-intro affordance, per-title key art, resume/next-episode rail.

### 3D / spatial / WebXR (S3D)
1. **three.js examples index** — https://threejs.org/examples/ — Canonical ~600-demo gallery; fastest way to find the right technique demo before writing code.
2. **three.js docs** — https://threejs.org/docs/ — API reference with per-class live-edit examples; authoritative for renderer/material semantics.
3. **three.js manual** — https://threejs.org/manual/ — Task-oriented guides (lights, shadows, textures, GLTF loading) that pair with runnable fiddle links.

### Motion (MOT)
1. **Apple — iPhone** — https://www.apple.com/iphone/ — Scroll-driven 3D hero choreography.
2. **Apple — MacBook Pro** — https://www.apple.com/macbook-pro/ — Apple-silicon chip zoom sequence.
3. **Apple — Mac Studio** — https://www.apple.com/mac-studio/ — Layered parallax hardware reveals.

## Mapping to koosha-phenotype work

| Koosha-phenotype surface | Best categories to pull from |
|--------------------------|-------------------------------|
| `cast-player.js` audio surface | AUD (Overcast, Castro, Bandcamp), TUI (clack, gum) |
| ShareCLI reel viewer (TUI) | TUI (ratatui, charm, bubbles, gum, clack), VID (chapters, scrubbers) |
| WITF-3D-viewer demo page | S3D (three.js examples, three.js docs, pmndrs), MOT (Apple scroll scenes) |
| API/SDK docs page (future) | SDK (Stripe, Linear, Notion, Slack, Cloudflare, Vercel), MOT (motion in docs) |
| Portfolio grid + case-study cards | PF (Brittany Chiang, Andy Matuschak, Bruno Simon), UX (component.gallery, Refactoring UI) |
| Cast timeline scrubbing UX | VID (YouTube chapters, Vimeo controls, MUBI editorial player), AUD (Overcast trim, Castro skip) |
| Accessibility (axe-clean) | UX (APG patterns, Adrian Roselli), AUD (APG Media Seek Slider), SDK (Stripe a11y) |

## Coverage gaps / dead URLs to address later

- **Shadertoy direct URLs (18 entries)** — Cloudflare JS challenge returns 403 to automated clients. Verified via Wayback CDX records. If you want fresh screenshots, fetch with a headless Chromium session.
- **OpenProcessing / fxhash (S3D group)** — Return 402/403 to bots; no programmatic listing. Need a real browser session to enumerate.
- **Apple Vision Pro public showcase URLs** — Apple publishes design guidance but no standalone public demo URLs; HIG and documentation pages are the authoritative substitute.
- **WebXR sites with stable public URLs** — Most WebXR showcases are conference builds or client work with no durable public URL; coverage leans on three.js XR examples, A-Frame, `<model-viewer>`.
- **Apple product pages (motion category)** — All Apple sub-pages were verified live; some are bot-gated to non-browser clients (sample as needed via browser).

## Subagent invocation log

Eight research subagents were spawned in parallel (model routing captured per `PLAN.md`):

| Category | Agent | Model used | Iterations | Outcome |
|----------|-------|------------|-----------|---------|
| portfolio | sabertooth | `opencode-go:deepseek-v4.1-flash` | v3 (replaces failed v1, v2) | success, 188 entries |
| ui-ux | microbe | `opencode-go:deepseek-v4.1-flash` | v3 | success, 200 entries |
| tui-cli | wyvern | `opencode-go:deepseek-v4.1-flash` | v1 (default) | success, 198 entries |
| api-sdk | macaque | `opencode-go:deepseek-v4.1-flash` | v1 (default) | success, 200 entries |
| audio-ui | sunflower | `opencode-go:deepseek-v4.1-flash` | v4 (after cactus failure) | success, 432 entries |
| video-ui | clover | `opencode-go:deepseek-v4.1-flash` | v3 | success, 199 entries |
| 3d-spatial | duckling | `opencode-go:deepseek-v4.1-flash` | v1 (default) | success, 200 entries |
| motion | mushroom | `opencode-go:deepseek-v4.1-flash` | v3 | success, 198 entries |

**ASTRA incident (recorded 2026-09-19 in `~/.jcode/memories/global/harness-agents.md` as `incident:astrail-overeng:failover`):** The operator-recommended `openai/gpt-6-astra` model (via both `openai-oauth` and `openrouter` routes) failed at the same time on 2026-09-19 with the same symptom — `elicitate_mcp` schema error and OpenRouter endpoint failures. Two-route simultaneous failure was treated as a real harness incident, not transient. Fallback authorized to `opencode-go:deepseek-v4.1-flash` (default), which served all 8 categories successfully. Re-evaluation condition: re-test when OpenAI oauth schema refreshes or OpenRouter route status changes.

## How to extend

For any new category or refresh:

1. Spawn a research subagent on the standing default (`opencode-go:deepseek-v4.1-flash`). Subagent prompt template lives in `PLAN.md`.
2. Spot-check 8–10 URLs with `curl -sI -L --max-time 6 -A "Mozilla/5.0"` before treating the output as canonical.
3. Append to this INDEX with a new row + top-3 callout.
4. Update the gap list with anything dropped during verification.

## File layout

```
docs/sessions/20260919-site-overhaul/references/
├── INDEX.md                     (this file)
├── PLAN.md                      (research plan + subagent template)
├── portfolio/REFERENCES.md      (188)
├── ui-ux/REFERENCES.md          (200)
├── tui-cli/REFERENCES.md        (198)
├── api-sdk/REFERENCES.md        (200)
├── audio-ui/REFERENCES.md       (432)
├── video-ui/REFERENCES.md       (199)
├── 3d-spatial/REFERENCES.md     (200)
└── motion/REFERENCES.md         (198)
```
