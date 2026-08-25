#!/bin/bash
# deploy_site.sh — build + deploy gauntletbench.com from fresh pipeline data.
#
# Runs ON THE BENCH MAC (needs node/npm at /opt/homebrew, the harness repo,
# and ~/Claude-Work/.secrets). Called by the nightly bake-off Stage 3 after
# publish_gauntlet.py, or by hand. Idempotent: skips deploy when neither the
# site source nor the scores changed (generated_at-only churn is ignored).
#
#   bash scripts/deploy_site.sh [--force]
#
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"
SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BENCH="$HOME/Claude-Work/Projects/ModelTesting/local-model-benchmark"
SEC="$HOME/Claude-Work/.secrets"
LOG="$SITE_DIR/scripts/deploy.log"
say() { echo "$(date -u +%FT%TZ) $*" | tee -a "$LOG"; }
cd "$SITE_DIR"

# git auth helper (token never echoed outside git's credential protocol)
ASKPASS="$(mktemp)"; trap 'rm -f "$ASKPASS"' EXIT
printf '%s\n' '#!/bin/bash' \
  'T=$(grep "^GITHUB_PAT_YODA_GUANTLETBENCH=" "$HOME/Claude-Work/.secrets/ModelTesting/CREDENTIALS.env" | cut -d= -f2 | tr -d "\r\"")' \
  'case "$1" in *Username*) echo Yoda-quelltask;; *Password*) echo "$T";; esac' > "$ASKPASS"
chmod +x "$ASKPASS"

NEED=0
[ "${1:-}" = "--force" ] && NEED=1

# 1. sync site source
PULL=$(GIT_ASKPASS="$ASKPASS" git pull --ff-only origin main 2>&1 | tail -1)
[ "$PULL" != "Already up to date." ] && NEED=1

# 2. fresh data (real change = any diff beyond the generated_at timestamp)
cp "$BENCH/benchmarks/gauntlet-data.json" src/data/gauntlet-data.json
if ! git diff --quiet -- src/data/gauntlet-data.json; then
  REAL=$(git diff -U0 -- src/data/gauntlet-data.json | grep -cE '^[+-] ' | cat)
  TS=$(git diff -U0 -- src/data/gauntlet-data.json | grep -cE '^[+-] *"generated_at"' | cat)
  if [ "$REAL" -gt "$TS" ]; then NEED=1; else git checkout -q -- src/data/gauntlet-data.json; fi
fi

if [ "$NEED" -eq 0 ]; then say "skip: no site or score changes"; exit 0; fi

# 3. deps + build
{ [ -d node_modules ] && [ ! package-lock.json -nt node_modules ]; } || npm ci --silent
rm -rf dist && npm run build >/dev/null

# 4. leak gate (conservative pattern set with no known false positives)
if grep -rqiE "openclaw|dlessa|hindsight|tailscale|\b100\.[0-9]+\.[0-9]+\.[0-9]+\b" dist/; then
  say "ABORT: leak gate tripped in dist/ — not deploying"; exit 2
fi

# 5. deploy (scoped CF web-dev token: DNS/Pages/Cache only)
CLOUDFLARE_API_TOKEN=$(grep '^CF_TOKEN_WEBDEV=' "$SEC/websites/CREDENTIALS.env" | cut -d= -f2 | tr -d '\r"')
CLOUDFLARE_ACCOUNT_ID=$(grep '^CF_ACCOUNT_ID=' "$SEC/websites/CREDENTIALS.env" | cut -d= -f2 | tr -d '\r"')
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
npx -y wrangler@latest pages deploy dist --project-name gauntletbench --branch main --commit-dirty=true >/dev/null

# 6. commit + push the data refresh under the org identity
if ! git diff --quiet -- src/data/gauntlet-data.json; then
  git add src/data/gauntlet-data.json
  git -c user.name="Yoda-quelltask" -c user.email="Yoda-quelltask@users.noreply.github.com" \
    commit -qm "Nightly data refresh ($(date +%F))"
  GIT_ASKPASS="$ASKPASS" git push -q origin main
fi
say "deployed OK (data: $(python3 -c "import json;print(json.load(open('src/data/gauntlet-data.json'))['generated_at'])"))"
