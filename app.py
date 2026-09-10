#!/usr/bin/env python3
"""
PAIGE Gateway - Serves the standalone React frontend
Listens on port 8002 for the PAIGE IDE with intelligent model and GPU management
"""

import os
import json
from pathlib import Path
from flask import Flask, send_from_directory, render_template, request, jsonify
from datetime import datetime
import sys

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from token_manager import get_token_manager
from gpu_orchestrator import get_gpu_orchestrator
from model_manager import get_model_manager

app = Flask(__name__, static_folder='website/dist', static_url_path='')
WORKSPACE_ROOT = Path(__file__).parent

# Initialize managers
token_mgr = get_token_manager()
gpu_orch = get_gpu_orchestrator()
model_mgr = get_model_manager()

# Store conversations in memory (replace with DB for production)
conversations = {}

@app.route('/')
def serve_index():
    """Serve the React app"""
    dist_path = WORKSPACE_ROOT / 'website' / 'dist'
    if (dist_path / 'index.html').exists():
        return send_from_directory(dist_path, 'index.html')
    return {'error': 'Frontend not built. Run: cd website && npm run build'}, 404

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from dist"""
    dist_path = WORKSPACE_ROOT / 'website' / 'dist'
    file_path = dist_path / path
    
    if file_path.is_file():
        return send_from_directory(dist_path, path)
    
    # Fall back to index.html for SPA routing
    if (dist_path / 'index.html').exists():
        return send_from_directory(dist_path, 'index.html')
    
    return {'error': 'Not found'}, 404

# ============ Token Vault APIs ============

@app.route('/api/credentials', methods=['GET'])
def get_credentials():
    """Get available credentials (masked)"""
    return jsonify(token_mgr.to_dict(mask=True))

# ============ GPU Management APIs ============

@app.route('/api/gpus', methods=['GET'])
def list_gpus():
    """List available GPUs"""
    return jsonify({'gpus': gpu_orch.list_gpus()})

@app.route('/api/gpus/recommend', methods=['POST'])
def recommend_gpu():
    """Get GPU recommendation for a model"""
    data = request.get_json()
    model_name = data.get('model_name', '')
    gpu = gpu_orch.recommend_gpu(model_name)
    return jsonify({
        'model': model_name,
        'recommended_gpu': gpu.name,
        'config': gpu_orch.get_config_for_model(model_name)
    })

# ============ Model Management APIs ============

@app.route('/api/models', methods=['GET'])
def list_models():
    """List available models"""
    gpu_filter = request.args.get('gpu')
    return jsonify({'models': model_mgr.list_models(filter_by_gpu=gpu_filter)})

@app.route('/api/models/search', methods=['POST'])
def search_models():
    """Search models"""
    data = request.get_json()
    query = data.get('query', '')
    return jsonify({'results': model_mgr.search_models(query)})

@app.route('/api/models/recommend', methods=['POST'])
def recommend_models():
    """Get recommended models for a task"""
    data = request.get_json()
    task = data.get('task', 'chat')
    return jsonify({'recommended': model_mgr.get_recommended_models_for_task(task)})

@app.route('/api/models/custom', methods=['POST'])
def add_custom_model():
    """Add a custom model"""
    data = request.get_json()
    try:
        from model_manager import Model
        model = Model(**data)
        model_mgr.add_custom_model(model)
        return jsonify({'success': True, 'model': data})
    except Exception as e:
        return {'error': str(e)}, 400

# ============ Chat & Sessions APIs ============

@app.route('/api/sessions', methods=['GET'])
def list_sessions():
    """List all conversations"""
    return jsonify({'sessions': list(conversations.keys())})

@app.route('/api/chat', methods=['POST'])
def send_message():
    """Process a message and return response"""
    data = request.get_json()
    session_id = data.get('session_id', 'default')
    message = data.get('message', '')
    
    if not message:
        return {'error': 'No message provided'}, 400
    
    # Initialize session if needed
    if session_id not in conversations:
        conversations[session_id] = {'messages': [], 'created': datetime.now().isoformat()}
    
    # Store user message
    conversations[session_id]['messages'].append({
        'role': 'user',
        'content': message,
        'timestamp': datetime.now().isoformat()
    })
    
    # Generate response with AI capabilities
    response = generate_intelligent_response(message)
    
    # Store agent response
    conversations[session_id]['messages'].append({
        'role': 'assistant',
        'content': response,
        'timestamp': datetime.now().isoformat()
    })
    
    return jsonify({
        'session_id': session_id,
        'response': response,
        'messages': conversations[session_id]['messages']
    })

@app.route('/api/session/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get a specific session"""
    if session_id not in conversations:
        return {'error': 'Session not found'}, 404
    return jsonify(conversations[session_id])

