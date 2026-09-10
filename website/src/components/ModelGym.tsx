import React, { useState, useEffect } from 'react';
import './ModelGym.css';

interface Project {
  project_id: string;
  name: string;
  base_model_id: string;
  description: string;
  status: string;
  gallery: any[];
  tasks: any[];
  created_at: string;
}

interface GalleryItem {
  stage: string;
  model_name: string;
  metrics: Record<string, any>;
  completed_at: string;
}

const ModelGym: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [baseModel, setBaseModel] = useState('meta-llama/Llama-2-7b');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/paige/gym/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) {
      console.error('Failed to load projects:', e);
    }
  };

  const createProject = async () => {
    if (!newProjectName) return;

    setLoading(true);
    try {
      const res = await fetch('/api/paige/gym/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          baseModel,
          description: `Building custom ${newProjectName} model`
        })
      });

      const data = await res.json();
      setProjects([...projects, data]);
      setNewProjectName('');
      setShowNewProject(false);
    } catch (e) {
      console.error('Failed to create project:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gym-container">
      {/* Header */}
      <div className="gym-header">
        <h1>🏋️ Model GYM</h1>
        <p>Build, fine-tune, and compress your own models</p>
      </div>

      <div className="gym-layout">
        {/* Left: Workspace */}
        <div className="gym-workspace">
          {selectedProject ? (
            <ProjectWorkspace project={selectedProject} onBack={() => setSelectedProject(null)} />
          ) : (
            <div className="projects-grid">
              {/* New Project Card */}
              <div className="project-card new-project" onClick={() => setShowNewProject(!showNewProject)}>
                <div className="card-icon">+</div>
                <p>New Project</p>
              </div>

              {/* Existing Projects */}
              {projects.map(project => (
                <div
                  key={project.project_id}
                  className="project-card"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="card-header">
                    <h3>{project.name}</h3>
                    <span className="model-badge">{project.base_model_id.split('/')[1]}</span>
                  </div>
                  <p className="card-description">{project.description}</p>
                  <div className="card-stats">
                    <span>{project.gallery.length} versions</span>
                    <span className={`status-${project.status}`}>{project.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Project Form */}
          {showNewProject && (
            <div className="new-project-form">
              <h3>Create New Model</h3>
              <input
                type="text"
                placeholder="Model name (e.g., 'Avatar Llama')"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <select value={baseModel} onChange={(e) => setBaseModel(e.target.value)}>
                <option value="meta-llama/Llama-2-7b">Llama 2 7B</option>
                <option value="meta-llama/Llama-2-13b">Llama 2 13B</option>
                <option value="mistralai/Mistral-7B">Mistral 7B</option>
                <option value="google/gemma-7b">Gemma 7B</option>
              </select>
              <div className="form-buttons">
                <button className="create-btn" onClick={createProject} disabled={loading}>
                  {loading ? '⏳' : '✓'} Create
                </button>
                <button className="cancel-btn" onClick={() => setShowNewProject(false)}>
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Gallery & Heretic Info */}
        <div className="gym-sidebar">
          {selectedProject && <GalleryPanel project={selectedProject} />}
          <HereticPanel />
        </div>
      </div>
    </div>
  );
};

const ProjectWorkspace: React.FC<{ project: Project; onBack: () => void }> = ({ project, onBack }) => {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const skills = [
    { id: 'fine_tune', name: '🎓 Fine-Tune', description: 'Adapt model to your data' },
    { id: 'compress', name: '📦 Compress', description: 'Reduce model size 50%' },
    { id: 'quantize', name: '⚡ Quantize', description: 'INT8/INT4 quantization' },
    { id: 'distill', name: '🔄 Distill', description: 'Knowledge distillation' }
  ];

  return (
    <div className="project-workspace">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="project-title">
        <h2>{project.name}</h2>
        <p>{project.base_model_id}</p>
      </div>

      <div className="skills-panel">
        <h3>Optimization Skills</h3>
        <div className="skills-grid">
          {skills.map(skill => (
            <div
              key={skill.id}
              className={`skill-card ${selectedSkill === skill.id ? 'active' : ''}`}
              onClick={() => setSelectedSkill(skill.id)}
            >
              <p className="skill-name">{skill.name}</p>
              <p className="skill-desc">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedSkill && <SkillDetail skill={selectedSkill} projectId={project.project_id} />}

      <div className="heretic-link-inline">
        <p>Powered by <a href="https://heretic-project.org" target="_blank" rel="noreferrer">Heretic</a> for advanced optimization</p>
      </div>
    </div>
  );
};

const SkillDetail: React.FC<{ skill: string; projectId: string }> = ({ skill, projectId }) => {
  const skillDetails = {
    fine_tune: {
      title: '🎓 Natural Language Fine-Tune',
      description: 'Adapt your model to specialized tasks with custom data',
      steps: ['Upload training data', 'Configure learning rate', 'Train on custom data', 'Evaluate performance']
    },
    compress: {
      title: '📦 Model Compression',
      description: 'Reduce model size without losing quality (via Heretic)',
      steps: ['Select compression ratio', 'Configure quantization', 'Compress model', 'Benchmark speed']
    },
    quantize: {
      title: '⚡ Quantization',
      description: 'Convert to INT8 or INT4 for faster inference',
      steps: ['Choose INT8 or INT4', 'Calibrate on data', 'Quantize weights', 'Test accuracy']
    },
    distill: {
      title: '🔄 Knowledge Distillation',
      description: 'Create smaller model from larger one (Heretic enhanced)',
      steps: ['Select teacher model', 'Create student model', 'Distill knowledge', 'Compare metrics']
    }
  };

  const detail = skillDetails[skill as keyof typeof skillDetails];

  return (
    <div className="skill-detail">
      <h3>{detail.title}</h3>
      <p>{detail.description}</p>
      <div className="steps">
        {detail.steps.map((step, i) => (
          <div key={i} className="step">
            <span className="step-num">{i + 1}</span>
            <span className="step-text">{step}</span>
          </div>
        ))}
      </div>
      <button className="execute-btn">▶ Start {detail.title.split(' ')[1]}</button>
    </div>
  );
};

const GalleryPanel: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <div className="gallery-panel">
      <h3>📊 Versions in Progress</h3>
      
      {project.gallery.length === 0 ? (
        <div className="empty-gallery">
          <p>No versions yet</p>
          <p className="hint">Start an optimization to see versions here</p>
        </div>
      ) : (
        <div className="gallery-items">
          {project.gallery.map((item: GalleryItem, idx: number) => (
            <div key={idx} className="gallery-item">
              <div className="item-stage">{item.stage}</div>
              <p className="item-model">{item.model_name}</p>
              <div className="item-metrics">
                {Object.entries(item.metrics).slice(0, 2).map(([key, val]) => (
                  <span key={key} className="metric">
                    {key}: {typeof val === 'number' ? val.toFixed(2) : val}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HereticPanel: React.FC = () => {
  return (
    <div className="heretic-panel">
      <div className="heretic-header">
        <h3>🔧 Heretic</h3>
        <a href="https://heretic-project.org" target="_blank" rel="noreferrer" className="heretic-link">
          Learn More →
        </a>
      </div>

      <div className="heretic-content">
        <div className="heretic-section">
          <h4>What is Heretic?</h4>
          <p>
            Heretic is an advanced toolkit for model optimization, compression, and fine-tuning. 
            It provides state-of-the-art techniques for:
          </p>
          <ul>
            <li><strong>Quantization:</strong> Reduce model size by 75%+</li>
            <li><strong>Pruning:</strong> Remove unnecessary weights</li>
            <li><strong>Distillation:</strong> Transfer knowledge to smaller models</li>
            <li><strong>Compression:</strong> NVIDIA-optimized compression</li>
          </ul>
        </div>

        <div className="heretic-features">
          <h4>Key Features</h4>
          <div className="feature-list">
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <p>Fast inference</p>
            </div>
            <div className="feature">
              <span className="feature-icon">💾</span>
              <p>Small size</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📈</span>
              <p>High accuracy</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🔗</span>
              <p>Easy integration</p>
            </div>
          </div>
        </div>

        <div className="heretic-cta">
          <a href="https://heretic-project.org" target="_blank" rel="noreferrer" className="heretic-btn">
            Visit Heretic Docs →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ModelGym;
