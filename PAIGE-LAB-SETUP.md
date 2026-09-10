# PAIGE Lab Setup Guide

## Architecture Overview

```
┌────────────────────────────────────┐
│  PAIGE Lab (Local Frontend)        │
│  🔬 Build & Test Custom Models     │
│  🏗️ Create Applications            │
│  ✅ Full Computer Use Access       │
│  Port: 8002                        │
└─────────────────┬──────────────────┘
                  │
            ┌─────┴─────┐
            │           │
     ┌──────▼──────┐  ┌─▼────────────────┐
     │   Local     │  │   PAIGE Lab      │
     │   Compute   │  │   (HF Spaces)    │
     │             │  │ 🎨 Gallery      │
     │   Models    │  │ 🛠️ Tools        │
     │   Testing   │  │ 💾 Storage      │
     └─────────────┘  └────────┬─────────┘
                               │
                      ┌────────▼────────┐
                      │  HF Storage     │
                      │ Your Models     │
                      │ (Versioned)     │
                      └─────────────────┘
```

### Components

**PAIGE Lab Backend (HF Spaces - `paige-lab-backend.py`)**
- Model gallery (like HF trending, YOUR models only)
- Compression tool router (OmniRouter style)
- Storage management
- Download/upload hub
- **Read-only for browsing**

**PAIGE Lab Frontend (Local - `PAIGELabFrontend.jsx`)**
- React dashboard
- Create custom models (full Python code)
- Build applications using models
- Test models with inputs
- Compress models locally
- Upload compressed versions to HF storage
- **Full computer use access**

**HuggingFace Storage**
- Your model repository
- Version control
- Automatic backup
- Versioning and metadata

## Setup Steps

### 1. Install Backend (HF Spaces)

The `paige-lab-backend.py` is a Gradio app that runs on HF Spaces.

**Option A: Deploy to HF Spaces Directly**

```bash
# Create HF Space manually
1. Go to https://huggingface.co/spaces
2. Create new space: "paige-lab"
3. Upload paige-lab-backend.py
4. Set to Gradio template
5. Add HF_TOKEN as secret
```

**Option B: Use local Gradio for testing**

```bash
cd /home/hunt/Downloads/PAIGE
source venv/bin/activate

# Install Gradio
pip install gradio -q

# Run locally
python3 paige-lab-backend.py
# Opens at http://localhost:7860
```

### 2. Install Frontend (Local)

The React frontend runs locally with full computer use.

**Setup:**

```bash
cd /home/hunt/Downloads/PAIGE
npm install  # Install React dependencies

# Set HF Spaces backend URL
export REACT_APP_HF_LAB_URL="https://paige-lab.hf.space"
# Or if testing locally:
export REACT_APP_HF_LAB_URL="http://localhost:7860"

# Start development server
npm start
# Opens at http://localhost:3000
```

### 3. Configure Environment

Create `.env` file:

```bash
# PAIGE Lab Frontend
REACT_APP_HF_LAB_URL=https://paige-lab.hf.space
REACT_APP_LOCAL_BACKEND=http://localhost:8002

# HuggingFace
HF_TOKEN=hf_your_token_here
HF_USERNAME=tyronne-os

# Model Storage
MODEL_STORAGE_PATH=/home/hunt/Downloads/PAIGE/.models
COMPRESSION_CACHE=/home/hunt/Downloads/PAIGE/.cache
```

## Workflow

### 1. Gallery Browsing

1. Open PAIGE Lab Frontend (localhost:3000)
2. Go to "Gallery" tab
3. View your compressed models from HF storage
4. Click "Download & Use" to pull into local environment

### 2. Create Custom Model

1. Go to "Create Model" tab
2. Write Python code for your model
3. Click "Create Model"
4. Model saved locally for testing

### 3. Build Application

1. Go to "Build App" tab
2. Select model from gallery or custom creation
3. Write application code (Gradio, Streamlit, etc.)
4. Click "Build Application"
5. Test URL opens automatically

