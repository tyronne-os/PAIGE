import React, { useState, useRef } from 'react';
import { Save, Plus, Trash2, Eye, Wand2 } from 'lucide-react';
import './DesignEasel.css';

interface DesignSpec {
  id: string;
  name: string;
  description: string;
  layers: DesignLayer[];
  diagram?: string;
  createdAt: string;
  updatedAt: string;
}

interface DesignLayer {
  id: string;
  type: 'component' | 'flow' | 'skill' | 'connection';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  metadata?: any;
}

const DesignEasel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [specs, setSpecs] = useState<DesignSpec[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<DesignSpec | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showNewSpec, setShowNewSpec] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTool, setCurrentTool] = useState<'component' | 'flow' | 'skill'>('component');
  const [preview, setPreview] = useState(false);

  const createNewSpec = () => {
    if (!newSpecName.trim()) return;

    const spec: DesignSpec = {
      id: `spec-${Date.now()}`,
      name: newSpecName,
      description: '',
      layers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSpecs([...specs, spec]);
    setSelectedSpec(spec);
    setNewSpecName('');
    setShowNewSpec(false);
  };

  const addLayer = (type: 'component' | 'flow' | 'skill' | 'connection') => {
    if (!selectedSpec) return;

    const newLayer: DesignLayer = {
      id: `layer-${Date.now()}`,
      type,
      name: `${type} #${selectedSpec.layers.length + 1}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 150,
      height: 80,
      color: getColorForType(type),
    };

    const updated = {
      ...selectedSpec,
      layers: [...selectedSpec.layers, newLayer],
      updatedAt: new Date().toISOString(),
    };

    setSelectedSpec(updated);
    setSpecs(specs.map(s => s.id === updated.id ? updated : s));
  };

  const getColorForType = (type: string): string => {
    const colors: Record<string, string> = {
      component: '#4f46e5',
      flow: '#06b6d4',
      skill: '#8b5cf6',
      connection: '#ec4899',
    };
    return colors[type] || '#6366f1';
  };

  const deleteLayer = (layerId: string) => {
    if (!selectedSpec) return;

    const updated = {
      ...selectedSpec,
      layers: selectedSpec.layers.filter(l => l.id !== layerId),
      updatedAt: new Date().toISOString(),
    };

    setSelectedSpec(updated);
    setSpecs(specs.map(s => s.id === updated.id ? updated : s));
  };

  const generateDiagram = () => {
    if (!selectedSpec) return;

    // Generate ASCII flow diagram
    let diagram = `DESIGN SPEC: ${selectedSpec.name}\n`;
    diagram += `Generated: ${new Date().toLocaleString()}\n\n`;
    diagram += 'COMPONENTS:\n';

    const components = selectedSpec.layers.filter(l => l.type === 'component');
    components.forEach((c, i) => {
      diagram += `  ${i + 1}. ${c.name}\n`;
    });

    diagram += '\nFLOWS:\n';
    const flows = selectedSpec.layers.filter(l => l.type === 'flow');
    flows.forEach((f, i) => {
      diagram += `  ${i + 1}. ${f.name}\n`;
    });

    diagram += '\nSKILLS:\n';
    const skills = selectedSpec.layers.filter(l => l.type === 'skill');
    skills.forEach((s, i) => {
      diagram += `  ${i + 1}. ${s.name}\n`;
    });

    const updated = {
      ...selectedSpec,
      diagram,
      updatedAt: new Date().toISOString(),
    };

    setSelectedSpec(updated);
    setSpecs(specs.map(s => s.id === updated.id ? updated : s));
  };

  const exportSpec = () => {
    if (!selectedSpec) return;

    const json = JSON.stringify(selectedSpec, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSpec.name}.json`;
    a.click();
  };

  return (
    <div className="design-easel">
      {/* Header */}
      <div className="easel-header">
        <h2>🎨 Design Easel</h2>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => setPreview(!preview)} title="Toggle Preview">
            <Eye size={18} />
          </button>
          {onClose && (
            <button className="icon-btn close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="easel-layout">
        {/* Specs List */}
        <div className="specs-panel">
          <div className="panel-header">
            <h3>Designs</h3>
            <button className="add-btn" onClick={() => setShowNewSpec(true)}>
              <Plus size={16} />
            </button>
          </div>

          {showNewSpec && (
            <div className="spec-form">
              <input
                type="text"
                placeholder="Spec name..."
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createNewSpec()}
              />
              <div className="form-buttons">
                <button onClick={createNewSpec} className="save-btn">
                  Create
                </button>
                <button onClick={() => setShowNewSpec(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="specs-list">
            {specs.length === 0 ? (
              <p className="empty-state">No designs yet</p>
            ) : (
              specs.map(spec => (
                <div
                  key={spec.id}
                  className={`spec-item ${selectedSpec?.id === spec.id ? 'active' : ''}`}
                  onClick={() => setSelectedSpec(spec)}
                >
                  <div className="spec-title">{spec.name}</div>
                  <div className="spec-meta">{spec.layers.length} layers</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Canvas / Editor */}
        <div className="canvas-area">
          {!selectedSpec ? (
            <div className="empty-canvas">
              <p>Create or select a design to start</p>
            </div>
          ) : !preview ? (
            <>
              {/* Toolbar */}
              <div className="canvas-toolbar">
                <div className="tool-group">
                  <button
                    className={`tool-btn ${currentTool === 'component' ? 'active' : ''}`}
                    onClick={() => setCurrentTool('component')}
                    title="Component"
                  >
                    □
                  </button>
                  <button
                    className={`tool-btn ${currentTool === 'flow' ? 'active' : ''}`}
                    onClick={() => setCurrentTool('flow')}
                    title="Flow"
                  >
                    →
                  </button>
                  <button
                    className={`tool-btn ${currentTool === 'skill' ? 'active' : ''}`}
                    onClick={() => setCurrentTool('skill')}
                    title="Skill"
                  >
                    ★
                  </button>
                </div>

                <button
                  className="action-btn generate-btn"
                  onClick={generateDiagram}
                  title="Generate diagram"
                >
                  <Wand2 size={16} />
                  Generate
                </button>

                <button className="action-btn export-btn" onClick={exportSpec} title="Export spec">
                  <Save size={16} />
                  Export
                </button>
              </div>

              {/* Canvas */}
              <div className="canvas">
                <svg className="canvas-svg" ref={canvasRef}>
                  {/* Grid background */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Layers */}
                  {selectedSpec.layers.map(layer => (
                    <g key={layer.id} className="layer-group">
                      <rect
                        x={layer.x}
                        y={layer.y}
                        width={layer.width}
                        height={layer.height}
                        fill={layer.color}
                        fillOpacity="0.2"
                        stroke={layer.color}
                        strokeWidth="2"
                        rx="4"
                        className="layer-rect"
                      />
                      <text
                        x={layer.x + layer.width / 2}
                        y={layer.y + layer.height / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="layer-text"
                      >
                        {layer.name}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Layers Panel */}
              <div className="layers-panel">
                <div className="panel-header">
                  <h3>Layers ({selectedSpec.layers.length})</h3>
                  <button
                    className="add-btn"
                    onClick={() => addLayer(currentTool)}
                    title="Add layer"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="layers-list">
                  {selectedSpec.layers.length === 0 ? (
                    <p className="empty-state">No layers yet</p>
                  ) : (
                    selectedSpec.layers.map(layer => (
                      <div key={layer.id} className="layer-item">
                        <div className="layer-info">
                          <span
                            className="layer-color"
                            style={{ backgroundColor: layer.color }}
                          />
                          <div className="layer-details">
                            <p className="layer-name">{layer.name}</p>
                            <p className="layer-type">{layer.type}</p>
                          </div>
                        </div>
                        <button
                          className="delete-btn"
                          onClick={() => deleteLayer(layer.id)}
                          title="Delete layer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            // Preview Mode
            <div className="preview-mode">
              <div className="preview-header">
                <h3>{selectedSpec.name}</h3>
                <button className="close-preview-btn" onClick={() => setPreview(false)}>
                  ← Back to Editor
                </button>
              </div>
              <div className="preview-content">
                {selectedSpec.diagram ? (
                  <pre className="diagram-display">{selectedSpec.diagram}</pre>
                ) : (
                  <p className="preview-empty">Generate a diagram to see preview</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignEasel;
