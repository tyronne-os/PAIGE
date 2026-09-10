#!/bin/bash
# Build and manage WelcomeBackPage workspace container

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
    exit 1
}

# Detect container runtime
RUNTIME="docker"
if ! command -v docker &> /dev/null; then
    if command -v podman &> /dev/null; then
        RUNTIME="podman"
        log_info "Docker not found, using Podman"
    else
        log_error "Neither Docker nor Podman found. Install one of them first."
    fi
fi

# Detect compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE="docker-compose"
elif command -v docker &> /dev/null && docker compose version &>/dev/null; then
    COMPOSE="docker compose"
elif command -v podman-compose &> /dev/null; then
    COMPOSE="podman-compose"
else
    # Fallback: use podman run directly if compose not available
    COMPOSE="podman-direct"
    log_warn "Compose tool not found, will use podman run directly"
fi

log_success "Using: $RUNTIME with $COMPOSE"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$WORKSPACE_ROOT"

# Command handling
case "${1:-help}" in
    build)
        log_info "Building WelcomeBackPage workspace image..."
        if [ "$RUNTIME" = "podman" ]; then
            podman build -t welcome-back:latest -f Dockerfile .
        else
            docker build -t welcome-back:latest -f Dockerfile .
        fi
        log_success "Image built successfully"
        ;;
    
    start)
        log_info "Starting workspace container..."
        if [ "$COMPOSE" = "podman-direct" ]; then
            # Use podman run directly
            log_info "Using podman run (no compose tool available)"
            podman run -d \
                --name welcome-back-workspace \
                --hostname welcome-back-workspace \
                -v "$WORKSPACE_ROOT:/workspace" \
                -v "$HOME/.kiro:/home/workspace/.kiro" \
                -v "$HOME/.config/nobility-depository:/home/workspace/.vault:ro" \
                -it welcome-back:latest bash
        elif [ "$RUNTIME" = "podman" ]; then
            $COMPOSE -f podman-compose.yml up -d workspace
        else
            $COMPOSE up -d workspace
        fi
        log_success "Container started"
        
        # Wait for health
        sleep 2
        log_info "Container is running"
        
        if [ "$RUNTIME" = "podman" ]; then
            podman ps --filter "name=welcome-back-workspace"
        else
            docker ps --filter "name=welcome-back-workspace"
        fi
        ;;
    
    stop)
        log_info "Stopping workspace container..."
        if [ "$RUNTIME" = "podman" ]; then
            $COMPOSE -f podman-compose.yml down workspace
        else
            $COMPOSE down workspace
        fi
        log_success "Container stopped"
        ;;
    
    restart)
        log_info "Restarting workspace container..."
        if [ "$RUNTIME" = "podman" ]; then
            $COMPOSE -f podman-compose.yml restart workspace
        else
            $COMPOSE restart workspace
        fi
        log_success "Container restarted"
        sleep 2
        ;;
    
    shell)
        log_info "Entering workspace shell..."
        if [ "$RUNTIME" = "podman" ]; then
            if podman ps --filter "name=welcome-back-workspace" | grep -q welcome-back; then
                # Container already running, exec into it
                podman exec -it welcome-back-workspace /bin/bash
            else
                # Container not running, start and enter
                podman run -it \
                    --name welcome-back-workspace \
                    --hostname welcome-back-workspace \
                    -v "$WORKSPACE_ROOT:/workspace" \
                    -v "$HOME/.kiro:/home/workspace/.kiro" \
                    -v "$HOME/.config/nobility-depository:/home/workspace/.vault:ro" \
                    welcome-back:latest /bin/bash
            fi
        else
            docker exec -it welcome-back-workspace /bin/bash
        fi
        ;;
    
    logs)
        log_info "Showing container logs..."
        if [ "$RUNTIME" = "podman" ]; then
            podman logs -f welcome-back-workspace
        else
            docker logs -f welcome-back-workspace
        fi
        ;;
    
    status)
        log_info "Checking workspace status..."
        if [ "$RUNTIME" = "podman" ]; then
            if podman ps --filter "name=welcome-back-workspace" | grep -q welcome-back; then
                log_success "Container is running"
                podman ps --filter "name=welcome-back-workspace"
            else
                log_warn "Container is not running"
            fi
        else
            if docker ps --filter "name=welcome-back-workspace" | grep -q welcome-back; then
                log_success "Container is running"
                docker ps --filter "name=welcome-back-workspace"
            else
                log_warn "Container is not running"
            fi
        fi
        ;;
    
    clean)
        log_warn "Cleaning up images and containers..."
        read -p "Continue? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [ "$RUNTIME" = "podman" ]; then
                podman ps -a --filter "name=welcome-back" --format "{{.ID}}" | xargs -r podman rm -f
                podman images --filter "reference=welcome-back" --format "{{.ID}}" | xargs -r podman rmi
            else
                docker ps -a --filter "name=welcome-back" --format "{{.ID}}" | xargs -r docker rm -f
                docker images --filter "reference=welcome-back" --format "{{.ID}}" | xargs -r docker rmi
            fi
            log_success "Cleanup complete"
        fi
        ;;
    
    setup)
        log_info "Setting up WelcomeBackPage workspace..."
        
        # Check prerequisites
        log_info "Checking prerequisites..."
        if ! command -v git &> /dev/null; then
            log_error "Git is required but not installed"
        fi
        
        # Build image
        $0 build
        
        # Start container
        $0 start
        
        log_success "Setup complete!"
        echo ""
        echo "Next steps:"
        echo "  1. Enter shell: $0 shell"
        echo "  2. Check status: $0 status"
        echo "  3. View logs: $0 logs"
        ;;
    
    *)
        echo "WelcomeBackPage Workspace Manager"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  build      - Build container image"
        echo "  start      - Start workspace container"
        echo "  stop       - Stop workspace container"
        echo "  restart    - Restart workspace container"
        echo "  shell      - Enter interactive shell in container"
        echo "  logs       - Show container logs"
        echo "  status     - Show container status"
        echo "  clean      - Remove container and image"
        echo "  setup      - Complete setup (build + start)"
        echo "  help       - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 setup              # First-time setup"
        echo "  $0 shell              # Enter workspace"
        echo "  $0 logs               # Watch logs"
        echo "  $0 stop && $0 start   # Restart"
        exit 0
        ;;
esac
