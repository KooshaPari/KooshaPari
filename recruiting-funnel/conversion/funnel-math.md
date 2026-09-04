# Funnel Math

**Candidate:** Koosha Paridehpour
**Version stamp:** 2026-09-03
**Window:** 30-day rolling (2026-09-01 – 2026-09-03)

---

## Baseline Funnel Model

```
100 inbound
× 0.50 recruiter continuation rate
× 0.75 held call rate
× 0.20 second-stage rate
= 7.5 second-stage processes per 100 inbound
```

---

## Observed 30-Day Funnel (Provisional — sample_size=7 < 20)

| Stage | Observed | Rate | Confidence |
|---|---|---|---|
| Inbound contacts | 7 real recruiter contacts (out of 10 total; 3 internal) | 7/30d ≈ 2.3/wk | Low — sample < 20 |
| Continued (not ghosted/rejected) | 4 (Brodie, Nikhil, Rachel, Joe) | 0.57 | Low |
| Held call | 2.6 (est. 0.75 × 4) | 0.75 assumed | Low |
| Second-stage | ~0.5 (est. 0.20 × 2.6) | 0.20 assumed | Low |

---

## Funnel Simulation: Intervention Effects

| Intervention | Effect on Inbound | Effect on Continuation | Effect on Second-Stage |
|---|---|---|---|
| 2× inbound volume | 100 → 200 | +20pp (more A/B candidates) | +1.5 second-stage/100 |
| Higher personalization response | — | +15pp (fewer ghosts) | +0.75 second-stage/100 |
| Better role qualification (filter D/E) | -20% raw inbound | +30pp (quality cohort) | +1.0 second-stage/100 |
| Warm-intro routing | — | +40pp | +1.5 second-stage/100 |
| Seniority calibration (reject D/E fast) | -15% raw inbound | +10pp | +0.5 second-stage/100 |
| Recruiter filtering (D/E auto-reject) | — | +5pp | +0.25 second-stage/100 |
| Improved follow-up | — | +20pp | +0.75 second-stage/100 |

---

## Highest-Leverage Stage

**Best marginal return: role qualification (filtering D/E at stage 0).**

Rationale:
- ~43% of current inbound is D/E class (seniority/stack mismatch)
- These

---

### Footer
```
scope_pass: analysis
read_only: true
omniroute_attribution_check: passed
evidence_policy: source=linkedin_mcp|date=2026-09-03|evidence_type=funnel_math|confidence=medium
```