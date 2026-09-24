#!/usr/bin/env bash
# anti-pattern-detector.sh
# Koosha-phenotype.com anti-pattern detector (Phenotype Design Constitution).
# Returns 0 if all checks pass; 1 if any check finds a violation.
# Run as a pre-commit hook or in CI.
#
# Patterns derived from ui-ux-pro-max/data/ux-guidelines.csv (119 guidelines)
# and the project's actual source layout. Each pattern is one row of the
# detector spec in the constitution skill, Section D.

set -uo pipefail

REPO_ROOT="${1:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$REPO_ROOT" || { echo "[detector] cannot cd to $REPO_ROOT" >&2; exit 2; }

# Self-exclusion: do not match this script's own pattern comments.
# NOTE: no inner single quotes here — bash keeps them as literal characters
# when this variable is word-split into rg args, which broke every `rgs`
# pattern (rg returned no matches at all). The quotes must NOT appear.
SELF="scripts/anti-pattern-detector.sh"
EXCLUDE_SELF="--glob !${SELF}"

VIOLATIONS=0
REPORT=""

note() {
  local n="$1" title="$2" file="$3" line="$4"
  REPORT+="[$n] $title\n    -> $file:$line\n"
  VIOLATIONS=$((VIOLATIONS + 1))
}

# Helper: run rg excluding self
rgs() { rg "$@" $EXCLUDE_SELF 2>/dev/null; }

# 1. outline:none without replacement
M=$(rgs -n "outline:\s*none" scripts/ | head -1)
if [[ -n "$M" ]]; then note "1" "outline:none without replacement" "${M%%:*}" "${M##*:}"; fi

# 2. box-shadow:none on interactive elements (heuristic: in components/)
M=$(rgs -n "box-shadow:\s*none" scripts/components/ | head -1)
if [[ -n "$M" ]]; then note "2" "box-shadow:none in components/" "${M%%:*}" "${M##*:}"; fi

# 3. tabindex outside main content (heuristic: tabindex with digit >0 in views)
M=$(rgs -nE 'tabindex\s*=\s*"[1-9]' scripts/views/ | head -1)
if [[ -n "$M" ]]; then note "3" "tabindex with positive value" "${M%%:*}" "${M##*:}"; fi

# 4. onpaste with preventDefault (critical: blocks password managers)
M=$(rgs -nB1 "onpaste" scripts/views/ 2>/dev/null | rg "preventDefault" $EXCLUDE_SELF | head -1)
if [[ -n "$M" ]]; then note "4" "onpaste preventDefault (critical)" "${M%%:*}" "${M##*:}"; fi

# 5. transition:none on hoverable element
M=$(rgs -n "transition:\s*none" scripts/ | head -1)
if [[ -n "$M" ]]; then note "5" "transition:none on hoverable" "${M%%:*}" "${M##*:}"; fi

# 6. width:<px> on prose container
M=$(rgs -nE 'width:\s*\d+px' scripts/views/project-detail.js | head -1)
if [[ -n "$M" ]]; then note "6" "fixed-width prose container" "${M%%:*}" "${M##*:}"; fi

# 7. height:<px> on text container
M=$(rgs -nE 'height:\s*\d+px' scripts/views/ | head -1)
if [[ -n "$M" ]]; then note "7" "fixed-height text container" "${M%%:*}" "${M##*:}"; fi

# 8. word-break:break-all on prose
M=$(rgs -n "word-break:\s*break-all" scripts/ | head -1)
if [[ -n "$M" ]]; then note "8" "word-break:break-all on prose" "${M%%:*}" "${M##*:}"; fi

# 9. white-space:nowrap on title chip in artifact.js
M=$(rgs -n "white-space:\s*nowrap" scripts/components/artifact.js | head -1)
if [[ -n "$M" ]]; then note "9" "nowrap title chip" "${M%%:*}" "${M##*:}"; fi

# 10. <input> without <label> (heuristic: input tag in contact view not preceded by label)
M=$(rgs -n "<input" scripts/views/contact.js | head -1)
if [[ -n "$M" ]]; then
  if ! rgs -n "<label" scripts/views/contact.js | head -1 > /dev/null; then
    note "10" "<input> without <label>" "${M%%:*}" "${M##*:}"
  fi
fi

# 11. autocomplete="off" on real input
M=$(rgs -n 'autocomplete="off"' scripts/views/contact.js | head -1)
if [[ -n "$M" ]]; then note "11" "autocomplete=off breaks autofill" "${M%%:*}" "${M##*:}"; fi

# 12. onclick= outside <button> (heuristic: onclick= in any script)
M=$(rgs -nE 'onclick=' scripts/ | head -1)
if [[ -n "$M" ]]; then note "12" "onclick= (use addEventListener on button)" "${M%%:*}" "${M##*:}"; fi

# 13. setTimeout without cleanup in views.
# A view file may use setTimeout only if the same file also calls clearTimeout
# (typically through a helper like createTimerGroup from contact-helpers.js).
# View files that schedule timers but never cancel them will be flagged.
VIEW_FILES_WITH_TIMEOUT=$(rgs -l "setTimeout" scripts/views/ || true)
for F in $VIEW_FILES_WITH_TIMEOUT; do
  if ! rg -q "clearTimeout" "$F"; then
    M=$(rg -n "setTimeout" "$F" | head -1)
    note "13" "setTimeout without clearTimeout" "${M%%:*}" "${M##*:}"
  fi
done

# 14. z-index value > 100
M=$(rgs -nE "z-index:\s*[0-9]{3,}" scripts/ | head -1)
if [[ -n "$M" ]]; then note "14" "z-index scale drift" "${M%%:*}" "${M##*:}"; fi

