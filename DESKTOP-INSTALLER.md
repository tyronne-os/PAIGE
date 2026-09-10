# WelcomeBackPage Desktop Installer Guide

**Install WelcomeBackPage as a trusted desktop application with one-click launch**

Similar to Pinokio's approach, this installer creates native application shortcuts and desktop integration.

---

## Quick Install

### Linux
```bash
bash desktop-installer.sh
```
Application appears in your application menu automatically.

### macOS
```bash
bash desktop-installer.sh
```
App bundle created in `~/Applications/WelcomeBackPage.app`

### Windows
```bash
bash desktop-installer.sh
```
Desktop shortcut created and launcher registered.

---

## Installation Methods

### Method 1: Bash Installer (Recommended)

**One-liner install:**
```bash
bash desktop-installer.sh
```

**With custom location:**
```bash
bash desktop-installer.sh /opt/welcome-back-page
```

**Uninstall:**
```bash
bash desktop-installer.sh "" uninstall
```

### Method 2: GUI Installer (Pinokio-style)

```bash
python3 scripts/gui-installer.py
```

Features:
- Visual installer window
- Choose installation directory
- Real-time installation log
- Platform detection
- Error reporting

### Method 3: Manual Installation

**Linux:**
```bash
# Create desktop entry
mkdir -p ~/.local/share/applications
cat > ~/.local/share/applications/welcome-back-page.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=WelcomeBackPage
Comment=Personal AI Agent Workspace
Exec=bash ~/Downloads/WelcomeBackPage/launcher.sh
Icon=welcome-back-page
Categories=Development;IDE;
Terminal=true
EOF

# Update database
update-desktop-database ~/.local/share/applications

# Copy icon
mkdir -p ~/.local/share/icons/hicolor/256x256/apps
cp icon.svg ~/.local/share/icons/hicolor/256x256/apps/welcome-back-page.svg
gtk-update-icon-cache ~/.local/share/icons/hicolor/
```

---

## What Gets Installed

### Files Created

| Platform | Location | Files |
|----------|----------|-------|
| **Linux** | `~/.local/share/applications/` | `welcome-back-page.desktop` |
| | `~/.local/share/icons/hicolor/256x256/apps/` | `welcome-back-page.svg` |
| | `~/.local/share/WelcomeBackPage/` | `launcher.sh` |
| **macOS** | `~/Applications/` | `WelcomeBackPage.app` |
| | `~/.local/share/WelcomeBackPage/` | `launcher.sh` |
| **Windows** | `~/Desktop/` | `WelcomeBackPage.lnk` |
| | `~/AppData/Local/WelcomeBackPage/` | `launcher.bat`, `icon.svg` |

### Desktop Integration

**Linux**:
- ✅ Application menu entry
- ✅ Desktop icon
- ✅ System theme integration
- ✅ Terminal integration

**macOS**:
- ✅ Applications folder icon
- ✅ Dock integration
- ✅ Spotlight searchable
- ✅ Right-click actions

**Windows**:
- ✅ Desktop shortcut
- ✅ Start menu (optional)
- ✅ Context menu integration
- ✅ File association

---

## Launcher Behavior

### What Happens When You Click the Icon

1. **Launch Detection**
   - Finds WelcomeBackPage project directory
   - Defaults to `~/Downloads/WelcomeBackPage`

2. **Environment Initialization**
   - Navigates to project directory
   - Runs `build-workspace.sh shell`

3. **Workspace Setup**
   - Builds/starts Docker/Podman container
   - Auto-initializes on first run per day
   - Loads session memory
   - Enters interactive shell

4. **Ready to Work**
   - All tools available (Python, Node, uv, gh, HF CLI)
   - Project memory loaded
   - Credentials verified
   - Vault accessible

---

## Customization

### Change Default Project Location

Edit the launcher script (Linux/macOS):
```bash
# Edit launcher.sh
nano ~/.local/share/WelcomeBackPage/launcher.sh

# Change this line:
PROJECT_DIR="$HOME/Downloads/WelcomeBackPage"
# To your preferred location:
PROJECT_DIR="/path/to/your/project"
```

### Add to Start Menu (Windows)

Right-click desktop shortcut → Properties → Advanced → Run as Administrator

### Create Quick Launch Icon

**Linux (GNOME/KDE):**
- Drag desktop file to taskbar
- Shortcut pins to taskbar

**macOS:**
- Right-click app → Options → Keep in Dock

**Windows:**
- Right-click shortcut → Pin to Start

### Customize Application Icon

The installer creates SVG icons. Edit `icon.svg` to customize:
- Colors: Change `#00ff00` (green), `#1a1a2e` (dark)
- Text: Modify "Welcome Back"
- Size: Adjust viewBox dimensions

Then reinstall to apply changes.

---

## Trusted Application Registration

### Linux

Applications are auto-trusted if installed properly. If you encounter permission issues:

```bash
# Grant execute permissions
chmod +x ~/.local/share/WelcomeBackPage/launcher.sh

# Rebuild desktop database
update-desktop-database ~/.local/share/applications/
```

### macOS

Apps signed locally for development:
```bash
codesign -s - ~/Applications/WelcomeBackPage.app
```

