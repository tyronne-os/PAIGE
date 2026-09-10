import { Plus, Trash2, MessageCircle } from 'lucide-react'

interface Session {
  id: string
  title: string
  created: Date
}

interface SidebarProps {
  open: boolean
  sessions: Session[]
  currentSession: string
  onSelectSession: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
}

function Sidebar({
  open,
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SidebarProps) {
  if (!open) return null

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                currentSession === session.id
                  ? 'bg-slate-700 text-white'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageCircle size={16} className="flex-shrink-0" />
              <span className="flex-1 truncate text-sm">{session.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteSession(session.id)
                }}
                className="p-1 rounded hover:bg-slate-600 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        <p>PAIGE v1.0</p>
        <p>Standalone IDE</p>
      </div>
    </aside>
  )
}

export default Sidebar
