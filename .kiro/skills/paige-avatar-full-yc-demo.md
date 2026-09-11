---
name: "PAIGE Avatar Full + Qwen Agent (YC Demo)"
description: "Complete bidirectional digital human avatar with Qwen-32B agent backend. Live conversation, real-time animation, agent memory integration. Production-ready for YC Winter Demo. 22-hour sprint."
category: "avatar"
difficulty: "advanced"
estimatedTime: "22 hours"
tags: ["avatar", "yc-demo", "qwen-32b", "bidirectional", "agent-team", "production", "paige-core"]
inclusion: "manual"
---

# PAIGE Avatar Full + Qwen Agent (YC Demo)

## Skill Summary

Complete production-ready implementation for YC Winter Demo:
- **Live bidirectional conversation** with 2D animated avatar
- **Qwen-32B Large Language Model** for intelligent responses
- **Real-time avatar animation** (lip-sync + expressions)
- **Memory integration** with PAIGE agent team
- **WebRTC streaming** for low-latency video
- **22-hour sprint deadline** with realistic pacing

## Context & Goals

Build a **digital human assistant** that:
1. Listens to investor questions (speech recognition)
2. Understands context using Qwen-32B reasoning
3. Accesses agent memory from previous conversations
4. Responds intelligently with synchronized avatar animation
5. Handles interruptions gracefully
6. Demonstrates YC-worthy product maturity

## Your Current Status

✅ **Available Resources:**
- Qwen 1B-32B (all downloaded)
- PAIGE Memory System (graph-based, cross-project)
- Avatar 2D Foundation (from Skill 1)
- Your portrait image
- NGC API credentials
- Lemovox/Whisper API access

✅ **Prerequisites:**
- Complete Skill 1 (PAIGE Avatar 2D Local) first
- GPU with 18GB+ VRAM (RTX 4090 recommended)
- Python 3.10+
- Node.js 18+

## Full Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ YC DEMO: Bidirectional Digital Human Avatar                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Investor Input (Voice + Webcam)                               │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Speech Recognition (Whisper / RIVA ASR)            │       │
│  │ • Real-time transcription                          │       │
│  │ • Target latency: <500ms                           │       │
│  └─────────────────────────────────────────────────────┘       │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Agent Orchestrator                                 │       │
│  │ • Route to Qwen vs Specialist Agents               │       │
│  │ • Query memory graph for context                   │       │
│  │ • Maintain conversation state                      │       │
│  └─────────────────────────────────────────────────────┘       │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Qwen-32B Large Language Model                      │       │
│  │ • 4-bit quantization (8-10GB VRAM)                 │       │
│  │ • System prompt: YC demo context                   │       │
│  │ • Target speed: 50-100 tokens/sec                  │       │
│  └─────────────────────────────────────────────────────┘       │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Memory System Integration                          │       │
│  │ • Store Q&A in PAIGE graph                         │       │
│  │ • Enable learning across conversations             │       │
│  │ • Track investor interests / objections            │       │
│  └─────────────────────────────────────────────────────┘       │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Text-to-Speech (RIVA TTS / gTTS)                   │       │
│  │ • Convert response to audio                        │       │
│  │ • Target latency: <1 second                        │       │
│  │ • Stream audio to avatar                           │       │
│  └─────────────────────────────────────────────────────┘       │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Avatar Animation (Audio2Face-2D / Maxine)          │       │
│  │ • Animate portrait to audio                        │       │
│  │ • Lip-sync + micro-expressions                     │       │
│  │ • Target latency: <200ms                           │       │
│  └─────────────────────────────────────────────────────┘       │
│         ↓                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ WebRTC Video Streaming                             │       │
│  │ • H.264 encoding                                   │       │
│  │ • Low-latency datagram protocol                    │       │
│  │ • Browser rendering                                │       │
│  └─────────────────────────────────────────────────────┘       │
│         ↓                                                       │
│  Bottom-Left Avatar: Responds in Real-Time with Animation     │
│  • Judges see: Voice in → Avatar responds with lip-sync       │
│  • Feels like: Real person, not chatbot               │       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 22-Hour Sprint Timeline

### PHASE 1: Foundation Setup (4 hours)

**Objective:** Get GPU inference + speech pipeline ready

#### Task 1.1: GPU Model Preparation (1 hour)

**File:** None (verification step)

```bash
# Verify Qwen-32B 4-bit quantization loaded
nvidia-smi  # Confirm GPU visible
ollama run qwen:32b-q4  # Or your quantization method

# Benchmark: Send test prompt
# Target: 50-100 tokens/sec
# Expected response time: 1-2 seconds for short response
```

**Checkpoint:** Model loads, inference works, GPU memory <12GB

#### Task 1.2: ASR Pipeline (1.5 hours)

**File:** `src/asr_engine.py`

