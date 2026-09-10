#!/bin/bash
# Custom Workspace Initialization Script
# Run after container starts on first open per day
# Add project-specific setup here

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

WORKSPACE_ROOT="${WORKSPACE_ROOT:-.}"
KIRO_DIR="$WORKSPACE_ROOT/.kiro"
LOG_DIR="$KIRO_DIR/logs"

# Create log directory
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/workspace-init-$(date +%Y-%m-%d).log"

{
    log_info "Starting custom workspace initialization..."
    
    # Load project memory if exists
    if [ -f "$WORKSPACE_ROOT/.project-memory.json" ]; then
        log_info "Loading project memory..."
        PROJECT_NAME=$(jq -r '.project.name // "Unknown"' "$WORKSPACE_ROOT/.project-memory.json")
        log_success "Project: $PROJECT_NAME"
    fi
    
    # Restore session memory
    if [ -f "$WORKSPACE_ROOT/.session-memory.json" ]; then
        log_info "Loading session memory..."
        SESSION_COUNT=$(jq '.sessions | length' "$WORKSPACE_ROOT/.session-memory.json" 2>/dev/null || echo 0)
        log_success "Sessions on record: $SESSION_COUNT"
    fi
    
    # Initialize Python project if pyproject.toml exists
    if [ -f "$WORKSPACE_ROOT/pyproject.toml" ]; then
        log_info "Python project detected"
        
        # Check if virtual environment exists
        if [ ! -d "$WORKSPACE_ROOT/venv" ]; then
            log_info "Creating Python virtual environment..."
            cd "$WORKSPACE_ROOT"
            uv venv venv
            source venv/bin/activate
            log_success "Virtual environment created and activated"
            
            log_info "Installing dependencies..."
            uv pip install -e .
            log_success "Dependencies installed"
        else
            log_success "Virtual environment found"
        fi
        
        # Check for pre-commit hooks
        if [ -f "$WORKSPACE_ROOT/.pre-commit-config.yaml" ] && ! command -v pre-commit &> /dev/null; then
            log_info "Installing pre-commit..."
            pip install pre-commit
            pre-commit install || true
            log_success "pre-commit ready"
        fi
    fi
    
    # Initialize Node.js project if package.json exists
    if [ -f "$WORKSPACE_ROOT/package.json" ]; then
        log_info "Node.js project detected"
        
        if [ ! -d "$WORKSPACE_ROOT/node_modules" ]; then
            log_info "Installing npm dependencies..."
            cd "$WORKSPACE_ROOT"
            npm install
            log_success "npm dependencies installed"
        else
            log_success "node_modules found"
        fi
        
        # Check for outdated packages
        OUTDATED=$(npm outdated --depth=0 2>/dev/null | wc -l)
        if [ "$OUTDATED" -gt 1 ]; then
            log_warn "Some packages are outdated (run 'npm audit' to check)"
        fi
    fi
    
    # Sync from Git if repo
    if [ -d "$WORKSPACE_ROOT/.git" ]; then
        log_info "Git repository detected"
        cd "$WORKSPACE_ROOT"
        
        BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "detached")
        AHEAD=$(git rev-list --count @{u}..@ 2>/dev/null || echo 0)
        BEHIND=$(git rev-list --count @..@{u} 2>/dev/null || echo 0)
        
        log_success "Branch: $BRANCH (ahead: $AHEAD, behind: $BEHIND)"
        
        if [ "$BEHIND" -gt 0 ]; then
            log_warn "You are behind remote by $BEHIND commits"
            log_info "Run 'git pull' to update"
        fi
    fi
    
    # Restore session memory via HF if available
    if command -v huggingface-cli &> /dev/null && [ -f "$WORKSPACE_ROOT/hf-sync.sh" ]; then
        log_info "Checking Hugging Face sync..."
        if huggingface-cli whoami &>/dev/null; then
            log_success "HF authenticated - sync available"
        else
            log_warn "HF not authenticated - memory sync unavailable"
        fi
    fi
    
    # Create project memory if missing
    if [ ! -f "$WORKSPACE_ROOT/.project-memory.json" ]; then
        log_info "Creating project memory file..."
        python3 << 'EOF'
import json
from datetime import datetime
import os

data = {
    "project": {
        "name": "WelcomeBackPage",
        "type": "Personal AI Agent Workspace",
        "baseProject": "LLYACrew",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "owner": "tyronne-os",
        "email": "tjlsudadverified@gmail.com"
    },
    "storage": {
        "github": {
            "repo": "https://github.com/tyronne-os/WelcomeBackPage",
            "branch": "main",
            "sync": "bidirectional"
        },
        "huggingface": {
            "username": "tyronne-os",
            "storage": "1TB-5TB Pro membership",
            "dataset_repo": "tyronne-os/welcome-back-page-projects",
            "session_repo": "tyronne-os/welcome-back-page-sessions",
            "autosync": True,
            "frequency": "on-change"
        }
    },
    "projects": [],
    "sessions": [],
    "metadata": {
        "lastSync": datetime.utcnow().isoformat() + "Z",
        "vaultStatus": "connected",
        "gpuStatus": "manual-control",
        "securityLevel": "standard"
    }
}

with open(".project-memory.json", "w") as f:
    json.dump(data, f, indent=2)

print("Project memory created")
EOF
        log_success "Project memory file created"
    fi
    
    # Summary
    echo ""
    log_info "Workspace initialization complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Check memory: python3 scripts/manage-memory.py status"
    echo "  2. List projects: python3 scripts/manage-memory.py project list"
    echo "  3. Resume session: python3 scripts/manage-memory.py session restore {id}"
    echo ""
    
} 2>&1 | tee -a "$LOG_FILE"

exit 0
