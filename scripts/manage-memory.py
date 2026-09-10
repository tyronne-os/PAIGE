#!/usr/bin/env python3
"""
WelcomeBackPage Memory Management System

Manages project context, session memory, and cross-workspace memory sync.
Integrates with Kiro IDE, Podman workspace, and Hugging Face storage.

Usage:
    python manage-memory.py init              # Initialize memory system
    python manage-memory.py project add       # Register new project
    python manage-memory.py session save      # Save current session
    python manage-memory.py session restore   # Restore previous session
    python manage-memory.py status            # Show memory status
    python manage-memory.py cleanup           # Archive old sessions
"""

import json
import os
import sys
import uuid
import subprocess
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
import argparse
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MemoryManager:
    """Manages WelcomeBackPage memory files and session tracking."""
    
    def __init__(self, workspace_root: Optional[str] = None):
        """Initialize memory manager."""
        self.workspace_root = Path(workspace_root or os.getcwd())
        self.kiro_dir = self.workspace_root / '.kiro'
        self.memory_file = self.workspace_root / '.project-memory.json'
        self.session_file = self.workspace_root / '.session-memory.json'
        self.projects_dir = self.kiro_dir / 'projects'
        self.sessions_dir = self.kiro_dir / 'sessions'
        self.storage_dir = self.kiro_dir / 'storage'
        
        self._ensure_directories()
    
    def _ensure_directories(self) -> None:
        """Ensure all required directories exist."""
        for directory in [self.kiro_dir, self.projects_dir, self.sessions_dir, self.storage_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    def _load_json(self, filepath: Path, default: Dict = None) -> Dict:
        """Load JSON file with fallback to default."""
        if not filepath.exists():
            return default or {}
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse {filepath}, using default")
            return default or {}
    
    def _save_json(self, filepath: Path, data: Dict, pretty: bool = True) -> None:
        """Save JSON file."""
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w') as f:
            if pretty:
                json.dump(data, f, indent=2)
            else:
                json.dump(data, f)
        logger.info(f"Saved {filepath}")
    
    def initialize(self) -> None:
        """Initialize memory system."""
        logger.info("Initializing memory system...")
        
        # Load or create project memory
        project_memory = self._load_json(self.memory_file, {
            'project': {
                'name': 'WelcomeBackPage',
                'createdAt': datetime.utcnow().isoformat() + 'Z',
                'owner': 'tyronne-os',
                'email': 'tjlsudadverified@gmail.com'
            },
            'storage': {
                'github': {
                    'repo': 'https://github.com/tyronne-os/WelcomeBackPage',
                    'branch': 'main',
                    'sync': 'bidirectional'
                },
                'huggingface': {
                    'username': 'tyronne-os',
                    'dataset_repo': 'tyronne-os/welcome-back-page-projects',
                    'session_repo': 'tyronne-os/welcome-back-page-sessions',
                    'autosync': True,
                    'frequency': 'on-change'
                }
            },
            'projects': [],
            'sessions': [],
            'metadata': {
                'lastSync': datetime.utcnow().isoformat() + 'Z',
                'vaultStatus': 'connected',
                'gpuStatus': 'manual-control',
                'securityLevel': 'standard'
            }
        })
        self._save_json(self.memory_file, project_memory)
        
        # Load or create session memory
        session_memory = self._load_json(self.session_file, {
            'version': '1.0.0',
            'workspace': 'WelcomeBackPage',
            'createdAt': datetime.utcnow().isoformat() + 'Z',
            'sessions': [],
            'projects': [],
            'environment': {
                'pythonVersion': '3.12',
                'nodeVersion': 'latest',
                'uvVersion': 'latest',
                'tools': {
                    'git': 'latest',
                    'gh': 'latest',
                    'huggingface-cli': 'latest'
                }
            },
            'storage': {
                'github': {
                    'lastSync': None,
                    'status': 'pending'
                },
                'huggingface': {
                    'lastSync': None,
                    'status': 'pending'
                }
            },
            'credentials': {
                'github': {
                    'status': 'verified',
                    'username': 'tyronne-os'
                },
                'huggingface': {
                    'status': 'pending',
                    'username': None
                }
            }
        })
        self._save_json(self.session_file, session_memory)
        
        logger.info("Memory system initialized")
    
    def add_project(self, name: str, path: str, project_type: str = 'web',
                   language: str = 'python', tags: List[str] = None) -> str:
        """Register a new project."""
        project_id = str(uuid.uuid4())
        
        memory = self._load_json(self.memory_file)
        
        project = {
            'id': project_id,
            'name': name,
            'path': path,
            'type': project_type,
            'status': 'active',
            'createdAt': datetime.utcnow().isoformat() + 'Z',
            'lastModified': datetime.utcnow().isoformat() + 'Z',
            'tags': tags or [],
            'config': {
                'language': language,
                'framework': None,
                'dependencies': {}
            }
        }
        
        memory['projects'].append(project)
        self._save_json(self.memory_file, memory)
        
        # Create project directory and metadata
        project_dir = self.projects_dir / project_id
        project_dir.mkdir(parents=True, exist_ok=True)
        
        project_meta = {
            'id': project_id,
            'name': name,
            'path': path,
            'type': project_type,
            'status': 'active',
            'createdAt': datetime.utcnow().isoformat() + 'Z',
            'lastActivity': datetime.utcnow().isoformat() + 'Z',
            'config': project['config']
        }
        self._save_json(project_dir / 'project-meta.json', project_meta)
        
        # Create activity log
        activity = {
            'events': [
                {
                    'type': 'project_created',
                    'timestamp': datetime.utcnow().isoformat() + 'Z',
                    'message': f'Project {name} created'
                }
            ]
        }
        self._save_json(project_dir / 'activity.json', activity)
        
        logger.info(f"Project registered: {name} ({project_id})")
        return project_id
    
    def save_session(self, project_id: Optional[str] = None, 
                    task: Optional[str] = None, notes: Optional[str] = None) -> str:
        """Save current session snapshot."""
        session_id = str(uuid.uuid4())
        
        memory = self._load_json(self.session_file)
        
        session_entry = {
            'id': session_id,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'project': project_id,
            'task': task,
            'notes': notes,
            'environment': memory.get('environment', {}),
            'status': 'saved'
        }
        
        memory['sessions'].append(session_entry)
        self._save_json(self.session_file, memory)
        
        # Create session directory
        session_dir = self.sessions_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        
        session_meta = {
            'id': session_id,
            'timestamp': session_entry['timestamp'],
            'project': project_id,
            'task': task,
            'notes': notes
        }
        self._save_json(session_dir / 'session-meta.json', session_meta)
        
        logger.info(f"Session saved: {session_id}")
        return session_id
    
    def restore_session(self, session_id: str) -> Dict:
        """Restore session from memory."""
        session_dir = self.sessions_dir / session_id
        
        if not session_dir.exists():
            logger.error(f"Session not found: {session_id}")
            return {}
        
        session_meta = self._load_json(session_dir / 'session-meta.json')
        logger.info(f"Session restored: {session_id}")
        
        return session_meta
    
    def list_projects(self) -> List[Dict]:
        """List all registered projects."""
        memory = self._load_json(self.memory_file)
        return memory.get('projects', [])
    
    def list_sessions(self, limit: int = 10) -> List[Dict]:
        """List recent sessions."""
        memory = self._load_json(self.session_file)
        sessions = memory.get('sessions', [])
        return sorted(sessions, key=lambda s: s['timestamp'], reverse=True)[:limit]
    
    def show_status(self) -> None:
        """Display memory system status."""
        print("\n" + "="*60)
        print("WelcomeBackPage Memory System Status")
        print("="*60 + "\n")
        
        memory = self._load_json(self.memory_file)
        session = self._load_json(self.session_file)
        
        # Project status
        projects = memory.get('projects', [])
        print(f"Projects: {len(projects)}")
        for p in projects[:5]:  # Show first 5
            print(f"  - {p['name']} ({p['status']}) [{p['type']}]")
        if len(projects) > 5:
            print(f"  ... and {len(projects) - 5} more")
        
        print()
        
        # Session status
        sessions = session.get('sessions', [])
        print(f"Sessions: {len(sessions)}")
        for s in sessions[:5]:  # Show first 5
            print(f"  - {s['timestamp']}: {s.get('task', 'No task')}")
        if len(sessions) > 5:
            print(f"  ... and {len(sessions) - 5} more")
        
        print()
        
        # Storage status
        print("Storage Status:")
        print(f"  GitHub: {session.get('storage', {}).get('github', {}).get('status', 'unknown')}")
        print(f"  Hugging Face: {session.get('storage', {}).get('huggingface', {}).get('status', 'unknown')}")
        
        print()
        
        # Credential status
        creds = session.get('credentials', {})
        print("Credentials:")
        for service, status in creds.items():
            print(f"  {service}: {status.get('status', 'unknown')}")
        
        print("\n" + "="*60 + "\n")
    
    def cleanup_sessions(self, days_old: int = 30) -> int:
        """Archive sessions older than specified days."""
        memory = self._load_json(self.session_file)
        
        cutoff_date = (datetime.utcnow() - timedelta(days=days_old)).isoformat()
        
        old_sessions = [s for s in memory.get('sessions', [])
                       if s['timestamp'] < cutoff_date]
        
        archive_dir = self.sessions_dir / 'archive'
        archive_dir.mkdir(parents=True, exist_ok=True)
        
        for session in old_sessions:
            session_dir = self.sessions_dir / session['id']
            if session_dir.exists():
                # Move to archive
                import shutil
                shutil.move(str(session_dir), str(archive_dir / session['id']))
                logger.info(f"Archived session: {session['id']}")
        
        # Update memory file
        memory['sessions'] = [s for s in memory['sessions']
                             if s['timestamp'] >= cutoff_date]
        self._save_json(self.session_file, memory)
        
        logger.info(f"Archived {len(old_sessions)} sessions")
        return len(old_sessions)


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description='WelcomeBackPage Memory Management'
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Commands')
    
    # Init command
    subparsers.add_parser('init', help='Initialize memory system')
    
    # Project commands
    project_parser = subparsers.add_parser('project', help='Manage projects')
    project_subs = project_parser.add_subparsers(dest='project_cmd')
    
    add_project = project_subs.add_parser('add', help='Add project')
    add_project.add_argument('name', help='Project name')
    add_project.add_argument('--path', default='.', help='Project path')
    add_project.add_argument('--type', default='web', help='Project type')
    add_project.add_argument('--language', default='python', help='Language')
    add_project.add_argument('--tags', nargs='+', help='Project tags')
    
    project_subs.add_parser('list', help='List projects')
    
    # Session commands
    session_parser = subparsers.add_parser('session', help='Manage sessions')
    session_subs = session_parser.add_subparsers(dest='session_cmd')
    
    save_session = session_subs.add_parser('save', help='Save session')
    save_session.add_argument('--project', help='Project ID')
    save_session.add_argument('--task', help='Current task')
    save_session.add_argument('--notes', help='Session notes')
    
    restore_session = session_subs.add_parser('restore', help='Restore session')
    restore_session.add_argument('session_id', help='Session ID')
    
    session_subs.add_parser('list', help='List sessions')
    
    # Status command
    subparsers.add_parser('status', help='Show memory status')
    
    # Cleanup command
    cleanup_parser = subparsers.add_parser('cleanup', help='Archive old sessions')
    cleanup_parser.add_argument('--days', type=int, default=30,
                               help='Sessions older than this many days')
    
    args = parser.parse_args()
    
    manager = MemoryManager()
    
    if args.command == 'init':
        manager.initialize()
    elif args.command == 'project':
        if args.project_cmd == 'add':
            manager.add_project(
                args.name,
                args.path,
                args.type,
                args.language,
                args.tags
            )
        elif args.project_cmd == 'list':
            for p in manager.list_projects():
                print(f"{p['id']}: {p['name']} ({p['status']})")
    elif args.command == 'session':
        if args.session_cmd == 'save':
            manager.save_session(args.project, args.task, args.notes)
        elif args.session_cmd == 'restore':
            session = manager.restore_session(args.session_id)
            print(json.dumps(session, indent=2))
        elif args.session_cmd == 'list':
            for s in manager.list_sessions():
                print(f"{s['id']}: {s['timestamp']} - {s.get('task', 'No task')}")
    elif args.command == 'status':
        manager.show_status()
    elif args.command == 'cleanup':
        manager.cleanup_sessions(args.days)
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
