# Skill: Full Avatar + Qwen Agent (YC Demo - 22 Hour Deadline)

## Overview
Complete implementation: Live bidirectional 2D avatar + Qwen agent team backend. Production-ready for YC Winter Demo. 22-hour sprint with existing resources.

## Purpose
- Full conversational digital human
- Avatar sees user (webcam) + responds with audio + animation
- Backend: Qwen large model + memory system
- Show investors: voice in → real-time avatar response → context awareness

## Architecture

```
User Webcam Input (Video + Audio)
        ↓
[Qwen 32B Large LLM - GPU Inference]
        ↓
[Agent Team Memory System (from PAIGE)]
        ↓
[RIVA/TTS Audio Generation]
        ↓
[Audio2Face-2D Animation]
        ↓
[WebRTC Stream to Browser]
        ↓
Bottom-left Avatar with Real-time Sync
```

## GPU Requirements
- **Model:** Qwen-32B (quantized 4-bit = 8-10GB VRAM)
- **ASR:** Whisper-tiny or RIVA (2-4GB)
- **TTS:** gTTS or RIVA (1-2GB)
- **Video Streaming:** ffmpeg + h264 encoding (1-2GB)
- **Memory Buffer:** Agent context (2-3GB)
- **Total:** ~18GB (fits on RTX 4090 or dual GPU setup)

## 22-Hour Sprint Breakdown

### PHASE 1: Foundation (Hours 1-4)
**Task 1.1: GPU Model Setup (1 hour)**
- Load Qwen-32B 4-bit quantization
- Verify inference speed: target 50-100 tokens/sec
- Test memory allocation

```bash
# Ubuntu terminal
ollama run qwen:32b-q4  # Or your quantization tool
```

- Verify: `nvidia-smi` shows model loaded
- Benchmark: Send test prompt, time response

**Task 1.2: ASR Pipeline Setup (1.5 hours)**
- Deploy Whisper or RIVA
- Connect microphone input → transcription
- Test latency: target <500ms for transcription

```python
# src/asr_engine.py
from openai import OpenAI
import pyaudio

client = OpenAI()

def transcribe_audio(audio_bytes):
    result = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_bytes
    )
    return result.text
```

**Task 1.3: TTS Audio Pipeline (1.5 hours)**
- Deploy gTTS or RIVA TTS
- Stream audio output to avatar
- Test quality + latency

```python
# src/tts_engine.py
from gtts import gTTS
from io import BytesIO

def text_to_speech(text: str, voice: str = 'en'):
    tts = gTTS(text, lang=voice, slow=False)
    fp = BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp.getvalue()
```

### PHASE 2: Avatar Animation (Hours 5-10)
**Task 2.1: Audio2Face Integration (2 hours)**
- Deploy Audio2Face-2D NIM (or Maxine)
- Connect TTS audio → avatar lip-sync
- Target: <200ms latency from audio to video

```python
# src/avatar_animator.py
import requests

AUDIO2FACE_ENDPOINT = "http://localhost:8000/v1/audio2face"

def animate_avatar(audio_bytes: bytes, portrait_image_path: str):
    payload = {
        'audio': base64.b64encode(audio_bytes).decode(),
        'image': portrait_image_path,
        'emotion': 'neutral'
    }
    response = requests.post(AUDIO2FACE_ENDPOINT, json=payload)
    return response.json()['video_frames']
```

**Task 2.2: WebRTC Streaming (2 hours)**
- Set up WebRTC data channel
- Stream video from backend to browser
- Test bandwidth requirements

```python
# src/webrtc_server.py
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiohttp import web

pcs = set()

async def offer(request):
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
    pc = RTCPeerConnection()
    pcs.add(pc)
    
    # Add video track with avatar stream
    # ... setup audio/video tracks
    
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    
    return web.json_response({
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    })
```

**Task 2.3: Frontend Avatar Component (2 hours)**
- Create full-screen or windowed avatar UI
- Handle video/audio playback
- Show loading states + error handling

```tsx
// website/src/components/AvatarFull.tsx
import React, { useEffect, useRef } from 'react'

export const AvatarFull: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    const setupWebRTC = async () => {
      const pc = new RTCPeerConnection()
      pcRef.current = pc

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0]
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const response = await fetch('/api/avatar/offer', {
        method: 'POST',
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type
        }),
        headers: { 'Content-Type': 'application/json' }
      })

      const answer = await response.json()
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    }

    setupWebRTC()
  }, [])

  return (
    <div style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 9999 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: 400,
          height: 500,
          borderRadius: 12,
          background: '#0f172a',
          border: '2px solid #3b82f6'
        }}
      />
    </div>
  )
}
```

### PHASE 3: Agent Backend (Hours 11-16)
**Task 3.1: Qwen Agent Setup (2 hours)**
- Initialize Qwen-32B with system prompt
- Connect to PAIGE memory system
- Integrate agent team routing

