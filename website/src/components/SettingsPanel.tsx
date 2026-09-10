import { useState, useEffect } from 'react'
import { Settings, X, Zap, HardDrive, Check, AlertCircle } from 'lucide-react'

interface GPU {
  name: string
  type: string
  memory_gb: number
  available: boolean
  compute_capability?: string
}

interface Credentials {
  huggingface: string
  github: string
  nvidia: string
  openai: string
}

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [gpus, setGpus] = useState<GPU[]>([])
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [activeTab, setActiveTab] = useState<'gpu' | 'credentials'>('gpu')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      try {
        const [gpusRes, credsRes] = await Promise.all([
          fetch('/api/gpus'),
          fetch('/api/credentials')
        ])
        const gpusData = await gpusRes.json()
        const credsData = await credsRes.json()
        
        setGpus(gpusData.gpus)
        setCredentials(credsData)
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isOpen])

  const gpuIcon = (type: string) => {
    switch (type) {
      case 'nvidia':
        return <Zap className="text-green-400" size={20} />
      case 'hf_free':
        return <HardDrive className="text-blue-400" size={20} />
      default:
        return <Settings className="text-gray-400" size={20} />
    }
  }

  const statusIcon = (status: string) => {
    return status === '✓' ? (
      <Check className="text-green-400" size={18} />
    ) : (
      <AlertCircle className="text-red-400" size={18} />
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('gpu')}
            className={`flex-1 px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'gpu'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            GPU Configuration
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 px-6 py-3 font-medium transition border-b-2 ${
              activeTab === 'credentials'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Credentials
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading settings...</div>
          ) : activeTab === 'gpu' ? (
            <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-200 mb-2">🚀 PAIGE GPU Orchestration</h3>
                <p className="text-sm text-blue-300">
                  Small models (Phi, Mistral) → HF Free GPU (saves your VRAM)<br />
                  Large models (Qwen, Minimax) → NVIDIA GPU (maximum power)<br />
                  Auto-detection ensures optimal performance
                </p>
              </div>

              <h3 className="font-semibold text-slate-200 mb-4">Available GPUs</h3>
              <div className="space-y-3">
                {gpus.map(gpu => (
                  <div
                    key={gpu.name}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        {gpuIcon(gpu.type)}
                        <div>
                          <h4 className="font-semibold text-white">{gpu.name}</h4>
                          <p className="text-sm text-slate-400">Type: {gpu.type.toUpperCase()}</p>
                        </div>
                      </div>
                      {gpu.available && (
                        <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded text-xs font-medium">
                          Available
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Memory</p>
                        <p className="text-white font-medium">{gpu.memory_gb.toFixed(1)} GB</p>
                      </div>
                      {gpu.compute_capability && (
                        <div>
                          <p className="text-slate-500">Compute Capability</p>
                          <p className="text-white font-medium">{gpu.compute_capability}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs text-slate-400">
                        {gpu.type === 'hf_free' && '💡 Free tier GPU through HuggingFace Pro - perfect for smaller models'}
                        {gpu.type === 'nvidia' && '⚡ High-performance GPU - recommended for large models'}
                        {gpu.type === 'cpu' && '💻 CPU fallback - slower but always available'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-200 mb-2">🔐 Token Vault Integration</h3>
                <p className="text-sm text-green-300">
                  All credentials are securely loaded from your kiro vault<br />
                  PAIGE never stores secrets - they stay encrypted locally
                </p>
              </div>

              <h3 className="font-semibold text-slate-200 mb-4">Connected Services</h3>
              <div className="space-y-3">
                {credentials && Object.entries(credentials).map(([service, status]) => (
                  <div
                    key={service}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="capitalize font-semibold text-white flex-1">{service}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusIcon(status)}
                      <span className={`text-sm font-medium ${status === '✓' ? 'text-green-400' : 'text-red-400'}`}>
                        {status === '✓' ? 'Connected' : 'Not configured'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-amber-200 mb-2">ℹ️ Setup Instructions</h4>
                <p className="text-sm text-amber-300 mb-3">
                  Missing credentials? Make sure they're saved in your kiro vault:
                </p>
                <code className="block bg-slate-900 p-3 rounded text-xs text-amber-100 overflow-x-auto">
                  kiro vault set huggingface hf_*****
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
