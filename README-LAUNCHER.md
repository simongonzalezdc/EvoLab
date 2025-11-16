# 🚀 EvoLab Desktop Launcher

This guide explains how to set up a desktop launcher for EvoLab on macOS.

## 🎯 Quick Setup (Easiest Method)

**Run this command in Terminal:**
```bash
./create-desktop-shortcut.sh
```

This will automatically create a "Launch EvoLab.app" on your Desktop that you can double-click to start the game!

---

## Option 1: Automatic Desktop App (Recommended)

1. **Run the setup script:**
   ```bash
   ./create-desktop-shortcut.sh
   ```

2. **Double-click "Launch EvoLab.app" on your Desktop**

The app will:
- ✅ Check for Node.js/npm
- ✅ Install dependencies if needed (first time only)
- ✅ Start the development server in Terminal
- ✅ Open your browser to http://localhost:5173

---

## Option 2: Shell Script

1. **Create a desktop alias:**
   - Right-click on `launch-game.sh` in Finder
   - Select "Make Alias"
   - Drag the alias to your Desktop
   - Rename it to "Launch EvoLab" (optional)

2. **To run:**
   - Double-click the alias on your Desktop
   - The script will:
     - Check for Node.js/npm
     - Install dependencies if needed (first time only)
     - Start the development server
     - Open your browser to http://localhost:5173

---

## Option 3: Manual AppleScript Application

1. **Open Script Editor:**
   - Press `Cmd + Space` and search for "Script Editor"
   - Open the application

2. **Create the application:**
   - Open `launch-game.applescript` in Script Editor
   - Go to File → Export
   - Choose "Application" as the file format
   - Save it to your Desktop as "Launch EvoLab.app"

3. **To run:**
   - Double-click "Launch EvoLab.app" on your Desktop

## Notes

- The first launch will take longer as it installs dependencies
- The development server will run in Terminal (you can close the Terminal window to stop the server)
- The game will open automatically in your default browser at http://localhost:5173
- Make sure Node.js 18+ is installed before using the launcher

## Troubleshooting

**If the script doesn't run:**
- Right-click the script → Get Info
- Check "Open with" → Select "Terminal" or "TextEdit"
- Or run from Terminal: `./launch-game.sh`

**If you get permission errors:**
- Run: `chmod +x launch-game.sh`
- Or use: `xattr -cr launch-game.sh` to remove quarantine attributes

