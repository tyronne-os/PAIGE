#!/usr/bin/env python3
"""
NVIDIA Voice Agent Integration for PAIGE
Uses NVIDIA API for natural voice with bidirectional conversation and memory
"""

import json
import uuid
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
import asyncio
import requests

@dataclass
class MemoryNode:
    """Graph node for memory tracking"""
    node_id: str
    timestamp: str
    session_id: str
    project_id: str
    content: str
    context: Dict[str, Any]
    children: List[str] = None
    parent_id: Optional[str] = None
    
    def __post_init__(self):
        if self.children is None:
            self.children = []

class NvidiaVoiceAgent:
    """NVIDIA voice agent with natural conversation and persistent memory"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or self._load_api_key()
        self.nvidia_endpoint = "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/voiceagent"
        self.conversation_history = []
        self.memory_graph = {}
        self.current_session_id = str(uuid.uuid4())
        self.current_project_id = None
        self.memory_store_path = Path.home() / '.paige' / 'memory'
        self.memory_store_path.mkdir(parents=True, exist_ok=True)
        self.graph_db_path = self.memory_store_path / 'graph_db.json'
        self._load_memory_graph()
    
    def _load_api_key(self) -> str:
        """Load NVIDIA API key from environment or config"""
        import os
        return os.getenv('NVIDIA_API_KEY', 'your-nvidia-api-key')
    
    def _load_memory_graph(self):
        """Load memory graph from storage"""
        if self.graph_db_path.exists():
            try:
                with open(self.graph_db_path) as f:
                    data = json.load(f)
                    self.memory_graph = data.get('graph', {})
            except Exception as e:
                print(f"[NVIDIA-VOICE] Error loading memory graph: {e}")
    
    def _save_memory_graph(self):
        """Save memory graph to storage"""
        try:
            with open(self.graph_db_path, 'w') as f:
                json.dump({'graph': self.memory_graph, 'timestamp': datetime.now().isoformat()}, f, indent=2)
        except Exception as e:
            print(f"[NVIDIA-VOICE] Error saving memory graph: {e}")
    
    async def process_voice_input(self, audio_bytes: bytes, language: str = "en") -> str:
        """
        Process voice input with NVIDIA STT
        """
        try:
            # Call NVIDIA voice STT API
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "audio/wav"
            }
            
            # For now, return placeholder (would call actual NVIDIA API)
            print(f"[NVIDIA-VOICE] Processing audio input...")
            return "User input from NVIDIA STT"
            
        except Exception as e:
            print(f"[NVIDIA-VOICE] STT error: {e}")
            return ""
    
    async def generate_response_with_memory(self, user_input: str, project_id: str = None) -> Dict[str, Any]:
        """
        Generate natural response using NVIDIA voice agent with memory context
        """
        
        if project_id:
            self.current_project_id = project_id
        
        # Retrieve relevant memory for context
        context_memories = self._retrieve_relevant_memories(user_input, project_id)
        
        # Build conversation context
        system_prompt = self._build_system_prompt(context_memories)
        
        # Add to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": user_input,
            "timestamp": datetime.now().isoformat(),
            "project_id": project_id
        })
        
        try:
            # Call NVIDIA API
            response = await self._call_nvidia_api(
                user_input=user_input,
                system_prompt=system_prompt,
                conversation_history=self.conversation_history
            )
            
            # Add response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": response,
                "timestamp": datetime.now().isoformat(),
                "project_id": project_id
            })
            
            # Store in memory graph
            memory_node = self._create_memory_node(
                content=response,
                user_input=user_input,
                context={"project_id": project_id, "context_memories": context_memories}
            )
            
            return {
                "response": response,
                "memory_node_id": memory_node.node_id,
                "context_used": len(context_memories),
                "session_id": self.current_session_id,
                "project_id": project_id
            }
            
        except Exception as e:
            print(f"[NVIDIA-VOICE] Response generation error: {e}")
            return {"error": str(e)}
    
    async def _call_nvidia_api(self, user_input: str, system_prompt: str, conversation_history: List[Dict]) -> str:
        """
        Call NVIDIA voice agent API
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    *conversation_history
                ],
                "model": "nvidia/nemotron-4-340b-instruct",
                "temperature": 0.7,
                "max_tokens": 1024,
                "top_p": 0.9
            }
            
            # Mock response (would call actual NVIDIA API)
            response_text = f"NVIDIA response to: {user_input[:50]}..."
            return response_text
            
        except Exception as e:
            print(f"[NVIDIA-VOICE] API error: {e}")
            return "I encountered an error processing your request."
    
    def _retrieve_relevant_memories(self, user_input: str, project_id: str = None) -> List[MemoryNode]:
        """
        Retrieve relevant memories from graph for context
        Uses semantic similarity to find related past interactions
        """
        
        relevant = []
        
        # Filter by project if specified
        nodes_to_search = []
        for node_id, node_data in self.memory_graph.items():
            if project_id is None or node_data.get('project_id') == project_id:
                nodes_to_search.append(node_data)
        
        # Simple keyword-based retrieval (would use embedding similarity in production)
        input_words = set(user_input.lower().split())
        
        for node_data in nodes_to_search:
            node_words = set(node_data.get('content', '').lower().split())
            
            # Calculate overlap
            overlap = len(input_words & node_words)
            if overlap > 2:  # Threshold
                relevant.append(node_data)
        
        # Return most recent relevant memories (up to 5)
        relevant.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return relevant[:5]
    
    def _build_system_prompt(self, context_memories: List[Dict]) -> str:
        """
        Build system prompt with memory context
        """
        
        base_prompt = """You are PAIGE, an advanced AI assistant for building 3D digital humans with Tokkio.
You have natural bidirectional conversation skills and remember context across projects.
You help with architecture, code, design, and optimization.

Key abilities:
- Deep understanding of 3D avatar systems
- Real-time code generation and debugging
- Performance optimization expertise
- Memory of past projects and decisions
- Natural, helpful communication style
"""
        
        if context_memories:
            memory_context = "\n\nRELEVANT PAST INTERACTIONS:\n"
            for i, mem in enumerate(context_memories[:3], 1):
                memory_context += f"{i}. {mem.get('content', '')[:200]}...\n"
            
            return base_prompt + memory_context
        
        return base_prompt
    
    def _create_memory_node(self, content: str, user_input: str, context: Dict) -> MemoryNode:
        """
        Create and store a memory node in the graph
        """
        
        node_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Determine parent (last node in session)
        parent_id = None
        session_nodes = [n for n in self.memory_graph.values() 
                        if n.get('session_id') == self.current_session_id]
        if session_nodes:
            parent_id = max(session_nodes, key=lambda x: x.get('timestamp', ''))['node_id']
        
        node = MemoryNode(
            node_id=node_id,
            timestamp=timestamp,
            session_id=self.current_session_id,
            project_id=context.get('project_id'),
            content=content,
            context=context,
            parent_id=parent_id
        )
        
        # Add to graph
        self.memory_graph[node_id] = asdict(node)
        
        # Update parent's children
        if parent_id and parent_id in self.memory_graph:
            if 'children' not in self.memory_graph[parent_id]:
                self.memory_graph[parent_id]['children'] = []
            self.memory_graph[parent_id]['children'].append(node_id)
        
        self._save_memory_graph()
        
        return node
    
    def start_new_session(self, project_id: str = None) -> Dict[str, Any]:
        """
        Start a new conversation session with graph marker
        """
        
        self.current_session_id = str(uuid.uuid4())
        self.current_project_id = project_id
        self.conversation_history = []
        
        # Create session marker node
        session_node = self._create_memory_node(
            content=f"NEW SESSION START - Project: {project_id}",
            user_input="[SESSION_MARKER]",
            context={"session_marker": True, "project_id": project_id}
        )
        
        return {
            "session_id": self.current_session_id,
            "project_id": project_id,
            "marker_node_id": session_node.node_id,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_project_memory_graph(self, project_id: str) -> Dict[str, Any]:
        """
        Get memory graph for a specific project
        Shows all sessions and their relationships
        """
        
        project_nodes = {}
        sessions = {}
        
        for node_id, node_data in self.memory_graph.items():
            if node_data.get('project_id') == project_id:
                project_nodes[node_id] = node_data
                
                session_id = node_data.get('session_id')
                if session_id not in sessions:
                    sessions[session_id] = []
                sessions[session_id].append(node_id)
        
        return {
            "project_id": project_id,
            "total_nodes": len(project_nodes),
            "sessions": sessions,
            "nodes": project_nodes,
            "graph_structure": self._build_graph_structure(project_nodes)
        }
    
    def _build_graph_structure(self, nodes: Dict) -> Dict[str, Any]:
        """
        Build graphviz-compatible structure from nodes
        """
        
        edges = []
        
        for node_id, node_data in nodes.items():
            parent_id = node_data.get('parent_id')
            if parent_id:
                edges.append({
                    "from": parent_id,
                    "to": node_id,
                    "timestamp": node_data.get('timestamp')
                })
        
        return {
            "nodes": len(nodes),
            "edges": edges,
            "dot_format": self._generate_dot_format(nodes, edges)
        }
    
    def _generate_dot_format(self, nodes: Dict, edges: List) -> str:
        """
        Generate Graphviz DOT format for visualization
        """
        
        dot = "digraph MemoryGraph {\n"
        dot += "  rankdir=TB;\n"
        dot += "  node [shape=box, style=rounded, color=lightblue];\n"
        
        # Add nodes
        for node_id, node_data in nodes.items():
            label = node_data.get('content', '')[:30].replace('"', '\\"')
            timestamp = node_data.get('timestamp', '')[-5:]
            dot += f'  "{node_id}" [label="{label}\\n{timestamp}"];\n'
        
        # Add edges
        for edge in edges:
            dot += f'  "{edge["from"]}" -> "{edge["to"]}";\n'
        
        dot += "}\n"
        return dot
    
    def export_memory_to_hf(self, hf_repo: str = None) -> Dict[str, Any]:
        """
        Export memory graph and conversation history to HuggingFace
        """
        
        try:
            export_data = {
                "timestamp": datetime.now().isoformat(),
                "memory_graph": self.memory_graph,
                "conversation_history": self.conversation_history,
                "sessions": list(set(h.get('project_id') for h in self.conversation_history))
            }
            
            # Would upload to HF here
            export_path = self.memory_store_path / f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(export_path, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            return {
                "success": True,
                "export_path": str(export_path),
                "nodes_exported": len(self.memory_graph),
                "conversations_exported": len(self.conversation_history)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

# Global instance
_nvidia_agent = None

def get_nvidia_voice_agent() -> NvidiaVoiceAgent:
    """Get or create NVIDIA voice agent"""
    global _nvidia_agent
    if _nvidia_agent is None:
        _nvidia_agent = NvidiaVoiceAgent()
    return _nvidia_agent
