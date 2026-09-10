#!/usr/bin/env python3
"""
PAIGE Voice Agent with Microsoft Agent Framework Integration
Enhanced voice controller that uses Instant Agent Builder for dynamic agent creation
"""

import json
import asyncio
from typing import Optional, Dict, List, Any
from pathlib import Path
import subprocess
import re
from datetime import datetime

from microsoft_agent_framework import (
    get_instant_agent_builder,
    AgentRole,
    Skill
)
from voice_agent_controller import VoiceAgentController, SpecFlow

class EnhancedVoiceAgent(VoiceAgentController):
    """Voice agent enhanced with Microsoft Agent Framework"""
    
    def __init__(self, model_name: str = "gemma-2b-uncensored"):
        super().__init__(model_name)
        self.agent_builder = get_instant_agent_builder()
        self.active_workflows = {}
    
    async def check_workload_and_scale_agents(self, required_agents: List[str]) -> Dict[str, Any]:
        """
        Enhanced workload checking using Microsoft Agent Framework
        Creates agents dynamically via Instant Agent Builder
        """
        
        current_agents = len(self.agent_builder.agents)
        required_count = len(required_agents)
        
        print(f"[AGENTS] Current pool: {current_agents}, Required: {required_count}")
        
        new_agents = []
        
        # Map agent types to roles
        role_mapping = {
            "code_executor": AgentRole.CODE_EXECUTOR,
            "researcher": AgentRole.RESEARCHER,
            "designer": AgentRole.DESIGNER,
            "integrator": AgentRole.CODE_EXECUTOR,  # Specialized code executor
            "quality_checker": AgentRole.CODE_EXECUTOR,  # Testing-focused code executor
        }
        
        # Create missing agents
        for agent_type in required_agents:
            if agent_type not in self.agent_builder.agents:
                role = role_mapping.get(agent_type, AgentRole.CODE_EXECUTOR)
                
                # Use Instant Agent Builder
                agent = await self.agent_builder.create_agent(
                    role=role,
                    name=agent_type,
                    skills=self._get_skills_for_agent_type(agent_type)
                )
                
                if agent:
                    self.agent_pool[agent.agent_id] = agent
                    new_agents.append(agent.agent_id)
        
        return {
            "current_pool_size": len(self.agent_builder.agents),
            "agents_created": new_agents,
            "total_agents": len(self.agent_builder.agents),
            "agent_roles": [agent.role.value for agent in self.agent_builder.agents.values()]
        }
    
    def _get_skills_for_agent_type(self, agent_type: str) -> List[str]:
        """Get skills for a given agent type"""
        
        skill_mapping = {
            "code_executor": ["python_execution", "bash_execution", "git_control", "file_management"],
            "researcher": ["web_search", "document_analysis", "data_extraction"],
            "designer": ["asset_generation", "layout_design", "style_guide"],
            "integrator": ["api_gateway", "webhook_handler", "data_mapping"],
            "quality_checker": ["testing", "validation", "performance_analysis"]
        }
        
        return skill_mapping.get(agent_type, [])
    
    async def execute_workflow(self, spec_flow: SpecFlow) -> Dict[str, Any]:
        """
        Execute workflow with agent framework orchestration
        """
        
        print(f"[WORKFLOW] Executing {spec_flow.task_id} with agent framework")
        print(f"[WORKFLOW] Assigned agents: {spec_flow.assigned_agents}")
        
        results = {}
        workflow_data = {
            "task_id": spec_flow.task_id,
            "started_at": datetime.now().isoformat(),
            "agents": spec_flow.assigned_agents,
            "steps": []
        }
        
        # Execute workflow steps with framework agents
        for step_num, agent_type in enumerate(spec_flow.assigned_agents, 1):
            try:
                # Find agent in builder
                agent = self._find_agent_by_type(agent_type)
                
                if not agent:
                    print(f"[WORKFLOW] Agent {agent_type} not found, creating...")
                    role_mapping = {
                        "code_executor": AgentRole.CODE_EXECUTOR,
                        "researcher": AgentRole.RESEARCHER,
                        "designer": AgentRole.DESIGNER,
                    }
                    role = role_mapping.get(agent_type, AgentRole.CODE_EXECUTOR)
                    agent = await self.agent_builder.create_agent(role, agent_type)
                
                if agent:
                    # Assign task to agent
                    task = {
                        "task_id": f"{spec_flow.task_id}_step_{step_num}",
                        "step": step_num,
                        "spec": spec_flow.spec,
                        "context_refs": spec_flow.context_refs
                    }
                    
                    result = await self.agent_builder.assign_task(agent.agent_id, task)
                    
                    workflow_data["steps"].append({
                        "step": step_num,
                        "agent": agent.agent_id,
                        "status": result.get("status", "unknown"),
                        "result": result
                    })
                    
                    results[f"step_{step_num}"] = result
            
            except Exception as e:
                print(f"[WORKFLOW] Step {step_num} error: {e}")
                workflow_data["steps"].append({
                    "step": step_num,
                    "status": "failed",
                    "error": str(e)
                })
        
        workflow_data["completed_at"] = datetime.now().isoformat()
        self.active_workflows[spec_flow.task_id] = workflow_data
        
        return {
            "status": "completed",
            "task_id": spec_flow.task_id,
            "workflow": workflow_data,
            "results": results,
            "agent_pool_size": len(self.agent_builder.agents)
        }
    
    def _find_agent_by_type(self, agent_type: str) -> Optional[Any]:
        """Find an agent by type in the builder pool"""
        
        for agent in self.agent_builder.agents.values():
            if agent_type in agent.name.lower() or agent_type == agent.role.value:
                if agent.status == "idle" or agent.completed_tasks < agent.completed_tasks + 5:
                    return agent
        
        return None
    
    async def get_team_status(self) -> Dict[str, Any]:
        """Get full team status including all agents"""
        
        agents = self.agent_builder.list_agents()
        
        return {
            "total_agents": len(agents),
            "agents": agents,
            "active_workflows": list(self.active_workflows.keys()),
            "timestamp": datetime.now().isoformat()
        }
    
    async def conversate_with_framework(self, user_input: str) -> Dict[str, Any]:
        """
        Full conversation with Microsoft Agent Framework integration
        """
        
        print(f"\n[PAIGE-VOICE-FRAMEWORK] {user_input}\n")
        
        # Generate spec
        spec_flow = await self.generate_spec_and_flow(user_input)
        if not spec_flow:
            return {"error": "Failed to generate spec"}
        
        # Scale agents using framework
        scale_result = await self.check_workload_and_scale_agents(spec_flow.assigned_agents)
        
        # Execute with framework
        workflow_result = await self.execute_workflow(spec_flow)
        
        # Get team status
        team_status = await self.get_team_status()
        
        response_text = f"""
✓ Workflow created and executed

**Task ID:** {spec_flow.task_id}
**Status:** {workflow_result.get('status', 'executing')}

**Agents Created:** {len(scale_result['agents_created'])}
**Total Team Size:** {team_status['total_agents']}

**Assigned Agents:**
{json.dumps(spec_flow.assigned_agents, indent=2)}

**Workflow Diagram:**
{spec_flow.workflow_diagram}

**Execution Status:**
{json.dumps(workflow_result.get('workflow', {}), indent=2)}
"""
        
        # Generate voice response
        voice_bytes = await self.generate_voice_response(response_text)
        
        return {
            "task_id": spec_flow.task_id,
            "text_response": response_text,
            "voice_response": voice_bytes.hex() if voice_bytes else None,
            "workflow_diagram": spec_flow.workflow_diagram,
            "agents_used": spec_flow.assigned_agents,
            "team_status": team_status,
            "execution_result": workflow_result
        }

# Global instance
_enhanced_voice_agent = None

def get_enhanced_voice_agent() -> EnhancedVoiceAgent:
    """Get or create the enhanced voice agent"""
    global _enhanced_voice_agent
    if _enhanced_voice_agent is None:
        _enhanced_voice_agent = EnhancedVoiceAgent()
    return _enhanced_voice_agent

if __name__ == "__main__":
    async def demo():
        agent = EnhancedVoiceAgent()
        
        # Test conversation
        response = await agent.conversate_with_framework(
            "Build a 3D avatar system with animation, physics, and real-time interaction"
        )
        
        print("\n=== RESPONSE ===")
        print(response["text_response"])
        print(f"\n=== TEAM STATUS ===")
        print(json.dumps(response["team_status"], indent=2))
    
    asyncio.run(demo())
