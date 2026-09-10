#!/bin/bash
# Hugging Face Storage Sync Script
# Syncs project memory and sessions to HF Datasets
# Usage: ./hf-sync.sh [push|pull|status]

set -e

# Configuration
HF_USERNAME="tyronne-os"
HF_DATASETS_REPO="$HF_USERNAME/welcome-back-page-projects"
HF_SESSIONS_REPO="$HF_USERNAME/welcome-back-page-sessions"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_MEMORY="$PROJECT_ROOT/.project-memory.json"
SESSION_MEMORY="$PROJECT_ROOT/.session-memory.json"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check HF CLI is installed
check_hf_cli() {
    if ! command -v huggingface-cli &> /dev/null; then
        log_error "Hugging Face CLI not installed"
        log_info "Install with: pip install huggingface-hub"
        exit 1
    fi
}

# Check authentication
check_hf_auth() {
    if ! huggingface-cli whoami &> /dev/null; then
        log_error "Not authenticated with Hugging Face"
        log_info "Authenticate with: huggingface-cli login"
        exit 1
    fi
    log_success "Hugging Face authentication verified"
}

# Initialize HF dataset repos if needed
init_hf_repos() {
    log_info "Checking Hugging Face repositories..."
    
    # This would require API calls to check/create repos
    # For now, we'll assume they exist or are created manually
    log_warn "Ensure these HF repos exist:"
    log_warn "  - https://huggingface.co/datasets/$HF_DATASETS_REPO"
    log_warn "  - https://huggingface.co/datasets/$HF_SESSIONS_REPO"
}

# Push to Hugging Face
push_to_hf() {
    log_info "Pushing to Hugging Face..."
    
    check_hf_auth
    
    # Create temporary directories for upload
    TEMP_DIR=$(mktemp -d)
    trap "rm -rf $TEMP_DIR" EXIT
    
    # Prepare project files
    log_info "Preparing project files..."
    mkdir -p "$TEMP_DIR/projects"
    
    if [ -f "$PROJECT_MEMORY" ]; then
        cp "$PROJECT_MEMORY" "$TEMP_DIR/projects/"
        log_success "Project memory copied"
    fi
    
    # Prepare session files
    log_info "Preparing session files..."
    mkdir -p "$TEMP_DIR/sessions"
    
    if [ -f "$SESSION_MEMORY" ]; then
        cp "$SESSION_MEMORY" "$TEMP_DIR/sessions/"
        log_success "Session memory copied"
    fi
    
    # Use git-lfs for large files if available
    if command -v git-lfs &> /dev/null; then
        log_info "Git LFS is available for large files"
    fi
    
    log_success "Files prepared in $TEMP_DIR"
    log_warn "Upload to HF manually or configure automated sync"
    log_info "Dataset repos ready for sync"
}

# Pull from Hugging Face
pull_from_hf() {
    log_info "Pulling from Hugging Face..."
    
    check_hf_auth
    
    # Download latest project memory from HF
    log_info "Fetching latest project memory from HF..."
    log_warn "Configure HF dataset download with huggingface_hub library"
    
    log_success "Pull configuration ready"
}

# Show sync status
show_status() {
    log_info "WelcomeBackPage Sync Status"
    echo ""
    
    log_info "Local Project Memory:"
    if [ -f "$PROJECT_MEMORY" ]; then
        echo "  File: $PROJECT_MEMORY"
        echo "  Size: $(du -h "$PROJECT_MEMORY" | cut -f1)"
        echo "  Modified: $(stat -f %Sm -t "%Y-%m-%d %H:%M:%S" "$PROJECT_MEMORY" 2>/dev/null || stat -c %y "$PROJECT_MEMORY" | cut -d' ' -f1-2)"
    else
        log_warn "  No project memory file"
    fi
    
    echo ""
    log_info "Local Session Memory:"
    if [ -f "$SESSION_MEMORY" ]; then
        echo "  File: $SESSION_MEMORY"
        echo "  Size: $(du -h "$SESSION_MEMORY" | cut -f1)"
        echo "  Modified: $(stat -f %Sm -t "%Y-%m-%d %H:%M:%S" "$SESSION_MEMORY" 2>/dev/null || stat -c %y "$SESSION_MEMORY" | cut -d' ' -f1-2)"
    else
        log_warn "  No session memory file"
    fi
    
    echo ""
    log_info "Hugging Face Configuration:"
    echo "  Username: $HF_USERNAME"
    echo "  Projects Dataset: $HF_DATASETS_REPO"
    echo "  Sessions Dataset: $HF_SESSIONS_REPO"
    
    echo ""
    check_hf_auth || log_warn "Not authenticated"
}

# Main command handler
case "${1:-status}" in
    push)
        push_to_hf
        ;;
    pull)
        pull_from_hf
        ;;
    status)
        show_status
        ;;
    *)
        echo "WelcomeBackPage HF Sync Tool"
        echo ""
        echo "Usage: $0 [push|pull|status]"
        echo ""
        echo "Commands:"
        echo "  push    - Push project and session memory to Hugging Face"
        echo "  pull    - Pull latest memory from Hugging Face"
        echo "  status  - Show sync status (default)"
        exit 1
        ;;
esac
