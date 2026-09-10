#!/usr/bin/env python3
"""
PAIGE Voice Agent Controller
Gemma-based voice agent with computer use control, spec generation, and dynamic agent creation
"""

import json
import asyncio
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict
from pathlib import Path
from datetime import datetime
import subprocess
import re

@dataclass
class SpecFlow:
    """Generated specification and workflow"""
    task_id: str
    description: str
    spec: Dict[str, Any]
    workflow_diagram: str  # ASCII or Mermaid diagram
    assigned_agents: List[str]
    context_refs: List[str]
    created_at: str

class VoiceAgentController:
    """Main voice agent orchestrator with computer use capabilities"""
    
    def __init__(self, model_name: str = "gemma-2b-uncensored"):
        self.model_name = model_name
        self.voice_model = None
        self.agent_pool = {}  # Dynamic agents created via Instant Agent Builder
        self.spec_history = []
        self.workflow_engine = WorkflowEngine()
        self.initialize_voice_model()
    
    def initialize_voice_model(self):
        """Initialize Gemma voice model"""
        try:
            # Try to load locally first
            from transformers import AutoModelForCausalLM, AutoTokenizer
            print(f"[VOICE] Loading {self.model_name}...")
            self.tokenizer = AutoTokenizer.from_pretrained(
                f"google/{self.model_name}",
                trust_remote_code=True
            )
            self.voice_model = AutoModelForCausalLM.from_pretrained(
                f"google/{self.model_name}",
                device_map="auto",
                torch_dtype="auto",
                trust_remote_code=True
            )
            print(f"[VOICE] ✓ {self.model_name} loaded successfully")
        except Exception as e:
            print(f"[VOICE] Error loading model: {e}")
            self.voice_model = None
    
    async def process_voice_input(self, audio_bytes: bytes, language: str = "en") -> str:
        """
        Convert voice input to text (STT)
        """
        try:
            # Use OpenAI Whisper or local STT
            import librosa
            import numpy as np
            
            # Load audio
            y, sr = librosa.load(audio_bytes, sr=16000)
            
            # Use Whisper for transcription
            from transformers import pipeline
            whisper = pipeline("automatic-speech-recognition", model="openai/whisper-small")
            result = whisper({"sampling_rate": sr, "raw": y})
            return result["text"]
        except Exception as e:
            print(f"[VOICE] STT Error: {e}")
            return ""
    
    async def generate_spec_and_flow(self, user_request: str) -> SpecFlow:
        """
        Convert user request into spec, workflow diagram, and agent assignments
        Uses prompt specialization to extract structured data
        """
        
        spec_prompt = f"""Analyze this request and generate a structured spec with workflow:
REQUEST: {user_request}

RETURN VALID JSON with:
{{
  "task_description": "Clear task summary",
  "spec": {{
    "inputs": ["list of inputs"],
    "outputs": ["list of outputs"],
    "constraints": ["any constraints"],
    "timeline": "estimated duration"
  }},
  "workflow_steps": [
    {{"step": 1, "action": "description", "agent": "agent_type"}},
    {{"step": 2, "action": "description", "agent": "agent_type"}}
  ],
  "required_agents": ["agent1", "agent2"],
  "context_refs": ["reference_doc", "api_spec", "example_code"],
  "diagram": "graph LR\\n  A[Step1]-->B[Step2]\\n  B-->C[Output]"
}}"""
        
        try:
            if self.voice_model:
                inputs = self.tokenizer(spec_prompt, return_tensors="pt")
                outputs = self.voice_model.generate(
                    **inputs,
                    max_length=1500,
                    temperature=0.7,
                    do_sample=True
                )
                response_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            else:
                # Fallback to API-based generation
                response_text = await self._call_api_for_spec(spec_prompt)
            
            # Parse JSON from response
            spec_data = self._extract_json(response_text)
            
            task_id = f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            spec_flow = SpecFlow(
                task_id=task_id,
                description=spec_data.get("task_description", ""),
                spec=spec_data.get("spec", {}),
                workflow_diagram=spec_data.get("diagram", ""),
                assigned_agents=spec_data.get("required_agents", []),
                context_refs=spec_data.get("context_refs", []),
                created_at=datetime.now().isoformat()
            )
            
            self.spec_history.append(spec_flow)
            return spec_flow
            
        except Exception as e:
            print(f"[VOICE] Spec generation error: {e}")
            return None
    
    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extract JSON from LLM response"""
        try:
            # Find JSON block
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        return {}
    
    async def _call_api_for_spec(self, prompt: str) -> str:
        """Fallback to API-based spec generation"""
        # This would call OpenAI or other API
        return ""
    
    async def check_workload_and_scale_agents(self, required_agents: List[str]) -> Dict[str, Any]:
        """
        Check current agent pool capacity
        Use Instant Agent Builder to create agents if needed
        """
        
        current_agents = len(self.agent_pool)
        required_count = len(required_agents)
        new_agents = []
        
        print(f"[AGENTS] Current pool: {current_agents}, Required: {required_count}")
        
        if required_count > current_agents:
            agents_to_create = required_count - current_agents
            print(f"[AGENTS] Scaling up by {agents_to_create}...")
            
            for i in range(agents_to_create):
                agent = await self._instant_create_agent(
                    required_agents[current_agents + i]
                )
                if agent:
                    self.agent_pool[agent['name']] = agent
                    new_agents.append(agent['name'])
        
        return {
            "current_pool_size": len(self.agent_pool),
            "agents_created": new_agents,
            "total_agents": len(self.agent_pool)
        }
    
    async def _instant_create_agent(self, agent_type: str) -> Optional[Dict[str, Any]]:
        """
        Microsoft Agent Framework: Instant Agent Builder
        Dynamically creates specialized agents with skill equipping
        """
        
        print(f"[INSTANT-BUILDER] Creating {agent_type} agent...")
        
        # Agent archetype to skills mapping
        skill_sets = {
            "code_executor": ["python_exec", "bash_exec", "git_control"],
            "researcher": ["web_search", "doc_analysis", "summarization"],
            "designer": ["figma_api", "asset_generation", "layout_design"],
            "integrator": ["api_gateway", "webhook_handler", "data_mapping"],
            "quality_checker": ["testing", "validation", "performance_analysis"]
        }
        
        skills = skill_sets.get(agent_type, ["general"])
        
        agent_config = {
            "name": f"{agent_type}_{len(self.agent_pool) + 1}",
            "type": agent_type,
            "created_at": datetime.now().isoformat(),
            "skills": skills,
            "status": "active",
            "capacity": 10,  # Tasks it can handle
            "completed_tasks": 0
        }
        
        # Equip with skills from product PDFs if available
        if Path(f"/home/hunt/Downloads/PAIGE/skills/{agent_type}_skills.pdf").exists():
            agent_config["skill_pdf"] = f"/home/hunt/Downloads/PAIGE/skills/{agent_type}_skills.pdf"
        
        print(f"[INSTANT-BUILDER] ✓ {agent_config['name']} created with {len(skills)} skills")
        return agent_config
    
    async def execute_workflow(self, spec_flow: SpecFlow) -> Dict[str, Any]:
        """
        Execute the workflow with assigned agents
        Uses WorkflowEngine to coordinate execution
        """
        
        print(f"[WORKFLOW] Executing {spec_flow.task_id}...")
        print(f"[WORKFLOW] Diagram:\n{spec_flow.workflow_diagram}")
        
        result = await self.workflow_engine.execute(
            task_id=spec_flow.task_id,
            spec=spec_flow.spec,
            agents=self.agent_pool,
            context_refs=spec_flow.context_refs
        )
        
        return result
    
    async def generate_voice_response(self, text: str) -> bytes:
        """
        Convert text response to speech (TTS)
        Using local Gemma voice or fallback TTS
        """
        try:
            # Try to use Piper TTS or system speech
            result = subprocess.run(
                ["piper", "--model", "en_US-hfc_female-medium", "--output_file", "/tmp/voice.wav"],
                input=text.encode(),
                capture_output=True,
                timeout=10
            )
            
            if result.returncode == 0:
                with open("/tmp/voice.wav", "rb") as f:
                    return f.read()
        except:
            pass
        
        # Fallback to system speech
        try:
            subprocess.run(["say", text], timeout=10, check=True)
        except:
            print(f"[VOICE] TTS unavailable")
        
        return b""
    
    async def conversate(self, user_input: str) -> Dict[str, Any]:
        """
        Full bidirectional conversation flow:
        1. Receive user input (text or voice)
        2. Generate spec + workflow
        3. Scale agents if needed
        4. Execute workflow
        5. Return response (text + voice + diagram)
        """
        
        print(f"\n[PAIGE-VOICE] Received: {user_input}\n")
        
        # Step 1: Generate spec
        spec_flow = await self.generate_spec_and_flow(user_input)
        if not spec_flow:
            return {"error": "Failed to generate spec"}
        
        # Step 2: Check and scale agents
        scale_result = await self.check_workload_and_scale_agents(spec_flow.assigned_agents)
        
        # Step 3: Execute workflow
        workflow_result = await self.execute_workflow(spec_flow)
        
        # Step 4: Generate response
        response_text = f"""
