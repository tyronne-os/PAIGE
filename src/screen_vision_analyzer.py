#!/usr/bin/env python3
"""
Screen Vision Analyzer for PAIGE
Uses LLaVA-NeXT (lightweight vision model) on HF free GPU to analyze screenshots
"""

import base64
import json
from typing import Dict, Any, Optional
from pathlib import Path
from io import BytesIO
from PIL import Image
import asyncio

class ScreenVisionAnalyzer:
    """Analyzes screenshots using vision model on free HF GPU"""
    
    def __init__(self, model_name: str = "llava-hf/llava-1.5-7b-hf"):
        self.model_name = model_name
        self.model = None
        self.processor = None
        self.initialize_model()
    
    def initialize_model(self):
        """Load LLaVA vision model (works on HF free GPU)"""
        try:
            from transformers import AutoProcessor, LlavaForConditionalGeneration
            import torch
            
            print(f"[VISION] Loading {self.model_name}...")
            
            self.processor = AutoProcessor.from_pretrained(
                self.model_name,
                trust_remote_code=True
            )
            
            self.model = LlavaForConditionalGeneration.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16,
                device_map="auto",
                trust_remote_code=True
            )
            
            print(f"[VISION] ✓ Model loaded successfully")
        except Exception as e:
            print(f"[VISION] Error loading model: {e}")
            self.model = None
    
    async def analyze_screen(self, image_data: str, custom_instructions: str = "") -> Dict[str, Any]:
        """
        Analyze a screenshot
        
        Args:
            image_data: Base64 encoded image
            custom_instructions: Context about what to focus on
        
        Returns:
            Analysis with description, elements, focus area, confidence
        """
        
        try:
            # Decode image
            image_bytes = base64.b64decode(image_data.split(',')[1] if ',' in image_data else image_data)
            image = Image.open(BytesIO(image_bytes))
            
            # Build prompt
            base_prompt = """Analyze this UI screenshot. Provide:
1. A brief description of what's shown
2. Number of major UI elements
3. The main focus area
4. Your confidence in the analysis (0-1)

Focus on understanding the user's current work context."""
            
            prompt = f"{base_prompt}\n\nContext: {custom_instructions}" if custom_instructions else base_prompt
            
            # Process image
            if self.model is None:
                return self._mock_analysis(image, prompt)
            
            # Generate analysis
            inputs = self.processor(
                text=prompt,
                images=image,
                return_tensors="pt"
            )
            
            # Move to GPU if available
            device = next(self.model.parameters()).device
            inputs = {k: v.to(device) if hasattr(v, 'to') else v for k, v in inputs.items()}
            
            # Generate
            output = self.model.generate(
                **inputs,
                max_new_tokens=256,
                do_sample=True,
                temperature=0.7
            )
            
            # Decode response
            response_text = self.processor.decode(output[0], skip_special_tokens=True)
            
            # Parse response
            analysis = self._parse_analysis(response_text, image)
            
            return analysis
            
        except Exception as e:
            print(f"[VISION] Analysis error: {e}")
            return self._error_analysis(str(e))
    
    def _parse_analysis(self, response: str, image: Image) -> Dict[str, Any]:
        """Parse model response into structured data"""
        
        lines = response.split('\n')
        description = lines[0] if lines else "UI Analysis"
        
        # Extract element count (heuristic)
        element_count = len([line for line in lines if any(c.isalnum() for c in line)]) * 2
        
        # Determine focus area
        focus_area = "General UI"
        if "button" in response.lower():
            focus_area = "Button/Control Area"
        elif "chart" in response.lower() or "graph" in response.lower():
            focus_area = "Data Visualization"
        elif "form" in response.lower() or "input" in response.lower():
            focus_area = "Form Input"
        elif "menu" in response.lower() or "navigation" in response.lower():
            focus_area = "Navigation"
        elif "code" in response.lower() or "editor" in response.lower():
            focus_area = "Code Editor"
        
        # Estimate confidence
        confidence = 0.85 if image.size[0] > 400 else 0.65
        
        return {
            "description": description[:200],
            "elementCount": min(element_count, 50),
            "focusArea": focus_area,
            "confidence": confidence,
            "fullResponse": response[:500]
        }
    
    def _mock_analysis(self, image: Image, prompt: str) -> Dict[str, Any]:
        """Mock analysis for when model isn't loaded"""
        
        width, height = image.size
        
        return {
            "description": f"Screenshot of {width}x{height} UI",
            "elementCount": 8,
            "focusArea": "General UI",
            "confidence": 0.6,
            "fullResponse": "Vision model not loaded - using mock analysis"
        }
    
    def _error_analysis(self, error: str) -> Dict[str, Any]:
        """Return error analysis"""
        
        return {
            "description": "Error analyzing screen",
            "elementCount": 0,
            "focusArea": "Error",
            "confidence": 0,
            "error": error
        }

# Global instance
_analyzer = None

def get_screen_vision_analyzer() -> ScreenVisionAnalyzer:
    """Get or create the screen vision analyzer"""
    global _analyzer
    if _analyzer is None:
        _analyzer = ScreenVisionAnalyzer()
    return _analyzer
