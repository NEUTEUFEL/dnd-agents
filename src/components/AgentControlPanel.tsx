import { useState } from 'react';
import type { AgentTask } from '../agents/types';
import type { AgentEvent } from '../agents/BaseAgent';

interface AgentControlPanelProps {
  isRunning: boolean;
  currentAgentId: string | null;
  events: AgentEvent[];
  completedTasks: AgentTask[];
  onAssignTask: (agentId: string, task: string) => Promise<AgentTask | undefined>;
  onStop: () => void;
}

const AGENT_INFO = {
  raj: {
    name: 'Raj',
    title: 'Research Agent',
    color: '#8b5cf6',
    icon: '🔬',
    capabilities: ['Web search', 'Summarization', 'Report generation'],
    placeholder: 'e.g., "Research the latest trends in AI agents"',
  },
  sheldon: {
    name: 'Sheldon',
    title: 'Code Review Agent',
    color: '#3b82f6',
    icon: '🔍',
    capabilities: ['Code analysis', 'Bug detection', 'Fix suggestions'],
    placeholder: 'e.g., "Review the App.tsx file for issues"',
  },
  penny: {
    name: 'Penny',
    title: 'Intern Agent',
    color: '#ec4899',
    icon: '📧',
    capabilities: ['Email processing', 'Todo management', 'Task completion'],
    placeholder: 'e.g., "Check my emails and organize my day"',
  },
};

export function AgentControlPanel({
  isRunning,
  currentAgentId,
  events,
  completedTasks,
  onAssignTask,
  onStop,
}: AgentControlPanelProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [viewingTask, setViewingTask] = useState<AgentTask | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !taskInput.trim() || isRunning) return;

    await onAssignTask(selectedAgent, taskInput.trim());
    setTaskInput('');
  };

  const recentEvents = events.slice(-10).reverse();

  return (
    <div className="bg-slate-800/90 border-2 border-slate-700 rounded-xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          🤖 Real Agent Control Panel
        </h3>
        {isRunning && (
          <button
            onClick={onStop}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
          >
            Stop Agent
          </button>
        )}
      </div>

      {/* Agent Selection */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {Object.entries(AGENT_INFO).map(([id, info]) => (
          <button
            key={id}
            onClick={() => setSelectedAgent(id)}
            disabled={isRunning}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              selectedAgent === id
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
            } ${isRunning && currentAgentId !== id ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{info.icon}</span>
              <span className="font-bold" style={{ color: info.color }}>
                {info.name}
              </span>
            </div>
            <div className="text-xs text-slate-400">{info.title}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {info.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded"
                >
                  {cap}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Task Input */}
      {selectedAgent && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder={AGENT_INFO[selectedAgent as keyof typeof AGENT_INFO].placeholder}
              disabled={isRunning}
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isRunning || !taskInput.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              {isRunning ? 'Running...' : 'Assign Task'}
            </button>
          </div>
        </form>
      )}

      {/* Live Events Feed */}
      {(isRunning || recentEvents.length > 0) && (
        <div className="mb-4">
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
            {isRunning && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            Live Activity
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
            {recentEvents.length === 0 ? (
              <div className="text-slate-500 text-sm">No recent activity</div>
            ) : (
              <div className="space-y-1">
                {recentEvents.map((event, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={`
                      ${event.type === 'thinking' ? 'text-purple-400' : ''}
                      ${event.type === 'tool_call' ? 'text-yellow-400' : ''}
                      ${event.type === 'tool_result' ? 'text-green-400' : ''}
                      ${event.type === 'task_complete' ? 'text-cyan-400' : ''}
                      ${event.type === 'error' ? 'text-red-400' : ''}
                    `}>
                      {event.type === 'thinking' && '💭'}
                      {event.type === 'tool_call' && '🔧'}
                      {event.type === 'tool_result' && '✓'}
                      {event.type === 'task_complete' && '🎉'}
                      {event.type === 'error' && '❌'}
                    </span>
                    <span className="font-medium text-slate-300">{event.agentName}</span>
                    <span className="text-slate-500">
                      {event.type === 'thinking' && 'thinking...'}
                      {event.type === 'tool_call' && `using ${(event.data as {tool: string}).tool}`}
                      {event.type === 'tool_result' && 'got result'}
                      {event.type === 'task_complete' && 'completed task!'}
                      {event.type === 'error' && `error: ${(event.data as {message: string}).message}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <div className="text-xs text-slate-400 mb-2">Completed Tasks</div>
          <div className="space-y-2">
            {completedTasks.slice(-3).reverse().map((task) => (
              <div
                key={task.id}
                className="bg-slate-900/50 rounded-lg p-3 cursor-pointer hover:bg-slate-900/70 transition-colors"
                onClick={() => setViewingTask(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {task.description}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {task.steps.length} steps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Result Modal */}
      {viewingTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="font-bold text-cyan-400">Task Result</h3>
              <button
                onClick={() => setViewingTask(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-300 bg-slate-900 p-4 rounded-lg">
                  {viewingTask.result || 'No result'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