Understood. I've created a workflow for your task:

**Task ID:** {spec_flow.task_id}
**Status:** {workflow_result.get('status', 'executing')}

**Workflow:**
{spec_flow.workflow_diagram}

**Assigned Agents:** {', '.join(spec_flow.assigned_agents)}
**New Agents Created:** {scale_result['agents_created']}

**Results:**
{json.dumps(workflow_result.get('results', {}), indent=2)}
"""
        
        # Generate voice response
        voice_bytes = await self.generate_voice_response(response_text)
        
        return {
            "task_id": spec_flow.task_id,
            "text_response": response_text,
            "voice_response": voice_bytes.hex() if voice_bytes else None,
            "workflow_diagram": spec_flow.workflow_diagram,
            "agents_used": spec_flow.assigned_agents,
            "execution_result": workflow_result
        }


class WorkflowEngine:
    """Executes workflows with agent coordination"""
    
    async def execute(self, task_id: str, spec: Dict[str, Any], 
                     agents: Dict[str, Any], context_refs: List[str]) -> Dict[str, Any]:
        """Execute workflow steps with agent assignment"""
        
        print(f"[WORKFLOW-ENGINE] Executing {task_id}")
        
        results = {}
        
        # Simulate workflow execution
        for step_num, agent_name in enumerate(agents.keys(), 1):
            print(f"[WORKFLOW] Step {step_num}: {agent_name}")
            
            # Assign work to agent
            task_result = await self._execute_step(task_id, agent_name, spec)
            results[f"step_{step_num}"] = task_result
        
        return {
            "status": "completed",
            "task_id": task_id,
            "results": results,
            "completed_at": datetime.now().isoformat()
        }
    
    async def _execute_step(self, task_id: str, agent_name: str, spec: Dict[str, Any]) -> Dict[str, Any]:
        """Execute single workflow step"""
        
        # Simulate agent work
        await asyncio.sleep(0.5)
        
        return {
            "agent": agent_name,
            "task_id": task_id,
            "status": "completed",
            "output": f"Step output from {agent_name}"
        }


# Global instance
_voice_controller = None

def get_voice_agent_controller() -> VoiceAgentController:
    """Get or create voice agent controller"""
    global _voice_controller
    if _voice_controller is None:
        _voice_controller = VoiceAgentController()
    return _voice_controller

if __name__ == "__main__":
    # Demo
    import sys
    
    async def demo():
        controller = VoiceAgentController()
        
        user_request = "Build a 3D digital human model with animation, texturing, and interactive chat"
        response = await controller.conversate(user_request)
        
        print("\n=== RESPONSE ===")
        print(response["text_response"])
        print(f"\nWorkflow Diagram:\n{response['workflow_diagram']}")
        print(f"Agents Used: {', '.join(response['agents_used'])}")
    
    asyncio.run(demo())