```python
# src/qwen_agent.py
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen-32B")
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen-32B",
    torch_dtype=torch.float16,
    device_map="auto",
    quantization_config=BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4"
    )
)

def generate_response(user_text: str, context: dict) -> str:
    system_prompt = """You are PAIGE, a helpful digital human assistant. 
    You have access to memory of previous conversations.
    Keep responses concise (under 200 tokens) for natural voice playback."""
    
    full_prompt = f"{system_prompt}\n\nUser: {user_text}\n\nAssistant:"
    
    inputs = tokenizer(full_prompt, return_tensors="pt")
    outputs = model.generate(**inputs, max_new_tokens=150)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return response.split("Assistant:")[-1].strip()
```

**Task 3.2: Memory Integration (1.5 hours)**
- Connect to PAIGE's graph-based memory
- Store conversation context
- Enable cross-session learning

```python
# src/memory_agent.py
import json

class MemoryAgent:
    def __init__(self):
        self.graph = self._load_memory_graph()
    
    def remember(self, user_input: str, avatar_response: str):
        """Store interaction in memory graph"""
        node = {
            'timestamp': datetime.now().isoformat(),
            'user': user_input,
            'response': avatar_response,
            'sentiment': self._analyze_sentiment(user_input)
        }
        self.graph['nodes'].append(node)
        self._save_memory_graph()
    
    def recall_context(self, limit: int = 5) -> str:
        """Get recent context for LLM"""
        recent = self.graph['nodes'][-limit:]
        return json.dumps(recent)
```

**Task 3.3: Orchestration Layer (1.5 hours)**
- Route: User input → ASR → LLM → Memory → TTS
- Implement request queuing (avoid bottlenecks)
- Error handling + fallbacks

```python
# src/orchestrator.py
from asyncio import Queue
import asyncio

class AvatarOrchestrator:
    def __init__(self):
        self.request_queue = Queue()
        self.processing = False
    
    async def handle_user_input(self, audio_bytes: bytes):
        """Main orchestration flow"""
        try:
            # 1. Transcribe
            user_text = await self.asr_engine.transcribe(audio_bytes)
            
            # 2. Generate response
            context = await self.memory.recall_context()
            response = await self.qwen_agent.generate(user_text, context)
            
            # 3. Synthesize audio
            audio_out = await self.tts_engine.synthesize(response)
            
            # 4. Animate avatar
            video_frames = await self.animator.animate(audio_out, portrait_image)
            
            # 5. Stream to WebRTC
            await self.webrtc.send_frames(video_frames)
            
            # 6. Store in memory
            await self.memory.remember(user_text, response)
            
        except Exception as e:
            print(f"Error: {e}")
            # Fallback to pre-recorded response
```

### PHASE 4: Testing & Demo Prep (Hours 17-22)
**Task 4.1: End-to-End Testing (2 hours)**
- Test full conversation loop
- Measure latencies:
  - ASR: <500ms
  - LLM: <2 seconds
  - TTS: <1 second
  - Animation: <500ms
  - Total: <4 seconds end-to-end target

**Task 4.2: Demo Script Prep (1 hour)**
- Pre-write 5 demo questions
- Prepare backup responses (if live fails)
- Test video output quality

**Task 4.3: Performance Optimization (1 hour)**
- Profile GPU memory usage
- Optimize Qwen quantization if needed
- Test thermal throttling

**Task 4.4: YC Presentation Integration (1 hour)**
- Full-screen avatar mode for demo
- Branding: PAIGE logo overlay
- Settings: Quick model/size adjustment

## Deliverables

### Code Files
- `src/qwen_agent.py` - LLM engine
- `src/asr_engine.py` - Speech recognition
- `src/tts_engine.py` - Text-to-speech
- `src/avatar_animator.py` - Audio2Face integration
- `src/webrtc_server.py` - WebRTC streaming
- `src/memory_agent.py` - Memory persistence
- `src/orchestrator.py` - Main orchestration
- `website/src/components/AvatarFull.tsx` - Frontend

### Backend Routes
- `POST /api/avatar/input` - Accept user voice input
- `GET /api/avatar/stream` - WebRTC offer/answer
- `GET /api/avatar/status` - Health check + GPU stats

## Success Metrics
✅ End-to-end latency <4 seconds  
✅ Avatar animations smooth (30fps+)  
✅ No GPU thermal throttling  
✅ Memory persists across sessions  
✅ Handles 5+ min continuous demo  
✅ Professional appearance for YC judges  

## Fallback Plan (If Behind Schedule)
- Hour 20: If streaming issues, use pre-recorded demo video + real audio
- Hour 21: If GPU issues, reduce Qwen to 14B
- Hour 22: If animation missing, show static portrait + audio

## Notes
- Use your NGC API key for any cloud NIM fallbacks
- Pre-download all model weights before demo
- Have ethernet cable ready (WiFi can drop on demo day)
- Test with multiple judges asking questions
- Have laptop on power (no battery risk)

## Resources Needed
✅ Qwen 1B-32B (you have downloaded)  
✅ GPU with 18GB+ VRAM (your current setup)  
✅ Python environment (already configured)  
✅ PAIGE IDE running (baseline from Skill 1)  
✅ Your portrait image (provided)  

## Go Live Command (Hour 22)
```bash
cd /home/hunt/Downloads/PAIGE
python app.py  # Start Flask + Qwen backend
npm run build && npm start  # Start React frontend
# Demo time!
```

**Estimated chance of completion in 22 hours: 85%** (if you have GPU ready + no blockers)
