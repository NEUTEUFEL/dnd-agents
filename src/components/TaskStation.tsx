import { TaskStation as TaskStationType, Agent, Task } from '../types/agent';
import { AgentAvatar } from './AgentAvatar';
import { TASK_TYPE_LABELS } from '../data/mockAgents';

interface TaskStationProps {
  station: TaskStationType;
  agents: Agent[];
  task?: Task;
  onAgentClick: (agent: Agent) => void;
  selectedAgentId: string | null;
}

export function TaskStation({
  station,
  agents,
  task,
  onAgentClick,
  selectedAgentId,
}: TaskStationProps) {
  const stationAgents = agents.filter(a => station.currentAgentIds.includes(a.id));
  const isSpecialStation = station.taskType === 'bar' || station.taskType === 'lounge';

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: station.position.x,
        top: station.position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Station table */}
      <div
        className={`
          relative rounded-lg border-2 transition-all
          ${isSpecialStation
            ? 'bg-slate-700/30 border-slate-600 px-6 py-4'
            : 'bg-slate-800/80 border-slate-600 px-8 py-6'
          }
        `}
      >
        {/* Station name */}
        <div className="text-center mb-2">
          <div className="text-slate-300 text-sm font-medium">{station.name}</div>
          <div className="text-xs text-slate-500">{TASK_TYPE_LABELS[station.taskType]}</div>
        </div>

        {/* Task progress (for work tables) */}
        {task && !isSpecialStation && (
          <div className="mb-3">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 text-center mt-1">
              {task.progress}%
            </div>
          </div>
        )}

        {/* Agents at this station */}
        <div className="flex gap-4 justify-center min-h-[50px] items-end">
          {stationAgents.map((agent) => (
            <AgentAvatar
              key={agent.id}
              agent={agent}
              size="md"
              onClick={() => onAgentClick(agent)}
              selected={selectedAgentId === agent.id}
            />
          ))}
          {stationAgents.length === 0 && (
            <div className="text-slate-600 text-xs">Empty</div>
          )}
        </div>
      </div>
    </div>
  );
}
