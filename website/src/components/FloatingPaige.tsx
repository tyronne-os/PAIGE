import React, { useState, useEffect, useRef } from 'react';
import './FloatingPaige.css';

interface PaigSettings {
  customInstructions: string;
  selectedVoice: string;
  voiceClone: string | null;
  eqSettings: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
  };
  screenVisionEnabled: boolean;
  autoAnalyzeScreens: boolean;
}

interface ScreenAnalysis {
  timestamp: string;
  description: string;
  elementCount: number;
  focusArea: string;
  confidence: number;
}

const FloatingPaige: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceClone, setShowVoiceClone] = useState(false);
  const [screenAnalysis, setScreenAnalysis] = useState<ScreenAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [position, setPosition] = useState({ 
    x: 20, 
    y: window.innerHeight - 120
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const [settings, setSettings] = useState<PaigSettings>({
    customInstructions: 'Help me build amazing 3D digital humans with Tokkio.',
    selectedVoice: 'default-female',
    voiceClone: null,
    eqSettings: { bass: 0, mid: 0, treble: 0, volume: 70 },
    screenVisionEnabled: true,
    autoAnalyzeScreens: true
  });

  const floatingRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Female voices available
  const availableVoices = [
    { id: 'default-female', name: 'Default Female', lang: 'en-US' },
    { id: 'echo-female', name: 'Echo', lang: 'en-US' },
    { id: 'nova-female', name: 'Nova', lang: 'en-US' },
    { id: 'sage-female', name: 'Sage', lang: 'en-US' },
    { id: 'shimmer-female', name: 'Shimmer', lang: 'en-US' },
    { id: 'alloy-female', name: 'Alloy', lang: 'en-US' },
  ];

  // Persist settings to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('paige-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('paige-settings', JSON.stringify(settings));
  }, [settings]);

  // Auto-analyze screen periodically
  useEffect(() => {
    if (!settings.screenVisionEnabled || !settings.autoAnalyzeScreens) return;

    const interval = setInterval(() => {
      analyzeScreen();
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [settings.screenVisionEnabled, settings.autoAnalyzeScreens]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.floating-settings') ||
        (e.target as HTMLElement).closest('.floating-header-buttons')) {
      return;
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const analyzeScreen = async () => {
    setIsAnalyzing(true);
    try {
      // Capture visible screen region
      const canvas = await captureScreen();
      if (!canvas) {
        setIsAnalyzing(false);
        return;
      }

      // Send to vision API
      const res = await fetch('/api/paige/analyze-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: canvas.toDataURL('image/jpeg', 0.7),
          customInstructions: settings.customInstructions
        })
      });

      const data = await res.json();
      
      setScreenAnalysis({
        timestamp: new Date().toISOString(),
        description: data.description || 'Analyzing screen...',
        elementCount: data.elementCount || 0,
        focusArea: data.focusArea || 'General UI',
        confidence: data.confidence || 0.8
      });

    } catch (e) {
      console.error('Screen analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const captureScreen = async (): Promise<HTMLCanvasElement | null> => {
    try {
      const canvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
        logging: false
      });
      return canvas;
    } catch (e) {
      console.error('Screen capture error:', e);
      return null;
    }
  };

  const handleVoiceClone = async (audioFile: File) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('voiceName', 'cloned-voice');

      const res = await fetch('/api/paige/clone-voice', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      
      setSettings(prev => ({
        ...prev,
        voiceClone: data.voiceId,
        selectedVoice: data.voiceId
      }));

      setShowVoiceClone(false);
    } catch (e) {
      console.error('Voice clone error:', e);
    }
  };

  const renderSettingsPanel = () => (
    <div className="floating-settings-panel">
      <h3>⚙️ PAIGE Settings</h3>

      {/* Custom Instructions */}
      <div className="setting-group">
        <label>Custom Instructions</label>
        <textarea
          value={settings.customInstructions}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            customInstructions: e.target.value
          }))}
          placeholder="Enter custom instructions for PAIGE..."
        />
      </div>

      {/* Voice Selection */}
      <div className="setting-group">
        <label>Voice</label>
        <select
          value={settings.selectedVoice}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            selectedVoice: e.target.value
          }))}
        >
          {availableVoices.map(voice => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
        
        <button 
          className="clone-btn"
          onClick={() => setShowVoiceClone(!showVoiceClone)}
        >
          🎙️ Clone Voice
        </button>
      </div>

      {/* Voice Cloning UI */}
      {showVoiceClone && (
        <div className="voice-clone-panel">
          <h4>Clone Voice</h4>
          <p>Upload a 10-30 second audio sample to clone this voice</p>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleVoiceClone(e.target.files[0]);
              }
            }}
          />
        </div>
      )}

      {/* EQ Controls */}
      <div className="setting-group">
        <label>Voice Equalizer</label>
        
        <div className="eq-slider">
          <label>Bass</label>
          <input
            type="range"
            min="-10"
            max="10"
            value={settings.eqSettings.bass}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              eqSettings: { ...prev.eqSettings, bass: parseInt(e.target.value) }
            }))}
          />
          <span>{settings.eqSettings.bass}</span>
        </div>

        <div className="eq-slider">
          <label>Mid</label>
          <input
            type="range"
            min="-10"
            max="10"
            value={settings.eqSettings.mid}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              eqSettings: { ...prev.eqSettings, mid: parseInt(e.target.value) }
            }))}
          />
          <span>{settings.eqSettings.mid}</span>
        </div>

        <div className="eq-slider">
          <label>Treble</label>
          <input
            type="range"
            min="-10"
            max="10"
            value={settings.eqSettings.treble}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              eqSettings: { ...prev.eqSettings, treble: parseInt(e.target.value) }
            }))}
          />
          <span>{settings.eqSettings.treble}</span>
        </div>

        <div className="eq-slider">
          <label>Volume</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.eqSettings.volume}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              eqSettings: { ...prev.eqSettings, volume: parseInt(e.target.value) }
            }))}
          />
          <span>{settings.eqSettings.volume}%</span>
        </div>
      </div>

      {/* Vision Settings */}
      <div className="setting-group">
        <label>
          <input
            type="checkbox"
            checked={settings.screenVisionEnabled}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              screenVisionEnabled: e.target.checked
            }))}
          />
          Enable Screen Vision
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={settings.autoAnalyzeScreens}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              autoAnalyzeScreens: e.target.checked
            }))}
          />
          Auto-Analyze Screens
        </label>
      </div>

      <button 
        className="close-settings-btn"
        onClick={() => setShowSettings(false)}
      >
        ✕ Close
      </button>
    </div>
  );

  const renderScreenAnalysis = () => (
    screenAnalysis && (
      <div className="screen-analysis-panel">
        <h4>Screen Analysis</h4>
        <p><strong>Description:</strong> {screenAnalysis.description}</p>
        <p><strong>Focus:</strong> {screenAnalysis.focusArea}</p>
        <p><strong>Elements:</strong> {screenAnalysis.elementCount}</p>
        <p><strong>Confidence:</strong> {(screenAnalysis.confidence * 100).toFixed(0)}%</p>
      </div>
    )
  );

  return (
    <div
      ref={floatingRef}
      className={`floating-paige ${isMinimized ? 'minimized' : ''} ${isExpanded ? 'expanded' : ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10000,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Floating Header */}
      <div className="floating-header">
        <div className="floating-title">🤖 PAIGE</div>
        <div className="floating-header-buttons">
          <button
            className="header-btn"
            onClick={() => analyzeScreen()}
            title="Analyze current screen"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '⏳' : '👁️'}
          </button>
          <button
            className="header-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            ⚙️
          </button>
          <button
            className="header-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '−' : '+'}
          </button>
          <button
            className="header-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Restore' : 'Minimize'}
          >
            {isMinimized ? '□' : '−'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!isMinimized && (
        <div className="floating-content">
          {showSettings ? (
            renderSettingsPanel()
          ) : (
            <>
              {isExpanded ? (
                <div className="floating-expanded">
                  <div className="left-panel">
                    {renderScreenAnalysis()}
                  </div>
                  <div className="right-panel">
                    <div className="chat-area">
                      <p>Voice Vision Active</p>
                      <p className="status">
                        Ready to assist with your {screenAnalysis?.focusArea}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="floating-minimalist">
                  <p>🎙️ Voice Active</p>
                  {screenAnalysis && (
                    <p className="status">{screenAnalysis.focusArea}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Import html2canvas at top level
declare const html2canvas: any;

export default FloatingPaige;

/* Add to end of component JSX before closing div */
// Add orb styles below the existing content
