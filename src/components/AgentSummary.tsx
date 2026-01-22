import type { Agent, Task } from '../types/agent';

interface AgentSummaryProps {
  agents: Agent[];
  tasks: Task[];
  overallProgress: number;
  claudeUsage: number; // 0-100 percentage
}

// Calculate individual agent contribution based on tasks they've worked on
function getAgentProgress(agent: Agent, tasks: Task[]): number {
  const agentTasks = tasks.filter((t) => t.assignedAgentId === agent.id);
  if (agentTasks.length === 0) return 0;
  const totalProgress = agentTasks.reduce((sum, t) => sum + t.progress, 0);
  return Math.round(totalProgress / agentTasks.length);
}

function getStatusEmoji(status: Agent['status']): string {
  switch (status) {
    case 'working': return '⚡';
    case 'moving': return '🚶';
    case 'idle': return '💤';
    case 'blocked': return '🚫';
    case 'completed': return '✅';
    default: return '❓';
  }
}

export function AgentSummary({ agents, tasks, overallProgress, claudeUsage }: AgentSummaryProps) {
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;

  return (
    <div className="bg-slate-800/90 border-2 border-slate-700 rounded-xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          🤖 AI Agent Summary
        </h3>
        <div className="text-xs text-slate-500">
          {completedTasks}/{totalTasks} tasks complete
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        {agents.map((agent) => {
          const progress = getAgentProgress(agent, tasks);
          return (
            <div
              key={agent.id}
              className="bg-slate-900/50 rounded-lg p-2 border border-slate-700"
            >
              {/* Agent avatar mini */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{agent.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    {getStatusEmoji(agent.status)} {agent.status}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: agent.color,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-center mt-1">
                {progress}% done
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Project Progress */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Project Progress</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${overallProgress}%`,
                  background: overallProgress >= 100
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
                }}
              />
            </div>
            <span className="text-lg font-bold text-white">{overallProgress}%</span>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Tasks Completed</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${(completedTasks / totalTasks) * 100}%`,
                }}
              />
            </div>
            <span className="text-lg font-bold text-white">
              {completedTasks}/{totalTasks}
            </span>
          </div>
        </div>

        {/* Claude Usage */}
        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            <span>Claude Usage</span>
            <span className="text-[10px] text-slate-600">(simulated)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${claudeUsage}%`,
                  background: claudeUsage > 80
                    ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                    : claudeUsage > 50
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #22c55e, #16a34a)',
                }}
              />
            </div>
            <span className={`text-lg font-bold ${
              claudeUsage > 80 ? 'text-red-400' : claudeUsage > 50 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {claudeUsage}%
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {claudeUsage > 80 ? '⚠️ Running low!' : claudeUsage > 50 ? '📊 Moderate use' : '✨ Plenty left'}
          </div>
        </div>
      </div>
    </div>
  );
}