For production signing, create a developer certificate.

### Windows

Run installer with Administrator privileges:
```powershell
# Right-click Command Prompt → Run as Administrator
bash desktop-installer.sh
```

---

## Troubleshooting

### Application won't launch

**Linux:**
```bash
# Check desktop file syntax
cat ~/.local/share/applications/welcome-back-page.desktop

# Test launcher directly
bash ~/.local/share/WelcomeBackPage/launcher.sh

# Check permissions
ls -la ~/.local/share/WelcomeBackPage/launcher.sh
```

**macOS:**
```bash
# Check app bundle structure
ls -la ~/Applications/WelcomeBackPage.app/

# Test launcher
bash ~/.local/share/WelcomeBackPage/launcher.sh
```

**Windows:**
```batch
# Test launcher directly
%USERPROFILE%\AppData\Local\WelcomeBackPage\launcher.bat
```

### Icon not showing

**Linux:**
```bash
# Rebuild icon cache
gtk-update-icon-cache ~/.local/share/icons/hicolor/

# Verify icon file
ls -la ~/.local/share/icons/hicolor/256x256/apps/welcome-back-page.svg
```

**macOS:**
```bash
# Force icon update
touch ~/Applications/WelcomeBackPage.app
```

**Windows:**
```batch
# Clear icon cache
taskkill /f /im explorer.exe
explorer.exe
```

### Project directory not found

Edit launcher script to point to correct location:

**Linux/macOS:**
```bash
sed -i 's|$HOME/Downloads/WelcomeBackPage|/path/to/project|g' \
  ~/.local/share/WelcomeBackPage/launcher.sh
```

**Windows:**
Edit `launcher.bat` and change `PROJECT_DIR` path.

### Workspace won't start inside container

```bash
# Check Docker/Podman
docker ps  # or: podman ps

# Check for existing container
docker ps -a  # or: podman ps -a

# Try manual launch
cd ~/Downloads/WelcomeBackPage
bash scripts/build-workspace.sh shell
```

---

## Security Notes

✅ **What's Secure:**
- Vault credentials never written to disk
- Project code isolated in container
- Launcher runs with user permissions (not root)
- No hardcoded secrets in launcher

⚠️ **What to Know:**
- Desktop file is world-readable (standard on Linux)
- Launcher script has your project path (keep private)
- Application icon is public (SVG, no secrets)

---

## Uninstallation

### Using Installer Script
```bash
bash desktop-installer.sh "" uninstall
```

### Manual Removal

**Linux:**
```bash
rm ~/.local/share/applications/welcome-back-page.desktop
rm ~/.local/share/icons/hicolor/256x256/apps/welcome-back-page.svg
rm -rf ~/.local/share/WelcomeBackPage/
update-desktop-database ~/.local/share/applications/
```

**macOS:**
```bash
rm -rf ~/Applications/WelcomeBackPage.app
rm -rf ~/.local/share/WelcomeBackPage/
```

**Windows:**
```batch
del %USERPROFILE%\Desktop\WelcomeBackPage.lnk
rmdir /s %USERPROFILE%\AppData\Local\WelcomeBackPage
```

---

## Platform-Specific Details

### Linux

**Supported Desktop Environments:**
- GNOME (Tested ✓)
- KDE Plasma (Tested ✓)
- XFCE (Tested ✓)
- LXQt (Tested ✓)
- Cinnamon (Tested ✓)

**Installation Location Hierarchy:**
1. `~/.local/share/` (primary)
2. `~/.config/` (alternatives)
3. `/usr/local/share/` (system-wide, requires sudo)

### macOS

**System Requirements:**
- macOS 10.12 or later
- Bash 4.0+
- Terminal or iTerm2

**App Bundle Structure:**
```
WelcomeBackPage.app/
├── Contents/
│   ├── MacOS/
│   │   └── WelcomeBackPage (executable)
│   ├── Resources/
│   └── Info.plist
```

**Code Signing:**
- Default: Self-signed (development)
- Production: Requires Apple Developer Certificate

### Windows

**System Requirements:**
- Windows 10 or later
- PowerShell 5.1+
- Git Bash or WSL2

**Shortcut Properties:**
- Target: `launcher.bat` path
- Start in: Application directory
- Run: Normal (not minimized)

---

## Next Steps

### After Installation

1. **Launch the app** from your application menu/desktop
2. **First run** will auto-initialize workspace
3. **Check memory**: `python3 scripts/manage-memory.py status`
4. **Load session**: `python3 scripts/manage-memory.py session list`

### Integration

- Add to IDE quick-launch (VS Code, Sublime, etc.)
- Create shell alias: `alias wb='~/Downloads/WelcomeBackPage/launcher.sh'`
- Add to cron for scheduled launches
- Integrate with CI/CD pipelines

---

## Support

For issues:

1. Check troubleshooting section above
2. Review installation logs
3. Verify prerequisites (Docker/Podman, Bash 4+, Git)
4. Test manual launch: `bash ~/.local/share/WelcomeBackPage/launcher.sh`

---

**Last Updated**: 2026-09-10  
**Version**: 1.0.0  
**License**: Same as WelcomeBackPage
