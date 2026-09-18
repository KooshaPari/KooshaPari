// Writing / blog content for kooshapari.com.
//
// Each post is structured so the renderer (`scripts/views/blog-post.js`)
// can lay it out without parsing markdown. Sections are ordered and
// typed: `heading` for H2/H3, `para` for paragraphs, `list` for bulleted
// groups, `code` for code blocks, `quote` for blockquotes, `hr` for
// separators, `note` for callouts.
//
// Source-of-truth content lives here, not in markdown files — keeps the
// SPA shell happy and avoids a markdown parser dependency.

export const POSTS = [
  {
    slug: 'why-we-forked-omniroute',
    title: 'Why we forked OmniRoute — and how to avoid it',
    excerpt:
      'OmniRoute is one of the most active AI routing projects on GitHub. I shipped 101 merged PRs to it as an external contributor before we forked it. So why fork at all?',
    date: '2026-09-03',
    readingTime: '9 min',
    tags: ['AI Infrastructure', 'Open Source', 'Forks'],
    provenance: 'External OSS contribution note',
    body: [
      { type: 'para', text: "If you've worked on AI infrastructure at any non-trivial scale, you've probably hit the same wall we did: there are dozens of model providers, each with its own quirks, rate limits, and failure modes, and no single vendor handles all of them gracefully. That's the gap OmniRoute fills. It's a single API surface that fronts the long tail of providers — Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter, plus a growing list of community adapters — with retries, fallbacks, and routing intelligence layered on top. As of this writing, it has roughly 60,000 stars and is one of the most active AI routing projects on GitHub." },
      { type: 'para', text: "I spent the month of June 2026 contributing to OmniRoute as an external contributor. By July 18th I'd shipped 101 merged pull requests and was ranked #5 in the upstream contributor census, with work referenced in 21 upstream release notes. That alone is the kind of signal most teams would treat as 'good enough — keep working upstream.' So the natural follow-up question is: why fork it at all?" },
      { type: 'para', text: "The answer isn't 'OmniRoute is broken' or 'the maintainer is unresponsive.' Diego Souza has been consistently responsive, the project's velocity is high, and the upstream architecture is well-thought-through. The answer is a much narrower one about how production deployments of AI infrastructure eventually diverge from a general-purpose open-source project, and what to do about it when they do." },

      { type: 'heading', level: 2, text: 'What broke for us at scale' },
      { type: 'para', text: "Phenotype runs OmniRoute in production in front of roughly a dozen model providers. By mid-2026 we had a few specific operational needs that didn't quite fit the upstream shape:" },
      { type: 'list', items: [
        "Provider-specific rate limit semantics. Upstream has a generic 'cooldown' model that works for 90% of providers. We needed different cooldown curves per provider family — Anthropic's TPM behavior differs from OpenAI's RPM behavior, which differs from Groq's burst handling, which differs from the OpenRouter pass-through. None of these distinctions are upstream anti-patterns; they're just not yet modeled in upstream.",
        "Multi-tenant fallback chaining. We route traffic across multiple upstream accounts and need predictable degradation semantics when one account burns out. Upstream's fallback cache scoping is correct as a default but doesn't expose enough hooks for our workload pattern.",
        "Audit trails. Our compliance posture requires per-request forensic logging of routing decisions: which provider was tried first, why the fallback fired, what the latency profile looked like, what token cost was incurred. Upstream's logging is good; our requirements are stricter than upstream's policy.",
        "CI surface. Our CI runs roughly 12,000 unit tests across 40 packages and needs stable, predictable test runs in a fork-only environment. Upstream's CI is fine for upstream's release cadence but doesn't have the gating we need for our internal pre-merge cycle.",
        "Internal tooling. We have home-grown tools — agileplus, phenodag, a custom dockerized runner — that are meaningless to upstream but necessary for our engineering velocity.",
      ] },
      { type: 'para', text: "None of these are blockers. Each one is a small adaptation. Collectively, they made a fork the right call." },

      { type: 'heading', level: 2, text: 'How we keep the fork aligned' },
      { type: 'para', text: "The single biggest mistake you can make with a fork of an active upstream is letting it drift. A fork that hasn't rebased in six months is a fork that has to be re-merged by hand, and at that point you've stopped maintaining a fork and started maintaining a competing project." },
      { type: 'para', text: 'We use a simple set of disciplines:' },
      { type: 'list', items: [
        "Daily git fetch upstream and weekly rebase cycles. All our feature branches rebase onto upstream/release/v3.8.x before merge into fork main. We pin the current upstream SHA in a .upstream-ref file and have a CI check that fails if that file is stale (more than 30 days old).",
        "Linear history enforced on main. No merge commits. Each fork commit is either (a) a cherry-pick of upstream, (b) a fork-only change on top of upstream HEAD, or (c) a back-port of a future-upstream change we needed early. The linear history keeps the diff against upstream trivial to compute and review.",
        "Upstream-first PRs. Every fix that could plausibly benefit upstream gets sent upstream first as a PR. We then either wait for merge or carry the patch as a fork-only commit with a stable identifier in the commit message. Out of the 101 PRs I'd already merged upstream before we forked, the pattern continued — roughly 85% of our fork-only commits end up as upstream PRs within 60 days.",
        "Branch protection as a tripwire. The fork's main requires 1 PR review, dismisses stale approvals on push, and disallows force-pushes. Upstream itself has no branch protection (single-maintainer pattern), but the fork's stricter setting has caught two of our own mistakes before they hit the trunk.",
        "A divergence manifest. A machine-readable JSON file enumerates every fork-only commit with its rationale, upstream-equivalent status (sent / awaiting-review / declined / not-applicable), and merge-odds estimate. This file is read by our CI on every PR and used to gate 'this fork-only commit should have been upstream first' warnings.",
      ] },

      { type: 'heading', level: 2, text: "What we're contributing back, not carrying" },
      { type: 'para', text: 'The bulk of our fork-only commits are things like:' },
      { type: 'list', items: [
        "Provider-specific cooldown curves (these are now in flight upstream as standalone PRs)",
        "An additional audit-log schema (sent upstream, awaiting review)",
        "A small handful of test-suite reorganizations (some already merged, some declined as overly opinionated)",
        "Internal-only tooling files in directories like .agileplus/ and worklogs/ — these are explicitly not upstream-portable and are git-ignored from the public mirror",
      ] },
      { type: 'para', text: 'We carry roughly 700–800 fork-only commits ahead of upstream main at any given time. About 75% of them are CI/build tooling, ~15% are provider-specific behavior, ~10% are internal-only artifacts that never go upstream.' },

      { type: 'heading', level: 2, text: "What the fork is not" },
      { type: 'para', text: "It's worth being explicit about what our fork isn't:" },
      { type: 'list', items: [
        "Not a competing product. OmniRoute is the product. We're heavy users of it and depend on it. The fork is an extension, not a replacement.",
        "Not a long-term divergence. The whole point of the fork is to converge with upstream as fast as possible. Branches in our fork that aren't on a path to upstream get retired on a 90-day clock.",
        "Not an opinionated re-architecture. When upstream's architecture doesn't fit our needs, we work around it in the fork rather than re-designing it. Upstream's design choices are upstream's call.",
        "Not a candidate for a separate brand. We don't ship a 'PhenRoute' or similar. The whole point is to keep the fork's relationship to upstream legible: fork → upstream → fork → upstream.",
      ] },

      { type: 'heading', level: 2, text: "If you're considering a fork yourself" },
      { type: 'para', text: 'A few heuristics from our experience:' },
      { type: 'list', items: [
        "Fork when you have 3+ concrete operational needs that don't fit upstream. One quirk is a patch. Two quirks is a configuration. Three is a fork.",
        "Fork when your CI/audit/security posture is meaningfully stricter than upstream's default. If you just need a feature, send a PR upstream. If you need a guarantee upstream can't make, fork.",
        "Don't fork if you're going to rebrand or re-architect. That's a competing project, not a fork. Use a different name and a different namespace.",
        "Don't fork if you can't commit to the discipline. A fork that drifts is a tax you'll pay forever. If you can't commit to weekly rebase cycles and upstream-first PRs, you'll end up rewriting the fork in two years.",
      ] },

      { type: 'heading', level: 2, text: "What's next" },
      { type: 'para', text: "The longer-term question — and one we don't have a perfect answer to — is whether the right end-state is 'fork forever' or 'upstream absorbs fork-only features and we deprecate the fork in a year or two.' Diego and I have discussed this and the working hypothesis is that we'll converge: most of what we're carrying is upstream-portable, and a year from now the fork will be roughly 50 commits deep instead of 700+. We'll see." },
      { type: 'para', text: "For now, the fork exists because it has to, and it's small enough that it costs us very little to maintain. The 101 PRs I shipped upstream before we forked weren't wasted — they're the social capital that makes the fork relationship healthy. Upstream knows us, trusts us, and accepts most of what we send. That's a much better state than 'random external fork with no shared history.'" },

      { type: 'hr' },

      { type: 'note', text: "If you're working on AI infrastructure and want to talk shop, find me on LinkedIn or open an issue in KooshaPari/OmniRoute." },
    ],
  },
  {
    slug: 'what-keycaps-taught-me-about-systems',
    title: 'What 4,900 keycap sets taught me about systems engineering',
    excerpt:
      'I ran a mechanical keyboard group buy that sold 4,900 units across 10 countries in 30 days. The operational lessons map directly to how I build software systems.',
    date: '2026-09-10',
    readingTime: '7 min',
    tags: ['Systems Engineering', 'Physical Products', 'Lessons'],
    provenance: 'Personal experience',
    body: [
      { type: 'para', text: "In 2021 I launched GMK Arch, a mechanical keyboard keycap set designed around Arch Linux visual language. It sold approximately 4,900 units across roughly 10 countries in 30 days, generating approximately $432K in revenue. The project involved supplier coordination, demand forecasting, pricing strategy, and international fulfillment logistics — all managed by one person with no prior hardware shipping experience." },
      { type: 'para', text: "That experience shaped how I think about software systems more than any single engineering project. Here's why." },

      { type: 'heading', level: 2, text: 'Demand forecasting is a systems problem' },
      { type: 'para', text: "When you run a group buy, you don't know the final demand until orders close. You commit to manufacturing quantities weeks before you know the real number. I started with an expectation of approximately 15 units for WITF (a later project), watched interest climb toward approximately 100, then watched it settle back to approximately 50 as timing and market conditions shifted." },
      { type: 'para', text: "This is the same problem as capacity planning in distributed systems. You don't know the real load until production traffic arrives. You commit resources based on projections. The systems that work are the ones that degrade gracefully when projections are wrong — not the ones that require perfect forecasts." },
      { type: 'para', text: "When I built Substrate's provider routing layer, I applied the same principle: design for the capacity you expect, but make the degradation path explicit when reality diverges from the plan. Circuit breakers, fallback chains, and budget enforcement are the software equivalent of renegotiating with your supplier mid-production." },

      { type: 'heading', level: 2, text: 'Supplier coordination is dependency management' },
      { type: 'para', text: "GMK Arch required coordinating with GMK (the manufacturer), 10+ regional vendors across US, Canada, South America, EU, Oceania, Southeast Asia, UK, Korea, China, and Norway, plus designers, material suppliers, and logistics providers. Each had their own timeline, constraints, and failure modes." },
      { type: 'para', text: "The software parallel is dependency management in a multi-service system. Each provider (Anthropic, OpenAI, Gemini, Groq) has different rate limits, different failure modes, different cooldown semantics. When I built OmniRoute's routing intelligence, the lessons from supplier coordination were immediately applicable: map the failure modes of each dependency, build explicit fallback paths, and don't assume one provider's behavior generalizes to all." },

      { type: 'heading', level: 2, text: 'Cost reduction is architecture optimization' },
      { type: 'para', text: "Through supplier negotiation and manufacturing process optimization, I reduced the per-unit cost of the WITF Board from over $500 to approximately $350 all-in — a reduction of more than 40%. The savings came from understanding the manufacturing process deeply enough to identify where costs could be reduced without compromising quality." },
      { type: 'para', text: "This maps directly to performance optimization in software. The biggest gains come from understanding the system deeply enough to find the real bottlenecks, not from applying generic optimizations. When I optimized ShareCLI's process observation layer, the 40% reduction in overhead came from understanding the Linux kernel's process accounting well enough to avoid redundant syscalls — the same principle as understanding your supplier's cost structure well enough to negotiate effectively." },

      { type: 'heading', level: 2, text: 'Fulfillment is deployment' },
      { type: 'para', text: "Getting 4,900 units from a factory in China to 10 countries with different customs regulations, shipping carriers, and delivery expectations is a logistics problem that parallels software deployment. You need rollback paths (what happens when a shipment is delayed?), monitoring (tracking numbers, delivery confirmations), and graceful degradation (what happens when one region's customs process blocks imports?)." },
      { type: 'para', text: "The WITF Board taught me this more viscerally. When our external pick-and-pack provider changed terms mid-fulfillment, I had to adapt the distribution model in real time. That's the same as a cloud provider changing their API mid-deployment — you need the architecture to absorb the change without failing the entire release." },

      { type: 'heading', level: 2, text: 'The durable lesson' },
      { type: 'para', text: "The durable lesson from physical product work is that systems engineering isn't just about code. It's about understanding constraints, mapping failure modes, building explicit fallback paths, and designing for graceful degradation — whether the system is a keycap group buy or a multi-provider AI routing layer." },
      { type: 'para', text: "The 4,900 units shipped. The 10-region retail network held. The $432K in revenue arrived. And the engineering lessons from that process continue to shape how I build software systems today." },

      { type: 'hr' },
      { type: 'note', text: "All figures are approximate and sourced from canonical user facts documented in the project evidence ledger. Line items are not customers." },
    ],
  },
  {
    slug: 'building-at-the-systems-boundary',
    title: 'Building at the systems boundary',
    excerpt:
      'Where process management, provider routing, and runtime constraints shape what software can actually do — and why I choose to work there.',
    date: '2026-09-12',
    readingTime: '6 min',
    tags: ['Systems Engineering', 'Rust', 'Architecture'],
    provenance: 'Personal experience',
    body: [
      { type: 'para', text: "There's a boundary in software engineering where the abstractions stop working. It's the place where your process management code hits the Linux kernel's scheduler, where your provider routing hits a real rate limit, where your FUSE mount hits the filesystem's actual behavior. Most software is written above this boundary, relying on abstractions that usually hold. I choose to work at the boundary itself." },

      { type: 'heading', level: 2, text: 'What the boundary looks like' },
      { type: 'para', text: "When I built ShareCLI — a Rust runtime for observing and coordinating hundreds of concurrent AI coding agents — the boundary was everywhere. Process observation required understanding how the kernel reports process state. FUSE-backed views required understanding how the filesystem actually behaves under concurrent access. Thermal pressure monitoring required understanding how hardware throttling affects user-visible performance." },
      { type: 'para', text: "The abstractions don't hide these details. They expose them. The engineering challenge is deciding which details matter for the user-visible behavior and which are noise." },

      { type: 'heading', level: 2, text: 'Why systems work is different' },
      { type: 'para', text: "Application-level engineering is about features, UX, and business logic. Systems engineering is about constraints, failure modes, and observable behavior under load. The skill set overlaps but the mindset is different." },
      { type: 'para', text: "When I built Substrate's provider routing layer — an OpenAI-compatible dispatch gateway with SSE streaming, token-bucket rate limiting, full-jitter retry, circuit breakers, and budget enforcement — every design decision was shaped by real provider behavior. Anthropic's TPM behavior differs from OpenAI's RPM behavior, which differs from Groq's burst handling. The system had to be correct under all of these behaviors simultaneously." },
      { type: 'para', text: "This isn't a theoretical exercise. When a provider fails at 3 AM, the system needs to degrade gracefully, route around the failure, and maintain latency budgets — all without human intervention. The engineering that makes that work lives at the boundary between your routing logic and the provider's actual behavior." },

      { type: 'heading', level: 2, text: 'The verification problem' },
      { type: 'para', text: "The hardest part of systems work isn't building the system — it's verifying it works. Application code can be tested with unit tests and integration tests. Systems code needs to be tested against real hardware, real providers, real concurrent load, and real failure modes." },
      { type: 'para', text: "When I built phenotype-omlx — an Apple Silicon inference research fork with Rust performance cores and multi-backend routing — the verification required running actual inference workloads across MLX, Metal, C, Rust, Zig, Mojo, and Nim backends. Each backend had different memory bandwidth characteristics, different quantization behaviors, and different concurrency limits. The evaluation harness had to measure real performance, not synthetic benchmarks." },
      { type: 'para', text: "This is why I value evidence-led engineering. Every claim about system behavior needs to be backed by observable evidence. The evidence ledger approach — documenting what was observed, when, and under what conditions — isn't bureaucracy. It's the only reliable way to verify that a systems-level claim is true." },

      { type: 'heading', level: 2, text: 'Why I choose this work' },
      { type: 'para', text: "Working at the boundary is harder than working above it. The failure modes are more complex. The verification is more difficult. The debugging requires understanding multiple layers of the stack simultaneously." },
      { type: 'para', text: "But the work is more interesting, and the engineering decisions are more consequential. A well-designed routing layer affects every request that passes through it. A well-designed process observer affects every agent that runs on the system. The leverage is higher, and the lessons transfer across projects." },
      { type: 'para', text: "That's where I build. At the boundary. Where the abstractions stop and the real behavior begins." },

      { type: 'hr' },
      { type: 'note', text: "If you're working on systems-level infrastructure and want to compare notes, find me on LinkedIn or GitHub." },
    ],
  },
  {
    slug: 'declarative-deployment-separating-intent-from-execution',
    title: 'Declarative deployment: separating intent from execution',
    excerpt:
      'BytePort models deployment as intent, not commands. The insight is simple: what you want to deploy is a different question from how it gets deployed.',
    date: '2026-09-14',
    readingTime: '6 min',
    tags: ['Deployment', 'Go', 'Infrastructure'],
    provenance: 'Project experience',
    body: [
      { type: 'para', text: "Most deployment tools are imperative. You tell them what to do: push this container, rotate that DNS record, drain the old instance. The tool executes the steps in order and hopes nothing goes wrong in between. This works until it doesn't — and it stops working the moment you need to change something mid-deployment, roll back partially, or understand what a deployment actually did after the fact." },
      { type: 'para', text: "BytePort takes a different approach. It models deployment as intent — a declarative description of what the system should look like — rather than a sequence of commands. The runtime figures out how to get from the current state to the desired state, and it does so in a way that's observable, reversible, and composable." },

      { type: 'heading', level: 2, text: 'Why declarative matters' },
      { type: 'para', text: "The Kubernetes community learned this lesson a decade ago: declarative state is easier to reason about than imperative commands. But most deployment tooling outside Kubernetes is still imperative. You run a script, the script does things, and you hope the script is idempotent." },
      { type: 'para', text: "BytePort applies the declarative pattern to Go/AWS deployments. You declare the desired state — which services run where, what networking they need, what secrets they access — and the system computes the delta. This means:" },
      { type: 'list', items: [
        "Partial deployments are first-class. You can change one service without touching the others. The system knows what changed and only touches what's affected.",
        "Rollback is trivial. Revert to the previous declaration and the system computes the reverse delta. No special rollback scripts, no 'hope this works' moments.",
        "Audit is automatic. Every deployment is a diff between two declarations. The audit trail is the declaration history, not a log of imperative commands.",
        "Concurrent changes compose. Two teams can declare changes to different services and the system merges them correctly, because declarations don't conflict when they address different resources.",
      ] },

      { type: 'heading', level: 2, text: 'The Go/AWS fit' },
      { type: 'para', text: "Go is a good fit for deployment tooling because it compiles to a single binary, has excellent concurrency primitives for managing parallel infrastructure operations, and the standard library covers most of what you need for AWS API interaction. The AWS SDK for Go is mature and well-documented." },
      { type: 'para', text: "The challenge isn't the language — it's the state management. Computing the delta between current and desired state requires understanding every AWS resource's lifecycle, idempotency characteristics, and failure modes. EC2 instances behave differently from RDS instances, which behave differently from Lambda functions, which behave differently from S3 buckets. A deployment tool that treats them all the same will break on the edge cases." },

      { type: 'heading', level: 2, text: 'What we learned' },
      { type: 'para', text: "The most valuable insight from building BytePort wasn't technical. It was that deployment safety comes from separating current delivery from planned features. Most deployment failures happen because teams bundle 'what I need now' with 'what I'll need later' into a single deployment. BytePort's model makes these independent: you can declare a current delivery that's safe and tested, and a planned feature that's experimental, and deploy them through the same system without coupling their risk." },
      { type: 'para', text: "This principle — separating intent from execution, separating delivery from features — is the kind of architectural decision that seems obvious in retrospect but shapes every system built after it." },

      { type: 'hr' },
      { type: 'note', text: "BytePort is open-source at github.com/KooshaPari/BytePort. If you're building deployment tooling, I'd like to hear about the patterns that worked for you." },
    ],
  },
  {
    slug: 'running-hundreds-of-ai-agents-without-losing-your-mind',
    title: 'Running hundreds of AI agents without losing your mind',
    excerpt:
      'ShareCLI observes and coordinates hundreds of concurrent AI coding agents. The engineering is about visibility, not control.',
    date: '2026-09-16',
    readingTime: '7 min',
    tags: ['AI Agents', 'Rust', 'Observability'],
    provenance: 'Project experience',
    body: [
      { type: 'para', text: "When you run a single AI coding agent, the engineering challenge is making it useful. When you run 300 concurrently, the engineering challenge is making them observable. Control is an illusion at that scale — you can't review 300 diffs, approve 300 PRs, or debug 300 concurrent sessions. What you can do is build a system that tells you what's happening, flags anomalies, and lets you intervene where it matters." },
      { type: 'para', text: "ShareCLI is a Rust runtime for observing and coordinating concurrent AI agents. It provides process-level visibility, FUSE-backed virtual views, thermal pressure monitoring, and structured session recording. It doesn't control the agents — it makes their behavior visible." },

      { type: 'heading', level: 2, text: 'The observation problem' },
      { type: 'para', text: "AI coding agents are processes. They consume CPU, memory, and GPU resources. They make API calls, write files, run tests, and produce diffs. At 300 concurrent agents, the aggregate behavior is complex enough that individual agent debugging is impractical. You need system-level observability." },
      { type: 'para', text: "ShareCLI's approach is to instrument at the process level. It observes process state (running, sleeping, waiting), resource consumption (CPU, memory, thermal pressure), and output artifacts (files changed, tests run, diffs produced). This data feeds into structured session records that can be queried after the fact." },
      { type: 'para', text: "The key insight is that observation should be passive. The act of observing shouldn't change the agent's behavior. ShareCLI reads process state from the kernel's proc interface, reads file system events from inotify, and reads API traffic from network-level instrumentation. None of this requires injecting code into the agent processes." },

      { type: 'heading', level: 2, text: 'FUSE as a design surface' },
      { type: 'para', text: "One of ShareCLI's more unusual features is its FUSE-backed virtual views. A FUSE filesystem is a filesystem implemented in userspace — the kernel forwards filesystem operations to your code, and your code responds with data. This lets you present a virtual filesystem that aggregates data from multiple sources." },
      { type: 'para', text: "ShareCLI uses FUSE to present a unified view of all agent sessions. The virtual filesystem exposes session state, diffs, test results, and resource consumption as files. You can navigate this view with standard tools — ls, cat, grep — without learning a new interface. The virtual filesystem is read-only, so it can't accidentally modify agent state." },
      { type: 'para', text: "The design trade-off is complexity. FUSE is a kernel interface with strict correctness requirements. A bug in the FUSE handler can hang the entire filesystem. ShareCLI's handler is deliberately simple — it reads from pre-computed indexes and returns data directly, with no mutable state and no blocking operations." },

      { type: 'heading', level: 2, text: 'Thermal awareness' },
      { type: 'para', text: "When you run hundreds of concurrent processes on Apple Silicon, thermal pressure becomes a real constraint. The CPU throttles under sustained load, and the throttle behavior is non-obvious: it's not a simple temperature threshold, it's a power-envelope model that considers sustained power draw, instantaneous power, and thermal dissipation." },
      { type: 'para', text: "ShareCLI monitors thermal pressure through the powermetrics interface and adjusts its scheduling recommendations accordingly. When thermal pressure is high, it suggests deferring non-urgent agents and prioritizing the ones closest to completion. This isn't强制throttling — it's visibility. The human operator makes the scheduling decision, armed with thermal data." },

      { type: 'heading', level: 2, text: 'What we built for ourselves' },
      { type: 'para', text: "ShareCLI grew out of a practical need: running multi-repo engineering work across several harnesses simultaneously. Each harness (Jcode, Codex, ForgeCode) manages its own agents, but there was no unified view of what was happening across all of them. ShareCLI provides that view." },
      { type: 'para', text: "The structured session recording is the most valuable feature for our workflow. Every agent session produces a record with timestamps, file changes, test results, and resource consumption. When something goes wrong — a test failure, a merge conflict, a resource exhaustion — the session record provides the evidence needed to diagnose the issue without reproducing it." },

      { type: 'heading', level: 2, text: 'The durable lesson' },
      { type: 'para', text: "The durable lesson from ShareCLI is that observability is the engineering discipline that scales. Control doesn't scale — you can't manually manage 300 agents. Automation doesn't fully scale — you can't anticipate every failure mode. But observation scales because it provides the information needed for both human judgment and automated responses." },
      { type: 'para', text: "Build systems that show you what's happening. The decisions about what to do about it can come from humans, from automation, or from both. But the visibility has to be there first." },

      { type: 'hr' },
      { type: 'note', text: "ShareCLI is part of the KooshaPari ecosystem on GitHub. If you're building agent orchestration tooling, I'm interested in comparing approaches." },
    ],
  },
];
