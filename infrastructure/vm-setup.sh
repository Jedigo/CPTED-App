#!/usr/bin/env bash
# ============================================================================
# CPTED Server — VM Setup Script
# Run this on a fresh Ubuntu 24.04 Server VM after installation.
#
# Usage:
#   scp vm-setup.sh cpted@<vm-ip>:~
#   ssh cpted@<vm-ip>
#   chmod +x vm-setup.sh && ./vm-setup.sh
# ============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }

# ---------- Step 1: System update ----------
info "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# ---------- Step 2: Install Docker + Docker Compose ----------
info "Installing Docker prerequisites..."
sudo apt install -y ca-certificates curl

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

info "Installing Docker Engine + Compose plugin..."
sudo apt install -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

info "Adding user '$(whoami)' to docker group..."
sudo usermod -aG docker "$(whoami)"

# ---------- Step 3: Install Tailscale ----------
info "Installing Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh

info "Starting Tailscale — authenticate when prompted..."
sudo tailscale up

# ---------- Step 4: Verify ----------
echo ""
info "=== Setup verification ==="
echo ""
docker --version
docker compose version
tailscale status
echo ""
info "=== Done! ==="
warn "Log out and back in for docker group membership to take effect."
warn "Then test with: docker run hello-world"
