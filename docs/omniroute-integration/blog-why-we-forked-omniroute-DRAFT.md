# Why we forked OmniRoute — and how to avoid it

**Status:** Draft for operator review. Not published.
**Author:** Koosha Paridehpour, Phenotype
**Date:** 2026-09-03
**Word target:** ~1,800

---

If you've worked on AI infrastructure at any non-trivial scale, you've probably hit the same wall we did: there are dozens of model providers, each with its own quirks, rate limits, and failure modes, and no single vendor handles all of them gracefully. That's the gap [OmniRoute](https://github.com/diegosouzapw/OmniRoute) fills. It's a single API surface that fronts the long tail of providers — Anthropic, OpenAI, Gemini, Groq, Mistral, OpenRouter, plus a growing list of community adapters — with retries, fallbacks, and routing intelligence layered on top. As of this writing, it has roughly 60,000 stars and is one of the most active AI routing projects on GitHub.

I spent the month of June 2026 contributing to OmniRoute as an external contributor. By July 18th I'd shipped 101 merged pull requests and was ranked #5 in the upstream contributor census, with work referenced in 21 upstream release notes. That alone is the kind of signal most teams would treat as "good enough — keep working upstream." So the natural follow-up question is: **why fork it at all?**

The answer isn't "OmniRoute is broken" or "the maintainer is unresponsive." Diego Souza has been consistently responsive, the project's velocity is high, and the upstream architecture is well-thought-through. The answer is a much narrower one about how production deployments of AI infrastructure eventually diverge from a general-purpose open-source project, and what to do about it when they do.

## What broke for us at scale

Phenotype runs OmniRoute in production in front of roughly a dozen model providers. By mid-2026 we had a few specific operational needs that didn't quite fit the upstream shape:

1. **Provider-specific rate limit semantics.** Upstream has a generic "cooldown" model that works for 90% of providers. We needed different cooldown curves per provider family — Anthropic's TPM behavior differs from OpenAI's RPM behavior, which differs from Groq's burst handling, which differs from the OpenRouter pass-through. None of these distinctions are upstream-anti-patterns; they're just not yet modeled in upstream.

2. **Multi-tenant fallback chaining.** We route traffic across multiple upstream accounts and need predictable degradation semantics when one account burns out. Upstream's fallback cache scoping is correct as a default but doesn't expose enough hooks for our workload pattern.

3. **Audit trails.** Our compliance posture requires per-request forensic logging of routing decisions: which provider was tried first, why the fallback fired, what the latency profile looked like, what token cost was incurred. Upstream's logging is good; our requirements are stricter than upstream's policy.

4. **CI surface.** Our CI runs ~12,000 unit tests across 40 packages and needs stable, predictable test runs in a fork-only environment. Upstream's CI is fine for upstream's release cadence but doesn't have the gating we need for our internal pre-merge cycle.

5. **Internal tooling.** We have home-grown tools — `agileplus`, `phenodag`, a custom dockerized runner — that are meaningless to upstream but necessary for our engineering velocity.

None of these are blockers. Each one is a small adaptation. Collectively, they made a fork the right call.

## How we keep the fork aligned

The single biggest mistake you can make with a fork of an active upstream is **letting it drift**. A fork that hasn't rebased in six months is a fork that has to be re-merged by hand, and at that point you've stopped maintaining a fork and started maintaining a competing project.

We use a simple set of disciplines:

