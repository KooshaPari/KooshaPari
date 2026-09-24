/* ============================================================
 *  Koosha Paridehpour — Public Record (citation-backed)
 *  Source: external research generated 2026-08-25 by sage agents.
 *  Additive to the resume-derived profile in phenotype.js.
 *  Does NOT replace or overwrite any resume-derived data. The
 *  "Public Record" tab consumes this to render the Resume vs.
 *  Public-Record contrast table and the citation-backed
 *  social/legal/patent findings.
 * ============================================================ */
export const PUBLIC_RECORD = {
  generatedAt: "2026-08-25",
  generatedBy: "Phase 2 external research (sage agents, citation-backed)",
  headline:
    "One person, two product surfaces: a hardware-keyboard Shopify brand AND a separate agent/dev-tools GitHub portfolio — wired into the same CA LLC.",

  resumeVsPublic: [
    {
      claim: "Phenotype = AI-software platform",
      resumeSays:
        "Senior Software Engineer / Founder at Phenotype (systems + product framing)",
      publicRecord:
        "phenotype.us is a Shopify storefront for mechanical keycap sets (GMK Arch, DSS Cipher, WITF Board). The 'AI platform' framing lives on a separate site: projects.kooshapari.com (84 GitHub projects, auto-generated).",
      verdict: "contradicts",
      citations: [
        "https://phenotype.us",
        "https://projects.kooshapari.com",
        "https://github.com/KooshaPari?tab=repositories",
      ],
    },
    {
      claim: "Polished senior engineering voice",
      resumeSays: "Bilingual thought-leadership tone, calm confidence",
      publicRecord:
        "GitHub bio (verbatim): '12yr SysAdmin \\\\ Script Kiddie 5yr PM \\\\ 3yr SWE AI Slop Post ~Apr 2025. :( Meant for my fun only, dont appr. PR\\\\Commits and don't believe READMEs'",
      verdict: "contradicts",
      citations: ["https://github.com/KooshaPari"],
    },
    {
      claim: "2 patents pending",
      resumeSays: "Two pending patent applications referenced in both PDFs",
      publicRecord:
        "0 results on Google Patents AND 0 results on PatentsView for inventor 'Koosha Paridehpour'. Recommended next search: re-query PatentsView by ASSIGNEE 'MP Advance Solutions LLC' (USPTO PAIR requires login).",
      verdict: "unverified",
      citations: [
        "https://patents.googleapis.com/v1/patents:search?q=inventor%3D%22Koosha+Paridehpour%22",
        "https://patentsview.org",
      ],
    },
    {
      claim: "ASU Barrett Honors + BSc/MSc CS Dec 2025 / Dec 2026",
      resumeSays:
        "Barrett, The Honors College; BSc CS Dec 2025, MSc CS Dec 2026 at Arizona State University",
      publicRecord:
        "No ASU directory record surfaced for 'Koosha Paridehpour'. No honors thesis, no conference talks (HackMIT/TreeHacks/CalHacks), no arXiv/ResearchGate/ORCID/Google Scholar publications.",
      verdict: "unverified",
      citations: ["https://search.asu.edu"],
    },
    {
      claim: "Bilingual thought-leadership / public voice",
      resumeSays:
        "Implies a polished, public-facing engineering persona",
      publicRecord:
        "Medium titles that match the cynical/casual GitHub bio, NOT the resume voice: 'Why I stopped being a Product Manager', 'You could replace me with an LLM', 'Pivot table from Google Sheets and Microsoft Excel using Rust'.",
      verdict: "contradicts",
      citations: ["https://medium.com/@kooshapari"],
    },
    {
      claim: "Co-author on OsireLLM (38★)",
      resumeSays: "SDK / dev-tools staff work",
      publicRecord:
        "KooshaPari/OsireLLM is a co-authored repo on the @KooshaPari GitHub (38 stars). Genuine SDK work, matches the 'dev-tools' framing.",
      verdict: "matches",
      citations: ["https://github.com/KooshaPari/OsireLLM"],
    },
    {
      claim: "Legal entity = MP Advance Solutions LLC",
      resumeSays: "Phenotype is the operating brand",
      publicRecord:
        "MP Advance Solutions LLC, California, ACTIVE, formed Oct 2020. phenotype.us footer reads '© MP Advance Solutions LLC DBA Phenotype'. Trademark 'Phenotype' implied to LLC.",
      verdict: "matches",
      citations: [
        "https://www.bizapedia.com/ca/mp-advance-solutions-llc.html",
        "https://phenotype.us",
      ],
    },
  ],

  github: {
    handle: "KooshaPari",
    url: "https://github.com/KooshaPari",
    userId: 42529354,
    repos: 121,
    stars: 390,
    followers: 20,
    following: 6,
    bio:
      "12yr SysAdmin \\ Script Kiddie 5yr PM \\ 3yr SWE AI Slop Post ~Apr 2025. :( Meant for my fun only, dont appr. PR\\Commits and don't believe READMEs",
    topRepos: [
      {
        name: "tracera",
        stars: 180,
        url: "https://github.com/KooshaPari/tracera",
        note: "Top-starred project on the account.",
      },
      {
        name: "OsireLLM",
        stars: 38,
        url: "https://github.com/KooshaPari/OsireLLM",
        note: "Co-authored SDK (matches 'dev-tools' framing).",
      },
      {
        name: "thegent",
        stars: null,
        url: "https://github.com/KooshaPari/thegent",
        note: "Matches local daemon /Users/kooshapari/thegent/.",
      },
      {
        name: "forgecode",
        stars: null,
        url: "https://github.com/KooshaPari/forgecode",
        note: "Most recent activity.",
      },
    ],
    starLists: [
      "Agent Infra",
      "For my agents",
      "Game Dev",
      "Odin-Project",
      "Old Fork Slop",
      "Org Infra Libs",
      "PM",
      "Templates",
    ],
    citations: [
      "https://github.com/KooshaPari",
      "https://github.com/KooshaPari?tab=repositories",
      "https://github.com/KooshaPari?tab=stars",
    ],
  },

  phenotypeBrand: {
    hardware: {
      storeUrl: "https://phenotype.us",
      description:
        "Mechanical-keyboard and keycap Shopify storefront",
      footerConfirmedLegal:
        "© MP Advance Solutions LLC DBA Phenotype",
      phone: "+1 (424) 268-8456",
      products: ["GMK Arch", "DSS Cipher", "WITF Board"],
      citations: ["https://phenotype.us"],
    },
    software: {
      portfolioUrl: "https://projects.kooshapari.com",
      projectCount: 84,
      generatedBy:
        "auto-generated from `gh repo list` filtered to KooshaPari",
      flagshipRepos: [
        "pheno",
        "forgecode",
        "AgilePlus",
        "Apisync",
        "sharecli",
        "phenoEvents",
        "Tokn",
        "SessionLedger",
        "Agentora",
        "phenotype-omlx",
        "Tracera",
        "OmniRoute",
        "phenotype-tooling",
        "thegent",
        "ResearchLedger",
        "portage",
        "PhenoMCPServers",
        "Civis",
        "Dino",
        "nanovms",
        "helios-cli",
        "DataKit",
        "phenoDesign",
        "Configra",
        "substrate",
      ],
      citations: [
        "https://projects.kooshapari.com",
        "https://github.com/KooshaPari?tab=repositories",
      ],
    },
    disambiguation:
      "Same legal entity (MP Advance Solutions LLC), same DBA (Phenotype), two product surfaces: hardware keyboard storefront AND software agent/dev-tools portfolio on GitHub.",
  },

  legalEntity: {
    name: "MP Advance Solutions LLC",
    state: "California",
    status: "Active",
    formed: "2020-10",
    bizapediaUrl: "https://www.bizapedia.com/ca/mp-advance-solutions-llc.html",
    citations: ["https://www.bizapedia.com/ca/mp-advance-solutions-llc.html"],
  },

  trademark: {
    mark: "Phenotype",
    owner: "MP Advance Solutions LLC (NOT the individual)",
    goodsServices:
      "Software / SaaS / downloadable computer programs",
    firstUseInCommerce: "2020-10",
    verificationStatus:
      "Implied via CA SOS + phenotype.us footer; USPTO TESS direct record not fetched in this pass.",
    citations: [
      "https://phenotype.us",
      "https://www.bizapedia.com/ca/mp-advance-solutions-llc.html",
    ],
  },

  patents: {
    claimed: "2 patents pending (per PDFs)",
    publicSearchResult:
      "0 results on Google Patents + PatentsView for inventor 'Koosha Paridehpour'",
    confidence:
      "medium-high (single source path; USPTO PAIR requires login and was not attempted)",
    recommendedNextSearch:
      "Re-search PatentsView by ASSIGNEE 'MP Advance Solutions LLC'",
    citations: [
      "https://patents.googleapis.com/v1/patents:search?q=inventor%3D%22Koosha+Paridehpour%22",
      "https://patentsview.org",
    ],
  },

  socialHandles: [
    { platform: "GitHub", handle: "@KooshaPari", url: "https://github.com/KooshaPari", confidence: "high" },
    { platform: "LinkedIn", handle: "/in/kooshapari", url: "https://www.linkedin.com/in/kooshapari", confidence: "high" },
    { platform: "LinkedIn", handle: "/in/kooshapari-ram-designs (historical)", url: "https://www.linkedin.com/in/kooshapari-ram-designs", confidence: "high" },
    { platform: "Hacker News", handle: "kooshapari", url: "https://news.ycombinator.com/user?id=kooshapari", confidence: "medium-high" },
    { platform: "Instagram", handle: "@kooshapari", url: "https://www.instagram.com/kooshapari/", confidence: "medium" },
    { platform: "Instagram", handle: "@phenotype_us", url: "https://www.instagram.com/phenotype_us/", confidence: "medium" },
    { platform: "Medium", handle: "@kooshapari", url: "https://medium.com/@kooshapari", confidence: "medium" },
    { platform: "Devpost", handle: "kooshapari", url: "https://devpost.com/kooshapari", confidence: "medium" },
    { platform: "Swimcloud", handle: "kooshapari", url: "https://www.swimcloud.com/swimmer/kooshapari", confidence: "medium" },
    { platform: "Hashnode", handle: "@kooshapari", url: "https://hashnode.com/@kooshapari", confidence: "low" },
    { platform: "dev.to", handle: "kooshapari", url: "https://dev.to/kooshapari", confidence: "low" },
    { platform: "Substack", handle: "@kooshapari", url: "https://substack.com/@kooshapari", confidence: "low" },
    { platform: "Toptal", handle: "koosha-paridehpour", url: "https://www.toptal.com/resume/koosha-paridehpour", confidence: "low" },
    { platform: "Twitter/X", handle: "NOT FOUND", url: "", confidence: "NOT FOUND" },
    { platform: "YouTube", handle: "NOT FOUND", url: "", confidence: "NOT FOUND" },
    { platform: "Bluesky", handle: "NOT FOUND", url: "", confidence: "NOT FOUND" },
    { platform: "Mastodon", handle: "NOT FOUND", url: "", confidence: "NOT FOUND" },
    { platform: "Threads", handle: "NOT FOUND", url: "", confidence: "NOT FOUND" },
    { platform: "ORCID", handle: "NOT FOUND", url: "", confidence: "NOT FOUND" },
    { platform: "ResearchGate", handle: "NOT FOUND", url: "", confidence: "NOT FOUND" },
    { platform: "Google Scholar", handle: "NOT FOUND", url: "", confidence: "NOT FOUND" },
  ],

  writing: [
    { title: "Why I stopped being a Product Manager", url: "https://medium.com/@kooshapari", confidence: "medium (title only, article not opened)" },
    { title: "Pivot table from Google Sheets and Microsoft Excel using Rust", url: "https://medium.com/@kooshapari", confidence: "medium" },
    { title: "You could replace me with an LLM", url: "https://medium.com/@kooshapari", confidence: "medium" },
  ],

  personalDomains: [
    { url: "https://kooshapari.com", note: "currently redirects to ramdesigns.xyz" },
    { url: "https://ramdesigns.xyz", note: "personal Adobe Portfolio listing keyboard designs + Phenotype" },
    { url: "https://projects.kooshapari.com", note: "live Phenotype software portfolio (84 projects)" },
  ],

  notFound: [
    "No ASU student directory record for 'Koosha Paridehpour'",
    "No Barrett Honors thesis publication",
    "No conference talks (HackMIT, TreeHacks, CalHacks, MIT CSAIL)",
    "No press / podcast guest appearances",
    "No arXiv, ResearchGate, ORCID, Google Scholar publications",
    "No ProductHunt launches",
    "No Twitter/X, YouTube, Bluesky, Mastodon, Threads handles",
  ],
};

