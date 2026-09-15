# Full Audit — Resume & LinkedIn Reconciliation
**Date:** 2026-09-12

---

## 1. Executive Summary

- **Six surfaces exist** for Koosha's professional identity: LinkedIn, site homepage, site resume page, Universal DOCX, MGMTProduct DOCX, and prior consolidation (Sept 8). None are fully aligned.
- **LinkedIn headline is the strongest** technically-focused positioning across all surfaces. Both DOCX headlines are weaker.
- **Both DOCX files contain stale data**: 5 teams / ~25 contributors (user-confirmed correct figure is 3 teams / ~15). LinkedIn about section already has the correct count.
- **Rust proficiency is overstated** in both DOCX files. User confirmed reader-level + AI-assisted. Prior consolidation already corrected this; DOCX files did not.
- **NetWeave congestion-aware routing** is claimed as implemented in DOCX files. User confirmed it is future work.
- **GPA discrepancy**: DOCX files claim 3.65 / 3.75. Transcript shows 3.53. Prior consolidation correctly omitted GPA.
- **LinkedIn top skills are misaligned** — still shows PM/Supply Chain leftovers instead of systems engineering skills.
- **Key decision needed**: Which headline/tagline becomes the canonical identity across all surfaces?

---

## 2. LinkedIn Profile State

| Field | Value |
|-------|-------|
| **Headline** | Systems/AI Infrastructure Engineer \| Rust, Go, Agent Runtimes \| Developer Platforms & 0→1 Products |
| **About** | Go/Rust systems, AI infrastructure, agent runtimes, CVS Health MVP, Atoms.Tech (3 teams / ~15 contributors), Phenotype ($432K GMK Arch, >40% cost reduction) |
| **Location** | Santa Monica, California |
| **Industry** | Software Development |
| **Open to work** | Recruiters only — Seattle WA + 4 more, Hybrid/Remote/On-site |
| **Top skills** | Project Management, Supply Chain Management, Product Management, Product Engineering, Software Development |
| **Education** | M.S. CS (expected Dec 2026) + B.S. CS (Dec 2025), ASU, Barrett Honors |
| **Analytics** | 963 profile views, 212 post impressions, 212 search appearances (7 days) |
| **Followers** | 6,190 |
| **Featured** | projects.kooshapari.com, ramdesigns.xyz |

**Headline analysis:**
- Most technically credible of all surfaces — explicit Rust/Go/Agent Runtimes.
- Correctly scoped: "Systems/AI Infrastructure Engineer" is narrow and strong.
- Team count in About section (3/~15) is the only surface that matches user-confirmed figures.
- Top skills are stale PM leftovers — mismatch with engineering headline.

---

## 3. Resume Source Comparison

### Universal Engineering DOCX (SWE focus)
- **Headline:** "Software Engineer specializing in Go, Rust, distributed systems, agent infrastructure, and performance-oriented developer tooling"
- **Order:** CVS Health → Atoms.Tech → Akoma → Phenotype
- **Depth:** Technical implementation details, language/runtime specifics, FUSE, ECS, graph algorithms
- **Projects:** ShareCLI, Substrate/CLIProxyAPI++/AgentAPI++, OmniRoute, BytePort, Systems Admin, LLM-Lab, ForgeCode, Civis, AgilePlus, Tracera, Journeys, NetWeave
- **Problem:** 5/~25 teams, unqualified Rust claim, NetWeave routing as implemented

### MGMTProduct DOCX (PM/TPM focus)
- **Headline:** "Technical Product and Program Manager spanning AI platforms, developer infrastructure, enterprise workflows, and physical products"
- **Order:** Phenotype → Atoms.Tech → CVS Health → Akoma
- **Emphasis:** Commercial outcomes ($432K, $40K, >40% cost reduction), cross-functional coordination, program governance
- **Projects:** Phenotype (hardware programs), BytePort, AgentAPI++/CLIProxyAPI++/MCPForge, Tracera, AgilePlus, Benchora, Civis, Frostify
- **Problem:** Same 5/~25 teams, program-management framing dilutes technical craft signal

### Prior Consolidation (Sept 8-9)
- 4 variants: SWE, PM, TPM, Universal (one-page Letter PDFs)
- **3 teams / ~15 contributors** (user-confirmed)
- Conservative claims: NetWeave routing = future, no M.S. date, reader-level Rust
- **Missing:** Frostify, OmniRoute, systems admin history, LLM-Lab, detailed architecture sections

### Live Site
- **Homepage:** "Koosha Paridehpour — Technical Atelier"
- **Meta:** "software engineer and technical product/program leader across systems, agent infrastructure, and physical products"
- **Resume page:** "Engineering, Product and Technical Programs"
- Resume rendered via JS SPA — condensed format matching prior universal variant
- 15+ case study routes with deeper content than any resume variant

