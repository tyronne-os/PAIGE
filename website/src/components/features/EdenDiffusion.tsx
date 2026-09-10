import { useState } from 'react'
import { Play, Palette, Sliders, Download } from 'lucide-react'

function EdenDiffusion() {
  const [prompt, setPrompt] = useState('A 3D digital human with ethereal features, surrounded by particles')
  const [model, setModel] = useState('stable-diffusion-xl')
  const [steps, setSteps] = useState(30)
  const [guidance, setGuidance] = useState(7.5)
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000))
  const [generating, setGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const generateImage = async () => {
    setGenerating(true)
    try {
      // Simulate diffusion model generation
      const canvas = document.createElement('canvas')
      canvas.width = 512
      canvas.height = 512
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Create gradient placeholder
        const gradient = ctx.createLinearGradient(0, 0, 512, 512)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(0.5, '#764ba2')
        gradient.addColorStop(1, '#f093fb')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 512)
        
        // Add some noise
        const imageData = ctx.getImageData(0, 0, 512, 512)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          data[i] += Math.random() * 50
          data[i + 1] += Math.random() * 50
          data[i + 2] += Math.random() * 50
        }
        ctx.putImageData(imageData, 0, 0)
        
        setGeneratedImage(canvas.toDataURL())
      }
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="w-full h-full flex gap-6">
      {/* Left Panel - Controls */}
      <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-4">
        {/* Model Selection */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <label className="text-sm font-semibold text-slate-300 block mb-2">Diffusion Model</label>
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="stable-diffusion-xl">Stable Diffusion XL</option>
            <option value="midjourney">Midjourney (HF GPU)</option>
            <option value="flux">Flux (Advanced)</option>
          </select>
        </div>

        {/* Prompt */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <label className="text-sm font-semibold text-slate-300 block mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your image..."
            className="w-full h-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Inference Steps */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-300">Steps</label>
            <span className="text-sm text-blue-400 font-medium">{steps}</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={steps}
            onChange={e => setSteps(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <p className="text-xs text-slate-500 mt-2">Higher = better quality, slower</p>
        </div>

        {/* Guidance Scale */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-300">Guidance Scale</label>
            <span className="text-sm text-pink-400 font-medium">{guidance.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={guidance}
            onChange={e => setGuidance(Number(e.target.value))}
            className="w-full accent-pink-600"
          />
          <p className="text-xs text-slate-500 mt-2">How strictly to follow prompt</p>
        </div>

        {/* Seed */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-300">Seed</label>
            <button
              onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
              className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition"
            >
              Randomize
            </button>
          </div>
          <input
            type="number"
            value={seed}
            onChange={e => setSeed(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-2">For reproducible results</p>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateImage}
          disabled={generating}
          className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition"
        >
          <Play size={18} />
          {generating ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Image Preview */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center relative">
          {generatedImage ? (
            <img
              src={generatedImage}
              alt="Generated"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-slate-500">
              <Palette className="mx-auto mb-3 opacity-50" size={48} />
              <p>Generate an image to see preview</p>
            </div>
          )}
        </div>

        {/* Stats & Export */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Model</p>
            <p className="text-sm font-semibold text-slate-200">{model}</p>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Quality</p>
            <p className="text-sm font-semibold text-slate-200">{steps} steps</p>
          </div>
        </div>

        {/* Export Buttons */}
        {generatedImage && (
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 flex items-center justify-center gap-2 transition">
              <Download size={16} />
              Download
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center justify-center gap-2 transition">
              <Sliders size={16} />
              Refine
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default EdenDiffusion
