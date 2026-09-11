import React, { useState, ReactNode, useEffect } from 'react'
import { MessageCircle, Settings, Plus, Menu, Send, Palette } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import ProjectPreview from './components/ProjectPreview'
import DesignEasel from './components/DesignEasel'
import ModelGym from './components/ModelGym'
import ThemeVault from './components/ThemeVault'
import GitHubBrowser from './components/GitHubBrowser'
import RecentProjects from './components/RecentProjects'
import './App.css'

type AppMode = 'chat' | 'project' | 'design' | 'gym'
type ProjectMode = 'split' | 'pipeline' | 'eden'

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '2rem', color: 'white' }}>Error loading component. Check console.</div>
    }
    return this.props.children
  }
}

function App() {
  const [appMode, setAppMode] = useState<AppMode>('chat')
  const [projectMode, setProjectMode] = useState<ProjectMode>('split')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showGitHub, setShowGitHub] = useState(false)
  const [showRecentProjects, setShowRecentProjects] = useState(true)
  const [currentSession, setCurrentSession] = useState<string>('session-1')
  const [sessions, setSessions] = useState([
    { id: 'session-1', title: 'New Chat', created: new Date() },
  ])
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([])
  const [input, setInput] = useState('')

  // Load GitHub token on mount
  useEffect(() => {
    const token = localStorage.getItem('github_token')
    if (!token) {
      // Prompt for GitHub token on first load
      const newToken = prompt('Enter your GitHub Personal Access Token (leave blank to skip):')
      if (newToken) {
        localStorage.setItem('github_token', newToken)
      }
    }
    
    // Show recent projects on first load
    const hasSeenRecentProjects = localStorage.getItem('paige-recent-projects-shown')
    if (!hasSeenRecentProjects) {
      setShowRecentProjects(true)
      localStorage.setItem('paige-recent-projects-shown', 'true')
    }
  }, [])

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`
    setSessions([...sessions, { id: newId, title: 'New Chat', created: new Date() }])
    setCurrentSession(newId)
    setMessages([])
  }

  const handleSelectSession = (id: string) => {
    setCurrentSession(id)
    setMessages([]) // Load session messages (placeholder)
  }

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id))
    if (currentSession === id && sessions.length > 0) {
      setCurrentSession(sessions[0].id)
    }
  }

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: input,
      }
      setMessages([...messages, newMessage])
      setInput('')
      // Simulate agent response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: 'I\'m PAIGE, your AI development assistant. How can I help you today?',
        }])
      }, 500)
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      <Sidebar
        open={sidebarOpen}
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />
      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold">PAIGE IDE</h1>
            
            {/* Mode Switcher */}
            <div className="ml-6 flex gap-2 border-l border-slate-700 pl-6">
              <button
                onClick={() => setAppMode('chat')}
                className={`px-4 py-1 rounded-lg font-medium transition ${
                  appMode === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setAppMode('project')}
                className={`px-4 py-1 rounded-lg font-medium transition ${
                  appMode === 'project'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🎯 Project
              </button>
              <button
                onClick={() => setAppMode('design')}
                className={`px-4 py-1 rounded-lg font-medium transition ${
                  appMode === 'design'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🎨 Design
              </button>
              <button
                onClick={() => setAppMode('gym')}
                className={`px-4 py-1 rounded-lg font-medium transition ${
                  appMode === 'gym'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🏋️ GYM
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowGitHub(!showGitHub)}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
              title="GitHub Repositories"
            >
              <Github size={20} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-slate-800 rounded-lg transition"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-950 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
              <ThemeVault onClose={() => setShowSettings(false)} />
            </div>
          </div>
        )}

        {/* GitHub Modal */}
        {showGitHub && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-950 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
              <GitHubBrowser onClose={() => setShowGitHub(false)} />
            </div>
          </div>
        )}

        {/* Recent Projects Modal (On Load) */}
        {showRecentProjects && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-950 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
              <RecentProjects onClose={() => setShowRecentProjects(false)} />
            </div>
          </div>
        )}

        {/* Content Area */}
        <ErrorBoundary>
          {appMode === 'chat' ? (
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              input={input}
              onInputChange={setInput}
            />
          ) : appMode === 'project' ? (
            <ProjectPreview
              mode={projectMode}
              onModeChange={setProjectMode}
            />
          ) : appMode === 'design' ? (
            <div className="flex-1 p-4 overflow-auto">
              <DesignEasel />
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <ModelGym />
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default App
