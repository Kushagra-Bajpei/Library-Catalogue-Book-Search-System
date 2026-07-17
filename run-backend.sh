#!/usr/bin/env bash
# run-backend.sh — Build & run just the C++ backend
# Usage: chmod +x run-backend.sh && ./run-backend.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/backend/build"

echo "━ Building C++ Backend ━"
rm -rf "$BUILD_DIR" && mkdir -p "$BUILD_DIR" && cd "$BUILD_DIR"

cmake .. \
    -DCMAKE_BUILD_TYPE=Release

cmake --build .

echo ""
echo "━ Starting Backend on http://localhost:8080 ━"
"$BUILD_DIR/library_server"
