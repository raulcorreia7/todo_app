#!/bin/bash
set -euo pipefail

# Config
IMAGE_NAME="${IMAGE_NAME:-luxtodo-api}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
TAR_FILE="${TAR_FILE:-${IMAGE_NAME}.tar.gz}"
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-}"
VPS_PATH="${VPS_PATH:-/opt/luxtodo}"
BACKEND_PATH="${BACKEND_PATH:-backend}"

# Logging
log() { echo "[$(date +%H:%M:%S)] $1"; }
info() { log "→ $1"; }
ok() { log "✓ $1"; }

# Help
help() {
	cat <<EOF
Deploy backend to VPS.

Usage: VPS_HOST=<host> ./scripts/deploy-backend.sh [command]

Commands:
  build     Build Docker image locally
  save      Save image to tar.gz
  transfer  SCP tar to VPS
  deploy    Load image and restart on VPS
  (none)    Run all commands

Environment:
  IMAGE_NAME    Docker image name (default: luxtodo-api)
  IMAGE_TAG     Docker image tag (default: latest)
  TAR_FILE      Tar filename (default: \${IMAGE_NAME}.tar.gz)
  VPS_USER      SSH user (default: root)
  VPS_HOST      SSH hostname (required)
  VPS_PATH      Remote path (default: /opt/luxtodo)
  BACKEND_PATH  Local backend dir (default: backend)

Examples:
  VPS_HOST=cerberus.raulcorreia.dev ./scripts/deploy-backend.sh
  VPS_HOST=cerberus.raulcorreia.dev ./scripts/deploy-backend.sh build
  VPS_USER=admin VPS_HOST=192.168.1.10 ./scripts/deploy-backend.sh
EOF
}

# Cleanup on exit (only if tar exists)
cleanup() {
	[[ -f "${TAR_FILE}" ]] && rm -f "${TAR_FILE}" && info "Cleaned up local tar file"
}
trap cleanup EXIT

# Help
help() {
	cat <<EOF
Deploy backend to VPS.

Usage: VPS_HOST=<host> ./scripts/deploy-backend.sh [command]

Commands:
  build     Build Docker image locally
  save      Save image to tar.gz
  transfer  SCP tar to VPS
  deploy    Load image and restart on VPS
  (none)    Run all commands

Environment:
  IMAGE_NAME    Docker image name (default: luxtodo-api)
  IMAGE_TAG     Docker image tag (default: latest)
  TAR_FILE      Tar filename (default: \${IMAGE_NAME}.tar.gz)
  VPS_USER      SSH user (default: root)
  VPS_HOST      SSH hostname (required)
  VPS_PATH      Remote path (default: /opt/luxtodo)
  BACKEND_PATH  Local backend dir (default: backend)

Examples:
  VPS_HOST=cerberus.raulcorreia.dev ./scripts/deploy-backend.sh
  VPS_HOST=cerberus.raulcorreia.dev ./scripts/deploy-backend.sh build
  VPS_USER=admin VPS_HOST=192.168.1.10 ./scripts/deploy-backend.sh
EOF
	exit 0
}
trap cleanup EXIT

# Steps
build() {
	info "Building ${IMAGE_NAME}:${IMAGE_TAG}..."
	docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" "${BACKEND_PATH}/"
	ok "Build complete"
}

save() {
	info "Saving image to ${TAR_FILE}..."
	docker save "${IMAGE_NAME}:${IMAGE_TAG}" | gzip >"${TAR_FILE}"
	ok "Image saved ($(du -h "${TAR_FILE}" | cut -f1))"
}

transfer() {
	info "Transferring to ${VPS_HOST}:${VPS_PATH}..."
	scp "${TAR_FILE}" "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"
	ok "Transfer complete"
}

deploy() {
	info "Loading and restarting on ${VPS_HOST}..."
	ssh "${VPS_USER}@${VPS_HOST}" "cd ${VPS_PATH} && \
    docker load < ${TAR_FILE} && \
    docker compose up -d --no-build && \
    rm -f ${TAR_FILE}"
	ok "Deploy complete"
}

# Run all steps
main() {
	log "Deploying ${IMAGE_NAME}:${IMAGE_TAG} to ${VPS_HOST}"
	build
	save
	transfer
	deploy
	log "Done!"
}

# Run
case "${1:-}" in
-h | --help | help) help ;;
build | save | transfer | deploy | "")
	[[ -z "${VPS_HOST}" ]] && { echo "Error: VPS_HOST is required" && exit 1; }
	"${1:-main}"
	;;
*) echo "Unknown command: $1" && exit 1 ;;
esac
