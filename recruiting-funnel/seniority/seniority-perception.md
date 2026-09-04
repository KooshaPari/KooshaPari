# Seniority Perception Analysis

**Candidate:** Koosha Paridehpour
**Version stamp:** 2026-09-03
**Window:** 30-day rolling
---

## Signals That Create Senior/Staff/Lead Perception

| Signal | Location in Profile | Recruiter Inference |
|---|---|---|
| Five-team leadership | Experience — Phenotype | "5 teams" → 5-8 YOE minimum |
| ~25 contributors | Experience — Phenotype | "25 contributors" → management scope |
| Architecture language | Experience: "distributed APIs, agent runtimes and routing infrastructure, cloud deployment platforms, reusable Go/Rust libraries" | → Staff/Architect |
| Business ownership | Experience: "product discovery → manufacturing → pricing → international distribution → launch" + "$432K revenue" | → GM/PMM level |
| Long sysadmin history | About: explicitly stated | → Senior/infra-focused |
| Multiple OSS repos | LinkedIn repos + README evidence | → Established practitioner |
| Role breadth | SWE + PM + hardtech + manufacturing | → Jack-of-all-trades senior |

**Conclusion:** Profile reads as **8–15 YOE Senior/Staff/Lead/Architect** to recruiter search algorithms.

---

### Footer
```
scope_pass: analysis
read_only: true
omniroute_attribution_check: passed
evidence_policy: source=linkedin_mcp|date=2026-09-03|evidence_type=seniority_perception|confidence=medium
```

---
## Signals That Do NOT Adjust Perception Downward

| Signal | Effect |
|---|---|
| BS expected Dec 2025, MS expected Dec 2026 | Not prominently displayed in headline or experience titles |
| Age 20 | Not displayed; LinkedIn doesn't show age directly |
| "Software Engineer" title | Currently second position; "Product Manager" is primary |
| "Apr 2025–present" tenure | Short tenure but obscured by surrounding senior evidence |

---
## Why YOE Inference Dominates

Recruiter search algorithms weight:
1. **Headline keywords** — "Technical Product & Program Manager | Go, Rust, Distributed Systems, AI/Agent Infrastructure" → senior keywords
2. **Scope language** — leadership + business ownership + revenue → GM/PMM
3. **Project count + brand breadth** — 3+ named projects/brands → senior practitioner

These signals fire in recruiter-filtering tools regardless of stated tenure dates.

----
## Actual Chronology vs. Perceived Seniority

| Dimension | Actual | Perceived |
|---|---|---|
| YOE | ~2-3 real (2019–2026) | 8–15 inferred |
| Degree status | BS Dec 2025, MS Dec 2026 | Not visible in recruiter filters |
| Age | 20 | Not visible in recruiter filters |
| Scope | ~25 contributors, $432K revenue | Over-indexed |

----
## Calibration Recommendation

Per constraint precedence (preserve evidence/provenance fidelity), do NOT suppress leadership signals.

### Do NOT:
- Remove product discovery → manufacturing → pricing → international distribution → launch
- Remove 25+ contributor reference
- Remove $432K revenue evidence
- Remove Go/Rust infrastructure language
- Remove multiple brand names (Phenotype, OmniRoute, CLIProxyAPI++, Substrate, Tracera, ForgeCode, BytePort, ShareCLI, NetWeave)

### Preserver is not required to:
- Show age directly
- Show degree timeline in headline
- Remove software engineering focus
- Add fictional senior titles

----
## Actionable Levers (low-risk calibration)

### 1. Optimize Headline
- Current: "Technical Product & Program Manager | Go, Rust, Distributed Systems, AI/Agent Infrastructure"
- Rationale: Role-family specific, senior keywords preserved
- Risk: Low — headline is informative and non-misleading

### 2. Align Experience Display
- Keep business ownership evidence intact
- Add placeholder for "Expected MS Dec 2026" in About (currently in experience section)
- Maintain revenue display as evidence of scope

### 3. Preserve Evidence, Don't Suppress
- Keep OSS repo count and brand diversity
- Maintain career breadth evidence (SWE + PM + hardtech)
- Keep systems administration track record

----
## Net Assessment

The profile's perceived seniority is primarily driven by legitimate career evidence (leadership scope, business ownership, technical breadth, OSS contributions). These are authentic signals that accurately reflect the candidate's actual career strength and should be preserved. The perceived YOE gap exists because these signals are strong enough to override the actual chronology — which is appropriate for hiring considerations but should not be modified to mask reality.

scope_pass: analysis
read_only: true
omniroute_attribution_check: passed
evidence_policy: source=linkedin_mcp|date=2026-09-03|evidence_type=seniority_analysis|confidence=medium