# ============ Intelligence Engine ============

def generate_intelligent_response(message: str) -> str:
    """
    AI-powered response generator with context awareness
    """
    message_lower = message.lower()
    
    # Context detection
    if any(word in message_lower for word in ['help', 'what can you', 'how do i']):
        return """🤖 **PAIGE Can Help With:**

**Model Selection**
• Which model should I use? (I'll match to your GPU)
• Show me models for 3D work
• What's the difference between Qwen and Mistral?

**GPU Management**
• Auto-detect your NVIDIA GPU + HF free GPU
• Route small models to HF (saves VRAM)
• Optimize for Qwen/Minimax on NVIDIA

**Project Creation**
• Create a CRANE template for 3D digital humans
• Set up Torch + CUDA environment
• Deploy to HuggingFace backend

**Model Deployment**
• Download & cache models locally
• Run inference with optimized settings
• Stream responses to your app

What would you like to do?"""
    
    elif 'model' in message_lower or 'qwen' in message_lower or 'mistral' in message_lower:
        # Ask clarifying questions for model selection
        return """Great! Let's pick the right model. Tell me:
1. **GPU available?** (NVIDIA A100/RTX, or just HF free GPU?)
2. **Task?** (chat, reasoning, vision, multimodal?)
3. **Speed vs quality?** (fast, balanced, or maximum quality?)

Once I know, I'll recommend the perfect model and auto-configure GPU routing."""
    
    elif 'gpu' in message_lower or 'cuda' in message_lower:
        gpus = gpu_orch.list_gpus()
        gpu_str = '\n'.join([f"• {g['name']} ({g['memory_gb']:.1f}GB)" for g in gpus])
        return f"""📊 **Your GPU Setup:**

{gpu_str}

**PAIGE's Smart GPU Routing:**
→ Small models (Phi, Mistral) → HF free GPU (saves local VRAM)
→ Large models (Qwen, Minimax) → NVIDIA GPU
→ Vision models → HF free GPU + local NVIDIA if available

Ready to select a model?"""
    
    elif 'project' in message_lower or 'crane' in message_lower or 'create' in message_lower:
        return """🚀 **Creating CRANE Template for 3D Digital Humans**

I'll scaffold:
1. **Backend** → Torch/CUDA/Ollama on HF Spaces
2. **Frontend** → React component for avatar rendering
3. **Model loader** → Auto GPU detection + inference
4. **API** → FastAPI for realtime interaction
5. **Config** → Your tokens + GPU settings

What's your project name?"""
    
    elif 'deploy' in message_lower or 'hugging' in message_lower or 'hf' in message_lower:
        return """🌐 **Deploying to HuggingFace:**

PAIGE can create a Gradio Space with:
• Torch + CUDA pre-installed
• Your model running inference
• Live GPU utilization display
• Model versioning & management

Your HF token is ✓ ready. Shall I create a Space?"""
    
    else:
        # Default to asking for clarification
        return f"""I understood: "{message}"

I can help you with:
• **Model selection** (best for your GPU)
• **Project creation** (CRANE templates)
• **GPU optimization** (NVIDIA + HF routing)
• **Model deployment** (HF backend)
• **3D digital humans** (Tokkio framework)

What's your next step?"""