```python
import whisper
from openai import OpenAI

class ASREngine:
    def __init__(self):
        # Use Whisper (free) or RIVA (enterprise)
        self.model = whisper.load_model("tiny")  # Fast, 39MB
    
    def transcribe(self, audio_bytes: bytes) -> str:
        """Convert speech to text"""
        # Write temp audio file
        # Run Whisper transcription
        # Return text
        # Target latency: <500ms
        result = self.model.transcribe(audio_bytes)
        return result["text"]
```

**Checkpoint:** Microphone input → text transcription in <500ms

#### Task 1.3: TTS Pipeline (1.5 hours)

**File:** `src/tts_engine.py`

```python
from gtts import gTTS
from google.cloud import texttospeech

class TTSEngine:
    def __init__(self):
        # gTTS (free) or Google Cloud TTS (enterprise)
        self.client = texttospeech.TextToSpeechClient()
    
    def synthesize(self, text: str, voice_id: str = "en-US-Neural-C") -> bytes:
        """Convert text to speech audio"""
        # Generate audio bytes
        # Return audio stream
        # Target latency: <1 second
        pass
```

**Checkpoint:** Text → audio in <1 second, sound quality acceptable

---

### PHASE 2: Avatar Animation (6 hours)

**Objective:** Real-time lip-sync + WebRTC video streaming

#### Task 2.1: Audio2Face Integration (2 hours)

**File:** `src/avatar_animator.py`

```python
import requests
import base64
from PIL import Image

class AvatarAnimator:
    def __init__(self, portrait_path: str):
        self.portrait = Image.open(portrait_path)
        self.audio2face_endpoint = "http://localhost:8000/v1/audio2face"
    
    def animate(self, audio_bytes: bytes) -> list:
        """Generate video frames from audio + portrait"""
        payload = {
            "audio": base64.b64encode(audio_bytes).decode(),
            "image": base64.b64encode(self.portrait).decode(),
            "emotion": "neutral",
            "intensity": 0.8
        }
        
        response = requests.post(self.audio2face_endpoint, json=payload)
        frames = response.json()["video_frames"]
        return frames  # List of base64 encoded frames
```

**Checkpoint:** Audio → animated video frames in <200ms per frame

#### Task 2.2: WebRTC Streaming Server (2 hours)

**File:** `src/webrtc_server.py`

```python
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiohttp import web
import asyncio

class AvatarVideoTrack(VideoStreamTrack):
    def __init__(self, frames_queue):
        super().__init__()
        self.frames_queue = frames_queue
    
    async def recv(self):
        """Stream video frames to browser"""
        frame = await self.frames_queue.get()
        return frame

async def offer(request):
    """WebRTC offer handler"""
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
    
    pc = RTCPeerConnection()
    
    # Add video track with avatar stream
    video_track = AvatarVideoTrack(frames_queue)
    pc.addTrack(video_track)
    
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    
    return web.json_response({
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    })

app = web.Application()
app.router.post('/api/avatar/offer', offer)
```

**Checkpoint:** WebRTC connection works, video streams to browser

#### Task 2.3: Frontend Avatar Full Component (2 hours)

**File:** `website/src/components/AvatarFull.tsx`

```typescript
import React, { useEffect, useRef } from 'react'

export const AvatarFull: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  useEffect(() => {
    const setupWebRTC = async () => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }]
      })
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
        })
      })

      const answer = await response.json()
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    }

    setupWebRTC()
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      width: 400,
      height: 500,
      background: '#0f172a',
      border: '2px solid #3b82f6',
      borderRadius: 12,
      zIndex: 9999
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 10,
          objectFit: 'cover'
        }}
      />
    </div>
  )
}
```

**Checkpoint:** Video stream displays smoothly in browser at 30fps+

---

### PHASE 3: Agent Backend (6 hours)

**Objective:** Qwen reasoning + memory integration + orchestration

#### Task 3.1: Qwen-32B Agent (2 hours)

**File:** `src/qwen_agent.py`

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from peft import AutoPeftModelForCausalLM

class QwenAgent:
    def __init__(self):
        self.model_name = "Qwen/Qwen-32B"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        
        self.model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            quantization_config={
                "load_in_4bit": True,
                "bnb_4bit_quant_type": "nf4"
            }
        )
    
    def generate_response(self, user_text: str, context: dict) -> str:
        """Generate YC-appropriate response"""
        system_prompt = """You are PAIGE, a digital human assistant created by PAIGE Technologies.
You are demonstrating at Y Combinator Winter 2024.
Be concise (under 150 tokens), intelligent, and memorable.
You have access to context from previous conversations.
Always emphasize impact and innovation."""
        
        memory_context = context.get("recent_q_and_a", "")
        
        full_prompt = f"""{system_prompt}

Previous Context:
{memory_context}

Investor: {user_text}

PAIGE: """
        
        inputs = self.tokenizer(full_prompt, return_tensors="pt")
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=120,
            temperature=0.7,
            top_p=0.9,
            do_sample=True
        )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return response.split("PAIGE:")[-1].strip()