### 4. Test Model

1. Go to "Test" tab
2. Select model
3. Enter test input
4. Get instant results with latency

### 5. Compress Model

1. Go to "Compress" tab
2. Select compression tool:
   - **GGUF**: For local CPU inference
   - **bitsandbytes**: For GPU quantization
   - **Pruning**: Remove unused weights
   - **Distillation**: Create smaller model
   - **LoRA**: Parameter-efficient fine-tune

3. Click "Apply"
4. Get compression ratio and new size

### 6. Upload to HF Storage

1. After compression, click "Upload to HF"
2. New model version uploaded
3. Auto-appears in gallery for next download

## Key Features

### ✅ Full Computer Use Access

All model building and testing runs locally with:
- File system access
- GPU access
- Internet access
- Tool execution
- No sandbox restrictions

### 🎨 Custom Model Gallery

Like HuggingFace Trending, but:
- Only YOUR models
- Your compression settings
- Version tracking
- Private storage option
- Direct downloads from your storage

### 🛠️ Compression Tools Router

Like OmniRouter but for model optimization:
- Multiple compression methods
- Batch compression
- Performance benchmarking
- Auto-versioning
- Easy rollback

### 💾 Automatic Storage Sync

- Models auto-backup to HF
- Version history maintained
- Metadata tracking
- Cross-device access
- No manual sync needed

## Integration with CRANE

PAIGE Lab models can be used in CRANE:

```python
# In CRANE application
from paige_lab import load_model

model = load_model("paige-lab/my-compressed-model")
output = model.predict(input_text)
```

## API Endpoints (Local Backend)

```python
POST /api/download-model
  - repo_id: model ID from HF
  - source: "huggingface"

POST /api/create-model
  - code: Python model code
  - name: Model name

POST /api/build-app
  - model_id: Selected model
  - app_code: Application code
  - computer_use: true

POST /api/test-model
  - model_id: Model to test
  - input: Test input

POST /api/compress-model
  - model_id: Model to compress
  - compression_type: "gguf", "bitsandbytes", etc.

POST /api/upload-model
  - model_id: Model to upload
  - destination: "huggingface"
```

## Troubleshooting

**Gallery not loading?**
- Check HF_TOKEN is valid
- Verify HF Spaces backend is running
- Check network connectivity

**Create model fails?**
- Check Python syntax in code editor
- Verify dependencies are installed
- Check available disk space

**Compression slow?**
- Large models take time (5-30 mins depending on size)
- Can run in background
- Try smaller model first

**Upload fails?**
- Verify HF_TOKEN has write access
- Check network connection
- Verify model files are valid

## Advanced

### Custom Compression Recipes

Create `compression-recipes.json`:

```json
{
  "recipes": {
    "mobile": {
      "steps": [
        {"type": "pruning", "ratio": 0.3},
        {"type": "quantization", "bits": 4}
      ],
      "target_size": "2GB"
    },
    "laptop": {
      "steps": [
        {"type": "quantization", "bits": 8}
      ],
      "target_size": "5GB"
    }
  }
}
```

### Batch Operations

```bash
python3 paige-lab-backend.py --batch-compress models.txt --output compressed/
```

### Model Benchmarking

```bash
python3 paige-lab-backend.py --benchmark model_id --input-size 512
```

## Files

- `paige-lab-backend.py` - HF Spaces Gradio backend
- `PAIGELabFrontend.jsx` - React local frontend
- `paige-lab.css` - Styling
- `.models/` - Local model storage
- `.cache/` - Compression cache
- `compression-recipes.json` - (Optional) Recipes

## Summary

**PAIGE Lab = Model Gallery + Compression Router + Builder**

- Backend on HF Spaces: Browse & manage models
- Frontend locally: Build & test with full control
- HF Storage: Versioned model repository
- No cloud compute costs
- Full computer use on your device

Ready to build and compress your custom models! 🚀