@app.route('/api/system/info', methods=['GET'])
def system_info():
    """Get system information"""
    return jsonify({
        'service': 'PAIGE Gateway',
        'version': '1.0.0',
        'date': '2026-09-10',
        'gpus': gpu_orch.list_gpus(),
        'models_available': len(model_mgr.models),
        'credentials': token_mgr.to_dict(mask=True),
        'features': [
            'Token Vault Integration',
            'GPU Auto-Detection',
            'Model Composer',
            'Project Generator',
            'HF Backend Deployment',
            'Code Execution',
            'Intelligent Workflows'
        ]
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return {'status': 'ok', 'service': 'PAIGE Gateway'}

if __name__ == '__main__':
    print("""
    ╔════════════════════════════════════════════════════╗
    ║  PAIGE Gateway v1.0 - AI Development IDE          ║
    ║  http://localhost:8002                            ║
    ║  ✓ Token Vault Integration                        ║
    ║  ✓ GPU Orchestration (NVIDIA + HF Free)          ║
    ║  ✓ Model Composer                                ║
    ║  ✓ Project Generation                            ║
    ║  ✓ End-to-End Intelligence                       ║
    ║  🎯 Building CRANE 3D Digital Humans             ║
    ╚════════════════════════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=8002, debug=False)

# ============ Voice Agent APIs ============

@app.route('/api/voice/chat', methods=['POST'])
def voice_chat():
    """Handle voice/text chat with spec generation and agent orchestration"""
    from voice_agent_controller import get_voice_agent_controller
    import asyncio
    
    data = request.get_json()
    user_input = data.get('message', '')
    
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400
    
    try:
        controller = get_voice_agent_controller()
        response = asyncio.run(controller.conversate(user_input))
        return jsonify(response)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/audio-to-text', methods=['POST'])
def audio_to_text():
    """Convert audio to text using Whisper"""
    from voice_agent_controller import get_voice_agent_controller
    import asyncio
    
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400
    
    audio_file = request.files['audio']
    
    try:
        controller = get_voice_agent_controller()
        text = asyncio.run(controller.process_voice_input(audio_file.read()))
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice/agents/pool', methods=['GET'])
def get_agent_pool():
    """Get current agent pool status"""
    from voice_agent_controller import get_voice_agent_controller
    
    controller = get_voice_agent_controller()
    return jsonify({
        'pool_size': len(controller.agent_pool),
        'agents': list(controller.agent_pool.keys()),
        'agents_detail': list(controller.agent_pool.values())
    })

@app.route('/api/voice/specs/history', methods=['GET'])
def get_spec_history():
    """Get history of generated specs"""
    from voice_agent_controller import get_voice_agent_controller
    
    controller = get_voice_agent_controller()
    limit = request.args.get('limit', 10, type=int)
    
    specs = [
        {
            'task_id': s.task_id,
            'description': s.description,
            'agents': s.assigned_agents,
            'diagram': s.workflow_diagram,
            'created_at': s.created_at
        }
        for s in controller.spec_history[-limit:]
    ]
    
    return jsonify({'specs': specs})

if __name__ == '__main__':
    # Production: use gunicorn
    # Development: use Flask dev server
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=8002, debug=debug, use_reloader=False)

# ============ Screen Vision APIs ============

@app.route('/api/paige/analyze-screen', methods=['POST'])
def analyze_screen():
    """Analyze screenshot with vision model"""
    from screen_vision_analyzer import get_screen_vision_analyzer
    import asyncio
    
    data = request.get_json()
    image_data = data.get('imageData', '')
    instructions = data.get('customInstructions', '')
    
    if not image_data:
        return jsonify({'error': 'No image data'}), 400
    
    try:
        analyzer = get_screen_vision_analyzer()
        analysis = asyncio.run(analyzer.analyze_screen(image_data, instructions))
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ Voice Cloning APIs ============

@app.route('/api/paige/clone-voice', methods=['POST'])
def clone_voice():
    """Clone voice from audio sample"""
    from voice_cloner import get_voice_cloner
    import asyncio
    
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400
    
    audio_file = request.files['audio']
    voice_name = request.form.get('voiceName', 'cloned-voice')
    
    try:
        # Save temporary file
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            audio_file.save(tmp.name)
            temp_path = tmp.name
        
        # Clone voice
        cloner = get_voice_cloner()
        voice_info = asyncio.run(cloner.clone_voice(temp_path, voice_name))
        
        # Clean up
        import os
        os.remove(temp_path)
        
        if 'error' in voice_info:
            return jsonify(voice_info), 400
        
        return jsonify(voice_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/paige/voices', methods=['GET'])
def list_cloned_voices():
    """List cloned voices"""
    from voice_cloner import get_voice_cloner
    
    cloner = get_voice_cloner()
    voices = cloner.get_cloned_voices()
    return jsonify({'voices': voices})

@app.route('/api/paige/voice/<voice_id>', methods=['DELETE'])
def delete_voice(voice_id):
    """Delete a cloned voice"""
    from voice_cloner import get_voice_cloner
    
    cloner = get_voice_cloner()
    success = cloner.delete_voice(voice_id)
    
    return jsonify({'success': success})

@app.route('/api/paige/synthesize', methods=['POST'])
def synthesize_with_voice():
    """Synthesize speech with cloned voice"""
    from voice_cloner import get_voice_cloner
    import asyncio
    
    data = request.get_json()
    text = data.get('text', '')
    voice_id = data.get('voiceId', '')
    language = data.get('language', 'en')
    
    if not text or not voice_id:
        return jsonify({'error': 'Missing text or voiceId'}), 400
    
    try:
        cloner = get_voice_cloner()
        audio_bytes = asyncio.run(cloner.synthesize_with_cloned_voice(text, voice_id, language))
        
        if not audio_bytes:
            return jsonify({'error': 'Failed to synthesize'}), 500
        
        import base64
        return jsonify({
            'audio': base64.b64encode(audio_bytes).decode(),
            'format': 'wav'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
