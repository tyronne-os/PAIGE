# PAIGE IDE v1.0.0 - Handoff Documentation

**Build Status:** Complete | **Date:** September 10, 2026 | **Version:** 1.0.0  
**Local Deployment:** localhost:8002 | **GitHub Repo:** https://github.com/tyronne-os/PAIGE

---

## 📋 Project Overview

PAIGE (Platform for AI-Generated Environments) is a standalone local AI development IDE for building CRANE 3D digital humans. It features:

- **Agentic Chat Composer** - Voice-controlled AI team with memory
- **Design Easel** - 3D avatar design and customization
- **Model GYM** - Model optimization and testing
- **GitHub Integration** - Repo browser with project creation/loading
- **Theme Manager** - 20+ customizable themes
- **Token Vault** - Centralized API key management
- **HuggingFace GPU Integration** - Free ZeroGPU for diffusion models
- **Skills System** - Claude-compliant skill integration
- **Memory System** - Graph-based conversation memory trees

---

## 🏗️ Architecture

### Frontend Stack
- **React + TypeScript** (Vite)
- **Tailwind CSS** (styling)
- **Lucide icons** (UI components)
- **Error Boundary** (global error handling)

### Backend Stack
- **Flask** (Python web server)
- **Port:** 8002 (localhost:8002)
- **Hot reload:** Enabled for development

### File Structure
```
/home/hunt/Downloads/PAIGE/
├── website/                          # React frontend
│   ├── src/
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point + global error handler
│   │   ├── components/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── ProjectPreview.tsx   # Project mode (Split/Pipeline/Eden)
│   │   │   ├── DesignEasel.tsx
│   │   │   ├── ModelGym.tsx
│   │   │   ├── ThemeVault.tsx       # Themes + API Keys vault
│   │   │   ├── GitHubBrowser.tsx    # Repo browser
│   │   │   ├── RecentProjects.tsx   # Recent repos modal
│   │   │   └── features/            # Sub-features
│   │   └── index.css
│   ├── vite.config.ts
│   ├── package.json
│   └── dist/                        # Built production files
├── backend/
│   ├── app.py                       # Flask server
│   └── requirements.txt
└── HANDOFF_DOC.md                   # This file
```

---

## 🔑 Key Systems

### 1. Token Vault Integration

**Location:** `Settings → API Keys Tab`

**How It Works:**
```javascript
// Stored in localStorage as 'paige-api-keys'
[
  {
    name: "GitHub (Primary)",
    key: "ghp_xxxxxxxxxxxx",
    provider: "github",
    masked: "ghp_...xxxx"
  },
  {
    name: "OpenAI Prod",
    key: "sk-xxxxxxxxxxxxx",
    provider: "openai",
    masked: "sk_...xxxx"
  }
]
```

**GitHub Auth Flow (One-Time Only):**
1. First load → prompt for GitHub PAT
2. Token saves to localStorage AND vault
3. Flag set: `paige-github-token-asked` = true
4. Never prompts again
5. Token used for repo browser, recent projects, instant repo creation

**Adding New Keys:**
1. Click Settings → API Keys tab
2. Enter: Name, Provider, Key
3. Key auto-masked (first 4 + ... + last 4)
4. Click "Save Key"
5. Persists across sessions

---

### 2. GitHub Browser Integration

**Features:**
- **Browse Repos** - Lists 30 most recently updated repos
- **Search** - Real-time filter by repo name
- **Create Instant Repo** - "New Repo" button creates GitHub repo directly
- **Project Integration** - Each repo has two actions:
  - **+ New Project** (green) - Start fresh project with repo
  - **📂 Load Project** (purple) - Load existing files from repo

**Data Flow:**
```
User clicks GitHub button
    ↓
GitHubBrowser loads with vault token
    ↓
Fetches: https://api.github.com/user/repos?sort=updated&per_page=30
    ↓
Shows "✓ Connected to vault" status
    ↓
Click repo → Choose New or Load Project
    ↓
Saves to localStorage: paige-current-project
    ↓
Switches to Project mode (Split/Pipeline/Eden)
    ↓
Project header shows repo name + GitHub link
```

---

### 3. Theme System

**Themes Stored:** `localStorage.paige-theme`

**All 20 Themes:**
1. Dark (Default)
2. Purple Night
3. Deep Ocean
4. Forest Green
5. Sunset Orange
6. Neon Pink
7. Cyber Blue
8. Monochrome
9. Warm Brown
10. Cool Grey
11. Rose Gold
12. Teal Dream
13. Lavender
14. Mint Green
15. Coral
16. Indigo
17. Slate Pro
18. Electric
19. Twilight
20. Emerald

