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

class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          color: 'white',
          backgroundColor: '#0f172a',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#ff7f50' }}>⚠️ Component Error</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{this.state.error}</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Check browser console (F12) for details</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              maxWidth: '150px'
            }}
          >
            Reload Page
          </button>
        </div>
      )
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
    try {
      const token = localStorage.getItem('github_token')
      if (!token) {
        // Prompt for GitHub token on first load (optional)
        setTimeout(() => {
          const newToken = prompt('Enter your GitHub Personal Access Token (leave blank to skip):')
          if (newToken) {
            localStorage.setItem('github_token', newToken)
          }
        }, 500)
      }
      
      // Show recent projects on first load
      const hasSeenRecentProjects = localStorage.getItem('paige-recent-projects-shown')
      if (!hasSeenRecentProjects) {
        setShowRecentProjects(true)
        localStorage.setItem('paige-recent-projects-shown', 'true')
      }
    } catch (e) {
      console.error('Error in useEffect:', e)
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c2.6-.4 5.6-2 5.6-7 0-1.25-.756-2.3-2-2.972A4.9 4.9 0 0 0 15.666 3.75c-.748-1-.747-2.592-.191-2.766a10.7 10.7 0 0 0-5.523 1.14c-.335.118-.8 0-1.022-.217A4.882 4.882 0 0 0 7.97 1.05c-1.318 0-2.592.878-3.414 2.372C3.4 5.exposition 3 7.268 3 9.589c0 5 3 6.6 5.6 7a4.821 4.821 0 0 0-1 3.5v4"></path><circle cx="9" cy="18" r="1"></circle></svg>
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

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}
