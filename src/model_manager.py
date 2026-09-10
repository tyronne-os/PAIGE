#!/usr/bin/env python3
"""
Model Manager for PAIGE
Manages local, HuggingFace, and custom models
"""

import json
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
from pathlib import Path
import subprocess

@dataclass
class Model:
    """Model definition"""
    name: str
    source: str  # 'local', 'huggingface', 'custom'
    model_id: str  # e.g., 'meta-llama/Llama-2-7b'
    size_gb: float
    recommended_gpu: str  # 'nvidia', 'hf_free', 'cpu'
    description: str
    tags: List[str]
    custom_url: Optional[str] = None
    local_path: Optional[str] = None

class ModelManager:
    """Manages available models"""
    
    def __init__(self):
        self.models_config = Path.home() / '.paige' / 'models.json'
        self.models_config.parent.mkdir(exist_ok=True)
        self.models: Dict[str, Model] = {}
        self._init_default_models()
        self._load_custom_models()
    
    def _init_default_models(self):
        """Initialize with recommended models for CRANE 3D digital humans"""
        defaults = [
            # Small, fast models (HF free GPU)
            Model(
                name='Phi-2',
                source='huggingface',
                model_id='microsoft/phi-2',
                size_gb=4.5,
                recommended_gpu='hf_free',
                description='Small, fast LLM for reasoning',
                tags=['small', 'fast', 'reasoning']
            ),
            Model(
                name='Mistral-7B',
                source='huggingface',
                model_id='mistralai/Mistral-7B-Instruct-v0.1',
                size_gb=7.0,
                recommended_gpu='hf_free',
                description='Fast and efficient 7B model',
                tags=['small', 'instruct', 'multilingual']
            ),
            
            # Medium models (NVIDIA GPU)
            Model(
                name='Llama-2-13B',
                source='huggingface',
                model_id='meta-llama/Llama-2-13b-hf',
                size_gb=13.0,
                recommended_gpu='nvidia',
                description='Balanced 13B model',
                tags=['medium', 'instruction-tuned']
            ),
            
            # Large models (NVIDIA GPU required)
            Model(
                name='Qwen-14B',
                source='huggingface',
                model_id='Qwen/Qwen-14B-Chat',
                size_gb=28.0,
                recommended_gpu='nvidia',
                description='State-of-the-art 14B multilingual model',
                tags=['large', 'chat', 'multilingual', 'qwen']
            ),
            Model(
                name='Minimax-3',
                source='custom',
                model_id='minimax-3-8b-instruct',
                size_gb=16.0,
                recommended_gpu='nvidia',
                description='Minimax 3 multimodal model',
                tags=['large', 'multimodal', 'minimax'],
                custom_url='https://api.minimaxi.com/v1/models'
            ),
            
            # Vision & Multimodal
            Model(
                name='LLaVA-1.5',
                source='huggingface',
                model_id='liuhaotian/llava-v1.5-7b',
                size_gb=7.5,
                recommended_gpu='hf_free',
                description='Vision language model for image understanding',
                tags=['vision', 'multimodal', 'instruct']
            ),
        ]
        
        for model in defaults:
            self.models[model.model_id] = model
    
    def _load_custom_models(self):
        """Load custom models from config"""
        if self.models_config.exists():
            try:
                with open(self.models_config) as f:
                    data = json.load(f)
                    for model_dict in data.get('custom_models', []):
                        model = Model(**model_dict)
                        self.models[model.model_id] = model
            except Exception as e:
                print(f"[PAIGE] Warning: Could not load custom models: {e}")
    
    def add_custom_model(self, model: Model) -> bool:
        """Add a custom model"""
        self.models[model.model_id] = model
        self._save_models()
        return True
    
    def _save_models(self):
        """Save models to config"""
        try:
            custom = [
                asdict(m) for m in self.models.values() 
                if m.source == 'custom'
            ]
            with open(self.models_config, 'w') as f:
                json.dump({'custom_models': custom}, f, indent=2)
        except Exception as e:
            print(f"[PAIGE] Error saving models: {e}")
    
    def list_models(self, filter_by_gpu: Optional[str] = None) -> List[Dict[str, Any]]:
        """List available models"""
        models = list(self.models.values())
        
        if filter_by_gpu:
            models = [m for m in models if m.recommended_gpu == filter_by_gpu]
        
        return [asdict(m) for m in models]
    
    def get_model(self, model_id: str) -> Optional[Model]:
        """Get model by ID"""
        return self.models.get(model_id)
    
    def search_models(self, query: str) -> List[Dict[str, Any]]:
        """Search models by name or tags"""
        query_lower = query.lower()
        results = []
        
        for model in self.models.values():
            if (query_lower in model.name.lower() or
                query_lower in model.description.lower() or
                any(query_lower in tag for tag in model.tags)):
                results.append(asdict(model))
        
        return results
    
    def get_recommended_models_for_task(self, task: str) -> List[Dict[str, Any]]:
        """Get recommended models for a task"""
        task_lower = task.lower()
        
        recommendations = {
            '3d': [m for m in self.models.values() if 'multimodal' in m.tags],
            'chat': [m for m in self.models.values() if 'chat' in m.tags or 'instruct' in m.tags],
            'vision': [m for m in self.models.values() if 'vision' in m.tags or 'multimodal' in m.tags],
            'reasoning': [m for m in self.models.values() if 'reasoning' in m.tags],
            'small': [m for m in self.models.values() if 'small' in m.tags],
            'large': [m for m in self.models.values() if 'large' in m.tags],
        }
        
        matching = recommendations.get(task_lower, [])
        return [asdict(m) for m in matching] if matching else self.list_models()[:3]

# Global instance
_model_manager = None

def get_model_manager() -> ModelManager:
    """Get or create the global model manager"""
    global _model_manager
    if _model_manager is None:
        _model_manager = ModelManager()
    return _model_manager
