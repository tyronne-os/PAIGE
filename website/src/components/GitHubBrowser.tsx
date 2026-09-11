import React, { useState } from 'react';
import { Github, Plus, ExternalLink, Loader } from 'lucide-react';
import './GitHubBrowser.css';

interface Repo {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string;
}

const GitHubBrowser: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUserRepos = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: { Authorization: `token ${localStorage.getItem('github_token')}` }
      });
      const data = await response.json();
      setRepos(data);
    } catch (error) {
      console.error('Error fetching repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRepo = async () => {
    if (!newRepoName.trim()) return;
    
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `token ${localStorage.getItem('github_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newRepoName,
          description: newRepoDesc,
          private: false
        })
      });
      
      if (response.ok) {
        await fetchUserRepos();
        setNewRepoName('');
        setNewRepoDesc('');
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating repo:', error);
    }
  };

  return (
    <div className="github-browser">
      <div className="gb-header">
        <h3>
          <Github size={20} /> Your Repositories
        </h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="gb-controls">
        <button className="fetch-btn" onClick={fetchUserRepos} disabled={loading}>
          {loading ? <Loader className="spin" size={16} /> : '🔄'} Fetch Repos
        </button>
        <button className="create-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus size={16} /> New Repo
        </button>
      </div>

      {showCreateForm && (
        <div className="create-form">
          <input
            type="text"
            placeholder="Repository name"
            value={newRepoName}
            onChange={(e) => setNewRepoName(e.target.value)}
          />
          <textarea
            placeholder="Description (optional)"
            value={newRepoDesc}
            onChange={(e) => setNewRepoDesc(e.target.value)}
          />
          <div className="form-actions">
            <button className="submit-btn" onClick={createRepo}>Create</button>
            <button className="cancel-btn" onClick={() => setShowCreateForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="repos-list">
        {repos.length === 0 ? (
          <p className="empty">Click "Fetch Repos" to load your repositories</p>
        ) : (
          repos.map(repo => (
            <div key={repo.id} className="repo-item">
              <div className="repo-info">
                <a href={repo.url} target="_blank" rel="noopener noreferrer">
                  {repo.name}
                  <ExternalLink size={14} />
                </a>
                <p>{repo.description}</p>
                <div className="repo-meta">
                  {repo.language && <span className="language">{repo.language}</span>}
                  <span className="stars">⭐ {repo.stars}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GitHubBrowser;
