#!/bin/bash

# Script to create a desktop shortcut for EvoLab

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DESKTOP_PATH="$HOME/Desktop"
SHORTCUT_NAME="Launch EvoLab"
APP_PATH="$DESKTOP_PATH/$SHORTCUT_NAME.app"

# Create temporary AppleScript file
TEMP_SCRIPT=$(mktemp)
cat > "$TEMP_SCRIPT" << 'APPLESCRIPT'
on run
    set projectPath to "/Volumes/External Drive/02_DEVELOPMENT/Active Projects/Vibecoding/EvoLab"
    
    -- Setup PATH and check for Node.js in common locations
    set nodePath to ""
    set commonPaths to {"/opt/homebrew/bin/node", "/usr/local/bin/node", "/usr/bin/node"}
    
    -- Check common installation paths
    repeat with testPath in commonPaths
        try
            do shell script "test -x " & quoted form of testPath
            set nodePath to testPath
            exit repeat
        end try
    end repeat
    
    -- If not found in common paths, try which with proper PATH
    if nodePath is "" then
        try
            set nodePath to do shell script "export PATH=\"/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/sbin:$PATH\" && which node"
        on error
            display dialog "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" buttons {"OK"} default button "OK" with icon stop
            return
        end try
    end if
    
    -- Check if npm is available (usually in same directory as node)
    set npmPath to ""
    try
        set npmDir to do shell script "dirname " & quoted form of nodePath
        set npmPath to npmDir & "/npm"
        do shell script "test -x " & quoted form of npmPath
    on error
        -- Try to find npm in PATH
        try
            set npmPath to do shell script "export PATH=\"/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/sbin:$PATH\" && which npm"
        on error
            display dialog "npm is not installed. Please install Node.js which includes npm." buttons {"OK"} default button "OK" with icon stop
            return
        end try
    end try
    
    -- Check if dependencies need to be installed or updated
    set needInstall to false
    set installMessage to ""
    
    -- Check if node_modules doesn't exist
    try
        do shell script "test -d " & quoted form of (projectPath & "/node_modules")
    on error
        set needInstall to true
        set installMessage to "Installing dependencies for the first time. This may take a few minutes..."
    end try
    
    -- Check if package.json is newer than node_modules (dependencies may have changed)
    if not needInstall then
        try
            do shell script "test " & quoted form of (projectPath & "/package.json") & " -nt " & quoted form of (projectPath & "/node_modules") & " && exit 0 || exit 1"
            set needInstall to true
            set installMessage to "Dependencies need to be updated. Installing..."
        end try
    end if
    
    -- Check if package-lock.json is newer than node_modules
    if not needInstall then
        try
            do shell script "test -f " & quoted form of (projectPath & "/package-lock.json") & " && test " & quoted form of (projectPath & "/package-lock.json") & " -nt " & quoted form of (projectPath & "/node_modules") & " && exit 0 || exit 1"
            set needInstall to true
            set installMessage to "Dependencies need to be updated. Installing..."
        end try
    end if
    
    -- Check if node_modules is incomplete (missing key files)
    if not needInstall then
        try
            do shell script "test ! -f " & quoted form of (projectPath & "/node_modules/.bin/vite")
            set needInstall to true
            set installMessage to "Dependencies appear to be incomplete. Reinstalling..."
        end try
    end if
    
    -- Install dependencies if needed
    if needInstall then
        display dialog installMessage buttons {"OK"} default button "OK" with icon note
        try
            do shell script "export PATH=\"/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/sbin:$PATH\" && cd " & quoted form of projectPath & " && npm install"
        on error
            display dialog "Failed to install dependencies. Please check your internet connection and try again." buttons {"OK"} default button "OK" with icon stop
            return
        end try
    end if
    
    -- Open browser after delay
    do shell script "sleep 3 && open http://localhost:5173" without altering line endings
    
    -- Start the development server in a new Terminal window with proper PATH
    tell application "Terminal"
        activate
        do script "export PATH=\"/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/local/sbin:$PATH\" && cd " & quoted form of projectPath & " && npm run dev"
    end tell
end run
APPLESCRIPT

# Compile AppleScript into .app bundle
osacompile -o "$APP_PATH" "$TEMP_SCRIPT"

# Clean up temp file
rm "$TEMP_SCRIPT"

if [ -d "$APP_PATH" ]; then
    echo "✅ Desktop shortcut created: $APP_PATH"
    echo "You can now double-click 'Launch EvoLab.app' on your Desktop to launch the game!"
else
    echo "❌ Failed to create desktop shortcut. You can manually create an alias to launch-game.sh"
fi

