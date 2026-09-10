# WelcomeBackPage — Context Reference Guide

**Quick navigation for resuming work, managing sessions, and cross-workspace memory.**

## 🚀 Quick Start

### First Open Today
```bash
# System auto-initializes Podman workspace
# Check environment
podman run --rm welcome-back-workspace python3 --version

# Verify credentials
./hf-sync.sh status

# List recent sessions
python3 scripts/manage-memory.py session list
```

### Resume Last Session
```bash
# Restore session context
python3 scripts/manage-memory.py session restore {session-id}

# Load environment
source podman-workspace.yaml  # or run in Podman container

# Continue work
cd {project-path}
```

### Save Work Before Leaving
```bash
# Snapshot current session
python3 scripts/manage-memory.py session save \
  --project {project-id} \
  --task "Current task description" \
  --notes "What I was working on"

# Backup to Hugging Face
./hf-sync.sh push

# Commit to GitHub
git add .
git commit -m "Session snapshot"
git push
```

---

## 📁 Memory File Locations

| File | Purpose | Location |
|------|---------|----------|
| **Project Memory** | Master metadata | `.project-memory.json` |
| **Session Memory** | Current session state | `.session-memory.json` |
| **Memory Index** | File guide & structure | `.kiro/memory-index.md` |
| **Project Data** | Per-project metadata | `.kiro/projects/{id}/project-meta.json` |
| **Session Archive** | Saved session snapshots | `.kiro/sessions/{id}/session-meta.json` |
| **Sync Logs** | GitHub/HF sync history | `.kiro/storage/*.log` |

---

## 🔄 Context Restoration Workflow

### When Machine Restarts
1. Clone repo: `git clone https://github.com/tyronne-os/WelcomeBackPage.git`
2. Load memory: `python3 scripts/manage-memory.py status`
3. Restore session: `python3 scripts/manage-memory.py session restore {session-id}`
4. Continue work

### When Switching Workspaces
1. **Current workspace**: 
   - Save: `python3 scripts/manage-memory.py session save --notes "Switching workspace"`
   - Backup: `./hf-sync.sh push`
   - Commit: `git push`

2. **New workspace**:
   - Restore: `./hf-sync.sh pull`
   - Load: `python3 scripts/manage-memory.py session restore {session-id}`
   - Verify: `./hf-sync.sh status`

### When Resuming Next Day
1. On first open, Podman workspace auto-updates: `uv`, `node`, `python3`, CLI tools
2. Check credentials: `./hf-sync.sh status`
3. Sync from HF: `./hf-sync.sh pull`
4. List sessions: `python3 scripts/manage-memory.py session list`
5. Restore last: `python3 scripts/manage-memory.py session restore {most-recent-id}`

---

## 🛠️ Managing Projects

### Register New Project
```bash
python3 scripts/manage-memory.py project add \
  "Project Name" \
  --path /path/to/project \
  --type web \
  --language python \
  --tags ai agent project
```

### List Projects
```bash
python3 scripts/manage-memory.py project list
```

### View Project Context
```bash
cat .kiro/projects/{project-id}/project-meta.json
cat .kiro/projects/{project-id}/context.md
cat .kiro/projects/{project-id}/activity.json
```

---

## 💾 Storage & Sync

### GitHub Sync (Automatic on commit)
```bash
git add .project-memory.json .session-memory.json .kiro/
git commit -m "Update memory files"
git push origin main
```

### Hugging Face Manual Sync
```bash
# View status
./hf-sync.sh status

# Push to HF (backup)
./hf-sync.sh push

# Pull from HF (restore)
./hf-sync.sh pull
```

### HF Dataset Structure
```
tyronne-os/welcome-back-page-projects/
├── projects/
│   ├── .project-memory.json
│   └── {project-id}/
│       └── project-meta.json

tyronne-os/welcome-back-page-sessions/
├── sessions/
│   └── {session-id}/
│       └── session-meta.json
```

---

## 🔐 Credentials & Vault

**Never edit credentials directly.** All credentials stored in vault:

### View Credential Status (No Values)
```bash
./hf-sync.sh status
python3 scripts/manage-memory.py status
```

