import { Send } from 'lucide-react'
import { useEffect, useRef } from 'react'

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-400">
              <h2 className="text-2xl font-semibold mb-2">Welcome to PAIGE</h2>
              <p>Start a conversation to get started</p>
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
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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

      {/* Input Area */}
      <div className="border-t border-slate-700 p-4 bg-slate-900">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && onSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={onSendMessage}
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPanel
