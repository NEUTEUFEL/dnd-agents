import { useState } from 'react';
import { useAgentSimulation } from './hooks/useAgentSimulation';
import { useRealAgents } from './hooks/useRealAgents';
import type { Agent } from './types/agent';
import { GameWorld } from './components/GameWorld';
import { AgentCard } from './components/AgentCard';
import { ActionLog } from './components/ActionLog';
import { ControlPanel } from './components/ControlPanel';
import { AgentsModal } from './components/AgentsModal';
import { AgentSummary } from './components/AgentSummary';
import { AgentControlPanel } from './components/AgentControlPanel';
import './App.css';

function App() {
  // Simulation state (for the game visualization)
  const simulation = useAgentSimulation();

  // Real agents state
  const realAgents = useRealAgents();

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'real-agents'>('simulation');

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const currentSelectedAgent = selectedAgent
    ? simulation.agents.find((a) => a.id === selectedAgent.id) || null
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

      {/* Tab Switcher */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'simulation'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎮 Simulation View
          </button>
          <button
            onClick={() => setActiveTab('real-agents')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'real-agents'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🤖 Real Agents
          </button>
        </div>
      </div>

      {activeTab === 'simulation' ? (
        <>
          {/* Simulation View */}
          <div className="flex gap-4 max-w-7xl mx-auto">
            <div className="flex-1">
              <GameWorld
                stations={simulation.stations}
                agents={simulation.agents}
                tasks={simulation.tasks}
                onAgentClick={handleAgentClick}
                selectedAgentId={currentSelectedAgent?.id || null}
              />
            </div>
            <div className="w-80 space-y-4">
              <AgentCard agent={currentSelectedAgent} />
              <ActionLog entries={simulation.actionLog} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-4">
            <AgentSummary
              agents={simulation.agents}
              tasks={simulation.tasks}
              overallProgress={simulation.overallProgress}
              claudeUsage={simulation.claudeUsage}
            />
          </div>

          <div className="max-w-7xl mx-auto mt-4">
            <ControlPanel
              isPaused={simulation.isPaused}
              onPause={simulation.pause}
              onResume={simulation.resume}
              onRestart={simulation.restart}
              onViewAllAgents={() => setShowAgentsModal(true)}
              currentProject="Startup Plan"
            />
          </div>
        </>
      ) : (
        <>
          {/* Real Agents View */}
          <div className="max-w-4xl mx-auto">
            <AgentControlPanel
              isRunning={realAgents.isRunning}
              currentAgentId={realAgents.currentAgentId}
              events={realAgents.events}
              completedTasks={realAgents.completedTasks}
              onAssignTask={realAgents.assignTask}
              onStop={realAgents.stopCurrentAgent}
            />

            {/* Instructions */}
            <div className="mt-4 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="font-bold text-cyan-400 mb-2">How to Use Real Agents</h4>
              <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                <li>Select an agent by clicking their card above</li>
                <li>Type a task description in the input field</li>
                <li>Click "Assign Task" to start the agent</li>
                <li>Watch the live activity feed as the agent works</li>
                <li>View completed tasks by clicking on them</li>
              </ol>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-500">⚠️</span>
                  <div className="text-xs text-yellow-200">
                    <strong>Demo Mode:</strong> These agents use simulated tools.
                    To connect real APIs (Claude, web search, email), you'll need to add API keys
                    and implement the actual tool functions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Terminal Log (both views) */}
      <div className="max-w-7xl mx-auto mt-4">
        <div className="bg-slate-900/90 border-2 border-slate-700 rounded-lg p-3 font-mono text-sm shadow-inner">
          <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="ml-2">
              {activeTab === 'simulation' ? 'simulation_log.txt' : 'agent_log.txt'}
            </span>
          </div>
          <div className="max-h-28 overflow-y-auto space-y-1">
            {activeTab === 'simulation' ? (
              simulation.actionLog.slice(-6).map((entry) => (
                <div key={entry.id} className="flex gap-2">
                  <span className="text-green-500">&gt;</span>
                  <span className="text-cyan-400 font-bold">{entry.agentName}</span>
                  <span className="text-slate-300">{entry.action}</span>
                </div>
              ))
            ) : (
              realAgents.events.slice(-6).map((event, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-green-500">&gt;</span>
                  <span className="text-cyan-400 font-bold">{event.agentName}</span>
                  <span className="text-slate-300">
                    [{event.type}] {JSON.stringify(event.data).substring(0, 50)}...
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Agents Modal */}
      {showAgentsModal && (
        <AgentsModal
          agents={simulation.agents}
          onClose={() => setShowAgentsModal(false)}
          onSelectAgent={handleAgentClick}
        />
      )}
    </div>
  );
}

export default App;
