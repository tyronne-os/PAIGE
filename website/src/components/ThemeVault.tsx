import React, { useState, useEffect } from 'react'
import { Palette, Key, Save } from 'lucide-react'
import './ThemeVault.css'

interface Theme {
  name: string
  colors: {
    bg: string
    text: string
    primary: string
    secondary: string
    accent: string
  }
}

interface ApiKey {
  name: string
  key: string
  provider: string
  masked: string
}

const THEMES: Theme[] = [
  { name: 'Dark (Default)', colors: { bg: '#0f172a', text: '#e2e8f0', primary: '#3b82f6', secondary: '#1e293b', accent: '#06b6d4' } },
  { name: 'Purple Night', colors: { bg: '#1a0a3e', text: '#e0d5ff', primary: '#a78bfa', secondary: '#2d1b4e', accent: '#d8b4fe' } },
  { name: 'Deep Ocean', colors: { bg: '#0a1628', text: '#d1e7f7', primary: '#0ea5e9', secondary: '#082f4b', accent: '#06b6d4' } },
  { name: 'Forest Green', colors: { bg: '#0f2818', text: '#d4f4e6', primary: '#10b981', secondary: '#1a3a2a', accent: '#34d399' } },
  { name: 'Sunset Orange', colors: { bg: '#1f1207', text: '#fde68a', primary: '#f97316', secondary: '#3a2609', accent: '#fb923c' } },
  { name: 'Neon Pink', colors: { bg: '#1a0f1a', text: '#ffb3e6', primary: '#ec4899', secondary: '#3d1d3d', accent: '#f472b6' } },
  { name: 'Cyber Blue', colors: { bg: '#0d1b2a', text: '#00ff88', primary: '#00d4ff', secondary: '#1a3a4a', accent: '#00ffff' } },
  { name: 'Monochrome', colors: { bg: '#1a1a1a', text: '#e0e0e0', primary: '#b0b0b0', secondary: '#2a2a2a', accent: '#d0d0d0' } },
  { name: 'Warm Brown', colors: { bg: '#1a1410', text: '#f5e6d3', primary: '#d2691e', secondary: '#3a2817', accent: '#daa520' } },
  { name: 'Cool Grey', colors: { bg: '#14191f', text: '#cbd5e1', primary: '#64748b', secondary: '#1e293b', accent: '#94a3b8' } },
  { name: 'Rose Gold', colors: { bg: '#1f1514', text: '#f5d5cc', primary: '#c97c7c', secondary: '#3a2420', accent: '#e8b4a8' } },
  { name: 'Teal Dream', colors: { bg: '#0f1d1d', text: '#d0f0ef', primary: '#14b8a6', secondary: '#1a3a39', accent: '#2dd4bf' } },
  { name: 'Lavender', colors: { bg: '#18111f', text: '#e6d9ff', primary: '#a855f7', secondary: '#2d1a3a', accent: '#d8b4fe' } },
  { name: 'Mint Green', colors: { bg: '#0f1f1a', text: '#d4f4e9', primary: '#14b8a6', secondary: '#1a3a33', accent: '#6ee7b7' } },
  { name: 'Coral', colors: { bg: '#1f0f0f', text: '#ffcccb', primary: '#ff7f50', secondary: '#3a1f1f', accent: '#ff6347' } },
  { name: 'Indigo', colors: { bg: '#0f0a1f', text: '#e0d9ff', primary: '#6366f1', secondary: '#1e1a3a', accent: '#818cf8' } },
  { name: 'Slate Pro', colors: { bg: '#0f1419', text: '#d1d5db', primary: '#4b5563', secondary: '#1f2937', accent: '#9ca3af' } },
  { name: 'Electric', colors: { bg: '#0a0e27', text: '#ffff00', primary: '#00ff00', secondary: '#1a1f3a', accent: '#ff00ff' } },
  { name: 'Twilight', colors: { bg: '#1a0f2e', text: '#d9c9ff', primary: '#9d4edd', secondary: '#3a1f4e', accent: '#c77dff' } },
  { name: 'Emerald', colors: { bg: '#0f1f14', text: '#d1fae5', primary: '#059669', secondary: '#1a3a29', accent: '#10b981' } }
]

