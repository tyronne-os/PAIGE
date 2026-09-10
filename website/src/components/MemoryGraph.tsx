import React, { useState, useEffect } from 'react';
import './MemoryGraph.css';

interface MemoryNode {
  node_id: string;
  timestamp: string;
  content: string;
  session_id: string;
  project_id: string;
  parent_id?: string;
  children?: string[];
}

interface MemoryGraph {
  project_id: string;
  total_nodes: number;
  sessions: Record<string, string[]>;
  nodes: Record<string, MemoryNode>;
  graph_structure: {
    nodes: number;
    edges: Array<{ from: string; to: string }>;
    dot_format: string;
  };
}

const MemoryGraph: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [graph, setGraph] = useState<MemoryGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [crossProjectResults, setCrossProjectResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMemoryGraph();
  }, [projectId]);

  const fetchMemoryGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/paige/memory/project/${projectId}`);
      const data = await res.json();
      setGraph(data);
      
      // Set first session as selected
      if (Object.keys(data.sessions).length > 0) {
        setSelectedSession(Object.keys(data.sessions)[0]);
      }
    } catch (e) {
      console.error('Failed to fetch memory graph:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCrossProjectSearch = async () => {
    if (!searchQuery) return;

    try {
      const res = await fetch('/api/paige/memory/cross-project-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, projectId })
      });

      const data = await res.json();
      setCrossProjectResults(data.results);
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  const renderGraphVisualization = () => {
    if (!graph) return null;

    const sessions = Object.entries(graph.sessions);

    return (
      <div className="memory-graph-visualization">
        <h3>Memory Graph - {graph.total_nodes} nodes</h3>
        
        <div className="sessions-list">
          {sessions.map(([sessionId, nodeIds]) => (
            <div
              key={sessionId}
              className={`session-block ${selectedSession === sessionId ? 'active' : ''}`}
              onClick={() => setSelectedSession(sessionId)}
            >
              <div className="session-header">
                Session {sessionId.substring(0, 8)}...
              </div>
              <div className="node-count">{nodeIds.length} nodes</div>
            </div>
          ))}
        </div>

        {selectedSession && (
          <div className="session-nodes">
            <h4>Session Nodes</h4>
            <div className="nodes-tree">
              {graph.sessions[selectedSession]?.map(nodeId => {
                const node = graph.nodes[nodeId];
                if (!node) return null;

                return (
                  <div key={nodeId} className="node-item">
                    <div className="node-time">{new Date(node.timestamp).toLocaleTimeString()}</div>
                    <div className="node-content">{node.content.substring(0, 100)}...</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Graph Structure Visualization */}
        <div className="graph-ascii-view">
          <h4>Graph Structure (DOT Format)</h4>
          <pre>{graph.graph_structure.dot_format}</pre>
        </div>
      </div>
    );
  };

  return (
    <div className="memory-graph-panel">
      <div className="search-section">
        <h3>Cross-Project Memory Search</h3>
        <div className="search-bar">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all projects..."
            onKeyDown={(e) => e.key === 'Enter' && handleCrossProjectSearch()}
          />
          <button onClick={handleCrossProjectSearch}>🔍 Search</button>
        </div>
      </div>

      {crossProjectResults.length > 0 && (
        <div className="search-results">
          <h3>Cross-Project Results ({crossProjectResults.length})</h3>
          {crossProjectResults.map((result, idx) => (
            <div key={idx} className="result-card">
              <div className="result-project">{result.project_id}</div>
              <div className="result-content">{result.interaction.user_input}</div>
              <div className="result-relevance">
                Relevance: {(result.relevance * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading memory graph...</div>
      ) : (
        renderGraphVisualization()
      )}
    </div>
  );
};

export default MemoryGraph;
