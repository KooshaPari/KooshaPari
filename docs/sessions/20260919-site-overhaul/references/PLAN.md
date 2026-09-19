# Reference Research Library — koosha-phenotype overhaul

Goal: build a curated reference corpus so future Apple-grade over-engineering work on this site (and tangentially, the ShareCLI / 3D viewers / GFM artifact catalog) is grounded in concrete examples rather than vibes.

## Categories (target: 100–200 each)

| ID | Category | Path | Primary model | Effort |
|----|----------|------|---------------|--------|
| PF | Portfolio sites (personal/agency) | `references/portfolio/` | gpt-6-astra | low |
| UX | UI/UX patterns, micro-interactions, motion | `references/ui-ux/` | gpt-6-astra | low |
| TUI | TUI / CLI apps (terminal-only UIs) | `references/tui-cli/` | deepseek-v4.1-flash | medium |
| SDK | API / SDK documentation sites | `references/api-sdk/` | deepseek-v4.1-flash | medium |
| AUD | Audio / podcast player UIs | `references/audio-ui/` | gpt-6-astra | low |
| VID | Video player / video editor UIs | `references/video-ui/` | gpt-6-astra | low |
| S3D | 3D / spatial / WebXR / shader art | `references/3d-spatial/` | deepseek-v4.1-flash | medium |
| MOT | Motion-design showcase sites (high-craft animation) | `references/motion/` | gpt-6-astra | low |

## Per-category file format

Every category gets `REFERENCES.md` plus (optionally) `curated.md` for the top 20.

Each entry in `REFERENCES.md`:

```
## N. <Name>
- URL: <https://...>
- Author: <who built it>
- Year: <year active>
- What it does well: <one short sentence>
- Why we care: <mapping back to koosha-phenotype or shareCLI>
- Verification: <URL still resolves + what I saw there>
```

## Subagent prompt template (each receives)

```
You are collecting a curated reference list for category <X> — <description>.
Target: 100 to 200 entries. Each entry gets:
  - URL (still live, https://...)
  - Author/maintainer
  - Year first notable
  - Why it's a reference (one sentence)
  - Why it matters to koosha-phenotype / shareCLI / over-engineering Apple-grade UI

Output destination: <repo>/docs/sessions/20260919-site-overhaul/references/<cat>/REFERENCES.md

Rules:
- Prefer concrete, real URLs (no placeholder). If a URL fails (404/timeout), drop it.
- For categories biased toward sites, use webfetch / websearch.
- For categories biased toward tools/libs, prefer GitHub repo URLs.
- Group entries 1..N, plain markdown.
- Do NOT write code. Do NOT invent URLs. If a candidate is unverifiable, drop it.

Required artifacts in your reply:
- The path of REFERENCES.md (or its inlined content if short)
- A "top 10 we should study first" callout list
- A short note on: missing-source coverage (what didn't you find and want)
```

## Index / verification

After all subagents return, write `references/INDEX.md` aggregating every category with counts + top-3 picks + retry list (URLs that 404'd during verification).

## Compute placement

All subagents run locally on this host. Research is web-fetch heavy but light on compute; no GPU needed.
