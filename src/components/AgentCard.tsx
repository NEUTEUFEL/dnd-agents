import { Agent } from '../types/agent';
import { AgentAvatar } from './AgentAvatar';
import { StatBar } from './StatBar';

interface AgentCardProps {
  agent: Agent | null;
}

const STAT_COLORS = {
  speed: '#3b82f6',
  creativity: '#f59e0b',
  precision: '#ef4444',
  intel: '#10b981',
};

export function AgentCard({ agent }: AgentCardProps) {
  if (!agent) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="text-cyan-400 text-sm font-semibold mb-4">AGENT INFO</div>
        <div className="text-slate-500 text-sm">Select an agent to view details</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 w-72">
      {/* Header */}
      <div className="text-cyan-400 text-sm font-semibold mb-3">AGENT INFO</div>

      {/* Agent ID and Name */}
      <div className="flex items-start gap-3 mb-4">
        <AgentAvatar agent={agent} size="lg" showStatus={false} />
        <div className="pt-1">
          <div className="text-slate-500 text-xs">Agent #{agent.id.toUpperCase()}</div>
          <div className="text-lg font-bold" style={{ color: agent.color }}>
            {agent.name} {agent.title}
          </div>
          <div className="text-slate-400 text-sm">
            Personality: {agent.personality}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <div className="text-cyan-400 text-sm font-semibold mb-2">STATS</div>
        <div className="space-y-2">
          <StatBar label="Speed" value={agent.stats.speed} color={STAT_COLORS.speed} />
          <StatBar label="Creativity" value={agent.stats.creativity} color={STAT_COLORS.creativity} />
          <StatBar label="Precision" value={agent.stats.precision} color={STAT_COLORS.precision} />
          <StatBar label="Intel" value={agent.stats.intel} color={STAT_COLORS.intel} />
        </div>
      </div>

      {/* Goal */}
      <div className="mb-4">
        <div className="text-cyan-400 text-sm font-semibold mb-2">GOAL</div>
        <div className="bg-slate-700/50 rounded px-3 py-2 text-sm text-slate-300 italic">
          "{agent.goal}"
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-green-400 text-xs font-semibold mb-1">STRENGTHS</div>
          <ul className="text-xs text-slate-400 space-y-1">
            {agent.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-green-500">+</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-red-400 text-xs font-semibold mb-1">WEAKNESSES</div>
          <ul className="text-xs text-slate-400 space-y-1">
            {agent.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-red-500">-</span> {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-4 pt-3 border-t border-slate-700">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              agent.status === 'working' ? 'bg-green-500 animate-pulse' :
              agent.status === 'idle' ? 'bg-slate-500' :
              agent.status === 'moving' ? 'bg-yellow-500 animate-pulse' :
              agent.status === 'blocked' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
          />
          <span className="text-xs text-slate-400 capitalize">{agent.status}</span>
        </div>
      </div>
    </div>
  );
}
