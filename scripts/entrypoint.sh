#!/bin/bash
# WelcomeBackPage Container Entrypoint
# Handles environment setup and initialization

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INIT]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if this is first run (per day)
is_first_run() {
    MARKER="/tmp/workspace-init-$(date +%Y-%m-%d)"
    if [ ! -f "$MARKER" ]; then
        touch "$MARKER"
        return 0  # First run
    fi
    return 1  # Already run today
}

# Initialize workspace on first run per day
if is_first_run; then
    log_info "First run of the day - initializing workspace..."
    
    # Update system packages
    log_info "Updating system packages..."
    apt-get update -qq
    apt-get upgrade -y -qq 2>/dev/null || true
    apt-get clean && rm -rf /var/lib/apt/lists/*
    log_success "System packages updated"
    
    # Update uv
    log_info "Checking for uv updates..."
    uv self update 2>/dev/null || true
    log_success "uv ready: $(uv --version)"
    
    # Update node
    log_info "Checking node version..."
    log_success "node: $(node --version)"
    log_success "npm: $(npm --version)"
    
    # Verify python
    log_info "Checking python version..."
    log_success "python: $(python3 --version)"
    
    # Verify git
    log_info "Checking git..."
    log_success "git: $(git --version)"
    
    # Verify GitHub CLI
    log_info "Checking GitHub CLI..."
    if command -v gh &> /dev/null; then
        log_success "gh: $(gh --version | head -1)"
    else
        log_warn "GitHub CLI not found, installing..."
        apt-get update && apt-get install -y gh && apt-get clean
        log_success "gh installed"
    fi
    
    # Verify Hugging Face CLI
    log_info "Checking Hugging Face CLI..."
    if command -v huggingface-cli &> /dev/null; then
        log_success "huggingface-cli: $(huggingface-cli --version)"
    else
        log_warn "Hugging Face CLI not found, installing..."
        pip install -q huggingface-hub
        log_success "huggingface-cli installed"
    fi
    
    # Set up git config if not already done
    if [ -z "$(git config --global user.name)" ]; then
        log_info "Setting git config..."
        git config --global user.name "WelcomeBackPage Workspace" || true
        git config --global user.email "workspace@welcomeback.local" || true
    fi
    
    # Create necessary directories
    log_info "Setting up workspace directories..."
    mkdir -p /workspace/.kiro/{projects,sessions,storage,logs}
    mkdir -p /workspace/.cache/huggingface
    mkdir -p /workspace/.config/github-cli
    log_success "Workspace directories created"
    
    # Initialize Python virtual environment if in workspace
    if [ -f "/workspace/pyproject.toml" ] || [ -f "/workspace/setup.py" ]; then
        if [ ! -d "/workspace/venv" ]; then
            log_info "Creating Python virtual environment..."
            uv venv /workspace/venv
            log_success "Virtual environment created"
            
            # Install dependencies
            if [ -f "/workspace/pyproject.toml" ]; then
                log_info "Installing dependencies..."
                source /workspace/venv/bin/activate
                uv pip install -e /workspace
                log_success "Dependencies installed"
            fi
        fi
    fi
    
    # Run custom initialization script if exists
    if [ -f "/workspace/scripts/init-workspace.sh" ]; then
        log_info "Running custom workspace initialization..."
        bash /workspace/scripts/init-workspace.sh
    fi
    
    log_success "Workspace initialized for today"
    echo ""
fi

# Check credentials
log_info "Checking credentials..."
if [ -f "/workspace/.vault/vault.json" ]; then
    log_success "Vault available"
else
    log_warn "Vault not mounted - some credentials may be unavailable"
fi

# Check GitHub auth
if command -v gh &> /dev/null; then
    if gh auth status 2>/dev/null | grep -q "Logged in"; then
        log_success "GitHub authenticated"
    else
        log_warn "GitHub CLI not authenticated - run 'gh auth login'"
    fi
fi

# Check HF auth
if command -v huggingface-cli &> /dev/null; then
    if huggingface-cli whoami 2>/dev/null; then
        log_success "Hugging Face authenticated"
    else
        log_warn "Hugging Face not authenticated - run 'huggingface-cli login'"
    fi
fi

# Print environment info
echo ""
log_info "Workspace Environment:"
echo "  Python: $(python3 --version)"
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"
echo "  uv: $(uv --version)"
echo "  git: $(git --version | awk '{print $3}')"
echo "  gh: $(gh --version 2>/dev/null | head -1 || echo 'not found')"
echo "  huggingface-cli: $(huggingface-cli --version 2>/dev/null || echo 'not found')"
echo ""

# Handle signals
trap 'log_info "Shutting down gracefully..."; exit 0' SIGTERM SIGINT

# Execute command or fall back to bash
if [ $# -eq 0 ]; then
    log_info "Starting interactive shell..."
    exec /bin/bash
else
    log_info "Executing: $@"
    exec "$@"
fi