- **Daily `git fetch upstream` and weekly rebase cycles.** All our feature branches rebase onto `upstream/release/v3.8.x` before merge into fork `main`. We pin the current upstream SHA in a `.upstream-ref` file and have a CI check that fails if that file is stale (more than 30 days old).
- **Linear history enforced on `main`.** No merge commits. Each fork commit is either (a) a cherry-pick of upstream, (b) a fork-only change on top of upstream HEAD, or (c) a back-port of a future-upstream change we needed early. The linear history keeps the diff against upstream trivial to compute and review.
- **Upstream-first PRs.** Every fix that could plausibly benefit upstream gets sent upstream first as a PR. We then either wait for merge or carry the patch as a fork-only commit with a stable identifier in the commit message. Out of the 101 PRs I'd already merged upstream before we forked, the pattern continued — ~85% of our fork-only commits end up as upstream PRs within 60 days.
- **Branch protection as a tripwire.** The fork's `main` requires 1 PR review, dismisses stale approvals on push, and disallows force-pushes. Upstream itself has no branch protection (single-maintainer pattern), but the fork's stricter setting has caught two of our own mistakes before they hit the trunk.
- **A divergence manifest.** A machine-readable JSON file enumerates every fork-only commit with its rationale, upstream-equivalent status (sent / awaiting-review / declined / not-applicable), and merge-odds estimate. This file is read by our CI on every PR and used to gate "this fork-only commit should have been upstream first" warnings.

## What we're contributing back, not carrying

The bulk of our fork-only commits are things like:

- Provider-specific cooldown curves (these are now in flight upstream as standalone PRs)
- An additional audit-log schema (sent upstream, awaiting review)
- A small handful of test-suite reorganizations (some already merged, some declined as overly opinionated)
- Internal-only tooling files in directories like `.agileplus/` and `worklogs/` — these are explicitly *not* upstream-portable and are git-ignored from the public mirror

We carry roughly 700-800 fork-only commits ahead of upstream main at any given time. About 75% of them are CI/build tooling, ~15% are provider-specific behavior, ~10% are internal-only artifacts that never go upstream.

## What the fork is *not*

It's worth being explicit about what our fork isn't:

- **Not a competing product.** OmniRoute is the product. We're heavy users of it and depend on it. The fork is an extension, not a replacement.
- **Not a long-term divergence.** The whole point of the fork is to converge with upstream as fast as possible. Branches in our fork that aren't on a path to upstream get retired on a 90-day clock.
- **Not an opinionated re-architecture.** When upstream's architecture doesn't fit our needs, we work around it in the fork rather than re-designing it. Upstream's design choices are upstream's call.
- **Not a candidate for a separate brand.** We don't ship a "PhenRoute" or similar. The whole point is to keep the fork's relationship to upstream legible: fork → upstream → fork → upstream.

## If you're considering a fork yourself

A few heuristics from our experience:

- **Fork when you have 3+ concrete operational needs that don't fit upstream.** One quirk is a patch. Two quirks is a configuration. Three is a fork.
- **Fork when your CI/audit/security posture is meaningfully stricter than upstream's default.** If you just need a feature, send a PR upstream. If you need a guarantee upstream can't make, fork.
- **Don't fork if you're going to rebrand or re-architect.** That's a competing project, not a fork. Use a different name and a different namespace.
- **Don't fork if you can't commit to the discipline.** A fork that drifts is a tax you'll pay forever. If you can't commit to weekly rebase cycles and upstream-first PRs, you'll end up rewriting the fork in two years.

## What's next

The longer-term question — and one we don't have a perfect answer to — is whether the right end-state is "fork forever" or "upstream absorbs fork-only features and we deprecate the fork in a year or two." Diego and I have discussed this and the working hypothesis is that we'll converge: most of what we're carrying is upstream-portable, and a year from now the fork will be ~50 commits deep instead of 700+. We'll see.

For now, the fork exists because it has to, and it's small enough that it costs us very little to maintain. The 101 PRs I shipped upstream before we forked weren't wasted — they're the social capital that makes the fork relationship healthy. Upstream knows us, trusts us, and accepts most of what we send. That's a much better state than "random external fork with no shared history."

---

*If you're working on AI infrastructure and want to talk shop, find me on [LinkedIn](https://linkedin.com/in/kooshapari) or open an issue in [`KooshaPari/OmniRoute`](https://github.com/KooshaPari/OmniRoute).*