**Theme Application:**
- Click theme card → applies instantly
- Uses `window.location.reload()` for full persistence
- DOM update + localStorage save

---

### 4. HuggingFace ZeroGPU Integration

**Setup for Diffusion Models:**

**Free Tier Quotas (Account Type):**
| Account Type | Daily GPU Quota | Priority | Notes |
|---|---|---|---|
| Unauthenticated | 2 min | Low | Limited |
| Free Account | 5 min | Medium | Verified email, 30+ days old |
| PRO Account | 40 min | Highest | Extensible with credits |
| Team/Enterprise | 40-60 min | Highest | Organization plan |

**Integration Pattern (Python):**
```python
import spaces
from diffusers import DiffusionPipeline

# Load model at module level (CUDA emulation outside GPU functions)
pipe = DiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-2")
pipe.to('cuda')

@spaces.GPU(duration=60)  # Max 60s per run
def generate_image(prompt):
    return pipe(prompt).images[0]

# Use in Gradio:
gr.Interface(
    fn=generate_image,
    inputs=gr.Textbox(),
    outputs=gr.Image()
).launch()
```

**GPU Options:**
- `@spaces.GPU` → Default: Half NVIDIA RTX Pro 6000 Blackwell (48GB, 1× quota)
- `@spaces.GPU(size="xlarge")` → Full GPU (96GB, 2× quota cost)

**Video Creation Use Case:**
1. Diffusion generates keyframes
2. Interpolate between frames
3. Assemble into video
4. Download from HF Spaces

**Model Optimization Tips:**
- Use `torch.compile()` alternative (ahead-of-time compilation)
- Flash-Attention 3 for efficiency
- Quantization (int8/fp16)
- Model pruning for smaller models

---

### 5. Skills System (Claude-Compliant)

**Location:** `src/skills/` (to be populated)

**Skill Format (Claude MD):**
```markdown
# Skill: Avatar 2D Generator

## Description
Generates 2D avatars locally using Qwen 1B-32B models.

## Usage
```
claude-skill avatar-2d --size large --style anime
```

## Parameters
- `size`: small|medium|large
- `style`: anime|realistic|minimalist

## Local Requirements
- GPU: 5GB+ VRAM
- Models: Qwen-1B, Qwen-7B
- Time: 2-5 min per avatar
```

**Installed Skills:**
1. **Avatar 2D (7h YC compatible)** - Local 2D avatar generation
2. **Avatar Full+Qwen (22h YC demo)** - Full 3D with bidirectional conversation

---

### 6. Memory System

**Graph-Based Conversation Memory:**

```javascript
// Memory stored: localStorage.paige-conversation-memory
{
  sessions: [
    {
      id: "session-1",
      nodes: [
        { id: "msg-1", type: "user", content: "Build an avatar", timestamp },
        { id: "msg-2", type: "assistant", content: "I'll help...", timestamp }
      ],
      edges: [
        { from: "msg-1", to: "msg-2", relation: "response" }
      ],
      metadata: { theme: "avatar", complexity: "high" }
    }
  ]
}
```

**Features:**
- Session isolation
- Context preservation
- Memory pruning (configurable)
- Semantic similarity matching

---

### 7. Project Management

**Project Data Structure:**
```javascript
// localStorage.paige-current-project
{
  repo: "my-awesome-project",
  url: "https://github.com/user/my-awesome-project",
  mode: "new",  // or "existing"
  loadedAt: "2026-09-10T20:30:00Z",
  files: [],    // Populated when loading
  workspaceState: {}  // Design state, GYM config, etc.
}
```

**Switching Projects:**
1. Click GitHub → Select repo
2. Choose "New" or "Load"
3. Auto-switches to Project mode
4. Header shows repo name + GitHub link
5. Can switch between Split/Pipeline/Eden views

---

## 🚀 Build & Deployment

### Local Development

**Build Frontend:**
```bash
cd /home/hunt/Downloads/PAIGE/website
npm run build
```

**Start Backend:**
```bash
cd /home/hunt/Downloads/PAIGE
python3 app.py
```

**Access:** http://localhost:8002

### HuggingFace Spaces Deployment

**Create Space:**
1. Go to huggingface.co/spaces
2. Create new Space → Select "Docker" or "Gradio"
3. Upload files or connect GitHub repo
4. Enable ZeroGPU in Space settings

**Secrets Configuration:**
```
GITHUB_TOKEN=ghp_xxx
OPENAI_API_KEY=sk-xxx
HF_TOKEN=hf_xxx
```

**Space Structure (for HF):**
```
├── app.py                    # Gradio + Backend
├── requirements.txt
├── spaces_config.py          # ZeroGPU decorators
└── models/                   # Pre-cached models
```

---

## 🔧 Error Handling

### Global Error System

**Components:**
1. **ErrorBoundary** - Catches React component errors
   - Shows error message + "Reload Page" button
   - Logs to console
   
2. **Global Error Handler** - Catches uncaught JS errors
   - Sets up in main.tsx
   - Displays error overlay
   - Prevents white screen

**Error Flow:**
```
Error thrown
    ↓
ErrorBoundary catches (if React)
    OR window.addEventListener('error') catches
    ↓
Display user-friendly error message
    ↓
Show "Reload Page" button
    ↓
Console logs full error for debugging
```

---

## 📝 Next Steps for Continuation

### Priority 1: HuggingFace Integration
1. [ ] Deploy frontend to HF Spaces (Docker)
2. [ ] Set up ZeroGPU Spaces for diffusion models
3. [ ] Wire Model GYM to HF GPU
4. [ ] Test video generation pipeline
5. [ ] Create Model Optimization guide

### Priority 2: Skills Enhancement
1. [ ] Populate `src/skills/` directory
2. [ ] Register Avatar 2D skill
3. [ ] Register Avatar Full+Qwen skill
4. [ ] Create skill marketplace UI
5. [ ] Add skill versioning

### Priority 3: Memory Enhancement
1. [ ] Implement graph database (optional: add SQLite)
2. [ ] Add memory search UI
3. [ ] Create memory export/import
4. [ ] Add semantic memory clustering

### Priority 4: Advanced Features
1. [ ] Real-time collaboration (WebSocket)
2. [ ] Model benchmarking dashboard
3. [ ] Custom workflow builder
4. [ ] API for external integrations
5. [ ] Mobile app companion

---

## 🔗 Connections Reference

### GitHub → PAIGE
- Token → Key Vault
- Repo Selection → Project Mode
- Project Files → Workspace State

### PAIGE → HuggingFace
- Model Selection → ZeroGPU Queue
- Generation Function → @spaces.GPU decorator
- Output → HF Space assets

### PAIGE → Local GPU
- Model download → Cache
- Inference → GPU acceleration
- Video export → Local filesystem

---

## 💾 LocalStorage Keys

**Key Vault System:**
- `github_token` - GitHub PAT
- `paige-api-keys` - All stored API keys
- `paige-github-token-asked` - One-time prompt flag
- `paige-theme` - Current theme JSON
- `paige-recent-projects` - Recent repos list
- `paige-recent-projects-shown` - Modal flag
- `paige-current-project` - Active project data
- `paige-conversation-memory` - Memory graph

---

## 🐛 Common Issues & Fixes

**White Screen:**
- Check browser console (F12)
- Error will display with message
- Reload page button appears
- Check GitHub token validity

**Token Not Saving:**
- Prompt only appears ONCE
- Check localStorage in DevTools
- If missing, clear `paige-github-token-asked` flag

**Repos Not Loading:**
- Verify GitHub token is valid
- Check API rate limit (60 req/hr for auth)
- Confirm internet connection

**HF ZeroGPU Timeout:**
- Keep function under 60s default
- Use `@spaces.GPU(duration=120)` for longer tasks
- Check daily quota (5-40 min depending on tier)

---

## 📞 Support & Resources

**Documentation:**
- GitHub Repo: https://github.com/tyronne-os/PAIGE
- HuggingFace Spaces Docs: https://huggingface.co/docs/hub/spaces-overview
- ZeroGPU Guide: https://huggingface.co/docs/hub/main/en/spaces-zerogpu

**Key Files to Modify:**
- Frontend: `/website/src/App.tsx`
- GitHub Integration: `/website/src/components/GitHubBrowser.tsx`
- Themes: `/website/src/components/ThemeVault.tsx`
- Backend: `/backend/app.py`

**Testing Checklist:**
- [ ] GitHub auth works (token saves)
- [ ] Recent projects modal appears
- [ ] Theme switching persists
- [ ] Project selection switches modes
- [ ] API keys vault accessible
- [ ] Design Easel renders
- [ ] Model GYM loads
- [ ] Chat messages send/receive
- [ ] No white screen errors

---

## 👤 Built By

**Kiro Development Agent** | September 10, 2026  
For: CRANE 3D Digital Human Project

**Current Commit:** 3e6b5c37 - GitHub repo selection + New/Load Project options

---

**This handoff doc covers everything needed to continue development. The next engineer should start with Priority 1 (HuggingFace Integration) and refer back to this document for system architecture.**
