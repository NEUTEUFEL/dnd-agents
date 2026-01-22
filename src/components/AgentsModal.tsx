import { Agent } from '../types/agent';
import { AgentAvatar } from './AgentAvatar';
import { StatBar } from './StatBar';

interface AgentsModalProps {
  agents: Agent[];
  onClose: () => void;
  onSelectAgent: (agent: Agent) => void;
}

const STAT_COLORS = {
  speed: '#3b82f6',
  creativity: '#f59e0b',
  precision: '#ef4444',
  intel: '#10b981',
};

export function AgentsModal({ agents, onClose, onSelectAgent }: AgentsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-cyan-400">All Agents</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Agent Grid */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-60px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent);
                  onClose();
                }}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 cursor-pointer
                  hover:border-cyan-500 hover:bg-slate-800/50 transition-all"
              >
                {/* Agent Header */}
                <div className="flex items-center gap-3 mb-3">
                  <AgentAvatar agent={agent} size="md" showStatus={true} />
                  <div>
                    <div className="font-bold" style={{ color: agent.color }}>
                      {agent.name}
                    </div>
                    <div className="text-sm text-slate-400">{agent.title}</div>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="space-y-1.5 mb-3">
                  <StatBar label="SPD" value={agent.stats.speed} color={STAT_COLORS.speed} />
                  <StatBar label="CRE" value={agent.stats.creativity} color={STAT_COLORS.creativity} />
                  <StatBar label="PRE" value={agent.stats.precision} color={STAT_COLORS.precision} />
                  <StatBar label="INT" value={agent.stats.intel} color={STAT_COLORS.intel} />
                </div>

                {/* Personality & Status */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{agent.personality}</span>
                  <span className={`
                    px-2 py-0.5 rounded capitalize
                    ${agent.status === 'working' ? 'bg-green-500/20 text-green-400' : ''}
                    ${agent.status === 'idle' ? 'bg-slate-500/20 text-slate-400' : ''}
                    ${agent.status === 'moving' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                    ${agent.status === 'blocked' ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
