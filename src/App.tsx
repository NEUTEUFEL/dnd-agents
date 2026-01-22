import { useState } from 'react';
import { useAgentSimulation } from './hooks/useAgentSimulation';
import type { Agent } from './types/agent';
import { Workspace } from './components/Workspace';
import { AgentCard } from './components/AgentCard';
import { ActionLog } from './components/ActionLog';
import { ControlPanel } from './components/ControlPanel';
import { ProgressBar } from './components/ProgressBar';
import { AgentsModal } from './components/AgentsModal';
import './App.css';

function App() {
  const {
    agents,
    stations,
    tasks,
    actionLog,
    isPaused,
    overallProgress,
    pause,
    resume,
    restart,
  } = useAgentSimulation();

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentsModal, setShowAgentsModal] = useState(false);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  // Keep selected agent in sync with simulation state
  const currentSelectedAgent = selectedAgent
    ? agents.find((a) => a.id === selectedAgent.id) || null
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-cyan-400 mb-1">
          🎲 DND Agents
        </h1>
        <p className="text-slate-400 text-sm">
          Project: <span className="text-cyan-300">Startup Plan</span>
        </p>
      </header>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto mb-6">
        <ProgressBar progress={overallProgress} />
      </div>

      {/* Main Layout */}
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Workspace (left/center) */}
        <div className="flex-1">
          <Workspace
            stations={stations}
            agents={agents}
            tasks={tasks}
            onAgentClick={handleAgentClick}
            selectedAgentId={currentSelectedAgent?.id || null}
          />
        </div>

        {/* Sidebar (right) */}
        <div className="w-80 space-y-4">
          <AgentCard agent={currentSelectedAgent} />
          <ActionLog entries={actionLog} />
        </div>
      </div>

      {/* Control Panel */}
      <div className="max-w-7xl mx-auto mt-6">
        <ControlPanel
          isPaused={isPaused}
          onPause={pause}
          onResume={resume}
          onRestart={restart}
          onViewAllAgents={() => setShowAgentsModal(true)}
          currentProject="Startup Plan"
        />
      </div>

      {/* Terminal-style log at bottom */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 font-mono text-sm">
          <div className="max-h-32 overflow-y-auto space-y-1">
            {actionLog.slice(-8).map((entry) => (
              <div key={entry.id} className="flex gap-2">
                <span className="text-slate-600">&gt;</span>
                <span className="text-cyan-400">{entry.agentName}</span>
                <span className="text-slate-400">{entry.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agents Modal */}
      {showAgentsModal && (
        <AgentsModal
          agents={agents}
          onClose={() => setShowAgentsModal(false)}
          onSelectAgent={handleAgentClick}
        />
      )}
    </div>
  );
}

export default App;
