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

    # Step 1: Build all registries
    step "Building all registries"
    cd "$PROJECT_ROOT"
    npm run build-all-registries
    success "All registries built successfully"

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
    
    npx --yes shadcn@4.0.5 init "http://localhost:$SERVER_PORT/block-registry.json" \
        --defaults \
        --force \
        --base radix
    
    success "shadcn initialized with ui-builder registry"

    # Step 5b: Install shadcn components registry (optional add-on)
    step "Installing shadcn components registry"

    npx --yes shadcn@4.0.5 add "http://localhost:$SERVER_PORT/shadcn-components-registry.json" \
        --yes --overwrite

    success "shadcn components registry installed"

    # Step 5c: Install react-email components registry
    step "Installing react-email components registry"

    npx --yes shadcn@4.0.5 add "http://localhost:$SERVER_PORT/react-email-components-registry.json" \
        --yes --overwrite

    success "react-email components registry installed"

    # Step 5d: Pin tiptap to 3.20.1 (post-install to avoid EOVERRIDE conflict with direct deps)
    step "Pinning tiptap packages to 3.20.1"
    node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const V = '3.20.1';
const pkgs = ['@tiptap/core','@tiptap/react','@tiptap/pm','@tiptap/starter-kit','@tiptap/extensions','@tiptap/markdown','@tiptap/extension-blockquote','@tiptap/extension-bold','@tiptap/extension-bubble-menu','@tiptap/extension-bullet-list','@tiptap/extension-code','@tiptap/extension-code-block','@tiptap/extension-code-block-lowlight','@tiptap/extension-color','@tiptap/extension-document','@tiptap/extension-dropcursor','@tiptap/extension-floating-menu','@tiptap/extension-gapcursor','@tiptap/extension-hard-break','@tiptap/extension-heading','@tiptap/extension-horizontal-rule','@tiptap/extension-image','@tiptap/extension-italic','@tiptap/extension-link','@tiptap/extension-list','@tiptap/extension-list-item','@tiptap/extension-list-keymap','@tiptap/extension-ordered-list','@tiptap/extension-paragraph','@tiptap/extension-strike','@tiptap/extension-table','@tiptap/extension-text','@tiptap/extension-text-style','@tiptap/extension-typography','@tiptap/extension-underline'];
pkg.overrides = pkg.overrides || {};
for (const p of pkgs) { if (pkg.dependencies?.[p]) pkg.dependencies[p] = V; pkg.overrides[p] = V; }
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"
    npm install
    success "Tiptap packages pinned to 3.20.1"

    # minimal-tiptap CSS uses @reference "../../../global.css" (Tailwind v4) which expects the
    # globals at src/components/global.css, but Next.js places it at src/app/globals.css
    mkdir -p src/components
    cp src/app/globals.css src/components/global.css

    # Step 5e: Write a minimal email builder page that wires emailPageRenderer + emailCodeGenerator
    step "Writing email builder test page"

    mkdir -p src/app/email-test
    cat > src/app/email-test/page.tsx << 'EMAILPAGE'

"use client";

import "web-streams-polyfill/polyfill";
import UIBuilder from "@/components/ui/ui-builder";
import { reactEmailComponentDefinitions } from "@/lib/ui-builder/registry/react-email-component-definitions";
import {
  emailPageRenderer,
  emailCodeGenerator,
} from "@/lib/ui-builder/email/email-builder-utils";

const initialLayers = [
  {
    id: "email-page-1",
    type: "Html",
    name: "Email 1",
    pageType: "email",
    props: { lang: "en" },
    children: [
      {
        id: "email-body-1",
        type: "Body",
        name: "Body",
        props: {},
        children: [
          {
            id: "email-text-1",
            type: "Text",
            name: "Text",
            props: {},
            children: "Hello from UIBuilder Email!",
          },
        ],
      },
    ],
  },
];

export default function EmailTestPage() {
  return (
    <main className="flex flex-col h-dvh">
      <UIBuilder
        initialLayers={initialLayers}
        persistLayerStore={false}
        componentRegistry={reactEmailComponentDefinitions}
        pageTypeRenderers={{ email: emailPageRenderer }}
        pageTypeCodeGenerators={{ email: emailCodeGenerator }}
        allowPagesCreation
        allowPagesDeletion
      />
    </main>
  );
}
EMAILPAGE

    success "Email builder test page written to src/app/email-test/page.tsx"

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
    

    # Other files with known TypeScript issues
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

