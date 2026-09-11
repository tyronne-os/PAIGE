import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error handler for uncaught errors
window.addEventListener('error', (e) => {
  console.error('Global error caught:', e.error)
  const errorDiv = document.createElement('div')
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #0f172a;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    font-family: monospace;
    z-index: 9999;
    padding: 2rem;
  `
  errorDiv.innerHTML = `
    <h2 style="color: #ff7f50; margin-bottom: 1rem;">⚠️ Application Error</h2>
    <p style="color: #94a3b8; max-width: 600px; margin-bottom: 1rem;">${e.error?.message || 'Unknown error'}</p>
    <button onclick="location.reload()" style="
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    ">Reload Page</button>
  `
  document.body.innerHTML = ''
  document.body.appendChild(errorDiv)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
