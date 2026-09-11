import React, { useState, useEffect } from 'react'
import { X, Calendar, Star } from 'lucide-react'
import './RecentProjects.css'

interface Project {
  id: string
  name: string
  url: string
  lastAccessed: string
  description?: string
  language?: string
  stars?: number
}

const RecentProjects: React.FC<{ onClose: () => void; onSelectProject?: (project: Project) => void }> = ({ 
  onClose, 
  onSelectProject 
}) => {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    // Load recent projects from localStorage first
    const saved = localStorage.getItem('paige-recent-projects')
    if (saved) {
      try {
        setProjects(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading recent projects:', e)
      }
    }

    // Then fetch fresh from GitHub if we have a token
    const token = localStorage.getItem('github_token')
    if (token && token.trim()) {
      fetchGitHubProjects(token)
    }
  }, [])

  const fetchGitHubProjects = async (token: string) => {
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
        headers: { Authorization: `token ${token}` }
      })
      const data = await response.json()
      
      const formatted = data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        url: repo.html_url,
        lastAccessed: new Date(repo.updated_at).toLocaleDateString(),
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count
      }))
      
      setProjects(formatted)
      localStorage.setItem('paige-recent-projects', JSON.stringify(formatted))
    } catch (error) {
      console.error('Error fetching GitHub projects:', error)
    }
  }

  const handleSelectProject = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project)
    }
    onClose()
  }

  return (
    <div className="recent-projects">
      <div className="rp-header">
        <h2>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.75rem'}}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c2.6-.4 5.6-2 5.6-7 0-1.25-.756-2.3-2-2.972A4.9 4.9 0 0 0 15.666 3.75c-.748-1-.747-2.592-.191-2.766a10.7 10.7 0 0 0-5.523 1.14c-.335.118-.8 0-1.022-.217A4.882 4.882 0 0 0 7.97 1.05c-1.318 0-2.592.878-3.414 2.372C3.4 5.exposition 3 7.268 3 9.589c0 5 3 6.6 5.6 7a4.821 4.821 0 0 0-1 3.5v4"></path><circle cx="9" cy="18" r="1"></circle></svg> Recent Projects
        </h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="rp-content">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No recent projects yet</p>
            <p className="hint">Add your GitHub token in Settings to see your repositories</p>
          </div>
        ) : (
          <div className="projects-list">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="project-card"
                onClick={() => handleSelectProject(project)}
              >
                <div className="project-header">
                  <h3>{project.name}</h3>
                  {project.stars !== undefined && (
                    <span className="stars">
                      <Star size={14} /> {project.stars}
                    </span>
                  )}
                </div>
                
                {project.description && (
                  <p className="description">{project.description}</p>
                )}
                
                <div className="project-footer">
                  {project.language && (
                    <span className="language">{project.language}</span>
                  )}
                  <span className="date">
                    <Calendar size={12} /> {project.lastAccessed}
                  </span>
                </div>
                
                <a 
                  href={project.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="project-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open on GitHub →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentProjects
