# Current Downloads DOCX check

Resolution after this read-only snapshot: September 9 user explicitly confirmed `keep 3\15`. Working-copy authority is three teams / approximately 15 contributors. The source comparison below preserves what each unchanged original actually said; its team-count conflict is now resolved and no longer a user question.

Read-only check requested after user identified current DOCX files in Downloads. Original files and generated candidates unchanged. DOCX main-body paragraphs were extracted directly from OOXML using Python standard library; P references below count all `w:p` elements in `word/document.xml`, including blank paragraphs. No page-layout verification of these originals is claimed.

| File in /Users/kooshapari/Downloads | Modified Pacific time | SHA256 | Prior inventory |
|---|---|---|---|
| Eng Resume-2.docx | 2026-09-09 04:17:39 PDT | 7b1380ede887ae55227e99ab7bf66b4f67122bb277946241cab4aae44286968b | New filename; no matching file hash |
| MGMTProduct Resume-4.docx | 2026-09-09 04:17:07 PDT | 560a02f1635214ccaae1aba4b04e7a8405959f5868f6bc28203f0a3f139e8a1b | New filename; no matching file hash |

Comparison baseline: `source-manifest.json` and `variants/{swe,pm,tpm,universal}.md`. Both are current user-supplied documents, not an inference from timestamps alone. Whether either originated as a Google Docs export was not independently established.

## Material differences

| Topic | Current DOCX content | Existing conservative candidates / implication |
|---|---|---|
| Team scale | Engineering P4/P12: THREE teams, approximately15 contributors. Management P4/P14: FIVE teams, approximately25 | Candidates use five teams from historical direct-user evidence. Current sources now conflict with each other; resolve before carrying a count into updated outputs |
| Scope/structure | Engineering includes ShareCLI, Substrate/proxies, BytePort, systems administration, LLM-Lab, ForgeCode, Civis, AgilePlus, Tracera, Journeys, NetWeave, Frostify. Management includes BytePort, agent-control/code intelligence, Tracera, AgilePlus, Benchora, Civis, Frostify and architecture framing | Existing one-page candidates are much narrower and include only NetWeave as a selected project. These DOCX files establish the user's broader current source structure; do not treat minimal generated candidates as replacements |
| Role wording | Both use combined Lead Software Engineer & Technical Program Manager at Atoms and Software Engineer -> Product Manager at Akoma | Candidates use Technical Program Manager / Lead Software Engineer with responsibility evolution; current title wording differs, no effective promotion dates supplied |
| Proficiency | Engineering P4 says Go/Rust specialist; P58 broad language list omits Java. Management P60 includes Rust unqualified | Conflicts with direct-user Rust reader-level and equal Go/TypeScript/Python/Java/C authority already recovered |
| NetWeave | Engineering P52 says built congestion-aware A* with BFS fallback | Existing candidates explicitly preserve congestion-aware/dynamic routing as future per user project description; current draft alone does not establish later implementation evidence |
| Education | Both B.S. GPA3.65 and M.S. Dec2026 GPA3.75, Barrett Honors | Transcript-backed B.S. GPA3.53/Cum Laude differs; candidates omit GPA and unconfirmed expected M.S. date |
| Commercial detail | Both include >40% savings and $500+->$350 example; expanded manufacturer/network/launch/program metrics | Candidates retain only user-confirmed GMK/WITF revenue/line-item counts. Existing baseline caution still applies |
| Frostify | Both header3,350+ downloads; bullet3,000+ over six months | New project in current docs relative to generated candidates; figures may describe different snapshots, not independently checked |
| Systems lab | Engineering P35 measured95% VM performance, two SMMUSD concerts; P36 expanded VPS/Hackintosh history | Richer evidence-bearing content than conservative candidates; metrics not reverified here |
| Contact/classification | Both include phone and GitHub; no internship/capstone/contract/leisure-time classifications | Candidates omit phone and include historical user-specified engagement classifications |
| Copy defect | Engineering P20 ends `30 days.mately $432K in 30 days.` | Visible duplicated text fragment in OOXML, not a rendering artifact |

CVS week3/10, pilot and separate ePA proposal remain consistent. Akoma internal delivery remains consistent. Both name Atoms/Akoma directly, supporting resume-specific naming distinct from LinkedIn anonymity. No current DOCX edits, consolidation, title changes, format generation, external profile or Google Docs changes performed. Next decision belongs to the user/root: use these richer current documents as the working source and reconcile concrete conflicts, especially three versus five teams.