```

**Checkpoint:** Qwen generates coherent 50-100 token responses in <2 seconds

#### Task 3.2: Memory Integration (1.5 hours)

**File:** `src/memory_agent.py`

```python
import json
from datetime import datetime

class MemoryAgent:
    def __init__(self):
        self.graph = self._load_memory_graph()
    
    def remember(self, investor_question: str, avatar_response: str, context: dict = {}):
        """Store Q&A in memory graph for future reference"""
        node = {
            "id": f"qa-{datetime.now().timestamp()}",
            "timestamp": datetime.now().isoformat(),
            "investor_question": investor_question,
            "avatar_response": avatar_response,
            "context": context,
            "sentiment": self._analyze_sentiment(investor_question),
            "session": self._get_current_session()
        }
        
        self.graph["nodes"].append(node)
        self._save_memory_graph()
        
        return node["id"]
    
    def recall_context(self, limit: int = 5) -> str:
        """Get recent Q&A for context injection into Qwen"""
        recent = self.graph["nodes"][-limit:]
        formatted = "\n".join([
            f"Q: {n['investor_question']}\nA: {n['avatar_response']}"
            for n in recent
        ])
        return formatted
    
    def _analyze_sentiment(self, text: str) -> str:
        # Simple sentiment: positive/neutral/negative
        return "neutral"  # TODO: implement with VADER or transformers
    
    def _get_current_session(self) -> str:
        # YC demo session identifier
        return "yc-winter-2024"
```

**Checkpoint:** Memory stores/retrieves Q&A, provides context to Qwen

#### Task 3.3: Orchestration Layer (2 hours)

**File:** `src/orchestrator.py`

```python
import asyncio
from queue import Queue

class AvatarOrchestrator:
    def __init__(self):
        self.asr_engine = ASREngine()
        self.qwen_agent = QwenAgent()
        self.tts_engine = TTSEngine()
        self.animator = AvatarAnimator("avatar-portrait.png")
        self.memory = MemoryAgent()
        self.request_queue = asyncio.Queue()
    
    async def handle_user_input(self, audio_bytes: bytes) -> dict:
        """Main orchestration: voice in → avatar response"""
        try:
            # 1. Transcribe speech
            print("[PAIGE] Listening...")
            user_text = await asyncio.to_thread(
                self.asr_engine.transcribe, audio_bytes
            )
            print(f"[PAIGE] Heard: {user_text}")
            
            # 2. Get context from memory
            context = {
                "recent_q_and_a": self.memory.recall_context(limit=3)
            }
            
            # 3. Generate response using Qwen
            print("[PAIGE] Thinking...")
            response = await asyncio.to_thread(
                self.qwen_agent.generate_response, user_text, context
            )
            print(f"[PAIGE] Generated: {response}")
            
            # 4. Synthesize audio
            print("[PAIGE] Speaking...")
            audio_output = await asyncio.to_thread(
                self.tts_engine.synthesize, response
            )
            
            # 5. Animate avatar
            print("[PAIGE] Animating...")
            video_frames = await asyncio.to_thread(
                self.animator.animate, audio_output
            )
            
            # 6. Stream to WebRTC
            await self.webrtc.send_frames(video_frames)
            
            # 7. Store in memory
            self.memory.remember(user_text, response, context)
            
            print("[PAIGE] Response complete")
            
            return {
                "status": "success",
                "user_question": user_text,
                "avatar_response": response,
                "duration_ms": 0  # TODO: calculate
            }
        
        except Exception as e:
            print(f"[PAIGE] Error: {e}")
            return {"status": "error", "message": str(e)}
```

**Checkpoint:** Full pipeline works: voice in → Qwen → TTS → animation → avatar responds

---

### PHASE 4: Testing & YC Prep (5 hours)

**Objective:** Production-grade demo, stress test, optimization

#### Task 4.1: End-to-End Testing (2 hours)

**Latency Targets:**
- ASR: <500ms ✓
- LLM: <2 seconds ✓
- TTS: <1 second ✓
- Animation: <500ms ✓
- **Total: <4 seconds** ✓

**Test Script:**

```bash
# 1. Start backend
python /home/hunt/Downloads/PAIGE/app.py

# 2. In another terminal, test each component
curl http://localhost:8002/api/avatar/status  # Health check

# 3. Send test voice input (pre-recorded question)
# Measure: time from input sent to avatar animation complete

