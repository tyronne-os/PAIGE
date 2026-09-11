# PAIGE IDE - HuggingFace Deployment Guide

**Target:** ZeroGPU Spaces | **GPU:** Free tier (5-40 min daily) | **Model:** Diffusion (Small models preferred)

---

## 🎯 HuggingFace ZeroGPU Setup

### Step 1: Create HF Space

1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. **Space name:** `paige-ide`
4. **License:** MIT (optional)
5. **Visibility:** Public
6. **SDK:** Docker
7. **Space Hardware:** Select "ZeroGPU" in Settings (after creation)

### Step 2: Project Structure for HF

```
paige-hf/
├── Dockerfile
├── app.py                      # Gradio + Backend
├── requirements.txt
├── spaces_config.py            # GPU decorators
├── models/
│   ├── cache/                  # Model cache
│   └── config.json
└── frontend_build/             # Pre-built React (dist/)
    ├── index.html
    └── assets/
```

### Step 3: Dockerfile for HF Spaces

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy files
COPY requirements.txt .
COPY app.py .
COPY spaces_config.py .
COPY frontend_build/ ./frontend_build/

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt

# Set env for HF
ENV HF_HOME=/app/models/cache
ENV GRADIO_ANALYTICS_ENABLED=False

# Start app
CMD ["python", "app.py"]
```

### Step 4: requirements.txt for HF

```txt
gradio==4.44.0
torch==2.1.0
torchvision==0.16.0
torchaudio==2.1.0
transformers==4.36.0
diffusers==0.24.0
accelerate==0.25.0
safetensors==0.4.0
spaces==0.30.0
flask==3.0.0
flask-cors==4.0.0
pydantic==2.5.0
```

### Step 5: GPU Configuration (spaces_config.py)

```python
import spaces
from diffusers import DiffusionPipeline
import torch

# Initialize model at module level (outside GPU function)
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load small diffusion model (fits in free ZeroGPU)
model_id = "stabilityai/stable-diffusion-2-1-base"  # ~4GB
pipe = DiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,  # Memory optimization
    safety_checker=None         # Remove for speed
)
pipe = pipe.to(device)
pipe.enable_attention_slicing()  # More memory optimizations

@spaces.GPU(duration=60)  # Max 60 seconds
def generate_image(prompt: str, steps: int = 20) -> str:
    """
    Generate image from prompt.
    
    Args:
        prompt: Text description
        steps: Number of inference steps (less = faster)
    
    Returns:
        Path to generated image
    """
    try:
        # Generate image
        image = pipe(
            prompt,
            num_inference_steps=steps,
            guidance_scale=7.5
        ).images[0]
        
        # Save and return path
        image.save("/tmp/output.png")
        return "/tmp/output.png"
    except Exception as e:
        raise Exception(f"Generation failed: {str(e)}")

@spaces.GPU(duration=120)  # Video generation needs more time
def generate_video(prompt: str, num_frames: int = 8) -> str:
    """Generate short video from prompt"""
    frames = []
    
    for i in range(num_frames):
        # Add variation to prompt for each frame
        varied_prompt = f"{prompt}, frame {i+1} of {num_frames}"
        
        image = pipe(
            varied_prompt,
            num_inference_steps=15,  # Fewer steps = faster
            guidance_scale=7.5
        ).images[0]
        frames.append(image)
    
    # Create video (requires: pip install opencv-python pillow)
    import cv2
    from PIL import Image
    
    fps = 4  # Frames per second
    out_path = "/tmp/video.mp4"
    
    # Convert frames to video
    frame_array = [cv2.cvtColor(cv2.imread(f), cv2.COLOR_BGR2RGB) for f in frames]
    # ... video writing code ...
    
    return out_path
```

---

## 🎮 Gradio Integration (app.py for HF)

```python
import gradio as gr
import spaces
from spaces_config import generate_image, generate_video
from flask import Flask, send_from_directory
import os

# Flask for serving React frontend
app = Flask(__name__, static_folder='frontend_build', static_url_path='')

@app.route('/')
def serve_frontend():
    return send_from_directory('frontend_build', 'index.html')

