# KiroCrew → PAIGE: Component Analysis & Re-Engineering Roadmap

## Executive Summary

PAIGE is a **specialized fork** of KiroCrew focused on:
- Model development & compression (PAIGE Lab)
- Clean codebase (tracking/malware removed)
- Local-first with HF storage integration
- Custom UI (React gallery + compression tools)

This document identifies what PAIGE **has inherited**, what's **missing**, and what needs **re-engineering** for production parity.

---

## Task #1: Architecture Layer Comparison

### Layer 1: User Surfaces

| Component | KiroCrew | PAIGE Current | Status | Notes |
|-----------|----------|--------------|--------|-------|
| **Desktop App** | ✅ Electron (macOS, Windows, Linux) | ❌ None | MISSING | Needs: Build from kiro_crew/electron |
| **Web Dashboard** | ✅ React @ localhost:5476 | ✅ @ localhost:8002 | INHERITED | Modified port, clean codebase |
| **CLI Tool** | ✅ kirocrew commands | ✅ Available but not exposed | PARTIAL | Need: Wrapper for PAIGE-specific commands |
| **Slack Integration** | ✅ Full bidirectional | ❌ None | MISSING | Can add via MCP channels |
| **Discord** | ✅ Full bidirectional | ❌ None | MISSING | Can add via MCP channels |
| **Telegram** | ✅ Full bidirectional | ❌ None | MISSING | Can add via MCP channels |
| **Teams/Webex/etc** | ✅ 8+ channels | ❌ None | MISSING | Can add via MCP channels |
| **PAIGE Lab Gallery** | ❌ N/A (not in KiroCrew) | ✅ Custom Gradio @ 7860 | NEW | Purpose-built for model browsing |
| **PAIGE Lab Frontend** | ❌ N/A (not in KiroCrew) | ✅ Custom React @ 3000 | NEW | Purpose-built for model building |

**Gap #1: User Surfaces**
- Desktop app not built (low priority for server/container deployment)
- Messaging channels not configured (can be added via config)
- PAIGE Lab surfaces are *additions*, not replacements
- **Decision**: Focus on web dashboard + PAIGE Lab for MVP

---

### Layer 2: Gateway

| Component | KiroCrew | PAIGE | Status | Notes |
|-----------|----------|-------|--------|-------|
| **Long-running process** | ✅ kiro-crew gateway | ✅ python3 -m kiro_crew gateway | PRESENT | Same underlying service |
| **Port binding** | 5476 default | 8002 custom | CONFIGURED | No conflict with CRANE (8000) |
| **Message routing** | ✅ Full | ✅ Full | INHERITED | All surfaces can connect |
| **Session management** | ✅ Persistent sessions | ✅ Persistent sessions | INHERITED | Same system |
| **Memory injection** | ✅ Yes | ✅ Yes | INHERITED | Automatic context loading |
| **Schedule management** | ✅ Yes | ❓ Exposed? | PARTIAL | Need to verify/surface |
| **Approval broker** | ✅ Yes | ✅ Yes | INHERITED | Interactive tool approvals |
| **Dashboard exposure** | ✅ Yes | ✅ Yes | INHERITED | State visible in dashboard |
| **PAIGE Lab integration** | ❌ N/A | ✅ Custom handlers | NEW | Routes to 7860/3000 |

**Gap #2: Gateway Integration**
- Gateway works fine, but scheduling may not be surfaced in PAIGE Lab UI
- Need to route model compression tasks through task runner
- **Decision**: Extend PAIGE Lab to expose scheduler for batch operations

---

### Layer 3: Agent Sessions

| Component | KiroCrew | PAIGE | Status | Notes |
|-----------|----------|-------|--------|-------|
| **ACP Protocol** | ✅ Full implementation | ✅ Inherited | PRESENT | Agent Client Protocol works as-is |
| **Session isolation** | ✅ Per-conversation | ✅ Per-conversation | INHERITED | Independent contexts |
| **Model event streaming** | ✅ Yes | ✅ Yes | INHERITED | Real-time tool/model events |
| **Context preservation** | ✅ Yes (embeddings) | ✅ Yes (embeddings) | INHERITED | Semantic memory search |
| **Concurrent sessions** | ✅ Multiple in parallel | ✅ Multiple in parallel | INHERITED | Pool-based multiplexing |
| **Session resume** | ✅ After restart | ✅ After restart | INHERITED | Checkpoint system |
| **Subagents** | ✅ Spawn isolated agents | ✅ Inherited capability | INHERITED | Can fork parallel work |

