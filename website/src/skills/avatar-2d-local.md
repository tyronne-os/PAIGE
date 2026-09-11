# Skill: 2D Avatar (Local - Morning Project)

## Overview
Deploy a local 2D animated avatar in PAIGE bottom-left with settings panel. Uses Qwen (1B-32B) running on your GPU. No network required. Morning project scope.

## Purpose
- Replace floating orb with 2D avatar video stream
- Real-time animation (lip-sync if available, static portrait fallback)
- Settings panel: model selection (1B/7B/14B/32B), size (small/med/large)
- Local GPU inference only

## Requirements Met
✅ Qwen 1B-32B already downloaded to GPU  
✅ PAIGE settings panel exists (reuse)  
✅ Bottom-left position available  
✅ No external APIs needed  

## Architecture

```
User Input (Voice)
        ↓
[PAIGE Chat]
        ↓
[Qwen LLM - Local GPU]
        ↓
[TTS Audio]
        ↓
[Avatar Animation Engine]
        ↓
[Bottom-left Canvas Stream]
```

## Implementation Steps

### Step 1: Create Avatar Container Component (1.5 hours)
File: `website/src/components/LocalAvatar.tsx`

```typescript
import React, { useState, useRef } from 'react'
import { Volume2, Settings, Download } from 'lucide-react'

interface AvatarConfig {
  model: '1B' | '7B' | '14B' | '32B'
  size: 'small' | 'medium' | 'large'
  voiceId: string
  portraitImage: string
}

export const LocalAvatar: React.FC = () => {
  const [config, setConfig] = useState<AvatarConfig>({
    model: '7B',
    size: 'medium',
    voiceId: 'en-US-Neural-C',
    portraitImage: '/avatar-portrait.png'
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const getSizePixels = (size: 'small' | 'medium' | 'large') => {
    return size === 'small' ? 200 : size === 'medium' ? 320 : 480
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      width: getSizePixels(config.size),
      height: getSizePixels(config.size),
      borderRadius: 12,
      background: '#1e293b',
      border: '2px solid #475569',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999
    }}>
      {/* Video Stream */}
      <video
        ref={videoRef}
        style={{
          flex: 1,
          borderRadius: '10px 10px 0 0',
          background: '#0f172a',
          objectFit: 'cover'
        }}
      />

      {/* Controls */}
      <div style={{
        padding: '8px 12px',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '0 0 10px 10px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        borderTop: '1px solid #475569'
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            background: isPlaying ? '#ef4444' : '#3b82f6',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12
          }}
        >
          <Volume2 size={14} />
        </button>
        <button
          onClick={() => console.log('Settings')}
          style={{
            background: '#475569',
            border: 'none',
            color: '#e2e8f0',
            padding: '4px 8px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  )
}
```

### Step 2: Avatar Settings Panel (1 hour)
File: `website/src/components/AvatarSettings.tsx`

Show in settings panel:
- Model selector: 1B / 7B / 14B / 32B
- Size selector: Small (200px) / Medium (320px) / Large (480px)
- Voice selector: (current options)
- GPU memory display: Show VRAM usage

### Step 3: Backend Video Streaming (2 hours)
File: `src/avatar_streaming.py`

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
            # Simulate animation (replace with Audio2Face later)
            img_array = np.array(portrait_img)
            
            # Add subtle animation
            frame_count += 1
            # Pseudo-lip-sync on frame count
            
            ret, buffer = cv2.imencode('.jpg', img_array)
            frame = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/avatar/config', methods=['POST'])
def update_config():
    """Update avatar config (model, size, voice)"""
    data = request.json
    # Switch Qwen model based on data['model']
    # Reload GPU model
    return {'status': 'ok'}
```

### Step 4: Frontend Integration (1.5 hours)
File: `website/src/App.tsx` (update)

```typescript
import LocalAvatar from './components/LocalAvatar'

function App() {
  return (
    <div>
      {/* Existing chat/project UI */}
      <LocalAvatar />
    </div>
  )
}
```

### Step 5: Test & Deploy (1 hour)
- Verify video stream in bottom-left
- Test model switching (1B → 7B → 32B)
- Monitor GPU memory
- Test all 3 sizes

## Total Time: ~7 hours
**Perfect for morning project**

## Success Criteria
✅ Avatar appears in bottom-left corner  
✅ Settings panel allows model/size changes  
✅ Video stream displays smoothly  
✅ GPU memory stays <10GB  
✅ Handles model switching without crash  

## Notes
- If no animation available, show static portrait with audio playback
- Video stream can be simple MJPEG (multipart frames)
- Model switching requires ~30 second reload time
- Store config in localStorage for persistence

## Next Phase (Tomorrow)
After this skill: Add Audio2Face animation + bidirectional conversation (SKILL 2)
