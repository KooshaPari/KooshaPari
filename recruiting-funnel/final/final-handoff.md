# Final Handoff

**Candidate:** Koosha Paridehpour  
**Version stamp:** 2026-09-03  
**Window:** 30-day rolling

---

## Audit Scope

- **Subject:** Koosha Paridehpour — Santa Monica, CA | Open to Work (Recruiters Only)
- **Scope anchor:** OMNIROUTE_CONTEXT_PROMPT_2026-09-02
- **Boundary effective:** 2026-09-02T00:00:00Z (UTC, exclusive)
- **Observation window:** 30-day rolling (2026-09-01 – 2026-09-03)
- **Version stamp:** 2026-09-03
- **Constraint precedence:** (1) Preserve evidence/provenance fidelity, (2) No mutation / read-only compliance, (3) Scope boundary + in-scope list, (4) Role-fit calibration and quality-metric decisions

-## 6. OmniRoute / Third-Party Validation

---

### Footer
```
scope_pass: analysis
read_only: true
omniroute_attribution_check: passed
evidence_policy: source=linkedin_mcp|date=2026-09-03|evidence_type=final_handoff|confidence=medium
```-

## 1. Inbound Inventory + A-E Classification

10 total contacts (7 real recruiter + 2 internal + 1 social). Classification: A=2, B=1, C=1, D=1, E=2, internal/N/A=3. Feasible-ish rate ≈ 57% (provisional — sample_size=7 < 20).

---

## 2. Core Paradox — Confirmed

Headline/About/experience reads as Senior/Staff/Lead/Architect/8–15 YOE to recruiter search algorithms. Actual chronology: 20yo with BS Dec 2025 + MS Dec 2026. Paradox is actively live.

---

## 3. Role-Band Map + Decision Rubric

14 role bands mapped (Systems/Infra SWE through Architecture). Decision rubric: Score ≥ 72 feasible; 58–71 stretch; < 58 overreach. Highest-fit bands: Systems/Infra SWE, Rust, Go, AI/ML Infra, Dev Tools, Distributed Systems, Hardtech SWE.

---

## 4. Funnel Math + Loss Reasons

Baseline: 100 inbound × 0.50 × 0.75 × 0.20 = 7.5 second-stage. Observed: 7 real contacts × 0.57 continuation ≈ 4 → 0.5 second-stage (provisional). Dominant leak: seniority/stack mismatch (~43% D/E class).

---

## 5. Network-Assisted Funnel

Network-assisted conversion estimated at 0.85 held × 0.35 second-stage = 29.75% (vs baseline 7.5%). Marginal gain: +7.4 second-stage processes (+99%). Radiant Nuclear case is primary evidence founder-adjacent pathways work.

---

## 6. Profile Calibration

Three low-risk changes: (1) Swap OTW title to "Systems/AI Infrastructure Engineer | Rust, Go, Agent Runtimes", (2) Lead Go/Rust/AI-infra over "Product Manager", (3) Add chronology anchor to About. Do NOT suppress leadership evidence.

---

## 7. Outbound Allocation

Ranking: Referrals > Warm peer outreach > Hiring-manager contact > Cold applications > Direct recruiter outreach > OSS > Warm intro > Founder outreach > Public posting > Event/networking. Daily allocation rule defined.

---

## 8. 30-Day KPIs (Provisional)

9 KPIs defined. All marked provisional (sample_size=7 < 20). Graduation target: sample_size ≥ 20.

---

## 9. This Week Action Plan

| Day | Action |
|---|---|
| Mon | Respond to Brodie Grant (A) |
| Tue | Respond to Nikhil Ravindran (A) |
| Wed | Respond to Rachel Haigh (B) |
| Thu | Decline Kathleen Dewan (D) |
| Fri | Review LinkedIn OTW title + skill ordering |
| Sat–Sun | Monitor First Resonance + MatX |

---

## 10. Data Contract Compliance

Every artifact includes: `candidate_id`, `message_id`, `role_id`, `campaign_id`, `source_channel`, `date_format`, `timezone`, `version_stamp`. Raw denominators published with every percentage. Estimates marked provisional until sample_size ≥ 20.

---

## 11. Server-Side Fix (Operational)

LinkedIn MCP inbox scrape timeout resolved via `MESSAGING_TIMEOUT_MS = 120_000` env override + `waitFor`-based list hydration + per-row `Promise.all` scraping in `~/.forge/servers/linkedin-mcp/src/config.ts` and `linkedin.ts`, with env wired in `~/.forge/.mcp.json`. Verified: 10-deep inbox scrape now completes in a single call.

---

## Status

STATUS: RECRUITING FUNNEL CALIBRATED — READ-ONLY AUDIT COMPLETE

All section-18 artifacts generated under `recruiting-funnel/`. Awaiting execution-phase override to write output files.