const ThemeVault: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'vault'>('themes')
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyValue, setNewKeyValue] = useState('')
  const [newKeyProvider, setNewKeyProvider] = useState('openai')

  useEffect(() => {
    const saved = localStorage.getItem('paige-theme')
    if (saved) {
      try {
        const theme = JSON.parse(saved)
        setSelectedTheme(theme)
        applyThemeToDOM(theme)
      } catch (e) {
        console.error('Error loading theme:', e)
      }
    }
    
    // Load API keys from vault
    const savedKeys = localStorage.getItem('paige-api-keys')
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys))
      } catch (e) {
        console.error('Error loading API keys:', e)
      }
    }
  }, [])

  const applyThemeToDOM = (theme: Theme) => {
    document.body.style.backgroundColor = theme.colors.bg
    document.body.style.color = theme.colors.text
    const root = document.documentElement
    root.style.backgroundColor = theme.colors.bg
    root.style.color = theme.colors.text
  }

  const applyTheme = (theme: Theme) => {
    setSelectedTheme(theme)
    applyThemeToDOM(theme)
    localStorage.setItem('paige-theme', JSON.stringify(theme))
    window.location.reload()
  }

  const addApiKey = () => {
    if (!newKeyName.trim() || !newKeyValue.trim()) return
    const masked = newKeyValue.slice(0, 4) + '...' + newKeyValue.slice(-4)
    const key: ApiKey = { name: newKeyName, key: newKeyValue, provider: newKeyProvider, masked }
    setApiKeys([...apiKeys, key])
    localStorage.setItem('paige-api-keys', JSON.stringify([...apiKeys, key]))
    setNewKeyName('')
    setNewKeyValue('')
  }

  const deleteApiKey = (index: number) => {
    const updated = apiKeys.filter((_, i) => i !== index)
    setApiKeys(updated)
    localStorage.setItem('paige-api-keys', JSON.stringify(updated))
  }

  return (
    <div className="theme-vault">
      <div className="tv-header">
        <h3>Settings</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="tv-tabs">
        <button className={`tab ${activeTab === 'themes' ? 'active' : ''}`} onClick={() => setActiveTab('themes')}>
          <Palette size={16} /> Themes
        </button>
        <button className={`tab ${activeTab === 'vault' ? 'active' : ''}`} onClick={() => setActiveTab('vault')}>
          <Key size={16} /> API Keys
        </button>
      </div>

      <div className="tv-content">
        {activeTab === 'themes' ? (
          <div className="themes-grid">
            {THEMES.map((theme, idx) => (
              <div key={idx} className={`theme-card ${selectedTheme.name === theme.name ? 'active' : ''}`} onClick={() => applyTheme(theme)}>
                <div className="theme-preview">
                  <div className="color-swatch" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="color-swatch" style={{ backgroundColor: theme.colors.secondary }} />
                  <div className="color-swatch" style={{ backgroundColor: theme.colors.accent }} />
                </div>
                <p>{theme.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="vault-panel">
            <div className="key-form">
              <input type="text" placeholder="Key name (e.g., OpenAI Prod)" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} />
              <select value={newKeyProvider} onChange={(e) => setNewKeyProvider(e.target.value)}>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="huggingface">HuggingFace</option>
                <option value="nvidia">NVIDIA</option>
                <option value="github">GitHub</option>
              </select>
              <input type="password" placeholder="API Key" value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} />
              <button className="add-key-btn" onClick={addApiKey}>
                <Save size={14} /> Save Key
              </button>
            </div>

            <div className="keys-list">
              {apiKeys.length === 0 ? (
                <p className="empty">No API keys stored yet</p>
              ) : (
                apiKeys.map((key, idx) => (
                  <div key={idx} className="key-item">
                    <div className="key-info">
                      <p className="key-name">{key.name}</p>
                      <p className="key-provider">{key.provider.toUpperCase()}</p>
                      <code>{key.masked}</code>
                    </div>
                    <button className="delete-key-btn" onClick={() => deleteApiKey(idx)}>Delete</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ThemeVault
