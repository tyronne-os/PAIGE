# ═══════════════════ PAIGE: CREATIVE VOICE AGENT ═══════════════════
# Designer & Product strategist, specializes in UX/UI, creative direction, brand
# Cloned from CONNIE with different persona

import os
import json
from typing import List, Dict, Optional
from datetime import datetime
from pathlib import Path

# PAIGE Persona Configuration
PAIGE_PERSONA = {
    "name": "PAIGE",
    "title": "Chief Creative Officer & Product Designer",
    "background": "Former Design Lead at Apple, Product Strategist",
    "company": "Beryl Labs",
    "user_name": "TJ",
    "voice": {
        "gender": "female",
        "age_range": "32-45",
        "maturity": "creative, intuitive, visionary",
    },
    "system_prompt": """You are PAIGE, Chief Creative Officer and Product Designer at Beryl Labs. You're a former Apple Design Lead with expertise in user experience, visual design, brand strategy, and product vision.

Your personality:
- Creative and intuitive, with a visionary perspective
- Collaborative and empathetic—you understand users deeply
- Call TJ by name when addressing him
- You manage design direction, UX research, and brand strategy
- You complement CONNIE's technical execution with creative vision

How you work:
- You synthesize user insights and market trends to inform product decisions
- You're building Beryl Labs as a design-forward company—every detail matters
- You reference design systems, brand guidelines, and user research naturally
- You're collaborative and open to iteration
- You speak in terms of user experience, not technical implementation

When responding:
- Keep responses focused on user impact and creative strategy
- Reference relevant design patterns and brand guidelines
- Suggest design directions clearly with rationale
- Loop in CONNIE when technical feasibility needs validation
- Emphasize the "why" before the "how"
""",
}

# Knowledge Base Management (shared structure with CONNIE)
class KnowledgeBase:
    def __init__(self, storage_dir: str = "/tmp/paige_kb"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(exist_ok=True)
        self.index_file = self.storage_dir / "index.json"
        self.load_index()
    
    def load_index(self):
        """Load knowledge base index."""
        if self.index_file.exists():
            with open(self.index_file) as f:
                self.index = json.load(f)
        else:
            self.index = {"documents": [], "embeddings": {}}
    
    def add_document(self, doc_id: str, content: str, metadata: Dict = None):
        """Add document to knowledge base."""
        doc_entry = {
            "id": doc_id,
            "content": content,
            "metadata": metadata or {},
            "added_at": datetime.now().isoformat()
        }
        self.index["documents"].append(doc_entry)
        self.save_index()
    
    def save_index(self):
        """Save knowledge base index."""
        with open(self.index_file, 'w') as f:
            json.dump(self.index, f, indent=2)
    
    def query(self, query: str) -> List[Dict]:
        """Search knowledge base."""
        results = []
        query_lower = query.lower()
        for doc in self.index.get("documents", []):
            if query_lower in doc.get("content", "").lower():
                results.append(doc)
        return results


class PAIGEAgent:
    """PAIGE creative voice agent for Beryl Labs."""
    
    def __init__(self):
        self.persona = PAIGE_PERSONA
        self.kb = KnowledgeBase()
        self.conversation_history: List[Dict] = []
        self.user_preferences = {
            "design_style": "minimalist_modern",
            "color_palette": "brand_primary",
            "animation_preferences": "subtle_delight"
        }
    
    def get_system_prompt(self) -> str:
        """Get PAIGE's system prompt."""
        return self.persona["system_prompt"]
    
    def initialize_persona(self):
        """Initialize PAIGE's knowledge base with design context."""
        design_context = """
Beryl Labs Brand Guidelines:
- Primary color: #1F2937 (Modern gray-blue)
- Secondary: #6366F1 (Vibrant indigo)
- Accent: #EC4899 (Pink for energy)
- Typography: Inter (primary), Fira Code (technical)
- Animation principle: Purposeful motion, no gratuitous effects
- User philosophy: Design for clarity, beauty emerges naturally

Design System Components:
- Buttons: Minimal, high contrast, 12px padding
- Cards: Subtle shadow, rounded corners (8px)
- Typography hierarchy: 64px (hero), 28px (heading), 16px (body), 12px (caption)
- Spacing grid: 4px base unit (4, 8, 12, 16, 24, 32, 40, 48...)
- States: default, hover, active, disabled, loading
"""
        self.kb.add_document(
            "beryl-brand-guidelines",
            design_context,
            {"category": "brand", "owner": "paige"}
        )
    
    def chat(self, user_message: str) -> str:
        """Respond to user message."""
        # Add to conversation history
        self.conversation_history.append({
            "speaker": "user",
            "message": user_message,
            "timestamp": datetime.now().isoformat()
        })
        
        # Search knowledge base for relevant context
        relevant_docs = self.kb.query(user_message)
        
        # Format context
        context = f"""
Persona: {self.persona["name"]} ({self.persona["title"]})
Company: {self.persona["company"]}
Addressing: {self.persona["user_name"]}

Relevant Knowledge Base Results:
{self._format_kb_results(relevant_docs)}

Conversation History (last 3):
{self._format_history()}

User Message: {user_message}
"""
        
        # Return context for agent to use
        return context
    
    def _format_kb_results(self, docs: List[Dict]) -> str:
        """Format knowledge base results."""
        if not docs:
            return "No relevant documents found."
        
        formatted = []
        for doc in docs:
            formatted.append(f"- {doc['id']}: {doc['content'][:200]}...")
        return "\n".join(formatted)
    
    def _format_history(self) -> str:
        """Format recent conversation history."""
        recent = self.conversation_history[-3:]
        formatted = []
        for msg in recent:
            formatted.append(f"{msg['speaker']}: {msg['message']}")
        return "\n".join(formatted)


# Initialization
def create_paige_agent() -> PAIGEAgent:
    """Factory function to create and initialize PAIGE agent."""
    agent = PAIGEAgent()
    agent.initialize_persona()
    return agent


if __name__ == "__main__":
    # Test
    paige = create_paige_agent()
    print(f"✓ {paige.persona['name']} initialized")
    print(f"  Title: {paige.persona['title']}")
    print(f"  Company: {paige.persona['company']}")
    
    # Test chat
    response = paige.chat("What's your take on our onboarding flow?")
    print(f"\n✓ PAIGE ready for conversation")
