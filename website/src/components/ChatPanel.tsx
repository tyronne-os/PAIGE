import { Send, Upload, Settings2, Zap, FolderPlus, Folder, File } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Message {
  id: string
  role: string
  content: string
}

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: () => void
  input: string
  onInputChange: (value: string) => void
}

function ChatPanel({ messages, onSendMessage, input, onInputChange }: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedModel, setSelectedModel] = useState('sd-2-1-base')
  const [selectedAgent, setSelectedAgent] = useState('general')
  const [autopilot, setAutopilot] = useState(false)
  const [folders, setFolders] = useState<Array<{ id: string; name: string; expanded: boolean }>>([
    { id: 'fold-1', name: 'Project Files', expanded: true }
  ])
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [showAgentMenu, setShowAgentMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const models = [
    { id: 'sd-2-1-base', name: 'Stable Diffusion 2.1-base (Fastest)', icon: '⚡', source: 'local', speed: '20s', vram: '4GB' },
    { id: 'dall-e-mini', name: 'DALL-E mini', icon: '🎨', source: 'local', speed: '15s', vram: '2GB' },
    { id: 'gpt-4', name: 'GPT-4', icon: '🧠', source: 'openai', speed: 'streaming', vram: '-' },
    { id: 'claude', name: 'Claude 3', icon: '🎯', source: 'anthropic', speed: 'streaming', vram: '-' },
    { id: 'mistral', name: 'Mistral-7B', icon: '🚀', source: 'local', speed: '8s', vram: '7GB' },
  ]

  const agents = [
    { id: 'general', name: 'General Assistant', icon: '🤖' },
    { id: 'code', name: 'Code Expert', icon: '💻' },
    { id: 'design', name: 'Design Specialist', icon: '🎨' },
    { id: 'research', name: 'Research Agent', icon: '📚' },
    { id: 'crane', name: 'CRANE 3D (Custom)', icon: '🌟' },
  ]

  const addFolder = () => {
    const newFolder = {
      id: `fold-${Date.now()}`,
      name: 'New Folder',
      expanded: true
    }
    setFolders([...folders, newFolder])
  }

  const toggleFolder = (id: string) => {
    setFolders(folders.map(f => 
      f.id === id ? { ...f, expanded: !f.expanded } : f
    ))
  }

  const deleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileList = Array.from(files).map(f => f.name).join(', ')
      onInputChange(`${input}${input ? ' ' : ''}[Files: ${fileList}]`)
    }
  }

  const currentModel = models.find(m => m.id === selectedModel)
  const currentAgent = agents.find(a => a.id === selectedAgent)

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-400 max-w-md">
              <h2 className="text-3xl font-bold text-slate-300 mb-4">Welcome to PAIGE</h2>
              <p className="mb-4">Start a conversation with your AI team</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-800 rounded-lg p-2">📤 Upload files</div>
                <div className="bg-slate-800 rounded-lg p-2">🤖 Pick agents</div>
                <div className="bg-slate-800 rounded-lg p-2">⚡ Auto-pilot</div>
                <div className="bg-slate-800 rounded-lg p-2">📁 Manage folders</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer Area */}
      <div className="border-t border-slate-700 bg-slate-900 p-4 space-y-3">
        {/* Context & Controls Row */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 flex-wrap">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition border border-green-500"
              title="Current model: Click to change"
            >
              <span>{currentModel?.icon}</span>
              <span className="truncate max-w-[140px]">{currentModel?.name}</span>
              <Settings2 size={14} className="opacity-70" />
            </button>
            {showModelMenu && (
              <div className="absolute top-full mt-2 left-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 min-w-[280px]">
                {models.map((model: any) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id)
                      setShowModelMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition border-b border-slate-700 last:border-b-0 ${
                      selectedModel === model.id
                        ? 'bg-green-600 text-white'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{model.icon}</span>
                        <span className="font-medium">{model.name}</span>
                      </div>
                      {selectedModel === model.id && <span className="text-green-300">✓</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 ml-6">
                      {model.source === 'local' ? `⚡ ${model.speed} | 💾 ${model.vram}` : `${model.source} API`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agent Selector */}
          <div className="relative">
            <button
              onClick={() => setShowAgentMenu(!showAgentMenu)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
            >
              <span>{currentAgent?.icon}</span>
              <span className="truncate max-w-[140px]">{currentAgent?.name}</span>
              <Settings2 size={14} className="opacity-50" />
            </button>
            {showAgentMenu && (
              <div className="absolute top-full mt-2 left-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 min-w-[220px]">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent.id)
                      setShowAgentMenu(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      selectedAgent === agent.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {agent.icon} {agent.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Autopilot Toggle */}
          <button
            onClick={() => setAutopilot(!autopilot)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition ${
              autopilot
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            <Zap size={16} />
            {autopilot ? 'Autopilot ON' : 'Autopilot OFF'}
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition"
          >
            <Upload size={16} />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Folders Panel */}
        <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">PROJECT CONTEXT</span>
            <button
              onClick={addFolder}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition"
              title="Add folder"
            >
              <FolderPlus size={14} />
            </button>
          </div>

          <div className="space-y-1">
            {folders.map(folder => (
              <div key={folder.id}>
                <div className="flex items-center gap-1 group">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="p-0.5 hover:bg-slate-700 rounded transition"
                  >
                    {folder.expanded ? '▼' : '▶'}
                  </button>
                  <Folder size={14} className="text-yellow-400" />
                  <input
                    type="text"
                    value={folder.name}
                    readOnly
                    className="flex-1 text-xs text-slate-300 bg-transparent hover:bg-slate-700/50 px-1 rounded truncate"
                  />
                  <button
                    onClick={() => deleteFolder(folder.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-900/50 rounded text-red-400 transition text-xs"
                  >
                    ✕
                  </button>
                </div>
                {folder.expanded && (
                  <div className="ml-4 text-xs text-slate-500 py-1">
                    <div className="flex items-center gap-1 opacity-60">
                      <File size={12} />
                      <span>crane-model.py</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-60">
                      <File size={12} />
                      <span>config.json</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && onSendMessage()}
            placeholder="Message PAIGE with your AI team... (Ctrl+Enter to send)"
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={onSendMessage}
            disabled={!input.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2 text-white font-medium"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-300 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700/50">
          <div className="flex gap-4 items-center">
            <span>🤖 {currentAgent?.name}</span>
            <span className="flex items-center gap-1 bg-green-900/50 px-2 py-1 rounded border border-green-700">
              <span>💬 Active Model:</span>
              <span className="font-semibold text-green-300">{currentModel?.name}</span>
            </span>
            {autopilot && <span className="text-green-400 animate-pulse">⚡ Autopilot Active</span>}
          </div>
          <span className="text-slate-500">{folders.length} folder{folders.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
