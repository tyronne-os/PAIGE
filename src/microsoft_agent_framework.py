#!/usr/bin/env python3
"""
Microsoft Agent Framework Integration for PAIGE
Enables dynamic agent creation, skill management, and orchestration
"""

import json
import asyncio
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
from abc import ABC, abstractmethod

class AgentRole(Enum):
    """Agent role types"""
    CODE_EXECUTOR = "code_executor"
    RESEARCHER = "researcher"
    DESIGNER = "designer"
    INTEGRATOR = "integrator"
    QUALITY_CHECKER = "quality_checker"
    SUPERVISOR = "supervisor"

@dataclass
class Skill:
    """Agent skill definition"""
    name: str
    description: str
    implementation: str  # Python code or reference
    version: str = "1.0.0"
    dependencies: List[str] = None
    
    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []

class BaseAgent(ABC):
    """Base agent class for Microsoft Agent Framework"""
    
    def __init__(self, agent_id: str, role: AgentRole, name: str):
        self.agent_id = agent_id
        self.role = role
        self.name = name
        self.skills: Dict[str, Skill] = {}
        self.status = "idle"
        self.completed_tasks = 0
        self.task_queue = []
        self.created_at = datetime.now().isoformat()
    
    @abstractmethod
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task"""
        pass
    
    def add_skill(self, skill: Skill) -> bool:
        """Add a skill to the agent"""
        self.skills[skill.name] = skill
        return True
    
    def remove_skill(self, skill_name: str) -> bool:
        """Remove a skill from the agent"""
        if skill_name in self.skills:
            del self.skills[skill_name]
            return True
        return False
    
    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities"""
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "role": self.role.value,
            "status": self.status,
            "skills": list(self.skills.keys()),
            "completed_tasks": self.completed_tasks,
            "created_at": self.created_at
        }

class CodeExecutor(BaseAgent):
    """Agent for code execution and system operations"""
    
    def __init__(self, agent_id: str, name: str = "CodeExecutor"):
        super().__init__(agent_id, AgentRole.CODE_EXECUTOR, name)
        self._init_default_skills()
    
    def _init_default_skills(self):
        """Initialize default skills for code executor"""
        skills = [
            Skill(
                name="python_execution",
                description="Execute Python code safely",
                implementation="exec_python"
            ),
            Skill(
                name="bash_execution",
                description="Execute bash commands",
                implementation="exec_bash"
            ),
            Skill(
                name="git_control",
                description="Manage git operations",
                implementation="git_ops"
            ),
            Skill(
                name="file_management",
                description="Read/write files",
                implementation="file_ops"
            )
        ]
        for skill in skills:
            self.add_skill(skill)
    
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute code task"""
        self.status = "executing"
        
        try:
            code = task.get('code', '')
            language = task.get('language', 'python')
            
            result = await self._run_code(code, language)
            self.completed_tasks += 1
            
            return {
                "status": "success",
                "result": result,
                "task_id": task.get('task_id')
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "task_id": task.get('task_id')
            }
        finally:
            self.status = "idle"
    
    async def _run_code(self, code: str, language: str) -> str:
        """Run code in specified language"""
        if language == "python":
            # Simulate code execution
            return f"Executed: {code[:50]}..."
        elif language == "bash":
            # Simulate bash execution
            return f"Command: {code[:50]}..."
        return "Unknown language"

class Researcher(BaseAgent):
    """Agent for research and information gathering"""
    
    def __init__(self, agent_id: str, name: str = "Researcher"):
        super().__init__(agent_id, AgentRole.RESEARCHER, name)
        self._init_default_skills()
    
    def _init_default_skills(self):
        """Initialize default skills for researcher"""
        skills = [
            Skill(
                name="web_search",
                description="Search the web for information",
                implementation="web_search"
            ),
            Skill(
                name="document_analysis",
                description="Analyze and summarize documents",
                implementation="analyze_docs"
            ),
            Skill(
                name="data_extraction",
                description="Extract structured data from sources",
                implementation="extract_data"
            )
        ]
        for skill in skills:
            self.add_skill(skill)
    
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute research task"""
        self.status = "executing"
        
        try:
            query = task.get('query', '')
            
            result = await self._research(query)
            self.completed_tasks += 1
            
            return {
                "status": "success",
                "findings": result,
                "task_id": task.get('task_id')
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "task_id": task.get('task_id')
            }
        finally:
            self.status = "idle"
    
    async def _research(self, query: str) -> Dict[str, Any]:
        """Perform research"""
        return {
            "query": query,
            "results": f"Research findings for: {query}",
            "sources": 5
        }

