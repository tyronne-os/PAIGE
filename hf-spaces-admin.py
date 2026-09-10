#!/usr/bin/env python3
"""
HF Spaces Admin Panel (Gradio Raw Mode)
PAIGE Admin interface on HuggingFace Spaces
- Lists projects from HF storage
- Shows model registry
- NO compute/tool execution (that's in PAIGE frontend)
"""

import os
import json
from typing import List, Dict, Optional
from datetime import datetime

try:
    from huggingface_hub import HfApi, list_models, list_datasets
    HF_AVAILABLE = True
except ImportError:
    HF_AVAILABLE = False

try:
    import gradio as gr
    GRADIO_AVAILABLE = True
except ImportError:
    GRADIO_AVAILABLE = False


class HFStorageAdmin:
    """Admin backend for HF storage (READ-ONLY, no compute)"""
    
    def __init__(self, hf_token: Optional[str] = None):
        self.hf_token = hf_token or os.getenv("HF_TOKEN")
        self.api = HfApi() if HF_AVAILABLE else None
        self.username = "tyronne-os"
        
    def list_projects(self) -> List[Dict]:
        """List all projects in HF storage"""
        if not HF_AVAILABLE or not self.api:
            return [{"status": "HF API not available"}]
        
        try:
            projects = []
            
            # List datasets
            datasets = self.api.list_datasets(author=self.username)
            for ds in datasets:
                projects.append({
                    "name": ds.id.split("/")[1],
                    "type": "📊 Dataset",
                    "repo_id": ds.id,
                    "url": f"https://huggingface.co/datasets/{ds.id}",
                    "private": ds.private,
                    "created_at": str(ds.created_at)[:10] if hasattr(ds, 'created_at') else "N/A"
                })
            
            # List models
            models = self.api.list_models(author=self.username)
            for model in models:
                projects.append({
                    "name": model.id.split("/")[1],
                    "type": "🤖 Model",
                    "repo_id": model.id,
                    "url": f"https://huggingface.co/{model.id}",
                    "private": model.private,
                    "created_at": str(model.created_at)[:10] if hasattr(model, 'created_at') else "N/A",
                    "likes": model.likes if hasattr(model, 'likes') else 0
                })
            
            return sorted(projects, key=lambda x: x.get("created_at", ""), reverse=True)
        
        except Exception as e:
            return [{"error": str(e), "type": "❌ Error"}]
    
    def list_models_available(self) -> List[Dict]:
        """List available models for local inference (no execution)"""
        model_ids = [
            "mistralai/Mistral-7B-Instruct-v0.1",
            "meta-llama/Llama-2-7b-hf",
            "NousResearch/Nous-Hermes-2-Mistral-7B-DPO",
            "Qwen/Qwen1.5-7B-Chat",
            "mosaicml/mpt-7b-instruct",
            "TheBloke/Mistral-7B-Instruct-v0.1-GGUF",
        ]
        
        models = []
        for model_id in model_ids:
            models.append({
                "name": model_id,
                "size": "7B",
                "type": "🧠 LLM",
                "inference": "✅ Available",
                "location": "🏠 Local + 🌐 HF GPU"
            })
        
        return models
    
    def get_stats(self) -> Dict:
        """Get storage info (no execution)"""
        return {
            "username": self.username,
            "membership": "Pro (1TB-5TB)",
            "backend_status": "🟢 Connected" if HF_AVAILABLE else "🔴 Disconnected",
            "paige_frontend": "🏠 Running Locally",
            "compute_location": "🏠 Local Device (with computer use)",
            "timestamp": datetime.now().isoformat()
        }


