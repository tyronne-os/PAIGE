# WelcomeBackPage Workspace Setup Guide

**Auto-configured containerized development environment with Podman/Docker**

## Quick Start

### First Time (Complete Setup)
```bash
# Clone and navigate
git clone https://github.com/tyronne-os/WelcomeBackPage.git
cd WelcomeBackPage

# Build and start workspace
bash scripts/build-workspace.sh setup
```

### Daily Use
```bash
# Enter workspace shell (auto-initializes on first open per day)
bash scripts/build-workspace.sh shell

# Inside container, everything is ready:
# - Python 3.12 with uv
# - Node.js LTS with npm
# - Git, GitHub CLI, Hugging Face CLI
# - All credentials loaded from vault
```

---

## Features

✅ **Fully Automated Setup**
- One command: `setup` builds image + starts container
- Auto-initialization on first open each day
- Updates all tools (uv, node, python, CLI tools)

✅ **Environment Persistence**
- Session memory persists between sessions
- Project memory preserved
- Vault credentials securely mounted

✅ **Container Agnostic**
- Works with Docker or Podman (auto-detects)
- Both docker-compose and podman-compose supported
- Fallback options built-in

✅ **Auto-Init System**
- First run per day triggers full setup
- System packages updated
- Dependencies installed
- Credentials verified
- Environment logged

✅ **Memory & Context**
- `.project-memory.json` tracks all projects
- `.session-memory.json` saves session state
- `manage-memory.py` CLI for session management
- HF sync for cross-workspace backups

---

## Setup Details

### What Gets Installed

The `Dockerfile` creates a complete development environment with:

**Core Tools**:
- Python 3.12 with venv
- Node.js LTS (22+)
- uv (Python package manager)
- Rust toolchain (for building packages)
- Git with LFS support
- GitHub CLI (`gh`)
- Hugging Face CLI
- Build essentials (gcc, make, cmake)

**System Packages**:
- Vim, nano, less
- jq, tmux, htop, tree
- OpenSSL, dev headers
- And more (see `Dockerfile`)

### Initialization Scripts

#### `entrypoint.sh`
- Main container entry point
- Runs on every container start
- Tracks first-run-per-day
- Auto-initialization on first run
- Verifies credentials
- Loads memory files

#### `init-workspace.sh`
- Project-specific initialization
- Detects Python/Node projects
- Sets up virtual environments
- Installs dependencies
- Manages pre-commit hooks
- Logs all output

### Volume Mounts

| Path | Purpose | Mode | Type |
|------|---------|------|------|
| `/workspace` | Project code | rw | bind |
| `~/.kiro` | Kiro config | rw | bind |
| `~/.config/nobility-depository` | Vault (secrets) | ro | bind |
| `~/.cache/huggingface` | HF models/cache | rw | volume |
| `~/.config/github-cli` | GitHub config | rw | volume |
| `~/.ssh` | SSH keys | ro | bind |
| `~/.gitconfig` | Git config | ro | bind |
| `~/.cargo` | Rust toolchain | rw | volume |
| `~/.cache/pip` | Pip cache | rw | volume |

**Security**: Vault is read-only, credentials never written to container

---

## Commands

### Build Workspace Image
```bash
bash scripts/build-workspace.sh build
```
Builds the Docker/Podman image locally. ~5-10 minutes first time.

### Start Container
```bash
bash scripts/build-workspace.sh start
```
Starts the container. Auto-initializes on first run per day.

### Enter Shell
```bash
bash scripts/build-workspace.sh shell
```
Interactive bash shell inside the container. All tools available.

### Stop Container
```bash
bash scripts/build-workspace.sh stop
```
Stops the running container. Data persists in volumes.

### Restart Container
```bash
bash scripts/build-workspace.sh restart
```
Restarts the container (useful after updates).

### View Logs
```bash
bash scripts/build-workspace.sh logs
```
Shows container logs in real-time. Press `Ctrl+C` to exit.

### Check Status
```bash
bash scripts/build-workspace.sh status
```
Shows if container is running and resource usage.

### Complete Setup
```bash
bash scripts/build-workspace.sh setup
```
One command to build + start. Recommended for first-time setup.

### Cleanup
```bash
bash scripts/build-workspace.sh clean
```
Removes stopped containers and images. Frees disk space.

---

## Common Workflows

### Morning (First Open)
```bash
# System auto-initializes
bash scripts/build-workspace.sh shell

# Inside container:
python3 scripts/manage-memory.py session list
python3 scripts/manage-memory.py session restore {id}

# Continue work
cd {project-path}
```

