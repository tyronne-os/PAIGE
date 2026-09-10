import { useState, useEffect } from 'react'
import { Search, Zap, HardDrive, Cpu, ChevronRight, Check } from 'lucide-react'

interface Model {
  name: string
  model_id: string
  source: string
  size_gb: number
  recommended_gpu: string
  description: string
  tags: string[]
}

interface GPU {
  name: string
  type: string
  memory_gb: number
  available: boolean
  compute_capability?: string
}

interface ModelComposerProps {
  onSelectModel: (model: Model, gpu: GPU) => void
  onClose: () => void
}

function ModelComposer({ onSelectModel, onClose }: ModelComposerProps) {
  const [models, setModels] = useState<Model[]>([])
  const [gpus, setGpus] = useState<GPU[]>([])
  const [search, setSearch] = useState('')
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [selectedGpu, setSelectedGpu] = useState<GPU | null>(null)
  const [recommendedGpu, setRecommendedGpu] = useState<GPU | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'browse' | 'search'>('browse')

  // Fetch models and GPUs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modelsRes, gpusRes] = await Promise.all([
          fetch('/api/models'),
          fetch('/api/gpus')
        ])
        const modelsData = await modelsRes.json()
        const gpusData = await gpusRes.json()
        
        setModels(modelsData.models)
        setGpus(gpusData.gpus)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Get GPU recommendation when model is selected
  useEffect(() => {
    if (selectedModel) {
      const recommended = gpus.find(g => g.type === selectedModel.recommended_gpu)
      setRecommendedGpu(recommended || null)
      setSelectedGpu(recommended || null)
    }
  }, [selectedModel, gpus])

  const filteredModels = search
    ? models.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : models

  const gpuIcon = (type: string) => {
    switch (type) {
      case 'nvidia':
        return <Zap className="text-green-400" size={18} />
      case 'hf_free':
        return <HardDrive className="text-blue-400" size={18} />
      default:
        return <Cpu className="text-gray-400" size={18} />
    }
  }

  const handleSelect = () => {
    if (selectedModel && selectedGpu) {
      onSelectModel(selectedModel, selectedGpu)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">🎯 Model Composer</h2>
          <p className="text-sm text-slate-400">Select a model + GPU for your project</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-6 pt-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 px-2 font-medium transition ${
              activeTab === 'browse'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Browse Models
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 px-2 font-medium transition ${
              activeTab === 'search'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Search
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex gap-4 p-6">
          {/* Models List */}
          <div className="flex-1">
            {activeTab === 'search' && (
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-slate-400">Loading models...</div>
              ) : (
                filteredModels.map(model => (
                  <button
                    key={model.model_id}
                    onClick={() => setSelectedModel(model)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition border ${
                      selectedModel?.model_id === model.model_id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{model.name}</div>
                        <div className="text-xs opacity-75 mt-1">{model.description}</div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {model.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 bg-slate-700 rounded opacity-75"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedModel?.model_id === model.model_id && (
                        <Check className="text-green-400 mt-1" size={20} />
                      )}
                    </div>
                    <div className="text-xs mt-2 opacity-50">{model.size_gb}GB • {model.source}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* GPU & Details Panel */}
          <div className="w-80 flex flex-col gap-4">
            {selectedModel && (
              <>
                {/* Model Details */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Selected Model</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="text-white font-medium">{selectedModel.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Size:</span>
                      <span className="text-white font-medium">{selectedModel.size_gb}GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Source:</span>
                      <span className="text-blue-400 font-medium">{selectedModel.source}</span>
                    </div>
                  </div>
                </div>

                {/* GPU Recommendation */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    💡 Recommended GPU
                  </h3>
                  {recommendedGpu && (
                    <div className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50 mb-3">
                      {gpuIcon(recommendedGpu.type)}
                      <div className="flex-1">
                        <div className="font-medium text-blue-200">{recommendedGpu.name}</div>
                        <div className="text-xs text-blue-300">{recommendedGpu.memory_gb}GB</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Available GPUs */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Available GPUs</h3>
                  <div className="space-y-2">
                    {gpus.map(gpu => (
                      <button
                        key={gpu.name}
                        onClick={() => setSelectedGpu(gpu)}
                        className={`w-full flex items-center gap-3 p-2 rounded transition ${
                          selectedGpu?.name === gpu.name
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                        }`}
                      >
                        {gpuIcon(gpu.type)}
                        <div className="flex-1 text-left text-sm">
                          <div className="font-medium">{gpu.name}</div>
                          <div className="text-xs opacity-75">{gpu.memory_gb}GB</div>
                        </div>
                        {selectedGpu?.name === gpu.name && (
                          <Check className="text-green-400" size={16} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!selectedModel && (
              <div className="text-center py-8 text-slate-400">
                ← Select a model to see GPU options
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedModel || !selectedGpu}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white transition font-medium flex items-center gap-2"
          >
            Use Model <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModelComposer
