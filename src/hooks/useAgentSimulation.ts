import { useState, useEffect, useCallback, useRef } from 'react';
import type { Agent, Task, TaskStation, ActionLogEntry, Project } from '../types/agent';
import { MOCK_AGENTS, MOCK_STATIONS, MOCK_PROJECT } from '../data/mockAgents';

interface SimulationState {
  agents: Agent[];
  stations: TaskStation[];
  tasks: Task[];
  project: Project;
  actionLog: ActionLogEntry[];
  isPaused: boolean;
  overallProgress: number;
}

const TICK_INTERVAL = 1500; // ms between simulation ticks

export function useAgentSimulation() {
  const [state, setState] = useState<SimulationState>(() => initializeState());
  const tickRef = useRef<number | null>(null);

  function initializeState(): SimulationState {
    // Deep clone to avoid mutation
    const agents = JSON.parse(JSON.stringify(MOCK_AGENTS)) as Agent[];
    const stations = JSON.parse(JSON.stringify(MOCK_STATIONS)) as TaskStation[];
    const tasks = JSON.parse(JSON.stringify(MOCK_PROJECT.tasks)) as Task[];

    // Place agents at random starting positions
    agents.forEach((agent, idx) => {
      const stationIdx = idx % stations.length;
      stations[stationIdx].currentAgentIds.push(agent.id);
      agent.status = 'idle';
    });

    return {
      agents,
      stations,
      tasks,
      project: { ...MOCK_PROJECT, tasks },
      actionLog: [
        {
          id: 'init',
          timestamp: new Date(),
          agentId: 'system',
          agentName: 'System',
          action: 'Simulation initialized',
          type: 'system',
        },
      ],
      isPaused: false,
      overallProgress: 0,
    };
  }

  const addLogEntry = useCallback(
    (agentId: string, agentName: string, action: string, type: ActionLogEntry['type']) => {
      setState((prev) => ({
        ...prev,
        actionLog: [
          ...prev.actionLog,
          {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            agentId,
            agentName,
            action,
            type,
          },
        ],
      }));
    },
    []
  );

  const moveAgentToStation = useCallback(
    (agentId: string, targetStationId: string) => {
      setState((prev) => {
        const agent = prev.agents.find((a) => a.id === agentId);
        const targetStation = prev.stations.find((s) => s.id === targetStationId);

        if (!agent || !targetStation) return prev;
        if (targetStation.currentAgentIds.length >= targetStation.capacity) return prev;

        // Remove from current station
        const newStations = prev.stations.map((s) => ({
          ...s,
          currentAgentIds: s.currentAgentIds.filter((id) => id !== agentId),
        }));

        // Add to target station
        const targetIdx = newStations.findIndex((s) => s.id === targetStationId);
        newStations[targetIdx] = {
          ...newStations[targetIdx],
          currentAgentIds: [...newStations[targetIdx].currentAgentIds, agentId],
        };

        // Update agent status
        const newAgents = prev.agents.map((a) =>
          a.id === agentId ? { ...a, status: 'moving' as const } : a
        );

        return { ...prev, agents: newAgents, stations: newStations };
      });
    },
    []
  );

  const simulationTick = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused) return prev;

      let newAgents = [...prev.agents];
      let newStations = [...prev.stations];
      let newTasks = [...prev.tasks];
      const newLogs: ActionLogEntry[] = [];

      // Process each agent
      newAgents = newAgents.map((agent) => {
        // Find which station the agent is at
        const currentStation = newStations.find((s) =>
          s.currentAgentIds.includes(agent.id)
        );

        if (!currentStation) return agent;

        // If at break room or lounge, randomly decide to leave
        if (currentStation.taskType === 'break' || currentStation.taskType === 'lounge') {
          if (Math.random() > 0.7) {
            // Find a work table to go to
            const workStations = newStations.filter(
              (s) => !['break', 'lounge'].includes(s.taskType) && s.currentAgentIds.length < s.capacity
            );
            if (workStations.length > 0) {
              const target = workStations[Math.floor(Math.random() * workStations.length)];

              // Move agent
              newStations = newStations.map((s) => ({
                ...s,
                currentAgentIds: s.currentAgentIds.filter((id) => id !== agent.id),
              }));
              const targetIdx = newStations.findIndex((s) => s.id === target.id);
              newStations[targetIdx].currentAgentIds.push(agent.id);

              newLogs.push({
                id: `${Date.now()}-${agent.id}`,
                timestamp: new Date(),
                agentId: agent.id,
                agentName: agent.name,
                action: `moved to ${target.name}`,
                type: 'move',
              });

              return { ...agent, status: 'moving' as const };
            }
          }
          return { ...agent, status: 'idle' as const };
        }

        // At a work station - work on the task
        const task = newTasks.find((t) => t.stationId === currentStation.id);
        if (task && task.status !== 'completed') {
          // Calculate work based on agent stats
          const speedBonus = agent.stats.speed / 10;
          const progressIncrease = Math.floor(Math.random() * 5 + 3 + speedBonus);

          const taskIdx = newTasks.findIndex((t) => t.id === task.id);
          newTasks[taskIdx] = {
            ...newTasks[taskIdx],
            progress: Math.min(100, newTasks[taskIdx].progress + progressIncrease),
            status: newTasks[taskIdx].progress + progressIncrease >= 100 ? 'completed' : 'in_progress',
            assignedAgentId: agent.id,
          };

          if (newTasks[taskIdx].progress >= 100 && task.progress < 100) {
            newLogs.push({
              id: `${Date.now()}-${agent.id}-complete`,
              timestamp: new Date(),
              agentId: agent.id,
              agentName: agent.name,
              action: `completed "${task.name}"`,
              type: 'task_complete',
            });
          } else if (Math.random() > 0.6) {
            const actions = [
              `working on "${task.name}"`,
              `analyzing requirements`,
              `making progress`,
              `refining approach`,
            ];
            newLogs.push({
              id: `${Date.now()}-${agent.id}-think`,
              timestamp: new Date(),
              agentId: agent.id,
              agentName: agent.name,
              action: actions[Math.floor(Math.random() * actions.length)],
              type: 'thinking',
            });
          }

          return { ...agent, status: 'working' as const, currentTaskId: task.id };
        }

        // Task completed at this station, maybe move to another
        if (Math.random() > 0.5) {
          const otherStations = newStations.filter(
            (s) => s.id !== currentStation.id && s.currentAgentIds.length < s.capacity
          );
          if (otherStations.length > 0) {
            const target = otherStations[Math.floor(Math.random() * otherStations.length)];

            newStations = newStations.map((s) => ({
              ...s,
              currentAgentIds: s.currentAgentIds.filter((id) => id !== agent.id),
            }));
            const targetIdx = newStations.findIndex((s) => s.id === target.id);
            newStations[targetIdx].currentAgentIds.push(agent.id);

            newLogs.push({
              id: `${Date.now()}-${agent.id}-move`,
              timestamp: new Date(),
              agentId: agent.id,
              agentName: agent.name,
              action: `moved to ${target.name}`,
              type: 'move',
            });

            return { ...agent, status: 'moving' as const };
          }
        }

        return { ...agent, status: 'idle' as const };
      });

      // Calculate overall progress
      const totalProgress = newTasks.reduce((sum, t) => sum + t.progress, 0);
      const overallProgress = Math.floor(totalProgress / newTasks.length);

      return {
        ...prev,
        agents: newAgents,
        stations: newStations,
        tasks: newTasks,
        actionLog: [...prev.actionLog, ...newLogs],
        overallProgress,
      };
    });
  }, []);

  // Start/stop simulation loop
  useEffect(() => {
    if (!state.isPaused) {
      tickRef.current = window.setInterval(simulationTick, TICK_INTERVAL);
    }
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
      }
    };
  }, [state.isPaused, simulationTick]);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: true }));
    addLogEntry('system', 'System', 'Paused', 'system');
  }, [addLogEntry]);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
    addLogEntry('system', 'System', 'Resumed', 'system');
  }, [addLogEntry]);

  const restart = useCallback(() => {
    setState(initializeState());
  }, []);

  return {
    agents: state.agents,
    stations: state.stations,
    tasks: state.tasks,
    project: state.project,
    actionLog: state.actionLog,
    isPaused: state.isPaused,
    overallProgress: state.overallProgress,
    pause,
    resume,
    restart,
    moveAgentToStation,
  };
}
