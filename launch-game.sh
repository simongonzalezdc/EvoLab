#!/bin/bash

# EvoLab Game Launcher
# This script launches the EvoLab evolution simulator

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the project directory
cd "$SCRIPT_DIR" || exit 1

# Setup PATH to include common Node.js installation locations
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/sbin:$PATH"

# Source shell profile if it exists (for Homebrew and other tools)
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" 2>/dev/null
[ -f "$HOME/.bash_profile" ] && source "$HOME/.bash_profile" 2>/dev/null
[ -f "$HOME/.profile" ] && source "$HOME/.profile" 2>/dev/null

# Function to find Node.js
find_node() {
    # Check common installation paths
    local paths=(
        "/opt/homebrew/bin/node"
        "/usr/local/bin/node"
        "/usr/bin/node"
        "$HOME/.nvm/versions/node/*/bin/node"
        "$HOME/.fnm/node-versions/*/installation/bin/node"
    )
    
    # Check if node is in PATH
    if command -v node &> /dev/null; then
        command -v node
        return 0
    fi
    
    # Check common paths
    for path in "${paths[@]}"; do
        # Handle glob patterns
        if [[ $path == *"*"* ]]; then
            for expanded in $path; do
                [ -x "$expanded" ] && echo "$expanded" && return 0
            done
        else
            [ -x "$path" ] && echo "$path" && return 0
        fi
    done
    
    return 1
}

# Find Node.js
NODE_PATH=$(find_node)
if [ -z "$NODE_PATH" ]; then
    osascript -e 'display dialog "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" buttons {"OK"} default button "OK" with icon stop'
    exit 1
fi

# Find npm (usually in same directory as node)
NPM_PATH=$(dirname "$NODE_PATH")/npm
if [ ! -x "$NPM_PATH" ]; then
    # Try to find npm in PATH
    if ! command -v npm &> /dev/null; then
        osascript -e 'display dialog "npm is not installed. Please install Node.js which includes npm." buttons {"OK"} default button "OK" with icon stop'
        exit 1
    fi
fi

# Check if dependencies need to be installed or updated
NEED_INSTALL=false

# Check if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    NEED_INSTALL=true
    osascript -e 'display dialog "Installing dependencies for the first time. This may take a few minutes..." buttons {"OK"} default button "OK" with icon note'
# Check if package.json is newer than node_modules (dependencies may have changed)
elif [ "package.json" -nt "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
    NEED_INSTALL=true
    osascript -e 'display dialog "Dependencies need to be updated. Installing..." buttons {"OK"} default button "OK" with icon note'
# Check if node_modules is empty or corrupted
elif [ ! -f "node_modules/.package-lock.json" ] && [ ! -f "node_modules/.bin/vite" ]; then
    NEED_INSTALL=true
    osascript -e 'display dialog "Dependencies appear to be incomplete. Reinstalling..." buttons {"OK"} default button "OK" with icon note'
fi

# Install dependencies if needed
if [ "$NEED_INSTALL" = true ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        osascript -e 'display dialog "Failed to install dependencies. Please check your internet connection and try again." buttons {"OK"} default button "OK" with icon stop'
        exit 1
    fi
    echo "✅ Dependencies installed successfully!"
fi

# Open browser after a short delay (give server time to start)
(sleep 3 && open http://localhost:5173) &

# Start the development server
npm run dev

