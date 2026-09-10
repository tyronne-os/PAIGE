import { useState } from 'react'
import { Plus, Play, Save, RotateCcw } from 'lucide-react'

interface PipelineNode {
  id: string
  type: 'input' | 'model' | 'filter' | 'output'
  label: string
  x: number
  y: number
  config?: Record<string, any>
}

interface PipelineEdge {
  from: string
  to: string
}

function PipelineCanvas() {
  const [nodes, setNodes] = useState<PipelineNode[]>([
    { id: 'input', type: 'input', label: 'Prompt Input', x: 50, y: 200 },
    { id: 'model1', type: 'model', label: 'Mistral-7B', x: 300, y: 150 },
    { id: 'model2', type: 'model', label: 'Qwen-14B', x: 300, y: 300 },
    { id: 'output', type: 'output', label: 'Response', x: 550, y: 200 }
  ])
  const [edges, setEdges] = useState<PipelineEdge[]>([
    { from: 'input', to: 'model1' },
    { from: 'input', to: 'model2' },
    { from: 'model1', to: 'output' },
    { from: 'model2', to: 'output' }
  ])
  const [running, setRunning] = useState(false)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const nodeTypeColors = {
    input: 'from-green-600 to-emerald-600',
    model: 'from-blue-600 to-cyan-600',
    filter: 'from-purple-600 to-pink-600',
    output: 'from-orange-600 to-red-600'
  }

  const nodeTypeIcons = {
    input: '📥',
    model: '🤖',
    filter: '⚙️',
    output: '📤'
  }

  const addNode = (type: 'input' | 'model' | 'filter' | 'output') => {
    const newNode: PipelineNode = {
      id: `node-${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodes.length}`,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    }
    setNodes([...nodes, newNode])
  }

  const runPipeline = async () => {
    setRunning(true)
    try {
      // Simulate pipeline execution
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Pipeline executed successfully!')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="w-full h-full flex gap-4">
      {/* Canvas */}
      <div className="flex-1 bg-slate-900 rounded-lg border border-slate-700 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" style={{ background: 'radial-gradient(circle at 20% 50%, rgba(59,130,246,0.1) 0%, transparent 50%)' }}>
          {/* Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Edges */}
          {edges.map((edge, idx) => {
            const fromNode = nodes.find(n => n.id === edge.from)
            const toNode = nodes.find(n => n.id === edge.to)
            if (!fromNode || !toNode) return null
            return (
              <line
                key={idx}
                x1={fromNode.x + 60}
                y1={fromNode.y + 30}
                x2={toNode.x}
                y2={toNode.y + 30}
                stroke="#60a5fa"
                strokeWidth="2"
                markerEnd="url(#arrowblue)"
              />
            )
          })}
          <defs>
            <marker id="arrowblue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#60a5fa" />
            </marker>
          </defs>
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0">
          {nodes.map(node => (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`absolute w-24 h-16 cursor-move transition-all ${
                selectedNode === node.id ? 'ring-2 ring-yellow-400' : ''
              }`}
              style={{ left: node.x, top: node.y }}
            >
              <div className={`w-full h-full bg-gradient-to-br ${nodeTypeColors[node.type]} rounded-lg p-2 flex flex-col items-center justify-center text-white shadow-lg border border-slate-600 hover:border-slate-400`}>
                <div className="text-lg">{nodeTypeIcons[node.type]}</div>
                <div className="text-xs text-center font-medium truncate">{node.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-56 flex flex-col gap-4">
        {/* Add Node Panel */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <h3 className="font-semibold text-slate-200 mb-3">Add Node</h3>
          <div className="space-y-2">
            {(['input', 'model', 'filter', 'output'] as const).map(type => (
              <button
                key={type}
                onClick={() => addNode(type)}
                className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-slate-200 transition"
              >
                + {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Node Details */}
        {selectedNode && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <h3 className="font-semibold text-slate-200 mb-3">Node Config</h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">Selected: {nodes.find(n => n.id === selectedNode)?.label}</p>
              <p className="text-slate-400">Type: {nodes.find(n => n.id === selectedNode)?.type}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 text-sm">
          <p className="text-slate-300 mb-2">📊 Pipeline</p>
          <p className="text-slate-400">{nodes.length} nodes</p>
          <p className="text-slate-400">{edges.length} connections</p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 flex items-center justify-center gap-2 transition">
            <Save size={16} />
            Save
          </button>
          <button
            onClick={runPipeline}
            disabled={running}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 rounded-lg text-white flex items-center justify-center gap-2 transition font-medium"
          >
            <Play size={16} />
            {running ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PipelineCanvas
