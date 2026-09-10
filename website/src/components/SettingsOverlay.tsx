import { X, Zap, Database, Code, Share2 } from 'lucide-react'

type ProjectMode = 'split' | 'pipeline' | 'eden'

interface SettingsOverlayProps {
  mode: ProjectMode
  onClose: () => void
}

function SettingsOverlay({ mode, onClose }: SettingsOverlayProps) {
  const settingsConfig = {
    split: {
      title: 'A-B Test Settings',
      options: [
        { label: 'GPU Preference', value: 'auto', description: 'Auto-select best GPU' },
        { label: 'Timeout (sec)', value: '60', description: 'Max time per inference' },
        { label: 'Save Results', value: 'on', description: 'Auto-save comparisons' },
      ]
    },
    pipeline: {
      title: 'Pipeline Settings',
      options: [
        { label: 'Auto-Save', value: 'on', description: 'Save workflow as you edit' },
        { label: 'Parallel Execution', value: 'on', description: 'Run branches in parallel' },
        { label: 'Error Handling', value: 'retry', description: 'Retry on failure' },
      ]
    },
    eden: {
      title: 'Diffusion Settings',
      options: [
        { label: 'Output Format', value: 'png', description: 'Save as PNG/WEBP' },
        { label: 'Batch Size', value: '1', description: 'Images per generation' },
        { label: 'GPU Memory Limit', value: 'auto', description: 'VRAM management' },
      ]
    }
  }

  const config = settingsConfig[mode]

  // Bonus features (surprise #1 & #2)
  const bonusFeatures = [
    {
      icon: Share2,
      title: 'Instant Share',
      description: 'Generate shareable link for this project state'
    },
    {
      icon: Code,
      title: 'Export Code',
      description: 'Generate Python/JS code for your workflow'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 p-4 flex items-end justify-center">
      <div className="bg-slate-900 rounded-t-2xl shadow-2xl w-full max-w-2xl border border-slate-700 border-b-0 max-h-[70vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
          <h2 className="text-xl font-bold text-white">{config.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Standard Settings */}
          <div>
            <h3 className="font-semibold text-slate-200 mb-4">Configuration</h3>
            <div className="space-y-3">
              {config.options.map((option, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <div>
                    <p className="font-medium text-slate-200">{option.label}</p>
                    <p className="text-xs text-slate-400">{option.description}</p>
                  </div>
                  <div className="px-3 py-1 bg-slate-700 rounded text-sm text-slate-300 font-medium">
                    {option.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus Feature #1: Instant Share */}
          <div className="border-t border-slate-700 pt-6">
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Share2 className="text-purple-400 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-purple-200">🚀 Instant Share</h4>
                  <p className="text-sm text-purple-300 mt-1">
                    Generate a shareable link with your exact setup, models, and parameters. Share with teammates or save for later.
                  </p>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition mt-2">
                Generate Share Link
              </button>
            </div>
          </div>

          {/* Bonus Feature #2: Export Code */}
          <div>
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <Code className="text-green-400 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-green-200">💻 Export as Code</h4>
                  <p className="text-sm text-green-300 mt-1">
                    Generate production-ready Python or JavaScript code from your visual workflow.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                  Python
                </button>
                <button className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition">
                  JavaScript
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Section */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="font-semibold text-slate-200 mb-4">Advanced</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition">
                View Logs
              </button>
              <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 text-sm transition">
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Info Footer */}
          <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
            💡 All settings are automatically saved. Changes take effect immediately.
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsOverlay
