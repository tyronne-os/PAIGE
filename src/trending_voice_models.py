#!/usr/bin/env python3
"""
Trending Voice Models from HuggingFace
Fallback options when NVIDIA API is unavailable
"""

from typing import Dict, List, Any
from dataclasses import dataclass
import asyncio

@dataclass
class VoiceModel:
    """Voice model definition"""
    name: str
    model_id: str
    description: str
    provider: str
    parameters: str
    latency_ms: int
    quality: str
    languages: List[str]
    free_tier: bool
    hf_url: str

class TrendingVoiceModels:
    """Manager for trending HuggingFace voice models"""
    
    def __init__(self):
        self.models = self._init_trending_models()
        self.active_model = self.models[0]  # NVIDIA default
    
    def _init_trending_models(self) -> List[VoiceModel]:
        """Initialize 5 trending voice models + NVIDIA as primary"""
        
        return [
            # Primary: NVIDIA
            VoiceModel(
                name="NVIDIA Nemotron-4-340B",
                model_id="nvidia/nemotron-4-340b-instruct",
                description="State-of-the-art 340B language model with natural conversation",
                provider="NVIDIA",
                parameters="340B",
                latency_ms=100,
                quality="Premium",
                languages=["en", "es", "fr", "de", "zh"],
                free_tier=False,
                hf_url="https://huggingface.co/nvidia/nemotron-4-340b-instruct"
            ),
            
            # Fallback 1: Meta Llama
            VoiceModel(
                name="Meta Llama 2 Chat 70B",
                model_id="meta-llama/Llama-2-70b-chat-hf",
                description="Open-source 70B model optimized for conversation",
                provider="Meta",
                parameters="70B",
                latency_ms=150,
                quality="Excellent",
                languages=["en", "es", "fr", "de", "it"],
                free_tier=True,
                hf_url="https://huggingface.co/meta-llama/Llama-2-70b-chat-hf"
            ),
            
            # Fallback 2: Mistral
            VoiceModel(
                name="Mistral Large Instruct",
                model_id="mistralai/Mistral-Large-Instruct-2407",
                description="Fast 84B model with excellent instruction-following",
                provider="Mistral AI",
                parameters="84B",
                latency_ms=120,
                quality="Very Good",
                languages=["en", "fr", "es", "de", "it"],
                free_tier=True,
                hf_url="https://huggingface.co/mistralai/Mistral-Large-Instruct-2407"
            ),
            
            # Fallback 3: Qwen
            VoiceModel(
                name="Qwen QwQ 32B",
                model_id="Qwen/QwQ-32B-Preview",
                description="Advanced reasoning model with strong multilingual support",
                provider="Alibaba Qwen",
                parameters="32B",
                latency_ms=180,
                quality="Excellent",
                languages=["en", "zh", "es", "fr", "de"],
                free_tier=True,
                hf_url="https://huggingface.co/Qwen/QwQ-32B-Preview"
            ),
            
            # Fallback 4: Gemma
            VoiceModel(
                name="Google Gemma 2 27B",
                model_id="google/gemma-2-27b-it",
                description="Lightweight 27B model optimized for inference speed",
                provider="Google",
                parameters="27B",
                latency_ms=110,
                quality="Good",
                languages=["en", "es", "fr", "de", "zh"],
                free_tier=True,
                hf_url="https://huggingface.co/google/gemma-2-27b-it"
            ),
            
            # Fallback 5: Phi
            VoiceModel(
                name="Microsoft Phi 3.5 Mini",
                model_id="microsoft/phi-3.5-mini-instruct",
                description="Ultra-efficient 3.8B model for fast responses",
                provider="Microsoft",
                parameters="3.8B",
                latency_ms=80,
                quality="Good",
                languages=["en"],
                free_tier=True,
                hf_url="https://huggingface.co/microsoft/phi-3.5-mini-instruct"
            ),
        ]
    
    def get_all_models(self) -> List[Dict[str, Any]]:
        """Get all available models"""
        return [self._model_to_dict(m) for m in self.models]
    
    def _model_to_dict(self, model: VoiceModel) -> Dict[str, Any]:
        """Convert model to dict"""
        return {
            "name": model.name,
            "model_id": model.model_id,
            "description": model.description,
            "provider": model.provider,
            "parameters": model.parameters,
            "latency_ms": model.latency_ms,
            "quality": model.quality,
            "languages": model.languages,
            "free_tier": model.free_tier,
            "hf_url": model.hf_url
        }
    
    def switch_model(self, model_id: str) -> Dict[str, Any]:
        """Switch to a different model"""
        
        for model in self.models:
            if model.model_id == model_id:
                self.active_model = model
                return {
                    "success": True,
                    "active_model": self._model_to_dict(model),
                    "message": f"Switched to {model.name}"
                }
        
        return {
            "success": False,
            "error": f"Model {model_id} not found"
        }
    
    def get_active_model(self) -> Dict[str, Any]:
        """Get currently active model"""
        return self._model_to_dict(self.active_model)
    
    def get_fallback_model(self) -> VoiceModel:
        """Get first available fallback (Meta Llama if NVIDIA fails)"""
        return self.models[1]  # Meta Llama 2 Chat 70B
    
    def get_models_by_language(self, language: str) -> List[Dict[str, Any]]:
        """Get models that support a specific language"""
        
        matching = [m for m in self.models if language in m.languages]
        return [self._model_to_dict(m) for m in matching]
    
    def get_models_by_speed(self) -> List[Dict[str, Any]]:
        """Get models sorted by speed (latency)"""
        
        sorted_models = sorted(self.models, key=lambda m: m.latency_ms)
        return [self._model_to_dict(m) for m in sorted_models]
    
    def get_models_by_quality(self) -> List[Dict[str, Any]]:
        """Get models sorted by quality"""
        
        quality_order = {"Premium": 5, "Excellent": 4, "Very Good": 3, "Good": 2}
        sorted_models = sorted(
            self.models,
            key=lambda m: quality_order.get(m.quality, 0),
            reverse=True
        )
        return [self._model_to_dict(m) for m in sorted_models]

# Global instance
_model_manager = None

def get_trending_voice_models() -> TrendingVoiceModels:
    """Get or create trending models manager"""
    global _model_manager
    if _model_manager is None:
        _model_manager = TrendingVoiceModels()
    return _model_manager