# 15. 100vh on a section
M=$(rgs -nE "(height|min-height):\s*100vh" scripts/ | head -1)
if [[ -n "$M" ]]; then note "15" "100vh (use dvh on mobile)" "${M%%:*}" "${M##*:}"; fi

# 16. autoplay attribute (real attribute, not just the word in a comment)
M=$(rgs -nE '(autoplay\s*(=|>|"\s*true)|\.autoplay\s*=)' scripts/ | head -1)
if [[ -n "$M" ]]; then note "16" "autoplay (fails reduced-motion)" "${M%%:*}" "${M##*:}"; fi

# 17. color-only state in artifact.js (heuristic: red/green hex without sibling icon)
M=$(rgs -nE "(#ff0000|#00ff00|#f00|#0f0)" scripts/components/artifact.js | head -1)
if [[ -n "$M" ]]; then note "17" "color-only state in artifact" "${M%%:*}" "${M##*:}"; fi

# 18. console shipped to bundle (exclude intentional error logs with [namespace] tag)
M=$(rgs -nE 'console\.(log|warn)\(' bundled/ | head -1)
if [[ -n "$M" ]]; then note "18" "console shipped to bundle" "${M%%:*}" "${M##*:}"; fi

# 19. innerHTML = outside templates
M=$(rgs -nE "innerHTML\s*=" scripts/components/ | head -1)
if [[ -n "$M" ]]; then note "19" "innerHTML = (prefer textContent)" "${M%%:*}" "${M##*:}"; fi

# 20-22. Every HTML entry point must ship <main>, lang, and a skip link.
HTML_FILES=$(find . -maxdepth 2 -name "*.html" -not -path "./node_modules/*" -not -path "./bundled/*" -not -path "./dist/*" 2>/dev/null)
for hf in $HTML_FILES; do
  rg -q "<main" "$hf" 2>/dev/null || note "20" "missing <main> landmark" "$hf" "1"
  rg -q '<html[^>]*lang=' "$hf" 2>/dev/null || note "21" "missing lang attribute" "$hf" "1"
  rg -q 'skip-link' "$hf" 2>/dev/null || note "22" "missing skip link" "$hf" "1"
  IMG_NO_ALT=$(rg -o '<img[^>]*>' "$hf" 2>/dev/null | rg -v 'alt=' | head -1)
  if [[ -n "$IMG_NO_ALT" ]]; then
    note "26" "img without alt attribute" "$hf" "1"
  fi
done

# 23. viewport must not block zoom (WCAG 1.4.4: user-scalable=no, maximum-scale < 2)
M=$(rg -nE 'user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*(0\.[0-9]+|1(\.[0-9]+)?)([^0-9]|$)' "$HTML_FILES" 2>/dev/null | head -1)
if [[ -n "$M" ]]; then note "23" "viewport blocks pinch zoom" "${M%%:*}" "${M##*:}"; fi

# 24. positive tabindex (breaks natural focus order; tabindex=-1/0 are fine)
M=$(rgs -nE '(tabindex="|tabindex=)[1-9]' . | head -1)
if [[ -n "$M" ]]; then note "24" "positive tabindex (breaks focus order)" "${M%%:*}" "${M##*:}"; fi

# 25. global focus ring + reduced-motion kill must exist (constitution Section 3)
if ! rg -q ':focus-visible' styles/base.css 2>/dev/null; then
  note "25" "missing global :focus-visible ring" "styles/base.css" "1"
fi
if ! rg -q 'prefers-reduced-motion' styles/ 2>/dev/null; then
  note "25" "missing prefers-reduced-motion guard" "styles/" "1"
fi

# 27. Source files must respect the size mandate: <=350 lines target, <=500 hard
# limit. Files over the 500 hard limit are violations; files over the 350 target
# are reported as warnings so the gate reflects the documented contract. Scoped
# to tracked first-party source (scripts/, data/, styles/) so generated output
# (bundled/, dist/) and local artifacts (test-screenshots/, output/) are not
# mistaken for maintained modules. Uses git ls-files rather than a glob sweep so
# ignored and untracked scratch files cannot cause false hits.
SIZE_SCAN=$(git ls-files 'scripts/*.js' 'scripts/**/*.js' 'data/*.js' 'styles/*.css' 2>/dev/null \
  | xargs wc -l 2>/dev/null \
  | grep -v ' total$' \
  | awk '$1>350 {print $1" "$2}')
HARD_SIZE_VIOLATION=$(echo "$SIZE_SCAN" | awk '$1>500 {print; exit}')
if [[ -n "$HARD_SIZE_VIOLATION" ]]; then
  note "27" "file exceeds the 500-line hard limit" "${HARD_SIZE_VIOLATION#* }" "$HARD_SIZE_VIOLATION"
fi
OVER_TARGET=$(echo "$SIZE_SCAN" | awk '$1<=500')
if [[ -n "$OVER_TARGET" ]]; then
  echo "[detector] warning: files over the 350-line target (within the 500 hard limit):" >&2
  echo "$OVER_TARGET" | awk '{printf "  %s (%s lines)\n", $2, $1}' >&2
fi

# Report
if [[ "$VIOLATIONS" -eq 0 ]]; then
  echo "[detector] 0 violations across 27 patterns."
  exit 0
fi
printf "[detector] %d violation(s) found:\n" "$VIOLATIONS"
printf "%b\n" "$REPORT"
echo ""
echo "[detector] Fix all violations before opening a PR. See:"
echo "  .claude/skills/phenotype-design-constitution/SKILL.md Section D"
exit 1
