#!/usr/bin/env python3
"""
Model GYM Agent for PAIGE
Specialized agent for fine-tuning and compressing models
Integrates with Heretic for advanced optimization
"""

import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
import uuid

@dataclass
class ModelOptimization:
    """Model optimization task"""
    task_id: str
    model_name: str
    base_model_id: str
    optimization_type: str
    status: str
    progress: int
    dataset_size: int
    target_compression: float
    created_at: str
    updated_at: str
    metrics: Dict[str, float] = None
    output_model_id: Optional[str] = None
    
    def __post_init__(self):
        if self.metrics is None:
            self.metrics = {}

class ModelGymAgent:
    """Agent for model fine-tuning and compression"""
    
    def __init__(self):
        self.gym_projects = {}
        self.gym_path = Path.home() / '.paige' / 'model_gym'
        self.gym_path.mkdir(parents=True, exist_ok=True)
        self._load_projects()
    
    def _load_projects(self):
        """Load existing gym projects"""
        index_file = self.gym_path / 'projects_index.json'
        
        if index_file.exists():
            try:
                with open(index_file) as f:
                    data = json.load(f)
                    self.gym_projects = data.get('projects', {})
            except:
                pass
    
    def _save_projects(self):
        """Save gym projects"""
        index_file = self.gym_path / 'projects_index.json'
        
        try:
            with open(index_file, 'w') as f:
                json.dump({
                    'projects': self.gym_projects,
                    'updated': datetime.now().isoformat()
                }, f, indent=2)
        except Exception as e:
            print(f"[GYM] Error saving projects: {e}")
    
    def create_project(self, name: str, base_model_id: str, description: str = None) -> Dict[str, Any]:
        """Create new model optimization project"""
        
        project_id = str(uuid.uuid4())[:8]
        
        project = {
            "project_id": project_id,
            "name": name,
            "base_model_id": base_model_id,
            "description": description or "",
            "created_at": datetime.now().isoformat(),
            "status": "planning",
            "tasks": [],
            "gallery": [],
            "metrics": {}
        }
        
        self.gym_projects[project_id] = project
        self._save_projects()
        
        return project
    
    def plan_task(self, project_id: str, optimization_type: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Plan optimization task"""
        
        if project_id not in self.gym_projects:
            return {"error": "Project not found"}
        
        task_id = str(uuid.uuid4())[:8]
        
        optimization = {
            "task_id": task_id,
            "optimization_type": optimization_type,
            "status": "planned",
            "progress": 0,
            "config": config,
            "created_at": datetime.now().isoformat()
        }
        
        self.gym_projects[project_id]['tasks'].append(optimization)
        self._save_projects()
        
        return {
            "task_id": task_id,
            "project_id": project_id,
            "optimization_type": optimization_type,
            "status": "planned",
            "estimated_time": self._estimate_time(optimization_type)
        }
    
    def _estimate_time(self, opt_type: str) -> str:
        """Estimate optimization time"""
        times = {
            "fine_tune": "2-4 hours",
            "compress": "30-60 mins",
            "quantize": "15-30 mins",
            "distill": "4-8 hours"
        }
        return times.get(opt_type, "1-2 hours")
    
    def get_projects(self) -> List[Dict[str, Any]]:
        """Get all projects"""
        return list(self.gym_projects.values())
    
    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Get specific project"""
        return self.gym_projects.get(project_id)

_gym_agent = None

def get_model_gym_agent() -> ModelGymAgent:
    """Get or create gym agent"""
    global _gym_agent
    if _gym_agent is None:
        _gym_agent = ModelGymAgent()
    return _gym_agent