class Designer(BaseAgent):
    """Agent for design and creative tasks"""
    
    def __init__(self, agent_id: str, name: str = "Designer"):
        super().__init__(agent_id, AgentRole.DESIGNER, name)
        self._init_default_skills()
    
    def _init_default_skills(self):
        """Initialize default skills for designer"""
        skills = [
            Skill(
                name="asset_generation",
                description="Generate design assets",
                implementation="gen_assets"
            ),
            Skill(
                name="layout_design",
                description="Design layouts and compositions",
                implementation="design_layout"
            ),
            Skill(
                name="style_guide",
                description="Create and apply style guides",
                implementation="create_style"
            )
        ]
        for skill in skills:
            self.add_skill(skill)
    
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute design task"""
        self.status = "executing"
        
        try:
            requirement = task.get('requirement', '')
            
            result = await self._design(requirement)
            self.completed_tasks += 1
            
            return {
                "status": "success",
                "design": result,
                "task_id": task.get('task_id')
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "task_id": task.get('task_id')
            }
        finally:
            self.status = "idle"
    
    async def _design(self, requirement: str) -> Dict[str, Any]:
        """Create design"""
        return {
            "requirement": requirement,
            "design": "Generated design assets",
            "format": "SVG"
        }

class InstantAgentBuilder:
    """Microsoft Agent Framework: Instant Agent Builder
    Dynamically creates specialized agents on-demand
    """
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_counter = 0
        self.skill_library = self._init_skill_library()
    
    def _init_skill_library(self) -> Dict[str, Skill]:
        """Initialize global skill library"""
        return {
            "python_execution": Skill(
                name="python_execution",
                description="Execute Python code safely",
                implementation="exec_python"
            ),
            "web_search": Skill(
                name="web_search",
                description="Search the web for information",
                implementation="web_search"
            ),
            "asset_generation": Skill(
                name="asset_generation",
                description="Generate design assets",
                implementation="gen_assets"
            ),
        }
    
    async def create_agent(self, role: AgentRole, name: str = None, 
                          skills: List[str] = None) -> Optional[BaseAgent]:
        """
        Instantly create an agent with specified role and skills
        """
        
        agent_id = f"{role.value}_{self.agent_counter}"
        self.agent_counter += 1
        
        print(f"[INSTANT-BUILDER] Creating agent: {agent_id}")
        
        # Create agent based on role
        if role == AgentRole.CODE_EXECUTOR:
            agent = CodeExecutor(agent_id, name or "CodeExecutor")
        elif role == AgentRole.RESEARCHER:
            agent = Researcher(agent_id, name or "Researcher")
        elif role == AgentRole.DESIGNER:
            agent = Designer(agent_id, name or "Designer")
        else:
            agent = BaseAgent(agent_id, role, name or "Agent")
        
        # Add custom skills if provided
        if skills:
            for skill_name in skills:
                if skill_name in self.skill_library:
                    agent.add_skill(self.skill_library[skill_name])
        
        # Store agent
        self.agents[agent_id] = agent
        
        print(f"[INSTANT-BUILDER] ✓ Agent {agent_id} created with {len(agent.skills)} skills")
        return agent
    
    async def assign_task(self, agent_id: str, task: Dict[str, Any]) -> Dict[str, Any]:
        """Assign task to agent"""
        
        if agent_id not in self.agents:
            return {"error": f"Agent {agent_id} not found"}
        
        agent = self.agents[agent_id]
        result = await agent.execute_task(task)
        
        return result
    
    def get_agent_status(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent status"""
        
        if agent_id not in self.agents:
            return None
        
        return self.agents[agent_id].get_capabilities()
    
    def list_agents(self) -> List[Dict[str, Any]]:
        """List all agents"""
        return [agent.get_capabilities() for agent in self.agents.values()]
    
    def remove_agent(self, agent_id: str) -> bool:
        """Remove an agent"""
        if agent_id in self.agents:
            del self.agents[agent_id]
            return True
        return False

# Global instance
_builder = None

def get_instant_agent_builder() -> InstantAgentBuilder:
    """Get or create the global Instant Agent Builder"""
    global _builder
    if _builder is None:
        _builder = InstantAgentBuilder()
    return _builder

if __name__ == "__main__":
    # Demo
    async def demo():
        builder = InstantAgentBuilder()
        
        # Create agents
        code_agent = await builder.create_agent(
            AgentRole.CODE_EXECUTOR,
            "CodeRunner",
            ["python_execution", "bash_execution"]
        )
        
        researcher = await builder.create_agent(
            AgentRole.RESEARCHER,
            "DataExplorer",
            ["web_search", "document_analysis"]
        )
        
        designer = await builder.create_agent(
            AgentRole.DESIGNER,
            "UIArtist",
            ["asset_generation", "layout_design"]
        )
        
        print("\n=== AGENT POOL ===")
        for agent_info in builder.list_agents():
            print(json.dumps(agent_info, indent=2))
        
        # Execute a task
        if code_agent:
            result = await builder.assign_task(
                code_agent.agent_id,
                {"task_id": "test_001", "code": "print('Hello from agent')", "language": "python"}
            )
            print(f"\nTask Result: {json.dumps(result, indent=2)}")
    
    asyncio.run(demo())