### Working with Python Projects
```bash
# Enter shell
bash scripts/build-workspace.sh shell

# Inside container - venv auto-created:
source venv/bin/activate
pip list

# Or use uv directly:
uv pip install new-package
uv run python script.py
```

### Working with Node Projects
```bash
# Enter shell
bash scripts/build-workspace.sh shell

# Inside container:
npm ls
npm install
npm run dev
```

### Backup to Hugging Face
```bash
bash scripts/build-workspace.sh shell

# Inside container:
./hf-sync.sh push
```

### Commit Changes
```bash
bash scripts/build-workspace.sh shell

# Inside container:
git add .
git commit -m "message"
git push
```

### Stop Work
```bash
# Inside container:
python3 scripts/manage-memory.py session save \
  --task "What I was doing" \
  --notes "Next steps"

exit  # Exit container

# Outside container:
bash scripts/build-workspace.sh stop
```

---

## Troubleshooting

### Container won't start
```bash
# Check Docker/Podman is running
docker ps  # or: podman ps

# Check logs
bash scripts/build-workspace.sh logs

# Try rebuilding
bash scripts/build-workspace.sh clean
bash scripts/build-workspace.sh build
bash scripts/build-workspace.sh start
```

### Image too large / disk full
```bash
# Clean up stopped containers and unused images
bash scripts/build-workspace.sh clean

# Check volumes
docker volume ls  # or: podman volume ls
```

### Can't access files
```bash
# Check volume mounts
docker inspect welcome-back-workspace  # or: podman inspect

# Verify permissions
ls -la ~/.kiro/
ls -la ~/.config/nobility-depository/
```

### Credentials not working
```bash
# Inside container:
./hf-sync.sh status

# Check git
git config --global user.name

# Check GitHub
gh auth status

# Re-authenticate if needed
gh auth login
huggingface-cli login
```

### Python/Node not found inside container
```bash
# Rebuild image (may have failed during build)
bash scripts/build-workspace.sh build

# Or check logs during build
docker build -f Dockerfile . 2>&1 | tail -50
```

### Previous day's session not found
```bash
# Check session memory
python3 scripts/manage-memory.py session list

# Restore from HF if lost locally
./hf-sync.sh pull
python3 scripts/manage-memory.py session restore {id}

# Or check git history
git log --oneline | head -10
```

---

## Environment Variables

Inside the container, these are automatically set:

```bash
KIROCREW_HOME=/workspace/.kiro/crew
HF_HOME=/workspace/.cache/huggingface
GITHUB_CONFIG_DIR=/workspace/.config/github-cli
WORKSPACE_ROOT=/workspace
PATH=/root/.local/bin:/usr/local/bin:/usr/bin:/bin
SHELL=/bin/bash
LANG=en_US.UTF-8
TZ=UTC
```

---

## Performance Tips

1. **Use named volumes** for caches (HF, pip, Cargo) — faster than bind mounts
2. **Separate workspace volumes** to prevent path issues
3. **Keep .git shallow** for faster clones: `git clone --depth=1 ...`
4. **Update periodically**: `bash scripts/build-workspace.sh restart`
5. **Monitor resources**: Watch memory with `docker stats` or `podman stats`

---

## Advanced Configuration

### Change Resource Limits
Edit `docker-compose.yml` or `podman-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 8G
```

### Add Environment Variables
In compose file:
```yaml
environment:
  MY_VAR: "value"
```

### Use Different Python Version
Edit `Dockerfile`:
```dockerfile
FROM python:3.11-slim  # Change version here
```

### Rebuild with custom options
```bash
docker build -t welcome-back:custom \
  --build-arg PYTHON_VERSION=3.11 \
  -f Dockerfile .
```

---

## Integration with IDE

### VS Code DevContainers
1. Install "Dev Containers" extension
2. Place in `.devcontainer/devcontainer.json`:
```json
{
  "image": "welcome-back:latest",
  "workspaceFolder": "/workspace",
  "forwardPorts": [8000, 3000, 5173]
}
```
3. `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"

### Kiro IDE
Memory files sync automatically:
- `.kiro/memory-index.md` — Loaded on session start
- `.session-memory.json` — Restored from memory
- `manage-memory.py` — Available in shell

---

## References

- **Build script**: `scripts/build-workspace.sh`
- **Dockerfile**: `Dockerfile`
- **Docker Compose**: `docker-compose.yml`
- **Podman Compose**: `podman-compose.yml`
- **Entrypoint**: `scripts/entrypoint.sh`
- **Init script**: `scripts/init-workspace.sh`
- **Memory manager**: `scripts/manage-memory.py`
- **Context reference**: `CONTEXT-REFERENCE.md`

---

**Last Updated**: 2026-09-10  
**Version**: 1.0.0