### Verified Credentials
- ✅ **GitHub** (`GITHUB_TOKEN`) — Account: `tyronne-os`
- ⏳ **Hugging Face** (`HUGGINGFACE_TOKEN`) — Pending setup
- ✅ **OpenAI** (`OPENAI_API_KEY`) — Available in vault

### Re-authenticate
```bash
# GitHub
gh auth login

# Hugging Face
huggingface-cli login

# Verify
./hf-sync.sh status
```

---

## 🐳 Podman Workspace

### First Time Setup
```bash
# Build workspace
podman build -f Dockerfile -t welcome-back-workspace .

# Or use YAML config
podman-compose -f podman-workspace.yaml up -d
```

### Enter Workspace
```bash
podman run -it welcome-back-workspace /bin/bash
# or
podman-compose -f podman-workspace.yaml exec workspace /bin/bash
```

### Auto-Init on First Open (Per Day)
- Updates system packages
- Installs/updates: `uv`, `node`, `python3`, `gh`, `huggingface-cli`
- Verifies credentials
- Logs to: `.kiro/logs/podman-init.log`

### Check Environment
```bash
./hf-sync.sh status
```

---

## 📋 Session Management

### Save Session Snapshot
```bash
python3 scripts/manage-memory.py session save \
  --project {project-id} \
  --task "Implementing feature X" \
  --notes "Made progress on auth, next: testing"
```

### List Recent Sessions
```bash
python3 scripts/manage-memory.py session list
```

### Restore Session
```bash
python3 scripts/manage-memory.py session restore {session-id}
```

### Archive Old Sessions
```bash
# Archive sessions older than 30 days
python3 scripts/manage-memory.py cleanup --days 30

# View archived sessions
ls .kiro/sessions/archive/
```

---

## 🎯 Typical Workflows

### Morning (First Open)
```bash
# Environment auto-initializes
./hf-sync.sh status           # Verify creds
python3 scripts/manage-memory.py session list  # See yesterday's work
python3 scripts/manage-memory.py session restore {id}  # Load context
cd {project-path}
# Continue work
```

### Switching Workspaces
```bash
# Workspace A
python3 scripts/manage-memory.py session save --notes "Switching workspace"
./hf-sync.sh push
git push

# Workspace B (or new machine)
./hf-sync.sh pull
python3 scripts/manage-memory.py session restore {id}
# Resume work
```

### End of Day
```bash
python3 scripts/manage-memory.py session save \
  --task "Current task" \
  --notes "What I accomplished and next steps"
./hf-sync.sh push
git add .
git commit -m "End of day: Session saved"
git push
```

### Starting New Feature
```bash
python3 scripts/manage-memory.py project add "New Feature" \
  --path $(pwd) \
  --type feature \
  --language python

# Work on feature...

python3 scripts/manage-memory.py session save \
  --project {new-project-id} \
  --task "Implementing new feature" \
  --notes "Initial setup complete"
```

---

## 🔧 Troubleshooting

### Memory file missing
```bash
python3 scripts/manage-memory.py init
```

### Session not found
```bash
python3 scripts/manage-memory.py session list
ls .kiro/sessions/
```

### HF sync failing
```bash
./hf-sync.sh status
huggingface-cli whoami
huggingface-cli login  # Re-authenticate
./hf-sync.sh push
```

### Git out of sync
```bash
git status
git pull origin main
python3 scripts/manage-memory.py status
```

---

## 📚 References

- **Vault Access**: See `VAULT-ACCESS.md` in connie-crane
- **Memory Structure**: `.kiro/memory-index.md`
- **Podman Config**: `podman-workspace.yaml`
- **HF Sync Tool**: `hf-sync.sh`
- **Memory Manager**: `scripts/manage-memory.py`
- **GitHub Repo**: https://github.com/tyronne-os/WelcomeBackPage
- **Project**: https://www.huggingface.co/datasets/tyronne-os/welcome-back-page-projects
- **Sessions**: https://www.huggingface.co/datasets/tyronne-os/welcome-back-page-sessions

---

**Last Updated**: 2026-09-10  
**Version**: 1.0.0
