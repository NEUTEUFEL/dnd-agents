import { ActionLogEntry } from '../types/agent';

interface ActionLogProps {
  entries: ActionLogEntry[];
  maxEntries?: number;
}

const typeIcons: Record<ActionLogEntry['type'], string> = {
  move: '→',
  task_start: '▶',
  task_complete: '✓',
  thinking: '💭',
  blocked: '⚠',
  system: '⚙',
};

const typeColors: Record<ActionLogEntry['type'], string> = {
  move: 'text-blue-400',
  task_start: 'text-yellow-400',
  task_complete: 'text-green-400',
  thinking: 'text-purple-400',
  blocked: 'text-red-400',
  system: 'text-slate-500',
};

export function ActionLog({ entries, maxEntries = 10 }: ActionLogProps) {
  const displayEntries = entries.slice(-maxEntries).reverse();

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="text-cyan-400 text-sm font-semibold mb-3">ACTION LOG</div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {displayEntries.length === 0 ? (
          <div className="text-slate-500 text-sm">No actions yet...</div>
        ) : (
          displayEntries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 text-sm">
              <span className={typeColors[entry.type]}>{typeIcons[entry.type]}</span>
              <span className="text-slate-300">
                <span className="font-medium">{entry.agentName}</span>{' '}
                <span className="text-slate-400">{entry.action}</span>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
