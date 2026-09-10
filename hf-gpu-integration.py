#!/usr/bin/env python3
"""
HuggingFace GPU Integration for PAIGE
Connects free HF GPU to PAIGE IDE for:
- LLM inference
- Fine-tuning
- Model serving
- Notebook compute
"""

import os
import json
from pathlib import Path
from typing import Optional

# Try importing HF libraries
try:
    from huggingface_hub import login, model_info, list_models
    from huggingface_hub import InferenceClient
    HF_AVAILABLE = True
except ImportError as e:
    HF_AVAILABLE = False


class PAIGEGPUManager:
    """Manage HuggingFace GPU resources for PAIGE"""
    
    def __init__(self):
        self.config_path = Path(__file__).parent / "hf-gpu-config.json"
        self.hf_token = os.getenv("HF_TOKEN")
        self.config = self._load_config()
        
    def _load_config(self) -> dict:
        """Load GPU configuration"""
        if self.config_path.exists():
            with open(self.config_path) as f:
                return json.load(f)
        return {}
    
    def authenticate(self) -> bool:
        """Authenticate with HuggingFace"""
        if not self.hf_token:
            print("❌ HF_TOKEN not found. Set via: export HF_TOKEN=<your_token>")
            return False
        
        if not HF_AVAILABLE:
            print("❌ huggingface_hub not installed")
            return False
        
        try:
            login(token=self.hf_token)
            print("✅ Authenticated with HuggingFace")
            return True
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            return False
    
    def get_inference_client(self) -> Optional[object]:
        """Get HF Inference API client"""
        if not HF_AVAILABLE or not self.hf_token:
            return None
        
        try:
            client = InferenceClient(api_key=self.hf_token)
            print("✅ HF Inference client ready")
            return client
        except Exception as e:
            print(f"⚠️  Could not initialize inference client: {e}")
            return None
    
    def list_available_models(self) -> list:
        """List models available on HF hub"""
        if not self.authenticate():
            return []
        
        try:
            # Popular open models good for local/HF serving
            models = [
                "meta-llama/Llama-2-7b-hf",
                "mistralai/Mistral-7B-Instruct-v0.1",
                "NousResearch/Nous-Hermes-2-Mistral-7B-DPO",
                "TheBloke/Mistral-7B-Instruct-v0.1-GGUF",
                "mosaicml/mpt-7b-instruct",
                "Qwen/Qwen1.5-7B-Chat",
            ]
            print("\n📚 Available models for PAIGE:")
            for model in models:
                print(f"  - {model}")
            return models
        except Exception as e:
            print(f"⚠️  Error listing models: {e}")
            return []
    
    def setup_inference(self, model_id: str = "mistralai/Mistral-7B-Instruct-v0.1") -> dict:
        """Setup inference for a model"""
        config = {
            "model": model_id,
            "api": "huggingface_inference_api",
            "inference_type": "serverless",
            "provider": "huggingface",
            "max_tokens": 1024,
            "temperature": 0.7,
            "hf_token_env": "HF_TOKEN"
        }
        
        # Save to config
        with open(self.config_path, "w") as f:
            json.dump({"huggingface_gpu": config}, f, indent=2)
        
        print(f"✅ Inference setup for {model_id}")
        return config
    
    def test_inference(self, prompt: str = "Hello, how are you?") -> Optional[str]:
        """Test inference on HF GPU"""
        client = self.get_inference_client()
        if not client:
            print("❌ Could not initialize inference client")
            return None
        
        try:
            response = client.text_generation(prompt, max_new_tokens=100)
            print(f"✅ Inference test successful:")
            print(f"   Input:  {prompt}")
            print(f"   Output: {response}")
            return response
        except Exception as e:
            print(f"❌ Inference test failed: {e}")
            return None
    
    def status(self) -> dict:
        """Get GPU status"""
        return {
            "hf_authenticated": bool(self.hf_token),
            "hf_hub_available": HF_AVAILABLE,
            "config_loaded": bool(self.config),
            "inference_ready": self.get_inference_client() is not None,
            "config_path": str(self.config_path)
        }


def main():
    """CLI for GPU management"""
    import sys
    
    manager = PAIGEGPUManager()
    
    if len(sys.argv) < 2:
        print("PAIGE GPU Manager")
        print("Usage: python hf-gpu-integration.py <command>")
        print("\nCommands:")
        print("  auth      - Authenticate with HuggingFace")
        print("  status    - Show GPU status")
        print("  models    - List available models")
        print("  setup     - Setup inference")
        print("  test      - Test inference")
        print("  info      - Show integration info")
        return
    
    command = sys.argv[1]
    
    if command == "auth":
        manager.authenticate()
    
    elif command == "status":
        status = manager.status()
        print("\n🔧 PAIGE GPU Status:")
        for key, val in status.items():
            print(f"  {key}: {val}")
    
    elif command == "models":
        manager.list_available_models()
    
    elif command == "setup":
        model = sys.argv[2] if len(sys.argv) > 2 else "mistralai/Mistral-7B-Instruct-v0.1"
        manager.setup_inference(model)
    
    elif command == "test":
        prompt = sys.argv[2] if len(sys.argv) > 2 else "What is the capital of France?"
        manager.test_inference(prompt)
    
    elif command == "info":
        print("""
╔════════════════════════════════════════════════════════════════╗
║         PAIGE + HuggingFace GPU Integration                   ║
╚════════════════════════════════════════════════════════════════╝

Your Free HF GPU Can Do:
───────────────────────────────────────────────────────────────
✓ Run open-source LLMs (7B-13B models)
✓ Serverless inference via HF API
✓ Fine-tune models on your data
✓ Host models in HF Spaces
✓ Notebook compute for experiments

How It Works with PAIGE:
───────────────────────────────────────────────────────────────
1. PAIGE sends requests to HF Inference API
2. HF routes to your free GPU allocation
3. Results returned to PAIGE for CRANE to use
4. Fallback to local compute if needed

Setup:
───────────────────────────────────────────────────────────────
1. Run: python hf-gpu-integration.py auth
2. Run: python hf-gpu-integration.py models
3. Run: python hf-gpu-integration.py setup <model>
4. Run: python hf-gpu-integration.py test
5. Integrate into PAIGE launcher

Environment:
───────────────────────────────────────────────────────────────
export HF_TOKEN=<your_hf_token>
python hf-gpu-integration.py status

        """)
    
    else:
        print(f"Unknown command: {command}")


if __name__ == "__main__":
    main()
