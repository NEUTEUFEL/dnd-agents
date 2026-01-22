import type { Agent, TaskStation as TaskStationType, Task } from '../types/agent';
import { TaskStation } from './TaskStation';

interface WorkspaceProps {
  stations: TaskStationType[];
  agents: Agent[];
  tasks: Task[];
  onAgentClick: (agent: Agent) => void;
  selectedAgentId: string | null;
}

export function Workspace({
  stations,
  agents,
  tasks,
  onAgentClick,
  selectedAgentId,
}: WorkspaceProps) {
  return (
    <div className="relative w-full h-[400px] bg-slate-900/50 border border-cyan-500/30 rounded-lg overflow-hidden grid-pattern">
      {/* Entrance label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-teal-600 px-4 py-1 rounded text-xs font-bold text-white uppercase tracking-wider">
          Entrance
        </div>
      </div>

      {/* Render stations */}
      {stations.map((station) => {
        const task = tasks.find((t) => t.stationId === station.id);
        return (
          <TaskStation
            key={station.id}
            station={station}
            agents={agents}
            task={task}
            onAgentClick={onAgentClick}
            selectedAgentId={selectedAgentId}
          />
        );
      })}

      {/* Bar area */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-2xl">🍺</span>
          <span className="text-xs uppercase tracking-wider">Bar</span>
        </div>
      </div>
    </div>
  );
}
