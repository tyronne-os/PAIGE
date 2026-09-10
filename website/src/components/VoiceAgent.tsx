import React, { useState, useRef, useEffect } from 'react';
import './VoiceAgent.css';

interface SpecFlow {
  task_id: string;
  text_response: string;
  workflow_diagram: string;
  agents_used: string[];
  execution_result: any;
}

const VoiceAgent: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<SpecFlow | null>(null);
  const [agentPool, setAgentPool] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch agent pool status
  useEffect(() => {
    fetchAgentPool();
    const interval = setInterval(fetchAgentPool, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgentPool = async () => {
    try {
      const res = await fetch('/api/voice/agents/pool');
      const data = await res.json();
      setAgentPool(data.agents_detail || []);
    } catch (e) {
      console.error('Failed to fetch agent pool:', e);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioForTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (e) {
      console.error('Microphone access denied:', e);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const res = await fetch('/api/voice/audio-to-text', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setTranscript(data.text || '');
      
      // Automatically send to voice agent
      if (data.text) {
        await sendToVoiceAgent(data.text);
      }
    } catch (e) {
      console.error('Transcription error:', e);
    } finally {
      setLoading(false);
    }
  };

  const sendToVoiceAgent = async (message: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      setResponse(data);

      // Play voice response if available
      if (data.voice_response) {
        playVoiceResponse(data.voice_response);
      }
    } catch (e) {
      console.error('Voice chat error:', e);
    } finally {
      setLoading(false);
    }
  };

  const playVoiceResponse = (voiceHex: string) => {
    try {
      const byteArray = new Uint8Array(
        voiceHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
      );
      const audioBlob = new Blob([byteArray], { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.play();
    } catch (e) {
      console.error('Voice playback error:', e);
    }
  };

  const renderWorkflowDiagram = (diagram: string) => {
    return (
      <div className="workflow-diagram">
        <pre>{diagram}</pre>
      </div>
    );
  };

  return (
    <div className="voice-agent-container">
      <div className="voice-header">
        <h2>🎙️ PAIGE Voice Agent</h2>
        <p>Bidirectional conversation with spec generation & agent orchestration</p>
      </div>

      <div className="voice-controls">
        <button
          className={`record-btn ${isListening ? 'active' : ''}`}
          onClick={isListening ? stopVoiceRecording : startVoiceRecording}
          disabled={loading}
        >
          {isListening ? '⏹️ Stop Recording' : '🎤 Start Voice Input'}
        </button>

        {transcript && (
          <div className="transcript">
            <strong>You:</strong> {transcript}
          </div>
        )}

        {loading && (
          <div className="loading">
            <span className="spinner"></span> Processing...
          </div>
        )}
      </div>

      {response && (
        <div className="response-panel">
          <div className="response-text">
            <h3>PAIGE Response:</h3>
            <pre>{response.text_response}</pre>
          </div>

          {response.workflow_diagram && (
            <div className="workflow-section">
              <h3>Workflow Diagram:</h3>
              {renderWorkflowDiagram(response.workflow_diagram)}
            </div>
          )}

          <div className="agents-section">
            <h3>Agents Assigned:</h3>
            <div className="agent-tags">
              {response.agents_used.map(agent => (
                <span key={agent} className="agent-tag">{agent}</span>
              ))}
            </div>
          </div>

          {response.execution_result && (
            <div className="execution-section">
              <h3>Execution Results:</h3>
              <pre>{JSON.stringify(response.execution_result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <div className="agent-pool-panel">
        <h3>Agent Pool ({agentPool.length})</h3>
        <div className="agent-list">
          {agentPool.length === 0 ? (
            <p className="no-agents">No agents created yet</p>
          ) : (
            agentPool.map(agent => (
              <div key={agent.name} className="agent-card">
                <div className="agent-header">
                  <span className="agent-name">{agent.name}</span>
                  <span className={`agent-status ${agent.status}`}>{agent.status}</span>
                </div>
                <div className="agent-info">
                  <p>Type: {agent.type}</p>
                  <p>Skills: {agent.skills.join(', ')}</p>
                  <p>Capacity: {agent.completed_tasks}/{agent.capacity}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
