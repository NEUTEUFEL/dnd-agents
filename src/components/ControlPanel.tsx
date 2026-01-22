interface ControlPanelProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onViewAllAgents: () => void;
  currentProject: string;
}

export function ControlPanel({
  isPaused,
  onPause,
  onResume,
  onRestart,
  onViewAllAgents,
  currentProject,
}: ControlPanelProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <button
        onClick={isPaused ? onResume : onPause}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2
          transition-all border
          ${isPaused
            ? 'bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600/30'
            : 'bg-yellow-600/20 border-yellow-500 text-yellow-400 hover:bg-yellow-600/30'
          }
        `}
      >
        {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
      </button>

      <button
        onClick={onRestart}
        className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2
          bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700
          transition-all"
      >
        ↻ RESTART
      </button>

      <button
        onClick={onViewAllAgents}
        className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2
          bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700
          transition-all"
      >
        👥 ALL AGENTS
      </button>

      <div className="h-8 w-px bg-slate-700 mx-2" />

      <div className="flex gap-2">
        {['📱 APP', '📖 STORY', '🚀 STARTUP', '📢 MARKETING'].map((label) => (
          <button
            key={label}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm
              transition-all border
              ${currentProject.toLowerCase().includes(label.split(' ')[1]?.toLowerCase() || '')
                ? 'bg-cyan-600/30 border-cyan-500 text-cyan-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
