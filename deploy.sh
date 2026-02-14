#!/usr/bin/env bash
set -euo pipefail

# Configuration
REMOTE_USER="${REMOTE_USER:-cpted}"
REMOTE_IP="${REMOTE_IP:-10.21.1.138}"
REMOTE_HOST="${REMOTE_USER}@${REMOTE_IP}"
REMOTE_DIR="${REMOTE_DIR:-/home/cpted/cpted-app}"

echo "=== CPTED App Deploy ==="

# 1. Build frontend
echo "Building frontend..."
(cd cpted-assessor && npm run build)

# 2. Build server
echo "Building server..."
(cd server && npm run build)

# 3. Ensure remote directory exists
echo "Preparing remote directory..."
ssh "${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}"

# 4. Rsync to remote
echo "Syncing to ${REMOTE_HOST}:${REMOTE_DIR}..."
rsync -avz --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude 'cpted-assessor/node_modules' \
  --exclude 'cpted-assessor/src' \
  --exclude 'server/node_modules' \
  --exclude 'server/src' \
  --exclude 'files(1)' \
  --exclude 'infrastructure' \
  ./ "${REMOTE_HOST}:${REMOTE_DIR}/"

# 5. Docker Compose up
echo "Starting containers..."
ssh "${REMOTE_HOST}" "cd ${REMOTE_DIR} && docker compose up -d --build"

echo ""
echo "=== Deploy complete ==="
echo "App: http://${REMOTE_IP}"
echo "API: http://${REMOTE_IP}/api/health"
