# Resume Reconciliation Report — 2026-09-12

## Sources Compared

| Source | Type | Focus | Origin |
|--------|------|-------|--------|
| `MGMTProduct Resume-4.docx` | DOCX | Technical Product/Program Manager | ~/Downloads, dated 2026-09-09 |
| `Koosha_Paridehpour_Universal_Engineering_Resume.docx` | DOCX | Software Engineer | ~/Downloads |
| Prior consolidation (2026-09-08) | MD/HTML/PDF | SWE/PM/TPM/Universal variants | `output/resume-consolidation-2026-09-08/` |
| Live site `resume.html` | HTML (SPA) | "Engineering, Product and Technical Programs" | kooshapari.com/resume |
| Live site `index.html` | HTML (SPA) | "Technical Atelier" tagline | kooshapari.com |

---

## 1. Structural Comparison

### MGMTProduct Resume (PM/TPM focus)
- **Headline**: "Technical Product and Program Manager spanning AI platforms, developer infrastructure, enterprise workflows, and physical products"
- **Experience order**: Phenotype → Atoms.Tech → CVS Health → Akoma
- **Sections**: Product & Program Experience → Selected Product/Platform/Architecture → Education → Product, Program & Technical Fluency
- **Emphasis**: Commercial outcomes ($432K, $40K, >40% cost reduction), cross-functional coordination, program governance, stakeholder management
- **Team count**: FIVE teams (~25 contributors) — contradicts user-confirmed 3/15
- **Projects highlighted**: Phenotype (hardware programs), BytePort, AgentAPI++/CLIProxyAPI++/MCPForge, Tracera, AgilePlus, Benchora, Civis, Frostify
- **Skills framing**: Product strategy, discovery, roadmaps, program management, architecture, technical fluency (Go, Rust, Python, TS, SQL)

### Universal Engineering Resume (SWE focus)
- **Headline**: "Software Engineer specializing in Go, Rust, distributed systems, agent infrastructure, and performance-oriented developer tooling"
- **Experience order**: CVS Health → Atoms.Tech → Akoma → Phenotype
- **Sections**: Engineering Experience → Selected Systems Engineering → Education → Technical Skills
- **Emphasis**: Technical depth (runtimes, FUSE, ECS, graph algorithms, cellular automata), implementation details, language/runtime specifics
- **Team count**: FIVE teams (~25 contributors) — contradicts user-confirmed 3/15
- **Projects highlighted**: ShareCLI, Substrate/CLIProxyAPI++/AgentAPI++, OmniRoute, BytePort, Systems Admin, LLM-Lab, ForgeCode, Civis, AgilePlus, Tracera, Journeys, NetWeave
- **Skills framing**: Languages (Go, Rust, Python, TS, C/C++, Zig), systems (Linux, FUSE, IPC), agent infra (MCP, LSP), backend/cloud

### Prior Consolidation (Sept 8-9)
- **4 variants**: SWE, PM, TPM, Universal — all one-page Letter PDFs
- **Team count**: THREE teams, ~15 contributors (user-confirmed "keep 3/15")
- **Employer naming**: Atoms.Tech and Akoma named directly (Stealth aliases stripped for resume context)
- **Conservative claims**: NetWeave congestion-aware routing treated as future work, no M.S. date commitment, no independent Rust specialist claim
- **Missing from candidates**: Frostify, OmniRoute, systems admin history, LLM-Lab, detailed architecture framing sections

### Live Site
- **Title**: "Koosha Paridehpour — Technical Atelier"
- **Meta description**: "software engineer and technical product/program leader across systems, agent infrastructure, and physical products"
- **Resume page tagline**: "Engineering, Product and Technical Programs"
- **Resume content**: Rendered via JS SPA — condensed format matching prior universal variant

---

## 2. Key Conflicts