---

## 4. Cross-Surface Alignment Matrix

| Dimension | LinkedIn | Site Homepage | Site Resume | Universal DOCX | MGMTProduct DOCX | Prior Consolidation |
|-----------|----------|---------------|-------------|----------------|-------------------|---------------------|
| **Primary identity** | Systems/AI Infrastructure Engineer | Technical Atelier | Engineering, Product & Technical Programs | Software Engineer | Technical Product & Program Manager | Varies by variant |
| **Technical signal** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ |
| **Breadth signal** | ★★★☆☆ | ★★★★☆ | ★★★★★ | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| **Team count** | 3/~15 ✅ | — | — | 5/~25 ❌ | 5/~25 ❌ | 3/~15 ✅ |
| **Rust level** | Implied expert | — | — | "specializing" ❌ | Listed unqualified ❌ | Reader-level ✅ |
| **NetWeave routing** | — | — | — | Implemented ❌ | Implemented ❌ | Future work ✅ |
| **GPA** | Omitted | — | — | 3.65/3.75 ❌ | 3.65/3.75 ❌ | Omitted ✅ |

---

## 5. Conflicts & Gaps

### Team Count
Both DOCX files claim 5 teams / ~25 contributors. User confirmed 3 / ~15 on Sept 9. LinkedIn About already has correct figure. **DOCX files are stale.** All surfaces must use 3/~15.

### Rust Proficiency
DOCX files say "specializing in Go, Rust" and list Rust unqualified. User confirmed: reader-level + AI-assisted. Prior consolidation already corrected. DOCX files were never updated.

### NetWeave Routing
DOCX files claim "congestion-aware A* routing with BFS fallback" as implemented. User confirmed this is future work. Only the prior consolidation treats it correctly.

### GPA
DOCX files claim B.S. 3.65 / M.S. 3.75. Transcript shows 3.53. Prior consolidation correctly omitted GPA. Keep omitting.

### Skills Mismatch (LinkedIn)
LinkedIn top skills still show "Project Management, Supply Chain Management, Product Management" — leftover from PM era. Doesn't match the systems/engineering headline.

### Content Gaps
- **Frostify** (3,350+ downloads): In both DOCX files, missing from prior consolidation.
- **OmniRoute** (#5 external contributor, 101 merged PRs): Only in Universal DOCX.
- **LLM-Lab** (MLX/Metal, speculative decoding): Only in Universal DOCX.
- **ForgeCode** (Rust CLI/TUI, SQLite, FTS): Only in Universal DOCX.
- **Phenotype Journeys** (Rust test framework): Only in Universal DOCX.
- **"30 days" copy defect**: Present in both DOCX files, noted in prior audit.

### Featured Links (LinkedIn)
Point to older properties (projects.kooshapari.com, ramdesigns.xyz) instead of kooshapari.com.

---

## 6. Recommended Actions

| Priority | Action | Owner | Notes |
|----------|--------|-------|-------|
| **P0** | Fix team count to 3/~15 in both DOCX files | Koosha | Both DOCX files are stale; LinkedIn already correct |
| **P0** | Downgrade Rust from "specializing" to "reader-level + AI-assisted" in both DOCX files | Koosha | Prior consolidation already correct; propagate to DOCX |
| **P0** | Mark NetWeave congestion routing as future work in both DOCX files | Koosha | User-confirmed |
| **P1** | Choose canonical headline across all surfaces | Koosha | LinkedIn is strongest; recommend bridging it with site identity |
| **P1** | Update LinkedIn top skills to match engineering focus | Koosha | Replace PM/Supply Chain with Go, Rust, Systems Programming, Agent Infrastructure, Distributed Systems |
| **P1** | Update LinkedIn featured link to kooshapari.com | Koosha | Replace older properties |
| **P2** | Fold missing projects (Frostify, OmniRoute, LLM-Lab, ForgeCode, Journeys) into prior consolidation variants | Koosha | Universal DOCX has richer coverage that prior consolidation missed |
| **P2** | Reconcile education: keep GPA omitted across all surfaces | Koosha | Transcript (3.53) contradicts DOCX claims (3.65/3.75) |
| **P2** | Fix "30 days" copy defect in both DOCX files | Koosha | Noted in prior audit, still present |
| **P3** | Verify "Open to work" location (Seattle + 4) is current | Koosha | Base is Santa Monica |
| **P3** | Regenerate SWE/PM/TPM/Universal variants with corrected content | Koosha | After P0-P1 conflicts resolved |
| **P3** | Deploy updated SPA resume to site | Koosha | After canonical content finalized |
