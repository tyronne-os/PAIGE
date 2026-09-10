#!/usr/bin/env python3
"""
GPU Orchestrator for PAIGE
Smart routing: HF free GPU for small models, NVIDIA for large (Qwen, Minimax3)
"""

import subprocess
import json
from typing import Optional, Dict, Any
from dataclasses import dataclass

@dataclass
class GPUInfo:
    """GPU information"""
    name: str
    memory_gb: float
    type: str  # 'nvidia', 'hf_free', 'cpu'
    available: bool
    compute_capability: Optional[str] = None

class GPUOrchestrator:
    """Manages GPU allocation and routing for models"""
    
    def __init__(self):
        self.gpus = self._detect_gpus()
        self.large_models = {'qwen', 'minimax', 'llama-70b', 'mixtral-8x22b'}
        self.small_models = {'phi', 'mistral-7b', 'llama-7b'}
    
    def _detect_gpus(self) -> list[GPUInfo]:
        """Detect available GPUs"""
        gpus = []
        
        # Check NVIDIA GPUs
        nvidia_gpus = self._detect_nvidia()
        gpus.extend(nvidia_gpus)
        
        # Check HF free GPU
        hf_gpu = self._detect_hf_gpu()
        if hf_gpu:
            gpus.append(hf_gpu)
        
        # Always have CPU fallback
        gpus.append(GPUInfo(
            name='CPU',
            memory_gb=0,
            type='cpu',
            available=True
        ))
        
        return gpus
    
    def _detect_nvidia(self) -> list[GPUInfo]:
        """Detect NVIDIA GPUs via nvidia-smi"""
        gpus = []
        try:
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=index,name,memory.total,compute_cap', 
                 '--format=csv,noheader'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                for line in result.stdout.strip().split('\n'):
                    if not line:
                        continue
                    parts = line.split(', ')
                    idx, name, mem, cap = parts
                    gpus.append(GPUInfo(
                        name=f"NVIDIA {name.strip()} (GPU {idx})",
                        memory_gb=float(mem.split()[0]) / 1024,
                        type='nvidia',
                        available=True,
                        compute_capability=cap.strip()
                    ))
        except Exception as e:
            print(f"[PAIGE] Warning: Could not detect NVIDIA GPUs: {e}")
        
        return gpus
    
    def _detect_hf_gpu(self) -> Optional[GPUInfo]:
        """Detect HuggingFace free GPU"""
        # HF Pro gives ~15GB free GPU
        return GPUInfo(
            name='HuggingFace Pro (Free Tier)',
            memory_gb=15.0,
            type='hf_free',
            available=True
        )
    
    def recommend_gpu(self, model_name: str) -> GPUInfo:
        """Recommend GPU for a model"""
        model_lower = model_name.lower()
        
        # Large models → NVIDIA GPU
        if any(large in model_lower for large in self.large_models):
            nvidia = [g for g in self.gpus if g.type == 'nvidia' and g.available]
            if nvidia:
                return max(nvidia, key=lambda g: g.memory_gb)
        
        # Small models → HF free GPU to save local VRAM
        if any(small in model_lower for small in self.small_models):
            hf = [g for g in self.gpus if g.type == 'hf_free' and g.available]
            if hf:
                return hf[0]
        
        # Default to best available GPU
        available = [g for g in self.gpus if g.available and g.type != 'cpu']
        if available:
            return max(available, key=lambda g: g.memory_gb)
        
        return [g for g in self.gpus if g.type == 'cpu'][0]
    
    def get_config_for_model(self, model_name: str) -> Dict[str, Any]:
        """Get environment config for a model"""
        gpu = self.recommend_gpu(model_name)
        
        config = {
            'gpu': gpu.name,
            'gpu_type': gpu.type,
            'memory_gb': gpu.memory_gb,
            'env': {}
        }
        
        if gpu.type == 'nvidia':
            # Set CUDA environment
            config['env'].update({
                'CUDA_VISIBLE_DEVICES': self._get_cuda_device_id(gpu.name),
                'CUDA_LAUNCH_BLOCKING': '1',
            })
        elif gpu.type == 'hf_free':
            # HF uses their own inference API
            config['env'].update({
                'HF_INFERENCE_API': 'true',
            })
        
        return config
    
    def _get_cuda_device_id(self, gpu_name: str) -> str:
        """Extract CUDA device ID from GPU name"""
        # Parse "NVIDIA A100 (GPU 0)" -> "0"
        if 'GPU' in gpu_name:
            start = gpu_name.rfind('GPU') + 3
            return ''.join(c for c in gpu_name[start:] if c.isdigit())
        return '0'
    
    def list_gpus(self) -> list[Dict[str, Any]]:
        """List all available GPUs"""
        return [
            {
                'name': gpu.name,
                'type': gpu.type,
                'memory_gb': gpu.memory_gb,
                'available': gpu.available,
                'compute_capability': gpu.compute_capability
            }
            for gpu in self.gpus
        ]

# Global instance
_orchestrator = None

def get_gpu_orchestrator() -> GPUOrchestrator:
    """Get or create the global GPU orchestrator"""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = GPUOrchestrator()
    return _orchestrator
