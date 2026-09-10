import { useState } from 'react'
import { Send, Copy, Download, Settings2 } from 'lucide-react'

interface ModelResult {
  model: string
  response: string
  latency: number
  tokens: number
}

function SplitPlayground() {
  const [prompt, setPrompt] = useState('What is the future of AI in 3D modeling?')
  const [modelA, setModelA] = useState('mistral-7b')
  const [modelB, setModelB] = useState('qwen-14b')
  const [resultsA, setResultsA] = useState<ModelResult | null>(null)
  const [resultsB, setResultsB] = useState<ModelResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runComparison = async () => {
    setLoading(true)
    try {
      // Simulate API calls to both models
      const [resA, resB] = await Promise.all([
        fetch('/api/inference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelA, prompt })
        }),
        fetch('/api/inference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelB, prompt })
        })
      ])

      const dataA = await resA.json()
      const dataB = await resB.json()

      setResultsA(dataA)
      setResultsB(dataB)
    } catch (error) {
      console.error('Error running comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      {/* Prompt Input */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <label className="text-sm font-semibold text-slate-300 mb-2 block">Shared Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Enter prompt to test on both models..."
          className="w-full h-24 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      {/* Model Selection & Run */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-300 mb-2 block">Model A</label>
          <select
            value={modelA}
            onChange={e => setModelA(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="phi-2">Phi-2 (fast)</option>
            <option value="mistral-7b">Mistral-7B</option>
            <option value="llama-13b">Llama-2-13B</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-300 mb-2 block">Model B</label>
          <select
            value={modelB}
            onChange={e => setModelB(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="mistral-7b">Mistral-7B</option>
            <option value="llama-13b">Llama-2-13B</option>
            <option value="qwen-14b">Qwen-14B</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* Result A */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col overflow-hidden">
          <div className="mb-3">
            <h3 className="font-semibold text-slate-200">{modelA}</h3>
            <p className="text-xs text-slate-400">Model A</p>
          </div>
          <div className="flex-1 overflow-y-auto mb-3 p-3 bg-slate-900 rounded text-sm text-slate-300">
            {resultsA ? (
              resultsA.response
            ) : (
              <span className="text-slate-500 italic">Results will appear here...</span>
            )}
          </div>
          {resultsA && (
            <div className="flex gap-2 text-xs text-slate-400">
              <span>{resultsA.latency}ms</span>
              <span>•</span>
              <span>{resultsA.tokens} tokens</span>
              <button
                onClick={() => copyResult(resultsA.response)}
                className="ml-auto p-1 hover:bg-slate-700 rounded"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Result B */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex flex-col overflow-hidden">
          <div className="mb-3">
            <h3 className="font-semibold text-slate-200">{modelB}</h3>
            <p className="text-xs text-slate-400">Model B</p>
          </div>
          <div className="flex-1 overflow-y-auto mb-3 p-3 bg-slate-900 rounded text-sm text-slate-300">
            {resultsB ? (
              resultsB.response
            ) : (
              <span className="text-slate-500 italic">Results will appear here...</span>
            )}
          </div>
          {resultsB && (
            <div className="flex gap-2 text-xs text-slate-400">
              <span>{resultsB.latency}ms</span>
              <span>•</span>
              <span>{resultsB.tokens} tokens</span>
              <button
                onClick={() => copyResult(resultsB.response)}
                className="ml-auto p-1 hover:bg-slate-700 rounded"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 flex items-center gap-2 transition">
          <Download size={16} />
          Export Results
        </button>
        <button
          onClick={runComparison}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium flex items-center gap-2 transition"
        >
          <Send size={16} />
          {loading ? 'Testing...' : 'Run A-B Test'}
        </button>
      </div>
    </div>
  )
}

export default SplitPlayground
