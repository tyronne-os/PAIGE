import React, { useState, useEffect } from 'react'
import { Search, Plus, ExternalLink } from 'lucide-react'
import './GitHubBrowser.css'

interface Repo {
  id: number
  name: string
  url: string
  description?: string
  language?: string
  stars: number
  updated_at: string
}

const GitHubBrowser: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRepos()
  }, [])

  const fetchRepos = async () => {
    try {
      const token = localStorage.getItem('github_token')
      if (!token) {
        setError('No GitHub token found. Add one in Settings.')
        setLoading(false)
        return
      }

      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
        headers: { Authorization: `token ${token}` }
      })

      if (!response.ok) throw new Error('Failed to fetch repos')
      const data = await response.json()
      setRepos(data)
      setLoading(false)
    } catch (err) {
      setError('Error fetching repositories')
      setLoading(false)
    }
  }

  const createRepo = async () => {
    const name = prompt('Enter repository name:')
    if (!name) return

    try {
      const token = localStorage.getItem('github_token')
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, description: 'Created from PAIGE IDE' })
      })

      if (response.ok) {
        fetchRepos()
        alert(`Repository '${name}' created successfully!`)
      }
    } catch (err) {
      alert('Error creating repository')
    }
  }

  const filtered = repos.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="github-browser">
      <div className="gb-header">
        <h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c2.6-.4 5.6-2 5.6-7 0-1.25-.756-2.3-2-2.972A4.9 4.9 0 0 0 15.666 3.75c-.748-1-.747-2.592-.191-2.766a10.7 10.7 0 0 0-5.523 1.14c-.335.118-.8 0-1.022-.217A4.882 4.882 0 0 0 7.97 1.05c-1.318 0-2.592.878-3.414 2.372C3.4 5.exposition 3 7.268 3 9.589c0 5 3 6.6 5.6 7a4.821 4.821 0 0 0-1 3.5v4"></path><circle cx="9" cy="18" r="1"></circle></svg> GitHub Repositories
        </h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="gb-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="create-btn" onClick={createRepo}>
          <Plus size={16} /> New Repo
        </button>
      </div>

      <div className="gb-content">
        {loading ? (
          <div className="loading">Loading repositories...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No repositories found</div>
        ) : (
          <div className="repos-list">
            {filtered.map((repo) => (
              <div key={repo.id} className="repo-card">
                <div className="repo-header">
                  <h3>{repo.name}</h3>
                  <span className="stars">⭐ {repo.stars}</span>
                </div>
                {repo.description && <p className="description">{repo.description}</p>}
                <div className="repo-footer">
                  {repo.language && <span className="language">{repo.language}</span>}
                  <span className="updated">{new Date(repo.updated_at).toLocaleDateString()}</span>
                </div>
                <a href={repo.url} target="_blank" rel="noopener noreferrer" className="repo-link">
                  <ExternalLink size={14} /> Open on GitHub
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GitHubBrowser
