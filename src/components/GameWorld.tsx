import type { Agent, TaskStation, Task } from '../types/agent';
import { PixelCharacter } from './PixelCharacter';
import { TASK_TYPE_ICONS } from '../data/mockAgents';

interface GameWorldProps {
  agents: Agent[];
  stations: TaskStation[];
  tasks: Task[];
  onAgentClick: (agent: Agent) => void;
  selectedAgentId: string | null;
}

export function GameWorld({
  agents,
  stations,
  tasks,
  onAgentClick,
  selectedAgentId,
}: GameWorldProps) {
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden border-4 border-slate-700 shadow-2xl">
      {/* Floor tiles - Pokemon style */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(71, 85, 105, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(71, 85, 105, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Carpet area in center */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #7c3aed20 0%, #6d28d920 100%)',
          border: '2px solid #7c3aed30',
        }}
      />

      {/* Render stations as furniture/objects */}
      {stations.map((station) => {
        const task = tasks.find((t) => t.stationId === station.id);
        const isWorkStation = !['lounge', 'break'].includes(station.taskType);

        return (
          <div
            key={station.id}
            className="absolute"
            style={{
              left: station.position.x,
              top: station.position.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Station furniture sprite */}
            <div className="relative">
              {/* Different furniture for different station types */}
              {station.taskType === 'lounge' && <CouchSprite />}
              {station.taskType === 'break' && <TableSprite />}
              {station.taskType === 'idea' && <WhiteboardSprite />}
              {station.taskType === 'research' && <ComputerDeskSprite />}
              {station.taskType === 'build' && <WorkbenchSprite />}
              {station.taskType === 'review' && <DeskSprite />}

              {/* Station label */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-bold text-white bg-slate-800/90 px-2 py-1 rounded border border-slate-600">
                  {TASK_TYPE_ICONS[station.taskType]} {station.name}
                </span>
              </div>

              {/* Task progress bar (for work stations) */}
              {task && isWorkStation && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div
                      className="h-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${task.progress}%`,
                        background: task.progress >= 100
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                          : 'linear-gradient(90deg, #06b6d4, #0891b2)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Render pixel characters */}
      {agents.map((agent) => (
        <PixelCharacter
          key={agent.id}
          agentId={agent.id}
          name={agent.name}
          color={agent.color}
          x={agent.position.x}
          y={agent.position.y}
          status={agent.status}
          direction={agent.direction}
          onClick={() => onAgentClick(agent)}
          selected={selectedAgentId === agent.id}
        />
      ))}

      {/* Entrance area */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="bg-teal-700 px-4 py-1 rounded text-xs font-bold text-white uppercase tracking-wider border-2 border-teal-500 shadow-lg">
          🚪 Entrance
        </div>
      </div>

      {/* Apartment label */}
      <div className="absolute top-2 left-2">
        <div className="bg-slate-800/90 px-3 py-1 rounded text-sm font-bold text-cyan-400 border border-slate-600">
          🏠 Apartment 4A
        </div>
      </div>
    </div>
  );
}

// Pixel art furniture sprites
function CouchSprite() {
  return (
    <svg width="100" height="40" viewBox="0 0 100 40" className="pixelated">
      {/* Couch base */}
      <rect x="5" y="20" width="90" height="20" fill="#8b5cf6" rx="4" />
      {/* Couch back */}
      <rect x="5" y="5" width="90" height="18" fill="#7c3aed" rx="4" />
      {/* Cushions */}
      <rect x="10" y="22" width="25" height="15" fill="#a78bfa" rx="2" />
      <rect x="38" y="22" width="25" height="15" fill="#a78bfa" rx="2" />
      <rect x="66" y="22" width="25" height="15" fill="#a78bfa" rx="2" />
      {/* Armrests */}
      <rect x="0" y="15" width="8" height="25" fill="#6d28d9" rx="2" />
      <rect x="92" y="15" width="8" height="25" fill="#6d28d9" rx="2" />
    </svg>
  );
}

function TableSprite() {
  return (
    <svg width="80" height="50" viewBox="0 0 80 50" className="pixelated">
      {/* Table top */}
      <rect x="5" y="10" width="70" height="8" fill="#92400e" rx="2" />
      {/* Table legs */}
      <rect x="10" y="18" width="6" height="30" fill="#78350f" />
      <rect x="64" y="18" width="6" height="30" fill="#78350f" />
      {/* Food items */}
      <circle cx="25" cy="6" r="6" fill="#fbbf24" />
      <circle cx="40" cy="6" r="5" fill="#ef4444" />
      <circle cx="55" cy="6" r="6" fill="#fbbf24" />
    </svg>
  );
}

function WhiteboardSprite() {
  return (
    <svg width="70" height="60" viewBox="0 0 70 60" className="pixelated">
      {/* Board */}
      <rect x="5" y="5" width="60" height="40" fill="#f5f5f4" stroke="#374151" strokeWidth="3" rx="2" />
      {/* Stand */}
      <rect x="30" y="45" width="10" height="15" fill="#374151" />
      <rect x="20" y="55" width="30" height="5" fill="#4b5563" rx="2" />
      {/* Scribbles */}
      <line x1="15" y1="15" x2="45" y2="15" stroke="#3b82f6" strokeWidth="2" />
      <line x1="15" y1="25" x2="55" y2="25" stroke="#ef4444" strokeWidth="2" />
      <line x1="15" y1="35" x2="40" y2="35" stroke="#22c55e" strokeWidth="2" />
    </svg>
  );
}

function ComputerDeskSprite() {
  return (
    <svg width="60" height="50" viewBox="0 0 60 50" className="pixelated">
      {/* Desk */}
      <rect x="0" y="30" width="60" height="6" fill="#78350f" />
      <rect x="5" y="36" width="6" height="14" fill="#92400e" />
      <rect x="49" y="36" width="6" height="14" fill="#92400e" />
      {/* Monitor */}
      <rect x="15" y="8" width="30" height="22" fill="#1f2937" stroke="#374151" strokeWidth="2" rx="2" />
      <rect x="18" y="11" width="24" height="16" fill="#3b82f6" />
      {/* Monitor stand */}
      <rect x="26" y="28" width="8" height="4" fill="#374151" />
      {/* Keyboard */}
      <rect x="18" y="32" width="24" height="4" fill="#4b5563" rx="1" />
    </svg>
  );
}

function WorkbenchSprite() {
  return (
    <svg width="70" height="50" viewBox="0 0 70 50" className="pixelated">
      {/* Workbench */}
      <rect x="0" y="25" width="70" height="8" fill="#78350f" />
      <rect x="5" y="33" width="8" height="17" fill="#92400e" />
      <rect x="57" y="33" width="8" height="17" fill="#92400e" />
      {/* Tools */}
      <rect x="10" y="18" width="4" height="10" fill="#6b7280" />
      <rect x="8" y="15" width="8" height="5" fill="#f59e0b" />
      {/* Gear */}
      <circle cx="35" cy="18" r="8" fill="#4b5563" />
      <circle cx="35" cy="18" r="4" fill="#6b7280" />
      {/* Wrench */}
      <rect x="50" y="12" width="4" height="16" fill="#9ca3af" />
      <rect x="48" y="10" width="8" height="6" fill="#9ca3af" rx="2" />
    </svg>
  );
}

function DeskSprite() {
  return (
    <svg width="60" height="45" viewBox="0 0 60 45" className="pixelated">
      {/* Desk */}
      <rect x="0" y="25" width="60" height="6" fill="#78350f" />
      <rect x="5" y="31" width="6" height="14" fill="#92400e" />
      <rect x="49" y="31" width="6" height="14" fill="#92400e" />
      {/* Papers */}
      <rect x="8" y="20" width="15" height="8" fill="#f5f5f4" transform="rotate(-5 8 20)" />
      <rect x="25" y="19" width="15" height="8" fill="#fef3c7" transform="rotate(3 25 19)" />
      {/* Pen holder */}
      <rect x="45" y="15" width="10" height="12" fill="#6b7280" />
      <rect x="47" y="10" width="2" height="8" fill="#3b82f6" />
      <rect x="50" y="12" width="2" height="6" fill="#ef4444" />
      <rect x="53" y="11" width="2" height="7" fill="#22c55e" />
    </svg>
  );
}