# Gradio interface for GPU tasks
with gr.Blocks(theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🎨 PAIGE IDE - HuggingFace Integration
    
    Generate images and videos using ZeroGPU (5 min free daily quota)
    
    **Current Quota:** 5 minutes daily (Free tier)
    """)
    
    with gr.Tabs():
        # Image Generation Tab
        with gr.Tab("Image Generator"):
            with gr.Row():
                with gr.Column():
                    prompt = gr.Textbox(
                        label="Prompt",
                        placeholder="Describe your image...",
                        lines=3
                    )
                    steps = gr.Slider(
                        minimum=10,
                        maximum=50,
                        value=20,
                        step=5,
                        label="Steps (fewer = faster)"
                    )
                    generate_btn = gr.Button("✨ Generate Image", variant="primary")
                
                with gr.Column():
                    output_image = gr.Image(label="Result")
            
            generate_btn.click(
                fn=generate_image,
                inputs=[prompt, steps],
                outputs=output_image
            )
        
        # Video Generation Tab
        with gr.Tab("Video Generator"):
            with gr.Row():
                with gr.Column():
                    video_prompt = gr.Textbox(
                        label="Prompt",
                        placeholder="Describe your video...",
                        lines=3
                    )
                    num_frames = gr.Slider(
                        minimum=4,
                        maximum=16,
                        value=8,
                        step=1,
                        label="Number of Frames"
                    )
                    video_btn = gr.Button("🎬 Generate Video", variant="primary")
                
                with gr.Column():
                    output_video = gr.Video(label="Result")
            
            video_btn.click(
                fn=generate_video,
                inputs=[video_prompt, num_frames],
                outputs=output_video
            )

# Launch Gradio + Flask
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, share=False)
```

---

## 🚀 Deployment Steps

### Push to HuggingFace

```bash
# 1. Login to HF
huggingface-cli login
# Enter your HF token

# 2. Add HF as git remote
cd /home/hunt/Downloads/PAIGE
git remote add hf https://huggingface.co/spaces/YOUR-USERNAME/paige-ide

# 3. Push to HF (triggers auto-deploy)
git push hf main:main

# 4. Monitor deployment
# Go to: https://huggingface.co/spaces/YOUR-USERNAME/paige-ide
```

### Enable ZeroGPU

1. Go to Space Settings
2. Find "Hardware" section
3. Select "ZeroGPU"
4. Confirm (may take 5-10 min to activate)

---

## 💡 Optimization Tips

### For Free Tier (5 min/day):

**1. Model Quantization:**
```python
# Load in fp16 instead of fp32 (saves 50% memory)
pipe = DiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1-base",
    torch_dtype=torch.float16  # Memory saver
)
```

**2. Attention Slicing:**
```python
pipe.enable_attention_slicing()  # Slower but uses less VRAM
```

**3. Fewer Steps:**
```python
# Default: 50 steps = slow
# Optimal: 20 steps = 60% faster, minimal quality loss
image = pipe(prompt, num_inference_steps=20)
```

**4. Smaller Models:**
```
stabilityai/stable-diffusion-2-1-base     # 4GB (good for free tier)
runwayml/stable-diffusion-v1-5             # 3.5GB
stabilityai/stable-diffusion-2             # 3.2GB
```

### Memory Monitoring:

```python
import torch

def check_memory():
    print(f"GPU Memory Used: {torch.cuda.memory_allocated() / 1e9:.2f}GB")
    print(f"GPU Memory Reserved: {torch.cuda.memory_reserved() / 1e9:.2f}GB")

# Before loading model
check_memory()
```

---

## 🎥 Video Generation Workflow

**Step-by-step:**

```python
import cv2
from PIL import Image
import numpy as np

def create_video_from_prompts(prompts: list, output_path: str):
    """
    Generate video by creating frame from each prompt variation
    """
    frames = []
    
    for i, prompt_var in enumerate(prompts):
        print(f"Generating frame {i+1}/{len(prompts)}...")
        
        # Call GPU function
        image_path = generate_image(prompt_var, steps=15)
        
        # Load image
        img = Image.open(image_path)
        frames.append(np.array(img))
    
    # Convert to video
    height, width = frames[0].shape[:2]
    fps = 4  # 4 frames per second
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    for frame in frames:
        # BGR for OpenCV
        bgr_frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        out.write(bgr_frame)
    
    out.release()
    return output_path

# Usage:
prompts = [
    "a red ball, frame 1",
    "a red ball moving right, frame 2",
    "a red ball spinning, frame 3",
    "a red ball rolling away, frame 4"
]

video_path = create_video_from_prompts(prompts, "/tmp/demo.mp4")
```

---

## 📊 Quota Management

**Free Tier (5 min/day):**

| Task | Duration | Quota Used |
|---|---|---|
| Image (20 steps) | 30s | 30s |
| Image (15 steps) | 20s | 20s |
| Video (4 frames) | 90s | 90s |
| Video (8 frames) | 160s | Over quota! |

**Optimization:**
- Use 15-20 steps for images (still good quality)
- Use 4-6 frames for videos
- Enable `enable_attention_slicing()` for all models
- Cache models locally to avoid re-downloading

---

## 🔧 Backend Integration (Flask)

**Connect PAIGE frontend to HF models:**

```python
from flask import Flask, jsonify, request
from spaces_config import generate_image, generate_video
import threading
import uuid

app = Flask(__name__)

# Store job results
jobs = {}

@app.route('/api/generate-image', methods=['POST'])
def api_generate_image():
    """API endpoint for image generation"""
    data = request.json
    prompt = data.get('prompt')
    steps = data.get('steps', 20)
    
    try:
        result = generate_image(prompt, steps)
        return jsonify({
            'status': 'success',
            'image_url': f'/outputs/{result}'
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/generate-video', methods=['POST'])
def api_generate_video():
    """API endpoint for video generation"""
    data = request.json
    prompt = data.get('prompt')
    frames = data.get('frames', 8)
    
    job_id = str(uuid.uuid4())
    
    # Run in background thread
    def process():
        try:
            result = generate_video(prompt, frames)
            jobs[job_id] = {'status': 'done', 'url': f'/outputs/{result}'}
        except Exception as e:
            jobs[job_id] = {'status': 'error', 'message': str(e)}
    
    jobs[job_id] = {'status': 'processing'}
    threading.Thread(target=process).start()
    
    return jsonify({'job_id': job_id})

@app.route('/api/job-status/<job_id>', methods=['GET'])
def check_job(job_id):
    """Check job status"""
    return jsonify(jobs.get(job_id, {'status': 'not_found'}))
```

---

## 🧪 Testing Checklist

**Before deploying to HF:**

- [ ] Docker builds successfully
- [ ] Requirements.txt has all dependencies
- [ ] Model downloads on first run
- [ ] GPU function decorated with @spaces.GPU
- [ ] Image generation works (test with simple prompt)
- [ ] Video generation creates valid mp4
- [ ] Frontend served on root `/`
- [ ] API endpoints respond correctly
- [ ] No hardcoded credentials in code
- [ ] Secrets added in HF Space Settings

---

## 📈 Performance Metrics

**Expected Performance (Free ZeroGPU, small model):**

```
Prompt: "a red ball"
Model: stabilityai/stable-diffusion-2-1-base
Settings: 20 steps, fp16, attention_slicing=True

⏱️ Cold start (first run): 45s
   - Model download: 15s
   - Model load: 15s
   - Generation: 15s

⏱️ Warm start (subsequent): 20s
   - Generation: 20s

💾 Memory usage: 3.8GB (out of 48GB available)
```

---

## 🚨 Troubleshooting

**Model too large:**
```
Error: CUDA out of memory
Solution: Use smaller model or enable more optimizations
```

**Timeout errors:**
```
Error: GPU function exceeded 60s limit
Solution: Use @spaces.GPU(duration=120) or reduce quality
```

**Model won't download:**
```
Error: Connection timeout to HuggingFace Hub
Solution: Pre-cache model in Dockerfile, use local weights
```

---

## 📚 Resources

- [HF Spaces Docs](https://huggingface.co/docs/hub/spaces-overview)
- [ZeroGPU Guide](https://huggingface.co/docs/hub/main/en/spaces-zerogpu)
- [Gradio Docs](https://www.gradio.app/guides)
- [Diffusers Docs](https://huggingface.co/docs/diffusers)

---

**Next Engineer:** Start by creating the HF Space, pushing this code, and testing the image generation endpoint. Video generation is the stretch goal after image gen is working perfectly.
