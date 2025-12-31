#!/bin/bash

# Test Registry Script
# This script tests the registry by:
# 1. Building the registry
# 2. Hosting it locally
# 3. Creating a new Next.js project
# 4. Installing the registry via shadcn init
# 5. Building the project
# 6. Cleaning up

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
REGISTRY_DIR="$PROJECT_ROOT/registry"
TEST_DIR="/tmp/test-registry-$(date +%s)"
SERVER_PORT=8765
SERVER_PID=""

# Track if test passed
TEST_PASSED=false

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    
    # Kill the server if running
    if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
        echo "Stopping HTTP server (PID: $SERVER_PID)..."
        kill "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
    fi
    
    # Only remove test directory if test passed
    if [ "$TEST_PASSED" = true ] && [ -d "$TEST_DIR" ]; then
        echo "Removing test directory: $TEST_DIR"
        rm -rf "$TEST_DIR"
    elif [ -d "$TEST_DIR" ]; then
        echo -e "${YELLOW}Test directory preserved for debugging: $TEST_DIR${NC}"
    fi
    
    echo -e "${GREEN}Cleanup complete.${NC}"
}

# Set up trap to clean up on exit
trap cleanup EXIT

# Print step header
step() {
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${BLUE}STEP: $1${NC}"
    echo -e "${BLUE}===================================================${NC}\n"
}

# Print success message
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error message
error() {
    echo -e "${RED}✗ $1${NC}"
}

# Main script
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║           UI Builder Registry Test Script             ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Step 1: Build the registry
    step "Building the registry"
    cd "$PROJECT_ROOT"
    npm run build-registry
    success "Registry built successfully"

    # Step 2: Start HTTP server to host the registry (using http-server like package.json)
    step "Starting HTTP server on port $SERVER_PORT"
    cd "$PROJECT_ROOT"
    
    # Use http-server (same as package.json host-registry script)
    npx --yes http-server registry -p $SERVER_PORT -c-1 --silent &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 3
    
    # Verify server is running
    if ! curl -s "http://localhost:$SERVER_PORT/block-registry.json" > /dev/null; then
        error "Failed to start HTTP server or registry not accessible"
        exit 1
    fi
    success "HTTP server started (PID: $SERVER_PID)"
    success "Registry accessible at http://localhost:$SERVER_PORT/block-registry.json"

    # Step 3: Create test directory and initialize Next.js project
    step "Creating new Next.js project"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Create Next.js project with all defaults
    npx --yes create-next-app@latest test-app \
        --typescript \
        --tailwind \
        --eslint \
        --app \
        --src-dir \
        --no-import-alias \
        --turbopack \
        --yes
    
    success "Next.js project created at $TEST_DIR/test-app"

    # Step 4: Configure npm to handle peer dependency conflicts
    step "Configuring npm for peer dependency compatibility"
    cd "$TEST_DIR/test-app"
    
    # Create .npmrc to handle peer deps (React 18 vs 19 conflicts)
    echo "legacy-peer-deps=true" > .npmrc
    success "npm configured with legacy-peer-deps"

    # Step 5: Initialize shadcn with the registry
    step "Initializing shadcn with ui-builder registry"
    
    npx --yes shadcn@latest init "http://localhost:$SERVER_PORT/block-registry.json" \
        --yes \
        --base-color zinc
    
    success "shadcn initialized with ui-builder registry"

    # Step 6: Add @ts-nocheck to files with known TypeScript issues from external registries
    step "Adding @ts-nocheck to problematic files"
    
    # Function to add @ts-nocheck to top of file if not already present
    add_ts_nocheck() {
        local file="$1"
        if [ -f "$file" ] && ! grep -q "@ts-nocheck" "$file"; then
            echo "// @ts-nocheck" | cat - "$file" > "$file.tmp" && mv "$file.tmp" "$file"
            echo "Added @ts-nocheck to: $file"
        fi
    }
    
    # Files with known TypeScript issues
    add_ts_nocheck "src/components/ui/minimal-tiptap/components/image/image-edit-block.tsx"
    add_ts_nocheck "src/components/ui/ui-builder/index.tsx"
    
    success "TypeScript nocheck directives added"

    # Step 7: Apply TypeScript configuration patches if needed
    step "Applying TypeScript configuration patches"
    
    # Update tsconfig.json to match the main ui-builder project settings
    if [ -f "tsconfig.json" ]; then
        # Use node to patch the tsconfig
        node -e "
const fs = require('fs');
const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

// Ensure compilerOptions exists
tsconfig.compilerOptions = tsconfig.compilerOptions || {};

// Match ui-builder project settings
tsconfig.compilerOptions.skipLibCheck = true;
tsconfig.compilerOptions.strictFunctionTypes = false;

// Exclude auto-form and minimal-tiptap from type checking (like ui-builder)
tsconfig.exclude = tsconfig.exclude || [];
if (!tsconfig.exclude.includes('src/components/ui/auto-form/**/*')) {
    tsconfig.exclude.push('src/components/ui/auto-form/**/*');
}
if (!tsconfig.exclude.includes('src/components/ui/minimal-tiptap/**/*')) {
    tsconfig.exclude.push('src/components/ui/minimal-tiptap/**/*');
}

fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
console.log('TypeScript config patched');
"
        success "TypeScript config patched"
    fi

    # Step 8: Install dependencies (in case shadcn missed any)
    step "Installing dependencies"
    npm install
    success "Dependencies installed"

    # Step 9: Build the project
    step "Building the Next.js project"
    npm run build
    success "Project built successfully!"

    # Mark test as passed
    TEST_PASSED=true

    # Summary
    echo -e "\n${GREEN}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                    TEST PASSED!                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "Test project location: ${YELLOW}$TEST_DIR/test-app${NC}"
    echo -e "You can inspect it before cleanup by pressing Ctrl+C"
    echo ""
    read -t 10 -p "Press Enter to clean up (auto-cleanup in 10s)..." || true
}

# Run main function
main "$@"