**Status: ✅ No gaps - fully inherited**

---

### Layer 4: Core Services

| Component | KiroCrew | PAIGE | Status | Implementation |
|-----------|----------|-------|--------|-----------------|
| **Memory System** | ✅ Semantic embeddings | ✅ Semantic embeddings | INHERITED | Auto-downloads embedding model |
| **Persistent sessions** | ✅ ~/.kiro/crew | ✅ ~/ .kiro/crew (clean) | INHERITED | Same storage, no tracking |
| **Lessons/corrections** | ✅ Learn from failures | ✅ Available | INHERITED | Not surfaced in PAIGE Lab |
| **Skill framework** | ✅ Markdown skills | ✅ Available | INHERITED | Not customized for models |
| **MCP Servers** | ✅ kiro-cli, compute, cron | ✅ Available | INHERITED | Full set available |
| **Scheduling (cron)** | ✅ kirocrew cron | ✅ Available | INHERITED | Not exposed in PAIGE Lab |
| **Task runner** | ✅ kirocrew run <task.md> | ✅ Available | INHERITED | Need PAIGE-specific tasks |
| **Model Compression Tasks** | ❌ N/A | ❓ Needs building | MISSING | Must create task specs |
| **Batch Operations** | ❌ N/A | ❓ Needs building | MISSING | Multi-model compression |
| **Version Control** | ✅ Git integration | ✅ Git available | INHERITED | Can track model versions |

**Gap #3: Core Services**
- Memory system present but not customized for model context
- Skills framework exists but no model-specific skills built
- Task runner exists but no PAIGE Lab compression tasks defined
- Scheduling present but not exposed in PAIGE Lab UI
- **Decision**: Build PAIGE-specific skills and task definitions

---

### Layer 5: Security

| Component | KiroCrew | PAIGE | Status | Notes |
|-----------|----------|-------|--------|-------|
| **OS Sandbox** | ✅ namespace/Seatbelt | ✅ Inherited | INHERITED | Model compression runs sandboxed |
| **Interactive Approvals** | ✅ Dashboard + messaging | ✅ Dashboard | PARTIAL | Only web dashboard active |
| **Sensitive Data Guards** | ✅ Path/env redaction | ✅ Inherited | INHERITED | HF tokens protected |
| **Deny Rules Catalog** | ✅ Bundled rules | ✅ Inherited | INHERITED | Blocks destructive commands |
| **Audit Events** | ✅ kirocrew security | ✅ Inherited | INHERITED | Tool access logged |
| **Governance Policies** | ✅ Optional enforcement | ❓ Not configured | MISSING | Could add model-specific policies |
| **Credential Redaction** | ✅ Pattern matching | ✅ Inherited | INHERITED | HF_TOKEN hidden in logs |
| **Vault Integration** | ❌ Not in KiroCrew | ✅ AMANDA Access vault | EXTENSION | PAIGE-specific enhancement |

**Status: ✅ Largely inherited, extended with AMANDA vault**

---

## Task #2: Identify Missing Components

### Tier 1: Critical Missing (MVP needs these)

#### 2A. Desktop App
**KiroCrew has:** Electron app with:
- Auto-updates
- System tray integration
- Bundled Gateway
- SSH tunneling for remote

**PAIGE needs:**
- Fork or build from kiro_crew/electron
- Customize for PAIGE Lab branding
- **Priority**: LOW (server-based deployment preferred)

#### 2B. Messaging Channels
**KiroCrew has:** 10+ channels (Slack, Discord, Teams, etc.)

**PAIGE needs:**
- Configure at least Slack and Discord
- Route model compression updates to chat
- Approval buttons in Slack
- **Priority**: MEDIUM (enables async workflows)

#### 2C. Task Runner for Model Ops
**KiroCrew has:** `kirocrew run <task.md>` with checkpoints

**PAIGE needs:**
- `paige compress-model.md` (task spec)
- `paige quantize-batch.md` (task spec)
- `paige train-lora.md` (task spec)
- **Priority**: HIGH (core PAIGE Lab feature)

#### 2D. Scheduling UI in Dashboard
**KiroCrew has:** `kirocrew cron` + dashboard view

