import { useState } from 'react';
import { useAgentSimulation } from './hooks/useAgentSimulation';
import type { Agent } from './types/agent';
import { GameWorld } from './components/GameWorld';
import { AgentCard } from './components/AgentCard';
import { ActionLog } from './components/ActionLog';
import { ControlPanel } from './components/ControlPanel';
import { AgentsModal } from './components/AgentsModal';
import { AgentSummary } from './components/AgentSummary';
import './App.css';

function App() {
  const {
    agents,
    stations,
    tasks,
    actionLog,
    isPaused,
    overallProgress,
    claudeUsage,
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 text-white p-4">
      {/* Header */}
      <header className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Press Start 2P, monospace' }}>
          <span className="text-yellow-400">🎮</span>{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            DND AGENTS
          </span>{' '}
          <span className="text-yellow-400">🎮</span>
        </h1>
        <p className="text-slate-400 text-sm">
          Project: <span className="text-cyan-300 font-bold">Startup Plan</span>
        </p>
      </header>

      {/* Main Layout */}
      <div className="flex gap-4 max-w-7xl mx-auto">
        {/* Game World (left/center) */}
        <div className="flex-1">
          <GameWorld
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

      {/* Agent Summary Section */}
      <div className="max-w-7xl mx-auto mt-4">
        <AgentSummary
          agents={agents}
          tasks={tasks}
          overallProgress={overallProgress}
          claudeUsage={claudeUsage}
        />
      </div>

      {/* Control Panel */}
      <div className="max-w-7xl mx-auto mt-4">
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
      <div className="max-w-7xl mx-auto mt-4">
        <div className="bg-slate-900/90 border-2 border-slate-700 rounded-lg p-3 font-mono text-sm shadow-inner">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="ml-2">activity_log.txt</span>
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1">
            {actionLog.slice(-6).map((entry) => (
              <div key={entry.id} className="flex gap-2">
                <span className="text-green-500">&gt;</span>
                <span className="text-cyan-400 font-bold">{entry.agentName}</span>
                <span className="text-slate-300">{entry.action}</span>
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
