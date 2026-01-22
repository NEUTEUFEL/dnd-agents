import type { Agent } from '../types/agent';

interface AgentAvatarProps {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function AgentAvatar({
  agent,
  size = 'md',
  showStatus = true,
  onClick,
  selected = false,
}: AgentAvatarProps) {
  const isActive = agent.status === 'working' || agent.status === 'moving';

  return (
    <div
      onClick={onClick}
      className={`
        relative cursor-pointer transition-transform hover:scale-110
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
        ${selected ? 'scale-110' : ''}
      `}
      style={{ color: agent.color }}
    >
      {/* Outer glow for selected */}
      {selected && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-50"
          style={{ backgroundColor: agent.color }}
        />
      )}

      {/* Main avatar circle */}
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full relative flex items-center justify-center
          ${isActive ? 'agent-active' : ''}
        `}
        style={{
          background: `linear-gradient(135deg, ${agent.color} 0%, ${agent.secondaryColor} 100%)`,
          boxShadow: `0 4px 12px ${agent.color}40`,
        }}
      >
        {/* Inner highlight */}
        <div
          className="absolute top-1 left-1/2 -translate-x-1/2 w-1/2 h-1/4 rounded-full opacity-40"
          style={{ backgroundColor: 'white' }}
        />

        {/* Eyes */}
        <div className="flex gap-1.5">
          <div className="w-1.5 h-2 bg-white/90 rounded-full" />
          <div className="w-1.5 h-2 bg-white/90 rounded-full" />
        </div>
      </div>

      {/* Status indicator */}
      {showStatus && (
        <div
          className={`
            absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800
            ${agent.status === 'working' ? 'bg-green-500 animate-pulse' : ''}
            ${agent.status === 'idle' ? 'bg-slate-500' : ''}
            ${agent.status === 'moving' ? 'bg-yellow-500 animate-pulse' : ''}
            ${agent.status === 'blocked' ? 'bg-red-500' : ''}
            ${agent.status === 'completed' ? 'bg-blue-500' : ''}
          `}
        />
      )}

      {/* Name label */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">
        {agent.name}
      </div>
    </div>
  );
}
