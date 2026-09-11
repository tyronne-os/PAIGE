---
name: "PAIGE Avatar 2D (Local)"
description: "Deploy interactive 2D avatar in PAIGE bottom-left with real-time model/size switching. Uses local Qwen GPU inference (1B-32B). No network required."
category: "avatar"
difficulty: "intermediate"
estimatedTime: "7 hours"
tags: ["avatar", "local-gpu", "qwen", "2d-animation", "paige-core"]
inclusion: "manual"
---

# PAIGE Avatar 2D (Local)

## Skill Summary

Deploy an interactive 2D animated avatar positioned in PAIGE's bottom-left corner with:
- Real-time model switching (Qwen 1B/7B/14B/32B)
- Three size modes (Small: 200px, Medium: 320px, Large: 480px)
- Integrated settings panel
- Local GPU inference only
- Foundation for full bidirectional avatar (Skill 2)

## Context & Goals

Replace the static PAIGE floating orb with an animated 2D avatar that:
- Shows video stream of animated portrait
- Responds to chat messages
- Allows users to switch LLM models on-the-fly
- Runs entirely on local GPU (no external APIs)

## Your Current Status

✅ **Available Resources:**
- Qwen 1B to 32B (all downloaded to GPU)
- PAIGE settings panel (existing)
- Bottom-left coordinate space (reserved)
- GPU with 8GB+ VRAM
- Your avatar portrait image (blue blazer/pink top)

## Implementation Overview

### Architecture

```
User Voice Input
        ↓
[Composer Chat] → [Model Selection] → [Local Qwen 1B-32B]
        ↓
[TTS Engine]
        ↓
[Avatar Animation] → [Portrait + Audio Sync]
        ↓
[Bottom-Left Video Stream] → [User Sees Animated Avatar]
```

### Phase Breakdown (7 hours total)

#### Phase 1: Avatar Container Component (1.5 hours)

**Create:** `website/src/components/LocalAvatar.tsx`

Build React component with:
- Fixed positioning: bottom 20px, left 20px
- Video container (canvas or video element)
- Dynamic sizing (200px / 320px / 480px)
- Control bar: play/pause, settings toggle, minimize
- Draggable window support (optional)

**Key Code Structure:**
```typescript
interface LocalAvatarProps {
  model: '1B' | '7B' | '14B' | '32B'
  size: 'small' | 'medium' | 'large'
  voiceId: string
  isPlaying: boolean
}

export const LocalAvatar: React.FC<LocalAvatarProps> = ({
  model,
  size,
  voiceId,
  isPlaying
}) => {
  // Video stream from /api/avatar/stream
  // Settings trigger modal
  // Size affects CSS width/height
}
```

#### Phase 2: Settings Panel Integration (1 hour)

**Create:** `website/src/components/AvatarSettings.tsx`

Modal panel with four sections:
1. **Model Selector** - Dropdown: 1B / 7B / 14B / 32B
2. **Size Selector** - Buttons: Small / Medium / Large
3. **Voice Options** - Integrate existing PAIGE voice list
4. **GPU Stats** - Display current VRAM usage

**Storage:** localStorage key `paige-avatar-config`

#### Phase 3: Backend Streaming (2 hours)

**Create:** `src/avatar_streaming.py`

Flask endpoints:

```python
@app.route('/api/avatar/stream')
def stream_avatar():
    """MJPEG stream of animated avatar"""
    # Load portrait image
    # Generate frames with animation
    # Stream as multipart/jpeg
    # Support model switching mid-stream

@app.route('/api/avatar/config', methods=['POST'])
def update_avatar_config():
    """Switch model, size, voice"""
    # Unload current Qwen model
    # Load new model (30s wait)
    # Return confirmation

@app.route('/api/avatar/status')
def avatar_status():
    """Get GPU memory, active model, stream health"""
    # Return JSON with metrics
```

#### Phase 4: Frontend Integration (1.5 hours)

**Update:** `website/src/App.tsx`

```typescript
import LocalAvatar from './components/LocalAvatar'

export default function App() {
  const [avatarConfig, setAvatarConfig] = useState({
    model: '7B',
    size: 'medium',
    voiceId: 'en-US-Neural-C'
  })

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Existing PAIGE UI */}
      
      {/* Add avatar */}
      <LocalAvatar {...avatarConfig} />
    </div>
  )
}
```

#### Phase 5: Testing & Optimization (1 hour)

**Verification Checklist:**
- ✅ Avatar renders at bottom-left
- ✅ Video stream smooth (30fps+)
- ✅ Model switching works (1B → 7B → 32B)
- ✅ All 3 sizes display correctly
- ✅ Settings panel accessible
- ✅ GPU memory <10GB sustained
- ✅ No thermal throttling

**Deploy:**
```bash
cd /home/hunt/Downloads/PAIGE/website && npm run build
cd /home/hunt/Downloads/PAIGE && python app.py
# Open http://localhost:8002
```

## Success Criteria

All of these must pass:

✅ Avatar visible in bottom-left corner at startup  
✅ Video stream displays portrait smoothly (30fps+)  
✅ Settings panel opens/closes cleanly  
✅ Model dropdown changes Qwen model on-the-fly  
✅ Size buttons resize avatar window correctly  
✅ GPU memory never exceeds 10GB  
✅ No crashes when switching models  
✅ Avatar responds to chat messages with audio + animation sync  
✅ Portrait image displays with no distortion  
✅ localStorage persists settings across browser refresh  

## File Manifest

| File | Type | Purpose |
|------|------|---------|
| `website/src/components/LocalAvatar.tsx` | React Component | Avatar UI container |
| `website/src/components/AvatarSettings.tsx` | React Component | Settings modal |
| `src/avatar_streaming.py` | Python Backend | MJPEG stream + config API |
| `website/src/App.tsx` | (Update) | Import & render LocalAvatar |

## Troubleshooting Guide

| Issue | Solution |
|-------|----------|
| Avatar not appearing | Check CSS positioning, verify zIndex 9999 |
| Video stream blank | Verify `/api/avatar/stream` returns MJPEG frames |
| Model switch fails | Check Qwen model path, verify GPU memory freed |
| GPU memory leak | Monitor in Phase 5, implement model unload |
| Audio out of sync | Verify TTS audio duration matches animation length |

## Notes

- MJPEG (multipart JPEG) is simplest for initial version
- Model switching causes ~30 second pause (GPU reload)
- Portrait should be 1024x1024px minimum for quality
- Store all settings in localStorage for persistence
- This skill is **foundation** for full YC demo (Skill 2)

## What's Next

After mastering this skill:
- **SKILL 2:** Full Avatar + Qwen Agent (22-hour YC demo sprint)
- Adds: bidirectional voice conversation, memory integration, Agent team orchestration
- Same bottom-left avatar, but fully interactive

## Quick Start Command

```bash
# Assuming PAIGE already running on localhost:8002
# 1. Create the files above
# 2. Run build
npm run build --prefix /home/hunt/Downloads/PAIGE/website

# 3. Check avatar at http://localhost:8002
# 4. Click settings to switch model/size
```

---

**Estimated Total Time:** 7 hours  
**GPU Requirement:** 8GB+ VRAM  
**Difficulty:** Intermediate  
**Status:** Ready to implement
