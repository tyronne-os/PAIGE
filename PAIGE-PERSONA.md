# PAIGE — Persona AI Agent

**PAIGE** is a standalone persona AI agent extracted from the connie-crane project.

## Overview

- **Name**: PAIGE
- **Type**: Persona AI Agent
- **Origin**: connie-crane/paige_agent.py
- **Repository**: https://github.com/tyronne-os/PAIGE
- **Storage**: 1TB-5TB Hugging Face Pro membership
- **Created**: 2026-09-10

## Core Files

### Agent Logic
- **`paige_agent.py`** — Core agent implementation
- **`paige_knowledge_base.md`** — Knowledge base and context
- **`paige_voice_orb.js`** — Voice interface and interactions

### Project Management
- **`.project-memory.json`** — Project metadata and storage config
- **`.session-memory.json`** — Session state and context
- **`scripts/manage-memory.py`** — Session/project management CLI

### Workspace & Environment
- **`Dockerfile`** — Container image with all tools
- **`docker-compose.yml`** — Docker orchestration
- **`podman-compose.yml`** — Podman orchestration
- **`scripts/build-workspace.sh`** — Container management tool

### Desktop Integration
- **`desktop-installer.sh`** — Cross-platform desktop installer
- **`scripts/gui-installer.py`** — GUI installer (Pinokio-style)

## Quick Start

### Installation
```bash
# Clone repository
git clone https://github.com/tyronne-os/PAIGE.git
cd PAIGE

# Option A: Desktop installer
bash desktop-installer.sh

# Option B: Build workspace
bash scripts/build-workspace.sh setup

# Option C: Enter shell directly
bash scripts/build-workspace.sh shell
```

### Daily Use
```bash
# Open workspace (auto-initializes on first open per day)
bash scripts/build-workspace.sh shell

# Inside container:
# PAIGE agent is ready for use with full context
python3 scripts/manage-memory.py session list
python3 scripts/manage-memory.py session restore {id}
```

## Storage & Sync

### GitHub
- Repository: `https://github.com/tyronne-os/PAIGE`
- Branch: `main`
- Sync: Automatic on `git push`

### Hugging Face
- Projects: `tyronne-os/paige-projects`
- Sessions: `tyronne-os/paige-sessions`
- Storage: 1TB-5TB (Pro membership)
- Sync: `./hf-sync.sh [push|pull|status]`

## Persona Configuration

PAIGE is configured as a professional, analytical persona with:
- Supportive communication style
- Deep technical knowledge
- Context-aware assistance
- Session memory across interruptions

## Memory System

### Project Memory
Tracks all PAIGE projects, configurations, and metadata.

### Session Memory
Saves and restores:
- Conversation context
- Active tasks
- Environment state
- User preferences

### Backup Strategy
- GitHub: Automatic on commit
- Hugging Face: Manual via `hf-sync.sh` or automatic (configurable)
- Local: All files in `.kiro/sessions/` and `.kiro/projects/`

## Security

- ✅ Vault credentials mounted read-only
- ✅ No secrets in environment or logs
- ✅ Container isolation
- ✅ Session data encrypted at rest (HF)
- ✅ GitHub access via SSH key

## Documentation

| Document | Purpose |
|----------|---------|
| `PAIGE-PERSONA.md` | This file - PAIGE overview |
| `CONTEXT-REFERENCE.md` | Quick-start guide for daily use |
| `WORKSPACE-SETUP.md` | Complete workspace documentation |
| `DESKTOP-INSTALLER.md` | Desktop app installation guide |
| `.kiro/memory-index.md` | Memory system architecture |
| `PROJECT-SUMMARY.md` | Complete project summary |

## Integration with connie-crane

PAIGE was extracted from connie-crane as a standalone project but maintains compatibility:

- Can co-exist with connie-crane and WelcomeBackPage
- Shares the same LLYACrew base
- Uses the same vault and credential system
- Coordinates through GitHub + Hugging Face

## Next Steps

1. **First Run**: Execute `bash desktop-installer.sh` or `bash scripts/build-workspace.sh setup`
2. **Load Memory**: Check previous sessions with `python3 scripts/manage-memory.py session list`
3. **Resume Work**: Restore context with `python3 scripts/manage-memory.py session restore {id}`
4. **Interact**: Use PAIGE as your persona AI agent for assistance

---

**Repository**: https://github.com/tyronne-os/PAIGE  
**Version**: 1.0.0  
**Status**: Ready for use
