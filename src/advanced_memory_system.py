#!/usr/bin/env python3
"""
Advanced Memory System for PAIGE
Persistent memory across projects with HuggingFace storage
"""

import json
import hashlib
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
import uuid

@dataclass
class ProjectSession:
    """Session tracking across projects"""
    session_id: str
    project_id: str
    started_at: str
    ended_at: Optional[str] = None
    interactions: int = 0
    key_decisions: List[str] = None
    
    def __post_init__(self):
        if self.key_decisions is None:
            self.key_decisions = []

class AdvancedMemorySystem:
    """Advanced memory management with cross-project persistence"""
    
    def __init__(self, storage_path: str = None):
        self.storage_path = Path(storage_path or Path.home() / '.paige' / 'advanced_memory')
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        self.project_index = self._load_project_index()
        self.memory_embeddings = {}
        self.session_cache = {}
        self.hf_sync_status = {}
    
    def _load_project_index(self) -> Dict[str, Any]:
        """Load project memory index"""
        index_path = self.storage_path / 'project_index.json'
        
        if index_path.exists():
            try:
                with open(index_path) as f:
                    return json.load(f)
            except:
                pass
        
        return {}
    
    def _save_project_index(self):
        """Save project index"""
        index_path = self.storage_path / 'project_index.json'
        
        try:
            with open(index_path, 'w') as f:
                json.dump(self.project_index, f, indent=2)
        except Exception as e:
            print(f"[MEMORY] Error saving index: {e}")
    
    def create_project_memory_space(self, project_id: str, metadata: Dict = None) -> Dict[str, Any]:
        """
        Create dedicated memory space for a project
        """
        
        if project_id in self.project_index:
            return {"error": f"Project {project_id} already exists"}
        
        project_data = {
            "project_id": project_id,
            "created_at": datetime.now().isoformat(),
            "sessions": [],
            "interaction_count": 0,
            "key_learnings": [],
            "technical_decisions": [],
            "metadata": metadata or {},
            "memory_format": "graph_tree"
        }
        
        self.project_index[project_id] = project_data
        self._save_project_index()
        
        # Create project-specific storage
        project_dir = self.storage_path / project_id
        project_dir.mkdir(exist_ok=True)
        
        return project_data
    
    def add_interaction(self, project_id: str, session_id: str, interaction: Dict) -> Dict[str, Any]:
        """
        Add interaction to project memory
        """
        
        if project_id not in self.project_index:
            self.create_project_memory_space(project_id)
        
        # Create interaction record
        interaction_record = {
            "interaction_id": str(uuid.uuid4()),
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "user_input": interaction.get("user_input", ""),
            "response": interaction.get("response", ""),
            "embeddings": self._compute_embeddings(interaction.get("content", "")),
            "tags": interaction.get("tags", []),
            "metadata": interaction.get("metadata", {})
        }
        
        # Store interaction
        project_dir = self.storage_path / project_id
        interactions_file = project_dir / f"{session_id}_interactions.jsonl"
        
        try:
            with open(interactions_file, 'a') as f:
                f.write(json.dumps(interaction_record) + '\n')
        except Exception as e:
            print(f"[MEMORY] Error storing interaction: {e}")
            return {"error": str(e)}
        
        # Update project stats
        self.project_index[project_id]["interaction_count"] += 1
        self._save_project_index()
        
        return interaction_record
    
    def _compute_embeddings(self, text: str) -> Dict[str, float]:
        """
        Compute semantic embeddings for text
        (Simplified version - would use actual embedding model)
        """
        
        # Create a simple hash-based "embedding" for now
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        return {
            "hash": text_hash,
            "length": len(text),
            "timestamp": datetime.now().isoformat()
        }
    
    def retrieve_cross_project_context(self, query: str, project_id: str = None) -> List[Dict]:
        """
        Retrieve relevant memories across projects
        Can be scoped to single project or search all
        """
        
        results = []
        
        # Determine which projects to search
        projects_to_search = [project_id] if project_id else list(self.project_index.keys())
        
        for proj_id in projects_to_search:
            project_dir = self.storage_path / proj_id
            
            if not project_dir.exists():
                continue
            
            # Search all session files
            for session_file in project_dir.glob("*_interactions.jsonl"):
                try:
                    with open(session_file) as f:
                        for line in f:
                            interaction = json.loads(line)
                            
                            # Simple keyword matching
                            if self._text_similarity(query, interaction.get("user_input", "")) > 0.3:
                                results.append({
                                    "project_id": proj_id,
                                    "interaction": interaction,
                                    "relevance": self._text_similarity(query, interaction.get("user_input", ""))
                                })
                except:
                    pass
        
        # Sort by relevance
        results.sort(key=lambda x: x["relevance"], reverse=True)
        return results[:10]  # Return top 10
    
    def _text_similarity(self, text1: str, text2: str) -> float:
        """
        Simple text similarity (would use embedding distance in production)
        """
        
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1 & words2)
        union = len(words1 | words2)
        
        return intersection / union if union > 0 else 0.0
    
    def export_project_memory_to_hf(self, project_id: str, hf_token: str = None) -> Dict[str, Any]:
        """
        Export project memory to HuggingFace for backup and sync
        """
        
        if project_id not in self.project_index:
            return {"error": f"Project {project_id} not found"}
        
        try:
            project_dir = self.storage_path / project_id
            
            # Collect all data
            export_data = {
                "project_id": project_id,
                "exported_at": datetime.now().isoformat(),
                "project_metadata": self.project_index[project_id],
                "sessions": [],
                "total_interactions": self.project_index[project_id].get("interaction_count", 0)
            }
            
            # Collect session data
            for session_file in project_dir.glob("*_interactions.jsonl"):
                session_interactions = []
                try:
                    with open(session_file) as f:
                        for line in f:
                            session_interactions.append(json.loads(line))
                except:
                    pass
                
                if session_interactions:
                    export_data["sessions"].append({
                        "session_file": session_file.name,
                        "interaction_count": len(session_interactions),
                        "interactions": session_interactions
                    })
            
            # Save to local file
            export_file = self.storage_path / f"{project_id}_hf_export.json"
            
            with open(export_file, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            # Would sync to HF here
            self.hf_sync_status[project_id] = {
                "exported_at": datetime.now().isoformat(),
                "status": "ready_for_sync",
                "file": str(export_file),
                "size_mb": export_file.stat().st_size / (1024 * 1024)
            }
            
            return {
                "success": True,
                "project_id": project_id,
                "export_file": str(export_file),
                "total_interactions": export_data["total_interactions"],
                "sessions_exported": len(export_data["sessions"]),
                "size_mb": export_file.stat().st_size / (1024 * 1024)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def generate_memory_report(self, project_id: str = None) -> Dict[str, Any]:
        """
        Generate comprehensive memory report
        """
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "projects": []
        }
        
        projects = [project_id] if project_id else list(self.project_index.keys())
        
        for proj_id in projects:
            if proj_id not in self.project_index:
                continue
            
            proj_data = self.project_index[proj_id]
            project_dir = self.storage_path / proj_id
            
            # Count files and interactions
            session_files = list(project_dir.glob("*_interactions.jsonl")) if project_dir.exists() else []
            
            total_interactions = 0
            for session_file in session_files:
                try:
                    with open(session_file) as f:
                        total_interactions += sum(1 for _ in f)
                except:
                    pass
            
            report["projects"].append({
                "project_id": proj_id,
                "created_at": proj_data.get("created_at"),
                "total_interactions": total_interactions,
                "sessions": len(session_files),
                "key_decisions": proj_data.get("key_decisions", []),
                "storage_mb": sum(f.stat().st_size for f in project_dir.glob("*")) / (1024 * 1024) if project_dir.exists() else 0
            })
        
        # Cross-project stats
        total_interactions = sum(p["total_interactions"] for p in report["projects"])
        total_projects = len(report["projects"])
        
        report["summary"] = {
            "total_projects": total_projects,
            "total_interactions": total_interactions,
            "total_storage_mb": sum(p["storage_mb"] for p in report["projects"]),
            "avg_interactions_per_project": total_interactions / total_projects if total_projects > 0 else 0
        }
        
        return report

# Global instance
_memory_system = None

def get_advanced_memory_system() -> AdvancedMemorySystem:
    """Get or create advanced memory system"""
    global _memory_system
    if _memory_system is None:
        _memory_system = AdvancedMemorySystem()
    return _memory_system
