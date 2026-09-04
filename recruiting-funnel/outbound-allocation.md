# Outbound Allocation Strategy

**Candidate:** Koosha Paridehpour  
**Version stamp:** 2026-09-03  
**Window:** 30-day rolling

---

## Expected ROI Ranking (Per pmp-1-03.md:414)

| Rank | Channel | Expected ROI | Evidence | Action |
|---|---|---|---|---|
| 1 | **Referrals** | HIGH | 6k curated network, senior proximity, strong existing response rate | Activate warm peer outreach |
| 2 | **Warm peer outreach** | HIGH | 6k curated network, senior proximity | Activate network-assisted funnel |
| 3 | **Hiring-manager contact** | HIGH for hardtech/AI infra targets | Direct access to Radiant Nuclear founder-adjacent pathway | Engage Rachel Haigh → founder |
| 4 | **Cold applications** | LOWER | Seniority misperception filters to wrong bands; reject D/E fast | Filter before applying |
| 5 | **Direct recruiter outreach** | MEDIUM | You control the narrative; respond to A/B/C/D per playbook | Follow response playbook |
| 6 | **OSS-driven discovery** | HIGH | Phenotype. repos + inference/eval tooling | Keep OSS active |
| 7 | **Warm intro / executive warm path** | MEDIUM | For roles requiring business-ownership evidence | Activate if First Resonance/MatX surfaces |
| 8 | **Founder outreach** | MEDIUM | Radiant Nuclear case shows founder-adjacent pathway | Engage Rachel Haigh → founder |
| 9 | **Public posting** | MEDIUM | CES/comment-driven feed exposure working | Keep active |
| 10 | **Event/networking** | MEDIUM | Radiant Nuclear pathway | Attend hardtech/AI infra events |

---

## Allocation Rule (Per Data Contract)

---

### Footer
```
scope_pass: analysis
read_only: true
omniroute_attribution_check: passed
evidence_policy: source=linkedin_mcp|date=2026-09-03|evidence_type=outbound_allocation|confidence=medium
```

```
Daily outbound allocation = 
  (A-class contacts × 24h response) + 
  (B-class contacts × 48h response) + 
  (D-class declines × 48h clean decline) + 
  (Network-assisted activations × warm intro) + 
  (Cold applications × filtered through role-band-map.csv)
```

---

## Weekly Allocation Budget

| Day | Activity | Target |
|---|---|---|
| Mon | A-class responses (Brodie, Nikhil, Rachel) | 3 calls scheduled |
| Tue | D-class declines (Kathleen) | 1 clean decline |
| Wed | Network-assisted activations (Radiant Nuclear founder) | 1 warm intro |
| Thu | C-class redirect (Joe) | 1 low-effort reply |
| Fri | Cold application filter review | Review new inbound through role-band-map.csv |
| Sat–Sun | OSS + public activity maintenance | Keep repos + feed active |

---

## Data Contract for Outbound Rows

| Field | Value |
|---|---|
| candidate_id | koosha@domain.com |
| message_id | {UUID} |
| role_id | {role_band from role-band-map.csv} |
| campaign_id | {source_channel}_{date} |
| source_channel | recruiter | comment | referral | event | outbound |
| date_format | ISO-8601 UTC |
| timezone | IANA (UTC) |
| version_stamp | 2026-09-03 |

---

## Status

STATUS: OUTBOUND ALLOCATION MODELED — AWAITING IMPLEMENTATION
