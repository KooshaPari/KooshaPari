# Ledger addendum (2026-10-15T23:48Z)

This addendum records a process gap in the commit `97d145c` and the
fix-forward treatment chosen for it.

## What happened

`97d145c` (the round-2 doc-proliferation move) was authored and pushed
without the `tx-agent` / `tx-validated` ledger trailers required by the
global `AGENTS.md` policy for agent-authored commits.

## Why

The task brief instructed the use of
`/Users/kooshapari/bin/git-commit` for the commit. The wrapper's
auto-trailer path requires a **bare positional** subject (e.g.
`git-commit "subject" -m "body"`). The wrapper was invoked instead as

```
git-commit -m "$MSG_SUBJECT" -m "$MSG_BODY"
```

With `-m` as the first argument, the wrapper's case statement routes
the first subject into the `-m|--message)` branch, leaving
`LAST_WAS_M` set to `-m` for the next iteration. The wrap-message
condition `[ "$SKIP_WRAP" = false ] && [ -z "${LAST_WAS_M:-}" ]` is
therefore false for the subject arg, and `build_message` is not called.
The body passes through unchanged and no trailers are appended.

The gap was caught in post-push verification
(`git log -1 --format="%B" | grep -E "^tx-"` returned no hits).

## What was NOT done (per global immutability policy)

Per `AGENTS.md` "Immutable Transaction Ledger (CRITICAL)":

> Never rewrite history. No force push, no rebase published
> branches, no `git reset --hard`.

The exception for force push explicitly excludes `main`. The commit
`97d145c` is already on `origin/main`. An amend-and-force-push would
require force-pushing to `main`, which is BLOCKED. The commit stands
as authored.

## Conservative path chosen

Fix-forward: this file documents the gap in-tree so a future agent or
operator has a single, recoverable record of what `97d145c` would have
recorded if the wrapper had been called with a bare positional subject.

The `git-ledger validate 5` tool reports `All 5 entries pass ledger
validation` for the current branch head -- the validator only checks
`tx-validated` if `tx-agent` is present, so absence is not flagged.

## Recorded tx-* values for `97d145c` (per wrapper detection)

```
tx-agent:     jcode
tx-validated: lint,test
tx-scope:     docs
tx-intent:    move 18 loose docs/2026-09-*.md files into a dated session
              folder with cluster subfolders; mechanical, content-
              preserving, history-preserving tree cleanup.
tx-task:      (none -- branch is main, no T-#### reference)
```

These would have been auto-appended by the wrapper had the call been
`git-commit "subject" -m "body"` instead of `git-commit -m "subject" -m "body"`.

## Recovery

A future operator who wants the in-trailer metadata on `97d145c` to
match the global policy exactly can:

1. `git reset --soft HEAD~1` locally (NOT pushed).
2. Re-commit with the wrapper using the bare-positional pattern.
3. `git push --force-with-lease origin main` (BLOCKED by AGENTS.md
   unless operator explicitly approves force-push to `main` in the
   same turn).

Until then, the metadata above is recorded here for audit purposes.