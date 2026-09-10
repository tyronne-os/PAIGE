#!/usr/bin/env python3
"""
Token Vault Manager for PAIGE
Securely manages HF, Git, CUDA, NVIDIA credentials
"""

import os
import json
from pathlib import Path
from typing import Optional, Dict, Any
import subprocess

class TokenVaultManager:
    """Manages secure token access for PAIGE integrations"""
    
    def __init__(self):
        self.vault_file = Path.home() / '.paige' / 'credentials.json'
        self.vault_file.parent.mkdir(exist_ok=True)
        self.tokens: Dict[str, str] = {}
        self._load_tokens()
    
    def _load_tokens(self):
        """Load tokens from kiro vault via CLI"""
        tokens_needed = {
            'huggingface': 'huggingface',
            'github': 'github',
            'nvidia': 'nvidia',
            'openai': 'openai',
        }
        
        for key, provider in tokens_needed.items():
            token = self._get_token_from_vault(provider)
            if token:
                self.tokens[key] = token
    
    def _get_token_from_vault(self, provider: str) -> Optional[str]:
        """Retrieve token from kiro vault"""
        try:
            # Try to get from environment first
            env_var = f"{provider.upper()}_TOKEN"
            if env_var in os.environ:
                return os.environ[env_var]
            
            # Try kiro vault if available
            result = subprocess.run(
                ['kiro', 'vault', 'get', provider],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception as e:
            print(f"[PAIGE] Warning: Could not retrieve {provider} token: {e}")
        
        return None
    
    def get_hf_token(self) -> Optional[str]:
        """Get HuggingFace token"""
        return self.tokens.get('huggingface')
    
    def get_github_token(self) -> Optional[str]:
        """Get GitHub token"""
        return self.tokens.get('github')
    
    def get_nvidia_token(self) -> Optional[str]:
        """Get NVIDIA token"""
        return self.tokens.get('nvidia')
    
    def get_openai_token(self) -> Optional[str]:
        """Get OpenAI token"""
        return self.tokens.get('openai')
    
    def get_env_config(self) -> Dict[str, str]:
        """Get environment configuration for subprocesses"""
        env = os.environ.copy()
        
        if hf_token := self.get_hf_token():
            env['HF_TOKEN'] = hf_token
        if gh_token := self.get_github_token():
            env['GITHUB_TOKEN'] = gh_token
        if nv_token := self.get_nvidia_token():
            env['NVIDIA_API_KEY'] = nv_token
        if oai_token := self.get_openai_token():
            env['OPENAI_API_KEY'] = oai_token
        
        return env
    
    def to_dict(self, mask: bool = True) -> Dict[str, Any]:
        """Export as dict (optionally masked for UI)"""
        if mask:
            return {
                'huggingface': '✓' if self.get_hf_token() else '✗',
                'github': '✓' if self.get_github_token() else '✗',
                'nvidia': '✓' if self.get_nvidia_token() else '✗',
                'openai': '✓' if self.get_openai_token() else '✗',
            }
        else:
            return {
                'huggingface': self.get_hf_token()[:10] + '...' if self.get_hf_token() else None,
                'github': self.get_github_token()[:10] + '...' if self.get_github_token() else None,
                'nvidia': self.get_nvidia_token()[:10] + '...' if self.get_nvidia_token() else None,
                'openai': self.get_openai_token()[:10] + '...' if self.get_openai_token() else None,
            }

# Global instance
_token_manager = None

def get_token_manager() -> TokenVaultManager:
    """Get or create the global token manager"""
    global _token_manager
    if _token_manager is None:
        _token_manager = TokenVaultManager()
    return _token_manager
