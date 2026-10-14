# Terminal playback evidence decision

## Decision

Do not present a terminal recording as a historical ShareCLI or CLIProxyAPI++
demonstration. The inspected local material does not establish an attributable
interactive recording.

## Inspected material

| Artifact | Provenance and supported use | Not supported |
| --- | --- | --- |
| `ShareCLI/tests/golden/cli_help.txt` | Golden command-inventory fixture for `sharecli --help`; suitable only as a labelled static command reference. | A captured user session or a live terminal demonstration. |
| `ShareCLI/tests/golden/help.txt` | Canonical help golden; same constrained static-reference use. | Runtime or product-usage claims. |
| `ShareCLI/tests/golden/thermal_green.txt` and `thermal_red.txt` | Headless Ratatui `TestBackend` snapshots, documented in `ShareCLI/docs/visual/golden-visual-tests.md`; suitable only as labelled test-fixture states. | A recording of a rendered interactive TUI. |
| `ShareCLI/docs/assets/identity/demo.svg` and `demo.mp4` | Authored identity/heartbeat artwork. | Terminal playback or proof of a CLI session. |

The inspected repository paths did not yield an asciinema `.cast` file or an
attributable terminal video. The initially referenced `CLIProxyAPI++` checkout
is not present at the inspected path, so it contributes no eligible artifact.

## Safe portfolio treatment

The portfolio may add a static, clearly labelled **command inventory** or a
clearly labelled **headless test-fixture state** after copying only the
permitted derivative into the publication allowlist. It must include the
fixture source path and state that it is not a captured session. It must not
animate keystrokes, infer runtime output, or call the surface a recording.

## Gate to real playback

Require an attributable terminal capture or reproducible recorded run with its
repository revision, command, environment, date, and publication permission.
Until then, the V3 terminal-playback requirement remains blocked rather than
simulated.
