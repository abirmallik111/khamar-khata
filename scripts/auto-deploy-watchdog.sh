#!/bin/bash
# ====================================================================
# Khamar Khata Automatic Deployment Watchdog
# Checks git for updates every minute and rebuilds docker container automatically
# ====================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR" || exit 1

# Fetch latest changes from remote main
git fetch origin main > /dev/null 2>&1

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
    echo "[$(date)] 🚀 New updates detected on main ($REMOTE_HASH). Deploying..."
    git pull origin main
    docker compose -f docker-compose.prod.yml up -d --build
    echo "[$(date)] ✅ Deployment finished successfully!"
fi
