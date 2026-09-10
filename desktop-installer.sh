#!/bin/bash
# WelcomeBackPage Desktop Installer
# Installs application icon, desktop shortcut, and registers as trusted app
# Similar to Pinokio's desktop integration approach

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Platform detection
detect_platform() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        PLATFORM="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        PLATFORM="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        PLATFORM="windows"
    else
        log_error "Unsupported platform: $OSTYPE"
    fi
    log_success "Detected platform: $PLATFORM"
}

# Get installation directory
get_install_dir() {
    if [ -n "$1" ]; then
        INSTALL_DIR="$1"
    else
        INSTALL_DIR="$HOME/.local/share/WelcomeBackPage"
    fi
    mkdir -p "$INSTALL_DIR"
}

# Create desktop icon (SVG)
create_icon() {
    local icon_path="$1"
    mkdir -p "$(dirname "$icon_path")"
    
    cat > "$icon_path" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <!-- Background circle -->
  <circle cx="128" cy="128" r="128" fill="#1a1a2e"/>
  
  <!-- Welcome text arc -->
  <defs>
    <style>
      .icon-text { font-family: Arial, sans-serif; font-weight: bold; font-size: 32px; fill: #00ff00; }
      .icon-accent { fill: #00aa00; }
      .icon-shine { fill: none; stroke: #00ff00; stroke-width: 3; opacity: 0.6; }
    </style>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00ff88;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00aa00;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Main icon shape (rounded square with gradient) -->
  <rect x="48" y="48" width="160" height="160" rx="32" fill="url(#gradient)"/>
  
  <!-- Inner darker background -->
  <rect x="56" y="56" width="144" height="144" rx="28" fill="#0f0f1e"/>
  
  <!-- Welcome Back text -->
  <text x="128" y="100" class="icon-text" text-anchor="middle" font-size="20">
    Welcome
  </text>
  <text x="128" y="130" class="icon-text" text-anchor="middle" font-size="20">
    Back
  </text>
  
  <!-- Decorative elements -->
  <circle cx="60" cy="60" r="3" fill="#00ff88" opacity="0.8"/>
  <circle cx="196" cy="60" r="3" fill="#00ff88" opacity="0.8"/>
  <circle cx="60" cy="196" r="3" fill="#00ff88" opacity="0.8"/>
  <circle cx="196" cy="196" r="3" fill="#00ff88" opacity="0.8"/>
  
  <!-- Shine effect -->
  <ellipse cx="96" cy="96" rx="24" ry="24" class="icon-shine"/>
  
  <!-- Agent indicator (small circle) -->
  <circle cx="200" cy="45" r="16" fill="#ff6b6b"/>
  <text x="200" y="50" font-family="Arial" font-size="14" font-weight="bold" fill="white" text-anchor="middle">AI</text>
</svg>
EOF
    log_success "Icon created: $icon_path"
}

# Install on Linux
install_linux() {
    log_info "Installing for Linux..."
    
    local icon_dir="$HOME/.local/share/icons/hicolor/256x256/apps"
    local icon_path="$icon_dir/welcome-back-page.svg"
    local desktop_dir="$HOME/.local/share/applications"
    local desktop_file="$desktop_dir/welcome-back-page.desktop"
    local launcher_script="$INSTALL_DIR/launcher.sh"
    
    # Create directories
    mkdir -p "$icon_dir" "$desktop_dir" "$INSTALL_DIR"
    
    # Create icon
    create_icon "$icon_path"
    
    # Create launcher script
    cat > "$launcher_script" << 'LAUNCHER'
#!/bin/bash
# WelcomeBackPage Launcher Script

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_DIR="$APP_DIR/Downloads/WelcomeBackPage"

# Check if project exists
if [ ! -d "$PROJECT_DIR" ]; then
    PROJECT_DIR="$HOME/Downloads/WelcomeBackPage"
fi

if [ ! -d "$PROJECT_DIR" ]; then
    zenity --error --text "WelcomeBackPage project not found.\nExpected: $PROJECT_DIR" 2>/dev/null || \
    echo "Error: WelcomeBackPage project not found at $PROJECT_DIR"
    exit 1
fi

# Enter workspace
cd "$PROJECT_DIR"
bash scripts/build-workspace.sh shell
LAUNCHER
    chmod +x "$launcher_script"
    log_success "Launcher script created: $launcher_script"
    
    # Create desktop entry
    cat > "$desktop_file" << "DESKTOP"
[Desktop Entry]
Type=Application
Name=WelcomeBackPage
Comment=Personal AI Agent Workspace
Exec=$LAUNCHER_SCRIPT
Icon=welcome-back-page
Categories=Development;IDE;
Terminal=true
StartupNotify=true
Keywords=ai;agent;development;workspace;kiro;llyacrew;

[Desktop Action Open]
Name=Open Workspace
Exec=bash -c "cd %f && bash scripts/build-workspace.sh shell"

[Desktop Action Status]
Name=Show Status
Exec=bash -c "cd %f && bash scripts/build-workspace.sh status"
DESKTOP

    # Replace launcher script path in desktop file
    sed -i "s|\$LAUNCHER_SCRIPT|$launcher_script|g" "$desktop_file"
    chmod +x "$desktop_file"
    log_success "Desktop entry created: $desktop_file"
    
    # Update desktop database
    if command -v update-desktop-database &> /dev/null; then
        update-desktop-database "$desktop_dir"
        log_success "Desktop database updated"
    fi
    
    # Update icon cache
    if command -v gtk-update-icon-cache &> /dev/null; then
        gtk-update-icon-cache "$HOME/.local/share/icons/hicolor/"
        log_success "Icon cache updated"
    fi
    
    echo ""
    log_success "Linux installation complete!"
    echo ""
    echo "Installation details:"
    echo "  Desktop Entry: $desktop_file"
    echo "  Icon: $icon_path"
    echo "  Launcher: $launcher_script"
    echo ""
    echo "Application is now available in your application menu."
    echo "You can also launch it from the terminal with: WelcomeBackPage"
}

# Install on macOS
install_macos() {
    log_info "Installing for macOS..."
    
    local app_bundle="$HOME/Applications/WelcomeBackPage.app"
    local launcher_script="$INSTALL_DIR/launcher.sh"
    
    mkdir -p "$INSTALL_DIR"
    
    # Create launcher script for macOS
    cat > "$launcher_script" << 'LAUNCHER'
#!/bin/bash
# WelcomeBackPage Launcher for macOS

PROJECT_DIR="$HOME/Downloads/WelcomeBackPage"

if [ ! -d "$PROJECT_DIR" ]; then
    osascript -e 'tell app "System Events" to display dialog "WelcomeBackPage project not found" with title "Error"'
    exit 1
fi

cd "$PROJECT_DIR"
open -a Terminal . && bash scripts/build-workspace.sh shell
LAUNCHER
    chmod +x "$launcher_script"
    
    # Create macOS app bundle
    mkdir -p "$app_bundle/Contents/MacOS"
    mkdir -p "$app_bundle/Contents/Resources"
    
    # Create executable
    cat > "$app_bundle/Contents/MacOS/WelcomeBackPage" << 'MACOS_EXE'
#!/bin/bash
exec "$HOME/.local/share/WelcomeBackPage/launcher.sh"
MACOS_EXE
    chmod +x "$app_bundle/Contents/MacOS/WelcomeBackPage"
    
    # Create Info.plist
    cat > "$app_bundle/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>WelcomeBackPage</string>
    <key>CFBundleIdentifier</key>
    <string>com.tyronne-os.welcome-back-page</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>WelcomeBackPage</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.12</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2026 tyronne-os. All rights reserved.</string>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>
PLIST
    
    # Create icon (macOS icns format will use SVG via sips conversion if available)
    create_icon "$INSTALL_DIR/icon.svg"
    
    log_success "macOS app bundle created: $app_bundle"
    echo ""
    log_success "macOS installation complete!"
    echo ""
    echo "Application available at: $app_bundle"
    echo "Add to Dock: Right-click app → Options → Keep in Dock"
}

# Install on Windows
install_windows() {
    log_info "Installing for Windows..."
    
    local app_dir="$USERPROFILE/AppData/Local/WelcomeBackPage"
    mkdir -p "$app_dir"
    
    # Create launcher batch file
    cat > "$app_dir/launcher.bat" << 'LAUNCHER_BAT'
@echo off
setlocal enabledelayedexpansion

set PROJECT_DIR=%USERPROFILE%\Downloads\WelcomeBackPage

if not exist "%PROJECT_DIR%" (
    echo WelcomeBackPage project not found at %PROJECT_DIR%
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"
bash scripts/build-workspace.sh shell
pause
LAUNCHER_BAT
    
    # Create shortcut using PowerShell (Windows-native)
    local shortcut_path="$USERPROFILE/Desktop/WelcomeBackPage.lnk"
    
    if command -v powershell.exe &> /dev/null; then
        powershell.exe -Command "
            \$WshShell = New-Object -ComObject WScript.Shell
            \$Shortcut = \$WshShell.CreateShortcut('$shortcut_path')
            \$Shortcut.TargetPath = '$app_dir\\launcher.bat'
            \$Shortcut.WorkingDirectory = '$app_dir'
            \$Shortcut.Description = 'WelcomeBackPage - Personal AI Agent Workspace'
            \$Shortcut.Save()
        "
        log_success "Desktop shortcut created"
    fi
    
    # Create SVG icon
    create_icon "$app_dir/icon.svg"
    
    echo ""
    log_success "Windows installation complete!"
    echo ""
    echo "Installation details:"
    echo "  Launcher: $app_dir\\launcher.bat"
    echo "  Desktop Shortcut: $shortcut_path"
    echo ""
    echo "You can run the launcher from Desktop or Command Prompt."
}

# Register as trusted application
register_trusted() {
    log_info "Registering as trusted application..."
    
    case "$PLATFORM" in
        linux)
            # Mark desktop file as trusted
            if [ -f "$HOME/.local/share/applications/welcome-back-page.desktop" ]; then
                gio set "$HOME/.local/share/applications/welcome-back-page.desktop" \
                    metadata::trusted true 2>/dev/null || true
            fi
            ;;
        macos)
            # Code sign the app bundle
            if command -v codesign &> /dev/null; then
                codesign --remove-signature "$HOME/Applications/WelcomeBackPage.app" 2>/dev/null || true
                codesign -s - "$HOME/Applications/WelcomeBackPage.app" 2>/dev/null || true
                log_success "App signed for local use"
            fi
            ;;
        windows)
            log_warn "Windows: Run installer as Administrator for full trust"
            ;;
    esac
}

# Uninstall function
uninstall() {
    log_warn "Uninstalling WelcomeBackPage..."
    
    case "$PLATFORM" in
        linux)
            rm -f "$HOME/.local/share/applications/welcome-back-page.desktop"
            rm -f "$HOME/.local/share/icons/hicolor/256x256/apps/welcome-back-page.svg"
            rm -rf "$HOME/.local/share/WelcomeBackPage"
            ;;
        macos)
            rm -rf "$HOME/Applications/WelcomeBackPage.app"
            rm -rf "$HOME/.local/share/WelcomeBackPage"
            ;;
        windows)
            rm -f "$USERPROFILE/Desktop/WelcomeBackPage.lnk"
            rm -rf "$USERPROFILE/AppData/Local/WelcomeBackPage"
            ;;
    esac
    
    log_success "Uninstall complete"
}

# Main
main() {
    echo ""
    echo "╔════════════════════════════════════════════╗"
    echo "║   WelcomeBackPage Desktop Installer       ║"
    echo "║   Personal AI Agent Workspace             ║"
    echo "╚════════════════════════════════════════════╝"
    echo ""
    
    detect_platform
    get_install_dir "$1"
    
    case "${2:-install}" in
        install)
            case "$PLATFORM" in
                linux)
                    install_linux
                    ;;
                macos)
                    install_macos
                    ;;
                windows)
                    install_windows
                    ;;
            esac
            register_trusted
            ;;
        uninstall)
            uninstall
            ;;
        *)
            echo "Usage: $0 [install_dir] [install|uninstall]"
            echo ""
            echo "Examples:"
            echo "  $0                    # Install with defaults"
            echo "  $0 /opt/apps          # Install to custom directory"
            echo "  $0 /opt/apps uninstall # Uninstall"
            exit 1
            ;;
    esac
    
    echo ""
    log_success "Installation script finished"
}

main "$@"