**PAIGE needs:**
- Surface cron jobs in PAIGE Lab dashboard
- Schedule model compression runs
- Recurring backup tasks to HF
- **Priority**: HIGH (unattended operations)

---

### Tier 2: Important Missing (Post-MVP)

#### 2E. Model-Specific Skills
**KiroCrew has:** Markdown-based reusable skills

**PAIGE needs:**
- `quantize-gguf.md` (GGUF quantization workflow)
- `compress-bitsandbytes.md` (8-bit/4-bit workflow)
- `benchmark-model.md` (Performance testing)
- `upload-to-hf.md` (HF storage sync)
- **Priority**: MEDIUM (reusable templates)

#### 2F. Model Context in Memory
**KiroCrew has:** Generic semantic memory

**PAIGE needs:**
- Model-specific lessons (e.g., "this model needs --nf4")
- Compression history tracking
- Performance baselines per model
- **Priority**: MEDIUM (learning from compression runs)

#### 2G. Governance Policies for Models
**KiroCrew has:** Optional policy files

**PAIGE needs:**
- Model size limits (e.g., max 13B before quantization)
- Compression ratio targets
- Security policies for external model imports
- **Priority**: LOW (optional governance)

---

### Tier 3: Nice-to-Have Missing

- CI/CD integration for model releases
- Model registry federation (beyond HF)
- A/B testing framework for quantization methods
- Cost tracking for compression runs

---

## Task #3: Memory & Learning Systems

### What PAIGE Has (Inherited)

```
~/.kiro/crew/
├── sessions/         # Persistent session history
├── memory/          # Semantic memory store
│   ├── embeddings/   # Downloaded embedding model
│   └── index.db      # Vector search index
├── lessons/         # Learned corrections
├── knowledge/       # Knowledge base
└── skills/          # Reusable workflows
```

### What's Missing

| Feature | KiroCrew | PAIGE | Need | Example |
|---------|----------|-------|------|---------|
| **Persistent sessions** | ✅ | ✅ | NO | |
| **Semantic search** | ✅ | ✅ | NO | |
| **Lesson learning** | ✅ | ⚠️ | YES | "This model needs --flash-attn=2" |
| **Model-specific context** | ❌ | ❌ | YES | "Mistral-7B: works best with 2k context" |
| **Compression preferences** | ❌ | ❌ | YES | "User prefers GGUF for CPU, bitsandbytes for GPU" |
| **Performance baselines** | ❌ | ❌ | YES | "Model XYZ: 150ms @ 4-bit, 80ms @ 2-bit" |

### Re-Engineering Needed

```python
# Add to ~/.kiro/crew/skills/model-compression.md

# Compress Model: GGUF Format
Goal: Quantize model to GGUF for local CPU inference

## Context
- User preference: {prefer_quantization_method}
- Model size: {model_size_gb}
- Target device: {target_device}
- Previous compression ratio: {baseline_ratio}

## Lesson: GGUF Quantization
- For Mistral models: q4_K_M is optimal
- For Llama models: q5_K_S gives 90% quality
- Context window: Use --ctx 2048 for most cases

## Steps
1. Load model from {model_path}
2. Apply llama.cpp quantization with params
3. Benchmark against {baseline_ratio}
4. Save to {output_path}
5. Upload to HF with git

## Validate
- File size < {target_size}
- Inference speed > {baseline_speed}
- Quality loss acceptable
```

---

## Task #4: Security Layers Analysis

### Present & Inherited

✅ **OS Sandbox**
- Linux: namespace isolation (unshare)
- macOS: Seatbelt sandbox
- Windows: No equivalent, runs unsandboxed (configurable)

✅ **Interactive Approvals**
- Dashboard: Review tool requests
- Messaging: Slack buttons, Discord reactions
- Session-scoped trust: Reduce repeated prompts

✅ **Sensitive Data Guards**
- Path redaction: Blocks /home/hunt from logs
- Env redaction: Hides HF_TOKEN, OPENAI_KEY, etc.
- Credential patterns: Removes tokens/keys from output

✅ **Deny Rules Catalog**
- Destructive commands blocked (rm -rf, dd, etc.)
- Exfiltration paths blocked
- Registry access blocked

✅ **Audit Trail**
- `~/.kiro/crew/security_events.jsonl` (append-only)
- Tool calls logged with timestamps
- User actions recorded

