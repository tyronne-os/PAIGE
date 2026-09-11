import { Send, Upload, Settings2, Zap, FolderPlus, Folder, File, Mic, MicOff, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [collapsedSections, setCollapsedSections] = useState({
    model: false,
    agent: false,
    folders: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

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
      const fileList = Array.from(files).map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join(', ')
      onInputChange(`${input}${input ? ' ' : ''}[Files: ${fileList}]`)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        processAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(t => t + 1)
      }, 1000)
    } catch (error) {
      console.error('Microphone access denied:', error)
      alert('Microphone access denied. Please check your browser permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Send to backend for speech-to-text
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        onInputChange(`${input}${input ? ' ' : ''}${data.text}`)
      } else {
        console.error('Transcription failed')
        alert('Speech-to-text failed. Try again.')
      }
    } catch (error) {
      console.error('Transcription error:', error)
      alert('Could not process audio. Make sure backend is running.')
    }
  }

  const toggleSection = (section: 'model' | 'agent' | 'folders') => {
    setCollapsedSections({
      ...collapsedSections,
      [section]: !collapsedSections[section]
    })
  }

  const currentModel = models.find(m => m.id === selectedModel)
  const currentAgent = agents.find(a => a.id === selectedAgent)

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Messages Container - Smaller */}
      <div className="h-40 overflow-y-auto p-4 space-y-2 border-b border-slate-700">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400 text-sm">
              <p>Start a conversation with your AI team</p>
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
                  className={`max-w-xs px-3 py-2 rounded text-xs ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer Area - SMALLER */}
      <div className="border-t border-slate-700 bg-slate-900 p-3 space-y-2">
        {/* Context & Controls - COLLAPSIBLE */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <button
            onClick={() => toggleSection('model')}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 transition rounded-t-lg"
          >
            <span className="text-sm font-semibold text-slate-300">🎙️ Model & Input</span>
            {collapsedSections.model ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          
          {!collapsedSections.model && (
            <div className="border-t border-slate-700 px-3 py-2 flex items-center gap-2 flex-wrap">
              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelMenu(!showModelMenu)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-green-700 hover:bg-green-600 text-white text-xs font-medium transition border border-green-500"
                  title="Current model: Click to change"
                >
                  <span>{currentModel?.icon}</span>
                  <span className="truncate max-w-[120px]">{currentModel?.name}</span>
                  <Settings2 size={12} className="opacity-70" />
                </button>
                {showModelMenu && (
                  <div className="absolute top-full mt-1 left-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 min-w-[280px]">
                    {models.map((model: any) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id)
                          setShowModelMenu(false)
                        }}
                        className={`w-full text-left px-3 py-1 text-xs transition border-b border-slate-700 last:border-b-0 ${
                          selectedModel === model.id
                            ? 'bg-green-600 text-white'
                            : 'text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span>{model.icon}</span>
                            <span className="font-medium">{model.name}</span>
                          </div>
                          {selectedModel === model.id && <span className="text-green-300">✓</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 ml-5">
                          {model.source === 'local' ? `⚡ ${model.speed} | 💾 ${model.vram}` : `${model.source} API`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mic Button - DICTATION */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                title={isRecording ? `Recording... ${recordingTime}s` : 'Click to record audio'}
              >
                {isRecording ? (
                  <>
                    <MicOff size={12} />
                    <span>{recordingTime}s</span>
                  </>
                ) : (
                  <Mic size={12} />
                )}
              </button>

              {/* Upload Button - Multi-file */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition"
                title="Upload audio, video, documents, images..."
              >
                <Upload size={12} />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".wav,.mp3,.m4a,.webm,.mp4,.mov,.avi,.pdf,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Spacer */}
              <div className="flex-1" />

              {/* Autopilot Toggle */}
              <button
                onClick={() => setAutopilot(!autopilot)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                  autopilot
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                <Zap size={12} />
                {autopilot ? 'ON' : 'OFF'}
              </button>
            </div>
          )}
        </div>

        {/* Agent Selector - COLLAPSIBLE */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <button
            onClick={() => toggleSection('agent')}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-700 transition rounded-t-lg"
          >
            <span className="text-sm font-semibold text-slate-300">🤖 Agent</span>
            {collapsedSections.agent ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          {!collapsedSections.agent && (
            <div className="border-t border-slate-700 px-3 py-2">
              <div className="relative">
                <button
                  onClick={() => setShowAgentMenu(!showAgentMenu)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-200 text-xs font-medium transition w-full"
                >
                  <span>{currentAgent?.icon}</span>
                  <span className="truncate">{currentAgent?.name}</span>
                  <Settings2 size={12} className="opacity-50" />
                </button>
                {showAgentMenu && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20">
                    {agents.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgent(agent.id)
                          setShowAgentMenu(false)
                        }}
                        className={`w-full text-left px-3 py-1 text-xs transition ${
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
            </div>
          )}
        </div>

        {/* Folders Panel - LARGER & COLLAPSIBLE */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
          <button
            onClick={() => toggleSection('folders')}
            className="flex items-center justify-between px-3 py-2 hover:bg-slate-700 transition"
          >
            <span className="text-sm font-semibold text-slate-300">📁 PROJECT CONTEXT</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  addFolder()
                }}
                className="p-1 hover:bg-slate-600 rounded text-slate-400 hover:text-slate-200 transition"
                title="Add folder"
              >
                <FolderPlus size={16} />
              </button>
              {collapsedSections.folders ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
          </button>

          {!collapsedSections.folders && (
            <div className="border-t border-slate-700 p-3 space-y-2 flex-1 overflow-y-auto">
              {folders.map(folder => (
                <div key={folder.id}>
                  <div className="flex items-center gap-1 group">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="p-0.5 hover:bg-slate-700 rounded transition text-sm"
                    >
                      {folder.expanded ? '▼' : '▶'}
                    </button>
                    <Folder size={16} className="text-yellow-400" />
                    <input
                      type="text"
                      value={folder.name}
                      readOnly
                      className="flex-1 text-sm text-slate-300 bg-transparent hover:bg-slate-700/50 px-1 rounded truncate"
                    />
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-900/50 rounded text-red-400 transition text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  {folder.expanded && (
                    <div className="ml-6 text-sm text-slate-400 py-2 space-y-1">
                      <div className="flex items-center gap-2 hover:text-slate-300 cursor-pointer">
                        <File size={14} />
                        <span>crane-model.py</span>
                      </div>
                      <div className="flex items-center gap-2 hover:text-slate-300 cursor-pointer">
                        <File size={14} />
                        <span>config.json</span>
                      </div>
                      <div className="flex items-center gap-2 hover:text-slate-300 cursor-pointer">
                        <File size={14} />
                        <span>requirements.txt</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && onSendMessage()}
            placeholder="Message PAIGE... (Enter to send)"
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={onSendMessage}
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-1 text-white font-medium text-sm"
          >
            <Send size={14} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-1 text-xs text-slate-300 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700/50">
          <div className="flex gap-3 items-center">
            <span>🤖 {currentAgent?.name}</span>
            <span className="flex items-center gap-1 bg-green-900/50 px-2 py-0.5 rounded border border-green-700">
              <span>💬</span>
              <span className="font-semibold text-green-300">{currentModel?.name}</span>
            </span>
            {autopilot && <span className="text-green-400 animate-pulse">⚡ AP</span>}
          </div>
          <span className="text-slate-500">{folders.length} folders</span>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
