import React, { useState, useEffect, useRef } from 'react';
import './PaigEDU.css';

interface Agent {
  agent_id: string;
  name: string;
  role: string;
  status: string;
  skills: string[];
  completed_tasks: number;
  created_at: string;
}

interface Workflow {
  task_id: string;
  agents: string[];
  steps: Array<{
    step: number;
    agent: string;
    status: string;
    result: any;
  }>;
  started_at: string;
  completed_at?: string;
}

interface Message {
  sender: 'user' | 'paige' | 'system';
  text: string;
  timestamp: string;
  workflow?: Workflow;
}

const PaigEDU: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'agents' | 'workflows'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch team status
  useEffect(() => {
    fetchTeamStatus();
    const interval = setInterval(fetchTeamStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTeamStatus = async () => {
    try {
      const res = await fetch('/api/voice/team/status');
      const data = await res.json();
      
      if (data.agents) {
        setAgents(data.agents);
      }

      // Fetch workflows
      const workflowRes = await fetch('/api/voice/workflows');
      const workflowData = await workflowRes.json();
      
      if (workflowData.workflows) {
        setWorkflows(Object.values(workflowData.workflows) as Workflow[]);
      }
    } catch (e) {
      console.error('Failed to fetch team status:', e);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: userInput,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/voice/chat-with-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput })
      });

      const data = await res.json();

      // Add PAIGE response
      const paigMessage: Message = {
        sender: 'paige',
        text: data.text_response || 'Processing...',
        timestamp: new Date().toISOString(),
        workflow: data.workflow
      };

      setMessages(prev => [...prev, paigMessage]);

      // Refresh team status
      await fetchTeamStatus();
    } catch (e) {
      const errorMessage: Message = {
        sender: 'system',
        text: `Error: ${e}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderChatTab = () => (
    <div className="edu-chat-panel">
      <div className="messages-list">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message message-${msg.sender}`}>
            <div className="message-header">
              <span className="sender">{msg.sender === 'paige' ? '🤖 PAIGE' : msg.sender === 'user' ? '👤 You' : '⚙️ System'}</span>
              <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="message-content">
              {msg.text}
            </div>
            {msg.workflow && (
              <div className="workflow-preview">
                <p><strong>Workflow ID:</strong> {msg.workflow.task_id}</p>
                <p><strong>Agents:</strong> {msg.workflow.agents.join(', ')}</p>
                <p><strong>Status:</strong> {msg.workflow.steps?.[msg.workflow.steps.length - 1]?.status}</p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Tell PAIGE what you want to build... (Shift+Enter for newline)"
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !userInput.trim()}
          className="send-btn"
        >
          {loading ? '⏳' : '📤'} Send
        </button>
      </div>
    </div>
  );

  const renderAgentsTab = () => (
    <div className="edu-agents-panel">
      <div className="agents-grid">
        {agents.map(agent => (
          <div
            key={agent.agent_id}
            className={`agent-card ${selectedAgent?.agent_id === agent.agent_id ? 'selected' : ''}`}
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="agent-card-header">
              <h4>{agent.name}</h4>
              <span className={`status-badge ${agent.status}`}>{agent.status}</span>
            </div>
            <div className="agent-card-body">
              <p><strong>Role:</strong> {agent.role}</p>
              <p><strong>Tasks:</strong> {agent.completed_tasks}</p>
              <p><strong>Skills:</strong> {agent.skills.length}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedAgent && (
        <div className="agent-detail-panel">
          <h3>{selectedAgent.name}</h3>
          <div className="agent-details">
            <div className="detail-row">
              <span>Agent ID:</span>
              <code>{selectedAgent.agent_id}</code>
            </div>
            <div className="detail-row">
              <span>Role:</span>
              <span className="badge">{selectedAgent.role}</span>
            </div>
            <div className="detail-row">
              <span>Status:</span>
              <span className={`badge ${selectedAgent.status}`}>{selectedAgent.status}</span>
            </div>
            <div className="detail-row">
              <span>Created:</span>
              <span>{new Date(selectedAgent.created_at).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span>Completed Tasks:</span>
              <span className="badge">{selectedAgent.completed_tasks}</span>
            </div>
            <div className="detail-row">
              <span>Skills:</span>
              <div className="skills-list">
                {selectedAgent.skills.map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWorkflowsTab = () => (
    <div className="edu-workflows-panel">
      <div className="workflows-list">
        {workflows.map(workflow => (
          <div key={workflow.task_id} className="workflow-card">
            <div className="workflow-header">
              <h4>{workflow.task_id}</h4>
              <span className="agent-count">{workflow.agents.length} agents</span>
            </div>
            <div className="workflow-steps">
              {workflow.steps.map((step, idx) => (
                <div key={idx} className="step">
                  <span className="step-num">#{step.step}</span>
                  <span className="agent-name">{step.agent}</span>
                  <span className={`step-status ${step.status}`}>{step.status}</span>
                </div>
              ))}
            </div>
            <div className="workflow-timeline">
              <p><strong>Started:</strong> {new Date(workflow.started_at).toLocaleString()}</p>
              {workflow.completed_at && (
                <p><strong>Completed:</strong> {new Date(workflow.completed_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="paige-edu-container">
      <div className="edu-header">
        <h1>🎓 PAIGE EDU - Agent Team Monitor</h1>
        <div className="team-stats">
          <div className="stat">
            <span className="stat-value">{agents.length}</span>
            <span className="stat-label">Agents</span>
          </div>
          <div className="stat">
            <span className="stat-value">{workflows.length}</span>
            <span className="stat-label">Workflows</span>
          </div>
          <div className="stat">
            <span className="stat-value">{agents.filter(a => a.status === 'idle').length}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </div>

      <div className="edu-tabs">
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`tab ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          👥 Agents
        </button>
        <button
          className={`tab ${activeTab === 'workflows' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflows')}
        >
          🔄 Workflows
        </button>
      </div>

      <div className="edu-content">
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'agents' && renderAgentsTab()}
        {activeTab === 'workflows' && renderWorkflowsTab()}
      </div>
    </div>
  );
};

export default PaigEDU;
