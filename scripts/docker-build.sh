#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly REGISTRY="lgdweb"
readonly PROJECT_NAME="lgdweb-hub"

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

logInfo() { echo -e "${BLUE}Building $*${NC}"; }
logSuccess() { echo -e "${GREEN}Built $*${NC}"; }
logError() { echo -e "${RED}Error: $*${NC}" >&2; }

main() {
  local tag="${1:-latest}"
  local imageName="${REGISTRY}/${PROJECT_NAME}:${tag}"

  logInfo "$imageName"

  cd "$PROJECT_ROOT"

  docker buildx build \
    -f docker/Dockerfile \
    --network=host \
    --load \
    -t "$imageName" \
    .

  logSuccess "$imageName"
}

main "$@"
