---
name: "2D Avatar (Local - Morning Project)"
description: "Deploy a local 2D animated avatar in PAIGE bottom-left with settings panel. Uses Qwen (1B-32B) running on your GPU. No network required."
category: "avatar"
difficulty: "intermediate"
estimatedTime: "7 hours"
tags: ["avatar", "local-gpu", "qwen", "2d-animation", "morning-project"]
requirements:
  gpu: "8GB+ VRAM"
  models: ["Qwen-1B", "Qwen-7B", "Qwen-14B", "Qwen-32B"]
  dependencies: ["PAIGE-1.0", "FloatingPaige"]
  network: "none"
inclusion: "manual"
---

# 2D Avatar (Local - Morning Project)

## Overview

Deploy a local 2D animated avatar in PAIGE bottom-left with settings panel. Uses Qwen (1B-32B) running on your GPU. No network required. This is your **morning project** - foundation for the full YC demo version.

## Purpose

- Replace floating orb with 2D avatar video stream
- Real-time animation (lip-sync if available, static portrait fallback)
- Settings panel: model selection (1B/7B/14B/32B), size (small/med/large)
- Local GPU inference only
- Zero external dependencies

## Requirements Met

✅ Qwen 1B-32B already downloaded to GPU  
✅ PAIGE settings panel exists (reuse)  
✅ Bottom-left position available  
✅ No external APIs needed  

## Architecture

```
User Input (Voice) → [PAIGE Chat]
                      ↓
                [Qwen LLM - Local GPU]
                      ↓
                [TTS Audio]
                      ↓
            [Avatar Animation Engine]
                      ↓
            [Bottom-left Canvas Stream]
```

## Implementation Timeline

### Phase 1: Avatar Container Component (1.5 hours)

**File:** `website/src/components/LocalAvatar.tsx`

Create a React component that:
- Positions fixed bottom-left corner (20px, 120px from bottom)
- Displays video stream container
- Adds play/pause and settings buttons
- Implements size management (small: 200px, medium: 320px, large: 480px)

Key features:
- Video element with canvas support
- Control bar with mute/settings icons
- Draggable window (optional enhancement)
- Minimizable state

### Phase 2: Settings Panel (1 hour)

**File:** `website/src/components/AvatarSettings.tsx`

Modal panel that appears on settings click:
- **Model Selector:** Dropdown for Qwen 1B / 7B / 14B / 32B
- **Size Selector:** Three buttons (Small / Medium / Large)
- **Voice Selector:** Integrate existing voice options
- **GPU Memory Display:** Show current VRAM usage

Stores settings in localStorage for persistence.

### Phase 3: Backend Video Streaming (2 hours)

**File:** `src/avatar_streaming.py`

Flask endpoint that streams MJPEG video:

```python
from flask import Flask, Response
import cv2
import numpy as np
from PIL import Image
import base64

app = Flask(__name__)

@app.route('/api/avatar/stream')
def stream_avatar():
    """Stream animated avatar video"""
    portrait_img = Image.open('avatar-portrait.png')
    
    def generate_frames():
        frame_count = 0
        while True:
            img_array = np.array(portrait_img)
            
            # Add subtle animation (blinking, head sway)
            frame_count += 1
            
            # Simple animation overlay
            if (frame_count % 60) < 10:  # Blink every 60 frames
                # Draw closed eyes
                pass
            
            ret, buffer = cv2.imencode('.jpg', img_array, [cv2.IMWRITE_JPEG_QUALITY, 85])
            frame = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/avatar/config', methods=['POST'])
def update_config():
    """Update avatar config (model, size, voice)"""
    data = request.json
    model = data.get('model', '7B')
    
    # Switch Qwen model based on selection
    # Reload GPU model (30 second wait)
    
    return {'status': 'ok', 'model': model}
```

### Phase 4: Frontend Integration (1.5 hours)

**File:** `website/src/App.tsx` (update)

Add LocalAvatar import and render:

```typescript
import LocalAvatar from './components/LocalAvatar'

function App() {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Existing sidebar, chat, project components */}
      
      {/* Add avatar at bottom-left */}
      <LocalAvatar />
    </div>
  )
}
```

### Phase 5: Test & Deploy (1 hour)

Testing checklist:
- ✅ Avatar appears in bottom-left corner
- ✅ Settings panel allows model/size changes
- ✅ Video stream displays smoothly (30fps+)
- ✅ GPU memory stays <10GB
- ✅ Model switching without crash
- ✅ Portrait image displays clearly
- ✅ All 3 sizes work correctly

Deploy to localhost:8002:
```bash
cd /home/hunt/Downloads/PAIGE
npm run build --prefix website
python app.py
```

## Success Criteria

✅ Avatar appears in bottom-left corner  
✅ Settings panel allows model/size changes  
✅ Video stream displays smoothly (30fps+)  
✅ GPU memory stays under 10GB  
✅ Model switching without crash  
✅ Portrait image displays clearly  
✅ Audio playback syncs with avatar  

## Fallback Options

If real-time animation not possible:
- Show static portrait with audio playback
- Implement simple blinking/head sway
- Add TTS-driven mouth movement overlay

## Notes

- Video stream can be simple MJPEG (multipart frames)
- Model switching requires ~30 second reload time
- Store config in localStorage for persistence
- This is foundation for SKILL 2 (full YC demo with bidirectional conversation)
- Use your portrait image in blue blazer/pink top (already provided)

## Next Skill

After completing this: Move to **avatar-full-yc-demo** for live bidirectional conversation with Qwen agent team backend.

## Quick Reference

| Component | File | Duration |
|-----------|------|----------|
| Avatar UI | `website/src/components/LocalAvatar.tsx` | 1.5h |
| Settings | `website/src/components/AvatarSettings.tsx` | 1h |
| Backend Stream | `src/avatar_streaming.py` | 2h |
| Integration | `website/src/App.tsx` | 1.5h |
| Testing | All above | 1h |
| **Total** | | **7h** |