### Missing or Needs Extension

⚠️ **Model-Specific Policies**
- Should block malicious model imports
- Should validate model checksums from HF
- Should track model lineage

⚠️ **Governance for Compression**
- Could enforce minimum compression ratios
- Could require approval for large model operations
- Could track model licenses

⚠️ **Extended Audit for PAIGE Lab**
- Model download sources logged
- Compression operations traced
- Upload destinations verified

### PAIGE Extensions (via AMANDA vault)

✅ **AMANDA Access Vault**
- HF_TOKEN stored securely
- GitHub token stored
- Model credentials encrypted
- Better than environment variables

---

## Task #5: Production Parity Scorecard

| Category | KiroCrew | PAIGE | % Complete | Gap |
|----------|----------|-------|------------|-----|
| **Surfaces** | 100% | 60% | 60% | Missing: Desktop, Messaging |
| **Gateway** | 100% | 100% | 100% | ✅ Complete |
| **Sessions** | 100% | 100% | 100% | ✅ Complete |
| **Memory** | 100% | 80% | 80% | Missing: Model-specific context |
| **Skills** | 100% | 20% | 20% | Missing: Model compression skills |
| **Scheduling** | 100% | 50% | 50% | Present but not surfaced in Lab |
| **Task Runner** | 100% | 50% | 50% | Present but no Lab-specific tasks |
| **Security** | 100% | 100% | 100% | ✅ Complete (enhanced with AMANDA) |
| **Overall** | **100%** | **73%** | **73%** | **~27% gap** |

---

## Task #6: Re-Engineering Roadmap for PAIGE Lab

### Phase 1: Foundation (Current - Complete)
✅ Clean fork created
✅ Desktop launchers working
✅ PAIGE Lab gallery UI
✅ Basic integration with kiro_crew

### Phase 2: Core Features (Next)
🔄 **2A. Model Compression Tasks**
- [ ] Create `compress-gguf.md` task
- [ ] Create `compress-bitsandbytes.md` task
- [ ] Create `compress-pruning.md` task
- [ ] Create `compress-distillation.md` task
- [ ] Create `compress-lora.md` task
- Estimated: 2-3 days
- Files: `src/kiro_crew/skills/paige-compression-*.md`

🔄 **2B. Task Runner Integration**
- [ ] PAIGE Lab UI → Task submission
- [ ] Task status monitoring
- [ ] Checkpoint resumption
- [ ] Result visualization
- Estimated: 3-5 days
- Files: `src/paige_lab/task_runner.py`

🔄 **2C. Scheduling Exposure**
- [ ] Surface `kirocrew cron` in dashboard
- [ ] PAIGE Lab UI for scheduling compression
- [ ] Recurring backup to HF
- Estimated: 2-3 days
- Files: `src/paige_lab/scheduler.py`

🔄 **2D. Model-Specific Memory**
- [ ] Extend memory system for model context
- [ ] Store compression preferences
- [ ] Track performance baselines
- Estimated: 2-3 days
- Files: `src/paige_lab/model_memory.py`

### Phase 3: Enhancement (Post-MVP)
📋 **3A. Messaging Channels**
- [ ] Slack integration
- [ ] Discord integration
- [ ] Model compression notifications
- Estimated: 3-5 days
- Files: `src/kiro_crew/slack/paige_*`, `src/kiro_crew/discord/paige_*`

📋 **3B. Desktop App**
- [ ] Build from kiro_crew/electron
- [ ] PAIGE Lab branding
- [ ] System tray integration
- Estimated: 5-10 days
- Files: Build system integration

📋 **3C. Model Governance**
- [ ] Policy framework
- [ ] Model size limits
- [ ] Compression requirements
- [ ] License validation
- Estimated: 3-5 days
- Files: `src/paige_lab/governance.md`

📋 **3D. Advanced Skills**
- [ ] Model benchmarking workflow
- [ ] A/B testing quantization methods
- [ ] Automated optimization
- Estimated: 5-10 days
- Files: `src/kiro_crew/skills/paige-advanced-*.md`

---

## Implementation Priority Matrix

```
        High Impact
        ↑
        |  [2B] Runner    [3C] Governance
        |  [2C] Schedule  [3D] Skills
        |  [2D] Memory    
        |  [2A] Tasks     [3A] Messaging
        |                 [3B] Desktop
        └─────────────────────────→ Low Effort
```