| Topic | MGMTProduct DOCX | Universal DOCX | Prior Consolidation | User-Confirmed | Site |
|-------|-------------------|----------------|---------------------|----------------|------|
| **Team count** | 5 teams / ~25 | 5 teams / ~25 | 3 teams / ~15 | **3 teams / ~15** | — |
| **Atoms title** | Lead SWE & TPM | Lead SWE & TPM | Technical Program Manager | — | — |
| **Akoma title** | SWE → Product Manager | SWE → Product Manager | Lead Software Engineer | — | — |
| **Rust proficiency** | Listed unqualified | "specializing in Go, Rust" | Reader-level + AI-assisted | **Reader-level** | — |
| **NetWeave routing** | "congestion-aware A* routing with BFS fallback" | Same | Future extension | **Future work** | — |
| **Education GPA** | B.S. 3.65 / M.S. 3.75 | Same | Omitted (transcript shows 3.53) | — | — |
| **Phenotype classification** | No classification | No classification | "Variable, leisure-time" | — | — |
| **Phone number** | Included | Included | Omitted | — | — |

---

## 3. Content Gaps: DOCX Files vs. Live Site

### Projects in DOCX but not prominently on site
- **Frostify** (3,350+ downloads) — in both DOCX files, not in prior consolidation
- **OmniRoute** (#5 external contributor, 101 merged PRs) — only in Universal DOCX
- **LLM-Lab** (MLX/Metal, speculative decoding) — only in Universal DOCX
- **ForgeCode** (Rust CLI/TUI, SQLite, FTS) — only in Universal DOCX
- **Phenotype Journeys** (Rust test framework) — only in Universal DOCX

### Projects on site but not in DOCX
- **ShareCLI** — in Universal DOCX as first selected project; present on site
- **NetWeave** — in both DOCX and site
- All 15+ case study routes on site have deeper content than any resume variant

### Metrics discrepancy
- DOCX files include richer commercial detail ($432K, 4,900 items, 10-region network, 40+ manufacturers, 142K+ views)
- Prior consolidation retained only user-confirmed revenue/line-item counts
- Both DOCX files have the "30 days" copy defect noted in prior audit

---

## 4. Alignment with "Technical Atelier" Positioning

The site tagline "Technical Atelier" suggests a craft-oriented, technically deep identity that blends engineering rigor with product sensibility.

| Resume Variant | Alignment | Rationale |
|----------------|-----------|-----------|
| **Universal DOCX** | ★★★★☆ | Strongest technical depth; Go/Rust/systems specialization matches "atelier" craft ethos |
| **MGMTProduct DOCX** | ★★★☆☆ | Good breadth but program-management framing dilutes the technical craft signal |
| **Prior Universal** | ★★★★☆ | Conservative + technically balanced; missing some depth from Universal DOCX |
| **Prior SWE** | ★★★★☆ | Tight technical focus; too narrow for the breadth the site showcases |
| **Prior PM** | ★★☆☆☆ | Weakest match; hardware-program framing doesn't align with "atelier" |

**Recommendation**: The Universal Engineering DOCX is closest to the "Technical Atelier" positioning but needs these corrections:
1. Fix team count from 5/~25 to 3/~15
2. Downgrade Rust from "specializing" to "reader-level + AI-assisted"
3. Mark NetWeave congestion routing as future work
4. Add "Variable, leisure-time" classification for Phenotype
5. Consider including OmniRoute contribution (#5 external, 101 PRs) as a credibility signal

---

## 5. Recommended Next Steps

1. **Resolve team count**: Both DOCX files say 5/~25. User confirmed 3/~15 on Sept 9. Either DOCX is stale or the user changed their mind. Confirm before any export.

2. **Choose headline**: Current options:
   - "Software Engineer specializing in Go, Rust, distributed systems..." (Universal DOCX)
   - "Engineering, Product and Technical Programs" (site resume page)
   - "Technical Atelier" (site homepage)
   - Recommend: **"Software Engineer — Systems, Agent Infrastructure, and Technical Products"** (bridges the atelier identity with resume readability)

3. **Merge best content**: The Universal DOCX has richer project coverage (OmniRoute, ForgeCode, LLM-Lab, systems admin) that the prior consolidation missed. These should be folded into updated variants.

4. **Reconcile education**: Transcript GPA (3.53) differs from DOCX claims (3.65/3.75). Prior consolidation correctly omitted GPA. Keep omitting.

5. **Generate updated variants**: After resolving conflicts, regenerate SWE/PM/TPM/Universal with the richer DOCX content and corrected metrics.

6. **Deploy to site**: Update the SPA resume content to reflect the consolidated canonical version.
