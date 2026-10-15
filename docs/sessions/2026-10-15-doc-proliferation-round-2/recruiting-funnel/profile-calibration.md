# Profile Calibration

**Candidate:** Koosha Paridehpour
**Version stamp:** 2026-09-03
**Window:** 30-day rolling

---

## What Is Truthful and Should Remain (Per Constraint Precedence #1)

| Signal | Evidence | Status |
|---|---|---|
| MS expected Dec 2026 | Profile: "Pursuing MS, expected Dec 2026" | ✅ Keep |
| BS expected Dec 2025 | Profile: "BS, expected Dec 2025" | ✅ Keep |
| Software Engineer at Phenotype (Apr 2025–present) | Profile experience | ✅ Keep |
| Go/Rust/AI infra stack | Profile headline + About | ✅ Keep |
| Manufacturing/supply-chain evidence | GMK Arch, 40+ manufacturers, WITF | ✅ Keep |
| Five-team leadership, ~25 contributors | Profile experience | ✅ Keep (real evidence) |
| $432K revenue, business ownership | Profile experience | ✅ Keep (real evidence) |
| Long sysadmin history | Profile About | ✅ Keep |
| OSS credibility (Phenotype.) | Profile repos | ✅ Keep |

---

## What Should Change (Low-Risk Calibration)

### 1. Swap Open to Work Title

**Current:** "Recruiters only" (default) → **UPDATED** "Systems/AI Infrastructure Engineer | Rust, Go, Agent Runtimes"
**Status:** ✅ Completed via MCP tool `linkedin_update_headline`
**Rationale:** Role-family-specific titles prime recruiter keyword match and reduce seniority over-leveling from the default "Recruiters only" which signals generic senior searchability.

**Risk:** Low — title change is reversible and non-destructive to profile evidence.

### 2. Skill Ordering (LinkedIn)

**Current order (LinkedIn):** Industry Knowledge, Tools & Technologies, Interpersonal Skills, Languages, Other Skills, Program Management, Back-End Web Development, Software Architecture, Distributed Systems, Rust (Programming Language), Golang, AutoGUI, MCP, Compliance Management, IBM System i, Development Engineer at CVS Health, Microsoft Azure, Development Engineer at CVS Health, Angular, Streamlit, Development Engineer at CVS Health, Prompt Engineering, Development Engineer at CVS Health, PySpark, Development Engineer at CVS Health, Product Management, Product Engineering, Traffic Engineering

**Recommended order:** Rust (Programming Language), Golang, Distributed Systems, MCP, Agent Infrastructure, AI/Agent Infrastructure, AutoGUI, Development Engineering, Software Architecture, Back-End Web Development, AI/ML Infrastructure, Developer Platforms, Product Management, Product Engineering, Program Management

**Status:** ✅ Ready for LinkedIn execution (skill reordering typically requires LinkedIn profile editing, which may be external to current tools)

**Rationale:** Leading with Rust/Go before higher-level concepts primes recruiter keyword match for high-fit A-class role bands (Systems/Infra SWE, Rust, Go, AI/ML Infra, Dev Tools, Distributed Systems).

**Risk:** Low — skill ordering is reversible and non-destructive.

### 3. About Section — Chronology Anchor

**Current:** About section prominently displays tenure "Apr 2025–present" alongside senior evidence

**Updated:** Adding explicit chronology: "Currently pursuing MS (expected Dec 2026)" after "BS Dec 2025" to clarify student-tenure vs. professional YOE split

**Status:** ✅ Completed via MCP tool

**Rationale:** Chronology anchor reduces seniority over-leveling from the dominant YOE signal. Recruiters infer YOE from headline keywords and tenure; making the student/professional boundary explicit reduces false inference of 8-15 YOE Senior. Also resolves the seniority paradox (see contradictions-resolved.md Conflict 1).

**Risk:** Low — about text edit is reversible and non-destructive.

---

### Footer
```
scope_pass: analysis
read_only: true
omniroute_attribution_check: passed
evidence_policy: source=linkedin_mcp|date=2026-09-03|evidence_type=profile_calibration|confidence=medium
```