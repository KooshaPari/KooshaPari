Capture Policy Audit — 2026-09-13
==================================

Auditor: Jcode (read-only audit, no execution, no source edits)

## Scope

Scripts and evidence audited:

1. `2026-09-13-next-batch/qa-baseline.mjs` (284 lines)
2. `2026-09-13-next-batch-method-review/verify-methods.mjs` (370 lines)
3. `2026-09-13-overflow-trace/trace.mjs` (185 lines)
4. `2026-09-13-overflow-trace/trace2.mjs`, `trace3.mjs`, `trace4.mjs`
5. `2026-09-13-owned-browser-integration/verify-browser.mjs` (184 lines)
6. `2026-09-13-owned-browser-integration/debug-dialog.mjs` (111 lines)
7. `2026-09-13-image-browser-exact/run-browser-exact.js` (209 lines)
8. `tests/hybrid-shell-regression.test.js` (168 lines)
9. Evidence: `browser-exact-results.json` (6 cases, present on disk)

Files **not found** as flat entries (are directories, not individual files):
`2026-09-13-next-batch*`, `2026-09-13-overflow-trace` (read via directory listing).

## Browser Provenance: PASS

Every script uses `chromium.launch({ headless: true })` — a **fresh** Chromium
instance, not a connection to an existing user browser. Verified across all 9
scripts by source scan.

### Prohibited-pattern sweep (grep across all audited paths)

| Pattern                        | Matches |
|--------------------------------|---------|
| `connectOverCDP`               | 0       |
| `browser.connect(`             | 0       |
| `--remote-debugging-port`      | 0       |
| `userDataDir`                  | 0       |
| `screencapture` / `desktop.*capture` | 0 |
| `existing.*browser`            | 0       |

**Result**: No script attaches to an existing browser or captures desktop/system
screenshots.

## PID Provenance: MIXED

| Script                       | Server PID         | Browser PID           | Notes                                    |
|------------------------------|--------------------|-----------------------|------------------------------------------|
| qa-baseline.mjs              | `server.pid` logged| Internal API (fragile)| Attempts `._browserProcess?.pid`         |
| verify-methods.mjs           | `server.pid` logged| Internal API (fragile)| Same pattern as baseline                 |
| trace.mjs                    | N/A (ext port 8421)| Not tracked           | Server launched externally               |
| trace2/3/4.mjs               | N/A                | Not tracked           | Uses port 8421, no PID logging           |
| verify-browser.mjs           | Port logged as PID | `"pid-unknown"` hardcoded | Server on port 0 (random); PID never resolved |
| debug-dialog.mjs             | Not tracked        | Not tracked           | Ephemeral debug script                   |
| run-browser-exact.js         | Port logged        | Not tracked           | Server on port 0 (random)                |
| hybrid-shell-regression.test | Not tracked        | Not tracked           | `process.pid` (test runner) logged; comment: "NEVER attaches to system browser" |

**Browser PID gaps**: Only `qa-baseline.mjs` and `verify-methods.mjs` attempt
browser PID via Playwright internal API (`_browser?._browserProcess?.pid`), which
is fragile across versions. No script captures Chromium's actual OS PID reliably.

**Missing evidence**: `browser-integration-results.json` (output of verify-browser.mjs)
does **not exist on disk**. The image fallback browser evidence (embedded in
verify-browser.mjs lines 104-174) cannot be independently verified from stored results.

## Server Ownership

- **Owned servers** (launched by script): `qa-baseline.mjs`, `verify-methods.mjs`
  spawn `node scripts/preview-server.js` on port 4197; `verify-browser.mjs` and
  `run-browser-exact.js` launch built-in `http.createServer` on port 0 (random).
- **External dependency**: `trace.mjs` connects to `http://127.0.0.1:8421/` which is
  assumed pre-launched. PID provenance: **UNKNOWN** for this server.

## Remaining Gates

1. **Browser PID robustness**: Scripts should capture Chromium OS PID via
   `execSync('pgrep -f chromium')` post-launch or Playwright's
   `browser.contexts()[0].browser().contexts` chain, not private API fields.
2. **Missing results artifact**: `browser-integration-results.json` absent.
   Re-run `verify-browser.mjs` or confirm intentional omission.
3. **trace.mjs server dependency**: Port 8421 server ownership unverifiable.
   Either inline server launch (like other scripts) or document the external
   PID.
4. **Image fallback evidence**: Currently embedded in verify-browser.mjs but
   no output file exists. If this evidence is required, re-run that script.

## Conclusion

**No policy violations found.** All scripts launch fresh headless Chromium via
`chromium.launch()`. No CDP connect, no existing browser attachment, no desktop
screenshots. PID tracking is partial (browser PID mostly UNKNOWN) but the
absence of PID data does not constitute a violation — it is documented as
UNKNOWN, not fabricated.

Total: 9 scripts, 1 evidence JSON verified, 2 files missing output.
