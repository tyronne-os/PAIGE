#!/usr/bin/env python3
"""
PAIGE Voice Cloner
Uses XTTS V2 (Coqui) for instant voice cloning on free HF GPU
Model: https://huggingface.co/coqui/XTTS-v2
"""

import os
import json
import uuid
from typing import Optional, Dict, Any
from pathlib import Path
import asyncio

class VoiceCloner:
    """Instant voice cloning using XTTS V2 on free GPU"""
    
    def __init__(self):
        self.model_name = "coqui/XTTS-v2"
        self.model = None
        self.device = None
        self.voices_dir = Path.home() / '.paige' / 'cloned_voices'
        self.voices_dir.mkdir(parents=True, exist_ok=True)
        self.voice_registry = self._load_voice_registry()
        self.initialize_model()
    
    def initialize_model(self):
        """Load XTTS V2 model for voice cloning"""
        try:
            from TTS.api import TTS
            import torch
            
            print(f"[VOICE-CLONER] Loading {self.model_name}...")
            
            # Use GPU if available
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            
            self.model = TTS(
                model_name=self.model_name,
                progress_bar=False,
                gpu=(self.device == "cuda")
            )
            
            print(f"[VOICE-CLONER] ✓ XTTS V2 loaded on {self.device}")
            
        except Exception as e:
            print(f"[VOICE-CLONER] Warning: Could not load TTS model: {e}")
            self.model = None
    
    def _load_voice_registry(self) -> Dict[str, Dict[str, Any]]:
        """Load registered cloned voices"""
        registry_path = self.voices_dir / 'registry.json'
        
        if registry_path.exists():
            try:
                with open(registry_path) as f:
                    return json.load(f)
            except:
                pass
        
        return {}
    
    def _save_voice_registry(self):
        """Save voice registry"""
        registry_path = self.voices_dir / 'registry.json'
        
        try:
            with open(registry_path, 'w') as f:
                json.dump(self.voice_registry, f, indent=2)
        except Exception as e:
            print(f"[VOICE-CLONER] Error saving registry: {e}")
    
    async def clone_voice(self, audio_file_path: str, voice_name: str = None) -> Optional[Dict[str, Any]]:
        """
        Clone voice from audio sample
        
        Args:
            audio_file_path: Path to audio file (10-30 seconds recommended)
            voice_name: Name for the cloned voice (auto-generated if None)
        
        Returns:
            Voice info dict with voice_id, name, created_at, sample_path
        """
        
        if not os.path.exists(audio_file_path):
            return {"error": f"Audio file not found: {audio_file_path}"}
        
        try:
            voice_id = voice_name or f"clone_{uuid.uuid4().hex[:8]}"
            voice_dir = self.voices_dir / voice_id
            voice_dir.mkdir(exist_ok=True)
            
            # Copy sample
            sample_dst = voice_dir / 'sample.wav'
            
            import shutil
            shutil.copy(audio_file_path, sample_dst)
            
            # If model is loaded, generate speaker embedding
            if self.model:
                try:
                    # XTTS V2 automatically generates embeddings
                    print(f"[VOICE-CLONER] Cloning voice: {voice_id}")
                except Exception as e:
                    print(f"[VOICE-CLONER] Warning processing embedding: {e}")
            
            # Register voice
            voice_info = {
                "voice_id": voice_id,
                "name": voice_name or f"Cloned Voice {len(self.voice_registry) + 1}",
                "created_at": __import__('datetime').datetime.now().isoformat(),
                "sample_path": str(sample_dst),
                "model": "xtts-v2"
            }
            
            self.voice_registry[voice_id] = voice_info
            self._save_voice_registry()
            
            print(f"[VOICE-CLONER] ✓ Voice cloned: {voice_id}")
            
            return voice_info
            
        except Exception as e:
            print(f"[VOICE-CLONER] Clone error: {e}")
            return {"error": str(e)}
    
    async def synthesize_with_cloned_voice(self, text: str, voice_id: str, language: str = "en") -> Optional[bytes]:
        """
        Synthesize speech using cloned voice
        
        Args:
            text: Text to synthesize
            voice_id: Voice ID to use
            language: Language code
        
        Returns:
            Audio bytes (WAV format)
        """
        
        if voice_id not in self.voice_registry:
            return None
        
        if not self.model:
            print(f"[VOICE-CLONER] TTS model not available")
            return None
        
        try:
            voice_info = self.voice_registry[voice_id]
            sample_path = voice_info['sample_path']
            
            # Generate speech using cloned voice
            output_path = f"/tmp/tts_output_{uuid.uuid4().hex[:8]}.wav"
            
            self.model.tts_to_file(
                text=text,
                speaker_wav=sample_path,
                language=language,
                file_path=output_path
            )
            
            # Read output
            with open(output_path, 'rb') as f:
                audio_bytes = f.read()
            
            # Clean up
            os.remove(output_path)
            
            return audio_bytes
            
        except Exception as e:
            print(f"[VOICE-CLONER] Synthesis error: {e}")
            return None
    
    def get_cloned_voices(self) -> list:
        """Get list of cloned voices"""
        return list(self.voice_registry.values())
    
    def delete_voice(self, voice_id: str) -> bool:
        """Delete a cloned voice"""
        try:
            if voice_id in self.voice_registry:
                import shutil
                voice_dir = self.voices_dir / voice_id
                if voice_dir.exists():
                    shutil.rmtree(voice_dir)
                del self.voice_registry[voice_id]
                self._save_voice_registry()
                return True
        except Exception as e:
            print(f"[VOICE-CLONER] Error deleting voice: {e}")
        
        return False

# Global instance
_cloner = None

def get_voice_cloner() -> VoiceCloner:
    """Get or create the voice cloner"""
    global _cloner
    if _cloner is None:
        _cloner = VoiceCloner()
    return _cloner