def create_admin_interface():
    """Create Gradio admin panel for HF Spaces"""
    admin = HFStorageAdmin()
    
    with gr.Blocks(
        title="PAIGE Admin - HF Storage",
        theme=gr.themes.Soft(),
        css="""
        .header { text-align: center; }
        .info-box { background: #f0f0f0; padding: 20px; border-radius: 8px; }
        """
    ) as demo:
        with gr.Column():
            gr.Markdown("# 🚀 PAIGE Admin Panel")
            gr.Markdown("**HuggingFace Storage Browser** • *Compute runs locally on your device*")
            
            with gr.Tabs():
                # Storage Tab
                with gr.Tab("📦 Storage"):
                    gr.Markdown("### Your Projects on HuggingFace")
                    
                    with gr.Row():
                        refresh_btn = gr.Button("🔄 Refresh", scale=1)
                        filter_type = gr.Dropdown(
                            ["All", "📊 Dataset", "🤖 Model"],
                            value="All",
                            label="Filter",
                            scale=2
                        )
                    
                    projects_table = gr.Dataframe(
                        label="Projects",
                        interactive=False,
                        wrap=True
                    )
                    
                    def refresh_projects(filter_val):
                        projects = admin.list_projects()
                        if filter_val != "All":
                            projects = [p for p in projects if p.get("type") == filter_val]
                        return projects
                    
                    refresh_btn.click(
                        refresh_projects,
                        inputs=filter_type,
                        outputs=projects_table
                    )
                    demo.load(
                        refresh_projects,
                        inputs=filter_type,
                        outputs=projects_table
                    )
                
                # Models Tab
                with gr.Tab("🧠 Models"):
                    gr.Markdown("### Available Models for Inference")
                    gr.Markdown("Models are **executed locally** on your device with full computer use access")
                    
                    models_table = gr.Dataframe(
                        label="Model Registry",
                        interactive=False,
                        wrap=True
                    )
                    
                    def load_models():
                        return admin.list_models_available()
                    
                    demo.load(load_models, outputs=models_table)
                
                # Status Tab
                with gr.Tab("⚙️ Status"):
                    gr.Markdown("### System Status")
                    
                    stats_json = gr.JSON(label="Configuration")
                    
                    def load_stats():
                        return admin.get_stats()
                    
                    demo.load(load_stats, outputs=stats_json)
                
                # Architecture Tab
                with gr.Tab("🏗️ Architecture"):
                    gr.Markdown("""
                    ## PAIGE Hybrid Architecture

                    ```
                    ┌─────────────────────────────────────────┐
                    │  PAIGE Frontend (React) - LOCAL 🏠      │
                    │  ✅ Computer Use                        │
                    │  ✅ Model Execution                     │
                    │  ✅ Agent Control                       │
                    │  Port: 8002 (Local)                     │
                    └──────────────┬──────────────────────────┘
                                   │
                            ┌──────┴──────┐
                            │             │
                    ┌───────▼─────┐  ┌──────▼──────────┐
                    │  HF GPU 🌐  │  │ Local Models 🏠 │
                    │  Inference  │  │ Inference       │
                    │  (Optional) │  │ (Primary)       │
                    └─────────────┘  └────────┬────────┘
                                              │
                    ┌─────────────────────────┴────────────────┐
                    │  PAIGE Admin (Gradio) - HF Spaces 🌐   │
                    │  📦 List Projects                       │
                    │  🧠 Model Registry                      │
                    │  ⚙️ Status Only                          │
                    │  ❌ NO Compute (Read-Only)              │
                    └─────────────────────────────────────────┘
                    ```

                    ### Key Design:
                    - **Frontend**: Your device (full control, computer use)
                    - **Admin Panel**: HF Spaces (storage browser only)
                    - **Compute**: Local + optional HF GPU
                    - **Result**: Keep control, zero cloud cost
                    """)
                
                # Integration Tab
                with gr.Tab("🔗 Integration"):
                    gr.Markdown("""
                    ## PAIGE Frontend Integration

                    ### What's Running Locally (8002):
                    ```javascript
                    // React Admin Dashboard
                    - Projects Browser (fetches from HF)
                    - Model Selector
                    - Agent Control Panel
                    - Compute Status
                    - Tool Execution
                    ```

                    ### PAIGE Frontend Fetches From:
                    1. **HF Spaces Admin** (this Gradio app)
                       - Project list
                       - Model registry
                    
                    2. **Local Backend** (PAIGE service 8002)
                       - All compute
                       - Agent execution
                       - Tool access

                    ### Example Flow:
                    1. User opens React GUI (localhost:8002)
                    2. React fetches projects from this admin panel
                    3. User selects model to run
                    4. React sends to local backend (8002)
                    5. Backend executes locally with computer use
                    6. Results displayed in React GUI

                    ### No Cloud Compute:
                    - All tools run locally
                    - Computer use stays on your device
                    - HF Spaces is read-only storage browser
                    - You pay $0 for GPU (uses your free tier)
                    """)
    
    return demo


if __name__ == "__main__":
    if GRADIO_AVAILABLE:
        print("🚀 Starting PAIGE Admin Panel...")
        print("📍 Local URL: http://localhost:7860")
        print("🌐 Share URL: [will appear below]")
        print("")
        print("ℹ️  This is READ-ONLY storage browser")
        print("💻 Full compute runs in PAIGE Frontend (localhost:8002)")
        print("")
        
        demo = create_admin_interface()
        demo.launch(
            share=True,
            server_name="0.0.0.0",
            server_port=7860,
            show_error=True,
            verbose=True
        )
    else:
        print("❌ Gradio not installed. Install with:")
        print("   pip install gradio")