**Recommended Order:**
1. Phase 2A: Compression tasks (highest value, moderate effort)
2. Phase 2B: Task runner (enables 2A)
3. Phase 2D: Model memory (improves quality)
4. Phase 2C: Scheduling (enables async)
5. Phase 3A: Messaging (nice-to-have async)
6. Phase 3B: Desktop (optional, lower priority)
7. Phase 3C: Governance (optional, larger scope)
8. Phase 3D: Advanced skills (optional, future)

---

## Copy/Re-Engineer Strategy

### What to Copy As-Is
- `src/kiro_crew/session.py` - Session management
- `src/kiro_crew/memory.py` - Semantic memory
- `src/kiro_crew/skills.py` - Skill loading
- `src/kiro_crew/mcp_*.py` - MCP server infrastructure

### What to Extend/Customize
- Memory system → Add model-specific context storage
- Skill framework → Add model compression workflows
- Task runner → Add PAIGE Lab task types
- Dashboard → Add PAIGE Lab UI components

### What to Build New
- `paige_lab_backend.py` - Gallery + tools router (✅ Done)
- `PAIGELabFrontend.jsx` - Build interface (✅ Done)
- `paige_lab/tasks/*.md` - Compression task specs
- `paige_lab/skills/*.md` - Model compression workflows
- `paige_lab/model_memory.py` - Model-specific memory

---

## Files to Modify/Create

### Tier 1: MVP
```
src/kiro_crew/skills/
  ├── paige-compress-gguf.md          # NEW
  ├── paige-compress-bitsandbytes.md  # NEW
  ├── paige-compress-pruning.md       # NEW
  ├── paige-compress-distillation.md  # NEW
  └── paige-compress-lora.md          # NEW

src/paige_lab/
  ├── __init__.py                     # NEW
  ├── task_runner.py                  # NEW (extends kiro_crew.taskrunner)
  ├── scheduler.py                    # NEW (wraps kirocrew cron)
  ├── model_memory.py                 # NEW (extends kiro_crew.memory)
  └── api.py                          # NEW (REST API for PAIGE Lab)

tests/paige_lab/
  ├── test_task_runner.py             # NEW
  ├── test_model_memory.py            # NEW
  └── test_scheduler.py               # NEW
```

### Tier 2: Enhancement
```
src/kiro_crew/slack/paige_channels.py  # NEW
src/kiro_crew/discord/paige_events.py  # NEW
src/paige_lab/governance.md            # NEW
src/paige_lab/advanced_skills.md       # NEW
```

---

## Success Criteria

✅ **MVP Complete When:**
- Compression tasks run via task runner
- Task status visible in PAIGE Lab UI
- Model-specific memory working
- Scheduling interface in dashboard
- 73% → 90% production parity

✅ **Full Parity When:**
- Desktop app built and working
- Slack/Discord channels active
- All governance policies enforced
- Advanced skills available
- 90% → 100% production parity

---

## Testing Strategy

### Unit Tests
- Task runner execution
- Model memory operations
- Scheduler validation
- Memory lesson application

### Integration Tests
- End-to-end compression workflow
- Task checkpoint & resume
- Memory persistence across sessions
- HF upload integration

### E2E Tests (Manual)
- Click PAIGE icon → services start
- Gallery loads models
- Compress model → task runs
- View progress → task completes
- Check HF storage → new version available
- Resume session → memory preserved

---

## Conclusion

**PAIGE is at 73% production parity with KiroCrew.**

**Inheritance (automatic):**
- Gateway, sessions, ACP protocol
- Memory system, security, audit
- MCP infrastructure, sandbox

**Built specifically for PAIGE:**
- Model gallery UI (Gradio)
- Model building UI (React)
- HF storage integration

**Still needed:**
- Compression task definitions (2-3 days)
- Task runner UI integration (3-5 days)
- Scheduler exposure (2-3 days)
- Model memory extension (2-3 days)

**Optional (post-MVP):**
- Messaging channels (3-5 days)
- Desktop app (5-10 days)
- Governance framework (3-5 days)
- Advanced skills (5-10 days)

**Recommended: Focus on compression tasks first** - they're the core differentiator and highest value.

EOF

cat KIROCREW-PAIGE-GAP-ANALYSIS.md | head -100
