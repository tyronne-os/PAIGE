import { useState } from 'react'
import { Settings, ChevronRight, Copy, Zap, Layers } from 'lucide-react'
import SplitPlayground from './features/SplitPlayground'
import PipelineCanvas from './features/PipelineCanvas'
import EdenDiffusion from './features/EdenDiffusion'
import SettingsOverlay from './SettingsOverlay'

type ProjectMode = 'split' | 'pipeline' | 'eden'

interface ProjectPreviewProps {
  mode: ProjectMode
  onModeChange: (mode: ProjectMode) => void
}

function ProjectPreview({ mode, onModeChange }: ProjectPreviewProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [hoveredControl, setHoveredControl] = useState<string | null>(null)

  const features = [
    {
      id: 'split',
      label: 'Split',
      icon: Copy,
      description: 'A-B Testing Playground',
      color: 'from-purple-600 to-blue-600'
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: Layers,
      description: 'Workflow Canvas',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'eden',
      label: 'Eden',
      icon: Zap,
      description: 'Diffusion Editor',
      color: 'from-pink-600 to-purple-600'
    }
  ]

  return (
    <div className="relative w-full h-full flex flex-col bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        {mode === 'split' && <SplitPlayground />}
        {mode === 'pipeline' && <PipelineCanvas />}
        {mode === 'eden' && <EdenDiffusion />}
      </div>

      {/* Bottom Control Bar - Appears on hover */}
      <div
        className="relative h-20 border-t border-slate-700 bg-slate-900/50 backdrop-blur transition-all duration-300"
        onMouseEnter={() => setHoveredControl('bar')}
        onMouseLeave={() => setHoveredControl(null)}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-0 hover:opacity-100 transition-opacity" />

        {/* Control Content */}
        <div className="relative h-full flex items-center justify-between px-6">
          {/* Feature Buttons */}
          <div className="flex gap-3">
            {features.map(feature => {
              const Icon = feature.icon
              const isActive = mode === feature.id
              return (
                <button
                  key={feature.id}
                  onClick={() => onModeChange(feature.id as ProjectMode)}
                  onMouseEnter={() => setHoveredControl(feature.id)}
                  onMouseLeave={() => setHoveredControl(null)}
                  className={`group relative px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${feature.color} text-white shadow-lg`
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {/* Animated gradient background for active */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  )}

                  <div className="relative flex items-center gap-2">
                    <Icon size={16} />
                    <span>{feature.label}</span>
                    {isActive && <ChevronRight size={14} className="animate-pulse" />}
                  </div>

                  {/* Tooltip */}
                  {hoveredControl === feature.id && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900 rounded text-xs text-slate-200 whitespace-nowrap border border-slate-700 pointer-events-none">
                      {feature.description}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right side info and settings */}
          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="hidden group-hover:flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span>Ready to test</span>
            </div>

            {/* Settings Button - Only visible on hover */}
            <button
              onClick={() => setShowSettings(true)}
              onMouseEnter={() => setHoveredControl('settings')}
              onMouseLeave={() => setHoveredControl(null)}
              className="opacity-0 hover:opacity-100 transition-opacity p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 group"
            >
              <Settings size={20} />
              {hoveredControl === 'settings' && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 rounded text-xs text-slate-200 whitespace-nowrap border border-slate-700 pointer-events-none">
                  Settings
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Group hover state for parent */}
        <div className="group" />
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <SettingsOverlay
          mode={mode}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default ProjectPreview
