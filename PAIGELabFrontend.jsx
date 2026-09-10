/**
 * PAIGE Lab Frontend Component
 * Local application for building and testing custom models
 * Full computer use access + model integration
 */

import React, { useState, useEffect } from 'react';
import './paige-lab.css';

const PAIGELabFrontend = () => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [availableTools, setAvailableTools] = useState([]);
  const [buildLog, setBuildLog] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [modelCode, setModelCode] = useState('');
  const [appCode, setAppCode] = useState('');
  const [loading, setLoading] = useState(false);

  // HF Spaces backend URL (model gallery + compression tools)
  const HF_LAB_URL = process.env.REACT_APP_HF_LAB_URL || 'https://paige-lab.hf.space';
  
  // Local backend for execution (computer use)
  const LOCAL_BACKEND = 'http://localhost:8002';

  // Fetch model gallery from HF backend
  const fetchModelGallery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${HF_LAB_URL}/api/gallery`);
      const data = await response.json();
      setModels(data);
    } catch (error) {
      addLog('❌ Failed to load gallery', 'error');
    }
    setLoading(false);
  };

  // Fetch compression tools from HF backend
  const fetchCompressionTools = async () => {
    try {
      const response = await fetch(`${HF_LAB_URL}/api/tools`);
      const data = await response.json();
      setAvailableTools(data);
    } catch (error) {
      addLog('⚠️ Could not load compression tools', 'warning');
    }
  };

  // Download model from HF storage
  const downloadModel = async (modelId) => {
    setLoading(true);
    addLog(`📥 Downloading ${modelId}...`, 'info');
    
    try {
      const response = await fetch(`${LOCAL_BACKEND}/api/download-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: modelId,
          source: 'huggingface'
        })
      });
      
      if (response.ok) {
        addLog(`✅ Downloaded ${modelId}`, 'success');
        setSelectedModel({ id: modelId, status: 'ready' });
      } else {
        addLog(`❌ Download failed`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  // Create new model (write custom code)
  const createNewModel = async () => {
    if (!modelCode.trim()) {
      addLog('⚠️ Model code is empty', 'warning');
      return;
    }
    
    setLoading(true);
    addLog('🔨 Creating model...', 'info');
    
    try {
      const response = await fetch(`${LOCAL_BACKEND}/api/create-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: modelCode,
          name: selectedModel?.id || `model_${Date.now()}`
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        addLog(`✅ Model created: ${data.model_path}`, 'success');
        setSelectedModel({ id: data.model_id, path: data.model_path, status: 'created' });
      } else {
        addLog(`❌ Creation failed: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  // Build application using model
  const buildApplication = async () => {
    if (!selectedModel) {
      addLog('⚠️ Select a model first', 'warning');
      return;
    }
    
    if (!appCode.trim()) {
      addLog('⚠️ Application code is empty', 'warning');
      return;
    }
    
    setLoading(true);
    addLog('🏗️ Building application...', 'info');
    
    try {
      const response = await fetch(`${LOCAL_BACKEND}/api/build-app`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel.id,
          app_code: appCode,
          computer_use: true
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        addLog(`✅ App built successfully`, 'success');
        addLog(`📍 URL: ${data.app_url}`, 'success');
        setTestResults({ url: data.app_url, logs: data.logs });
      } else {
        addLog(`❌ Build failed: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  // Test model
  const testModel = async (testInput) => {
    if (!selectedModel) {
      addLog('⚠️ Select a model first', 'warning');
      return;
    }
    
    setLoading(true);
    addLog(`🧪 Testing model with: "${testInput}"`, 'info');
    
    try {
      const response = await fetch(`${LOCAL_BACKEND}/api/test-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel.id,
          input: testInput
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        addLog(`✅ Test result: ${data.output}`, 'success');
        setTestResults({ output: data.output, latency: data.latency });
      } else {
        addLog(`❌ Test failed: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  // Compress model
  const compressModel = async (compressionType) => {
    if (!selectedModel) {
      addLog('⚠️ Select a model first', 'warning');
      return;
    }
    
    setLoading(true);
    addLog(`⚙️ Compressing with ${compressionType}...`, 'info');
    
    try {
      const response = await fetch(`${LOCAL_BACKEND}/api/compress-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel.id,
          compression_type: compressionType
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        addLog(`✅ Compressed: ${data.new_size}MB (${data.ratio}x reduction)`, 'success');
        addLog(`📤 Ready to upload to HF storage`, 'info');
      } else {
        addLog(`❌ Compression failed: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  // Upload model to HF storage
  const uploadToHF = async () => {
    if (!selectedModel) {
      addLog('⚠️ Select a model first', 'warning');
      return;
    }
    
    setLoading(true);
    addLog(`📤 Uploading to HF storage...`, 'info');
    
    try {
      const response = await fetch(`${LOCAL_BACKEND}/api/upload-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel.id,
          destination: 'huggingface'
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        addLog(`✅ Uploaded to HF: ${data.repo_url}`, 'success');
      } else {
        addLog(`❌ Upload failed: ${data.error}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    }
    setLoading(false);
  };

  // Add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setBuildLog(prev => [...prev, { timestamp, message, type }]);
  };

  // Initialize
  useEffect(() => {
    fetchModelGallery();
    fetchCompressionTools();
  }, []);

  return (
    <div className="paige-lab-frontend">
      <header className="lab-header">
        <h1>🔬 PAIGE Lab</h1>
        <p>Build & Test Custom Models • Full Computer Use Access</p>
      </header>

      <nav className="lab-nav">
        <button 
          className={`nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          🎨 Gallery
        </button>
        <button 
          className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          🔨 Create Model
        </button>
        <button 
          className={`nav-btn ${activeTab === 'build' ? 'active' : ''}`}
          onClick={() => setActiveTab('build')}
        >
          🏗️ Build App
        </button>
        <button 
          className={`nav-btn ${activeTab === 'test' ? 'active' : ''}`}
          onClick={() => setActiveTab('test')}
        >
          🧪 Test
        </button>
        <button 
          className={`nav-btn ${activeTab === 'compress' ? 'active' : ''}`}
          onClick={() => setActiveTab('compress')}
        >
          ⚙️ Compress
        </button>
      </nav>

      <main className="lab-main">
        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <section className="tab-section">
            <h2>🎨 Model Gallery</h2>
            <p>Your custom models from HF storage • Like HF Trending</p>
            
            <button className="action-btn" onClick={fetchModelGallery} disabled={loading}>
              {loading ? '⏳ Loading...' : '🔄 Refresh Gallery'}
            </button>

            <div className="gallery-grid">
              {models.length === 0 ? (
                <p className="empty-state">No models yet. Create one to get started!</p>
              ) : (
                models.map((model, idx) => (
                  <div key={idx} className="gallery-card">
                    <h3>{model.name}</h3>
                    <p className="model-meta">
                      📥 {model.downloads} downloads • ❤️ {model.likes}
                    </p>
                    <p className="model-desc">{model.description}</p>
                    <div className="model-tags">
                      {model.tags?.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <button 
                      className="gallery-btn"
                      onClick={() => downloadModel(model.repo_id)}
                      disabled={loading}
                    >
                      📥 Download & Use
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Create Model Tab */}
        {activeTab === 'create' && (
          <section className="tab-section">
            <h2>🔨 Create Custom Model</h2>
            
            <div className="editor-section">
              <label>Model Code (Python)</label>
              <textarea 
                className="code-editor"
                placeholder="from transformers import AutoModel&#10;class MyModel:&#10;  def __init__(self):&#10;    pass"
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
              />
            </div>

            <button 
              className="action-btn"
              onClick={createNewModel}
              disabled={loading}
            >
              {loading ? '⏳ Creating...' : '🔨 Create Model'}
            </button>

            <div className="info-box">
              ✅ Full computer use access • Write any Python code
            </div>
          </section>
        )}

        {/* Build App Tab */}
        {activeTab === 'build' && (
          <section className="tab-section">
            <h2>🏗️ Build Application</h2>
            
            {!selectedModel && (
              <div className="warning-box">
                ⚠️ Download or create a model first from Gallery or Create tabs
              </div>
            )}

            {selectedModel && (
              <>
                <div className="info-box">
                  ✅ Model selected: {selectedModel.id}
                </div>

                <div className="editor-section">
                  <label>Application Code</label>
                  <textarea 
                    className="code-editor"
                    placeholder="import gradio as gr&#10;from model import MyModel&#10;&#10;model = MyModel()&#10;&#10;def predict(text):&#10;  return model.run(text)&#10;&#10;gr.Interface(predict, 'text', 'text').launch()"
                    value={appCode}
                    onChange={(e) => setAppCode(e.target.value)}
                  />
                </div>

                <button 
                  className="action-btn"
                  onClick={buildApplication}
                  disabled={loading}
                >
                  {loading ? '⏳ Building...' : '🏗️ Build Application'}
                </button>

                {testResults?.url && (
                  <div className="success-box">
                    ✅ App running at: <a href={testResults.url}>{testResults.url}</a>
                  </div>
                )}
              </>
            )}

            <div className="info-box">
              ✅ Full computer use • Integrated with your model
            </div>
          </section>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <section className="tab-section">
            <h2>🧪 Test Model</h2>

            {!selectedModel && (
              <div className="warning-box">
                ⚠️ Select a model first from Gallery or Create tabs
              </div>
            )}

            {selectedModel && (
              <>
                <div className="info-box">
                  ✅ Model: {selectedModel.id}
                </div>

                <div className="test-section">
                  <input 
                    type="text"
                    className="test-input"
                    placeholder="Enter test input..."
                    onKeyPress={(e) => e.key === 'Enter' && testModel(e.target.value)}
                  />
                  <button 
                    className="action-btn"
                    onClick={(e) => testModel(e.target.previousElementSibling.value)}
                    disabled={loading}
                  >
                    {loading ? '⏳ Testing...' : '🧪 Test'}
                  </button>
                </div>

                {testResults?.output && (
                  <div className="result-box">
                    <h4>Result:</h4>
                    <pre>{JSON.stringify(testResults.output, null, 2)}</pre>
                    {testResults.latency && (
                      <p>⏱️ Latency: {testResults.latency}ms</p>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Compress Tab */}
        {activeTab === 'compress' && (
          <section className="tab-section">
            <h2>⚙️ Compress Model</h2>

            {!selectedModel && (
              <div className="warning-box">
                ⚠️ Select a model first from Gallery
              </div>
            )}

            {selectedModel && (
              <>
                <div className="info-box">
                  ✅ Model: {selectedModel.id}
                </div>

                <div className="tools-grid">
                  {availableTools.map((tool, idx) => (
                    <div key={idx} className="tool-card">
                      <h4>{tool.icon} {tool.name}</h4>
                      <p>{tool.description}</p>
                      <p className="tool-meta">
                        Compression: {tool.compression_ratio}
                      </p>
                      <button 
                        className="compress-btn"
                        onClick={() => compressModel(tool.type)}
                        disabled={loading}
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>

                <div className="upload-section">
                  <h3>📤 Upload to HF Storage</h3>
                  <button 
                    className="upload-btn"
                    onClick={uploadToHF}
                    disabled={loading}
                  >
                    {loading ? '⏳ Uploading...' : '📤 Upload to HF'}
                  </button>
                  <p className="info-text">
                    Compressed model will be available in PAIGE Lab gallery
                  </p>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {/* Build Log */}
      <aside className="lab-log">
        <h3>📋 Build Log</h3>
        <div className="log-container">
          {buildLog.map((entry, idx) => (
            <div key={idx} className={`log-entry log-${entry.type}`}>
              <span className="log-time">{entry.timestamp}</span>
              <span className="log-msg">{entry.message}</span>
            </div>
          ))}
        </div>
      </aside>

      <footer className="lab-footer">
        <p>🔬 PAIGE Lab • Build, Test & Compress Custom Models • Full Computer Use</p>
      </footer>
    </div>
  );
};

export default PAIGELabFrontend;