# 4. Test 5 different questions
# - "What is PAIGE?"
# - "How does PAIGE work?"
# - "What's your business model?"
# - "Who is your competition?"
# - "What's next for PAIGE?"
```

**Metrics to Track:**
- ✅ Latency per component (should be <4s total)
- ✅ GPU memory (should stay <15GB)
- ✅ Thermal: GPU temp <80°C
- ✅ Animation quality: 30fps+ sustained
- ✅ Audio sync: lip-movements match words

#### Task 4.2: Demo Script Preparation (1 hour)

**Pre-written Responses (Backup):**

Prepare 5 demo questions with pre-recorded avatar responses in case live fails:

1. **"What is PAIGE?"**
   - Pre-response ready
   - Video recorded + saved
   - Fallback: Play if inference too slow

2. **"How does PAIGE work?"**
3. **"What makes you different?"**
4. **"How will you make money?"**
5. **"What's the roadmap?"**

**File:** `demo/backup_responses.json`

```json
{
  "what_is_paige": {
    "text": "PAIGE is a digital human AI assistant...",
    "audio": "demo/paige-intro.wav",
    "video": "demo/paige-intro.mp4"
  }
}
```

#### Task 4.3: Performance Optimization (1 hour)

**GPU Profiling:**

```python
import GPUtil
import psutil

def monitor_resources():
    gpus = GPUtil.getGPUs()
    for gpu in gpus:
        print(f"GPU Memory: {gpu.memoryUsed} / {gpu.memoryTotal} MB")
        print(f"GPU Temp: {gpu.temperature}°C")
    
    print(f"CPU: {psutil.cpu_percent()}%")
    print(f"RAM: {psutil.virtual_memory().percent}%")
```

**Optimizations if needed:**
- Reduce Qwen to 14B if memory issues
- Use faster quantization (INT8 instead of 4-bit)
- Batch requests to reduce latency variance
- Cache common responses

#### Task 4.4: YC Demo UI & Branding (1 hour)

**Update:** `website/src/components/AvatarFull.tsx`

Add:
- PAIGE logo overlay (top-left)
- "Live Demo" indicator
- Settings quick-access (model/size in demo mode)
- Error fallback message ("Using pre-recorded response")

---

## Success Criteria (All Must Pass)

✅ End-to-end latency < 4 seconds  
✅ Avatar animations smooth (30fps+)  
✅ No GPU thermal throttling (<80°C)  
✅ Memory persists correctly (judges see context learning)  
✅ Handles 5+ minute continuous demo without restart  
✅ Professional appearance (no visible artifacts)  
✅ Audio/video perfectly synced  
✅ Can switch between live and recorded demo seamlessly  
✅ Judges can ask follow-up questions  
✅ All 5 pre-written questions answered smoothly  

## Fallback Plan (If Behind)

| Hour | Issue | Solution |
|------|-------|----------|
| 20 | Streaming laggy | Use pre-recorded demo video + real audio |
| 21 | GPU out of memory | Reduce Qwen to 14B (8-bit quantization) |
| 22 | Animation missing | Show static portrait, keep audio/LLM |

## Quick Reference: File Manifest

| File | Lines | Purpose |
|------|-------|---------|
| `src/qwen_agent.py` | ~80 | Qwen inference + system prompt |
| `src/asr_engine.py` | ~40 | Speech → text transcription |
| `src/tts_engine.py` | ~40 | Text → audio synthesis |
| `src/avatar_animator.py` | ~60 | Audio → video animation |
| `src/webrtc_server.py` | ~80 | WebRTC video streaming |
| `src/memory_agent.py` | ~70 | Q&A memory storage/recall |
| `src/orchestrator.py` | ~120 | Main orchestration pipeline |
| `website/src/components/AvatarFull.tsx` | ~100 | Frontend video component |

## Go Live Command (Hour 22)

```bash
cd /home/hunt/Downloads/PAIGE

# 1. Build frontend
npm run build --prefix website

# 2. Start backend + serve
python app.py

# 3. Open browser
# http://localhost:8002
# Click settings → Demo Mode

# 4. Investors ask questions
# Avatar responds in real-time
# Memory learns from each question

# 5. If anything breaks: play pre-recorded backup
```

---

## Resources & Checklist

**Pre-Demo (24 hours before):**
- ✅ All model weights downloaded
- ✅ WebRTC ports open (8000, 8001, 8002)
- ✅ Ethernet cable ready (no WiFi during demo)
- ✅ Backup responses recorded
- ✅ 5 demo questions practiced
- ✅ GPU thermal paste fresh
- ✅ Laptop on power (no battery)

**Demo Time:**
- ✅ Start backend 5 min early
- ✅ Test ASR with microphone
- ✅ Send warmup question to Qwen
- ✅ Verify animation smooth
- ✅ Monitor GPU temp continuously

---

**Estimated Completion Probability:** 85% (with Skill 1 foundation + 22-hour focus)  
**Recommended Parallel:** Have co-founder manage GPU monitoring while you explain to judges
