import { useState } from 'react'
import { MessageCircle, Settings, Plus, Menu, Send } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ChatPanel from './components/ChatPanel'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentSession, setCurrentSession] = useState<string>('session-1')
  const [sessions, setSessions] = useState([
    { id: 'session-1', title: 'New Chat', created: new Date() },
  ])
  const [messages, setMessages] = useState<Array<{ id: string; role: string; content: string }>>([])
  const [input, setInput] = useState('')

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
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          input={input}
          onInputChange={setInput}
        />
      </main>
    </div>
  )
}

export default App
