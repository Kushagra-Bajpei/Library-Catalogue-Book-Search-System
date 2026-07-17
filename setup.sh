#!/usr/bin/env bash
# =============================================================
#  LibraryOS — Full Setup & Run Script
#  Installs compilation dependencies, builds C++ backend,
#  and launches both frontend + backend servers.
#  Usage:  chmod +x setup.sh && ./setup.sh
# =============================================================

set -e  # Exit immediately on any error

# ── Colours ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}✅  $1${RESET}"; }
info() { echo -e "${CYAN}ℹ️   $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠️   $1${RESET}"; }
fail() { echo -e "${RED}❌  $1${RESET}"; exit 1; }
step() { echo -e "\n${BOLD}${CYAN}━━━ $1 ━━━${RESET}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BUILD_DIR="$BACKEND_DIR/build"

echo -e "${BOLD}"
cat << 'EOF'
 ____  _       _ _     _ _
|  _ \(_) __ _(_) |   (_) |__
| | | | |/ _` | | |   | | '_ \
| |_| | | (_| | | |___| | |_) |
|____/|_|\__, |_|_____|_|_.__/
         |___/
 Library Catalogue & AVL Search System
 Full Setup & Run Script
================================================
EOF
echo -e "${RESET}"

# =============================================================
# STEP 1 — Check Prerequisites / Homebrew
# =============================================================
step "Step 1/4 — Checking Compiler & Package Manager"
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v brew &>/dev/null; then
        fail "Homebrew not found. Install it from https://brew.sh first."
    fi
    ok "Homebrew found: $(brew --version | head -1)"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    ok "Linux detected"
fi

# =============================================================
# STEP 2 — Install Build Tools
# =============================================================
step "Step 2/4 — Checking/Installing Dependencies"
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install cmake node 2>/dev/null || true
    ok "cmake and node are ready"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt update && sudo apt install -y build-essential cmake nodejs npm
    ok "Build tools and node are ready"
fi

# =============================================================
# STEP 3 — Build C++ Backend
# =============================================================
step "Step 3/4 — Building C++ Backend"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

info "Running cmake configure..."
cmake .. -DCMAKE_BUILD_TYPE=Release

ok "CMake configured successfully"

CPU_CORES=$(sysctl -n hw.ncpu 2>/dev/null || echo 4)
info "Building with $CPU_CORES cores..."
cmake --build . --config Release -j"$CPU_CORES"

if [ ! -f "$BUILD_DIR/library_server" ]; then
    fail "Build succeeded but binary not found."
fi
ok "Build complete → $BUILD_DIR/library_server"

# =============================================================
# STEP 4 — Frontend Setup & Launch
# =============================================================
step "Step 4/4 — Setting Up Frontend"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    info "Running npm install..."
    npm install
else
    ok "node_modules already present"
fi

# =============================================================
# Launch Servers
# =============================================================
step "Launching Servers"

# Kill any existing servers on these ports
if [[ "$OSTYPE" == "darwin"* ]]; then
    lsof -ti:8080 | xargs kill -9 2>/dev/null && info "Killed older process on port 8080" || true
    lsof -ti:5173 | xargs kill -9 2>/dev/null && info "Killed older process on port 5173" || true
else
    fuser -k 8080/tcp 2>/dev/null && info "Killed older process on port 8080" || true
    fuser -k 5173/tcp 2>/dev/null && info "Killed older process on port 5173" || true
fi

# Start backend
info "Starting C++ backend on http://localhost:8080 ..."
"$BUILD_DIR/library_server" &
BACKEND_PID=$!
sleep 2

if kill -0 $BACKEND_PID 2>/dev/null; then
    ok "Backend running (PID: $BACKEND_PID)"
else
    fail "Backend crashed at startup. Run manually: $BUILD_DIR/library_server"
fi

# Start frontend
info "Starting React frontend on http://localhost:5173 ..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}${GREEN}  🚀  LibraryOS is RUNNING!${RESET}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${CYAN}Frontend  →  ${BOLD}http://localhost:5173${RESET}"
echo -e "  ${CYAN}Backend   →  ${BOLD}http://localhost:8080${RESET}"
echo ""
echo -e "  ${RED}Press Ctrl+C to stop both servers${RESET}"
echo ""

# Open browser
sleep 1
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:5173 2>/dev/null || true
else
    xdg-open http://localhost:5173 2>/dev/null || true
fi

# Wait and cleanup on exit
trap "echo ''; info 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; ok 'Servers stopped.'" EXIT INT TERM
wait $BACKEND_PID $FRONTEND_PID
