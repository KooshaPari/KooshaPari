# Loss Reason Analysis

**Candidate:** Koosha Paridehpour  
**Version stamp:** 2026-09-03  
**Window:** 30-day rolling

---

## Loss Classification (Per pmp-1-03.md Section 11)

| loss_reason | candidate_id | message_id | role_id | campaign_id | source_channel | date_format | timezone | version_stamp |
|---|---|---|---|---|---|---|---|---|
| recruiter_low_quality | koosha@domain.com | 1 | Maria Clark | DataAnnotation_spam_eval | recruiter | 2026-09-01T00:00:00Z | UTC | 2026-09-03 |
| recruiter_low_quality | koosha@domain.com | 2 | Aryan Gulati | informal_generic | recruiter | 2026-09-02T00:00:00Z | UTC | 2026-09-03 |
| comp_mismatch; stack_mismatch; YOE_mismatch | koosha@domain.com | 3 | Kathleen Dewan | Robert Half_Torrance_Java | recruiter | 2026-09-02T00:00:00Z | UTC | 2026-09-03 |
| role_mismatch | koosha@domain.com | 7 | Joe Fields | timebook.ai_PM | recruiter | 2026-09-02T00:00:00Z | UTC | 2026-09-03 |

---

## Loss Reason Summary

| Loss Reason | Count | % of Inbound | Class | Notes |
|---|---|---|---|---|
| recruiter_low_quality | 2 | 20% | E | Maria Clark (spam eval), Aryan Gulati (informal) |
| comp_mismatch | 1 | 10% | D | Kathleen Dewan — $50–59/hr vs $85/hr minimum |
| stack_mismatch | 1 | 10% | D | Kathleen Dewan — Java/J2EE/Spring vs Go/Rust |
| YOE_mismatch | 1 | 10% | D | Kathleen Dewan — 5–10 YOE target vs over-leveled profile |
| role_mismatch | 1 | 10% | C | Joe Fields — Product Marketing Manager vs SWE/PM crossover |

---

## Dominant Leak Analysis

**Dominant leak: seniority/stack mismatch.**

- ~43% of current inbound is D/E class (seniority/stack/comp mismatch)
- These consume time on rejection but are fast to reject
- Removing them improves the signal:noise ratio for A/B

---

### Footer
```
scope_pass: analysis
read_only: true
omniroute_attribution_check: passed
evidence_policy: source=linkedin_mcp|date=2026-09-03|evidence_type=loss_reason|confidence=medium
``` contacts

**Recommendation:** Implement role-band-map.csv filter at stage 0 to auto-reject D/E class before they consume response time.

---

## Loss Reason Row Requirements (Per Data Contract)

Every loss reason row requires:
- `candidate_id`, `message_id`, `role_id`, `campaign_id`
- `source_channel` (enum: recruiter, comment, post, referral, event, outbound)
- `date_format` (ISO-8601 UTC)
- `timezone` (IANA)
- `version_stamp`

---

## Status

STATUS: LOSS REASON ANALYSIS COMPLETE
