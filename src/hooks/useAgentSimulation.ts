import { useState, useEffect, useCallback, useRef } from 'react';
import type { Agent, Task, TaskStation, ActionLogEntry, Project, Position, Direction } from '../types/agent';
import { MOCK_AGENTS, MOCK_STATIONS, MOCK_PROJECT } from '../data/mockAgents';

interface SimulationState {
  agents: Agent[];
  stations: TaskStation[];
  tasks: Task[];
  project: Project;
  actionLog: ActionLogEntry[];
  isPaused: boolean;
  overallProgress: number;
  claudeUsage: number; // Simulated Claude API usage 0-100
}

// Slower intervals for gentler movement
const DECISION_INTERVAL = 3000; // ms between agent decisions
const MOVEMENT_INTERVAL = 50;   // ms between position updates
const MOVEMENT_SPEED = 2;       // pixels per movement tick

function getDirection(from: Position, to: Position): Direction {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}

function moveTowards(current: Position, target: Position, speed: number): Position {
  const dx = target.x - current.x;
  const dy = target.y - current.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= speed) {
    return { ...target };
  }

  return {
    x: current.x + (dx / distance) * speed,
    y: current.y + (dy / distance) * speed,
  };
}

function hasReachedTarget(current: Position, target: Position): boolean {
  const distance = Math.sqrt(
    Math.pow(target.x - current.x, 2) + Math.pow(target.y - current.y, 2)
  );
  return distance < MOVEMENT_SPEED;
}

export function useAgentSimulation() {
  const [state, setState] = useState<SimulationState>(() => initializeState());
  const decisionTickRef = useRef<number | null>(null);
  const movementTickRef = useRef<number | null>(null);

  function initializeState(): SimulationState {
    const agents = JSON.parse(JSON.stringify(MOCK_AGENTS)) as Agent[];
    const stations = JSON.parse(JSON.stringify(MOCK_STATIONS)) as TaskStation[];
    const tasks = JSON.parse(JSON.stringify(MOCK_PROJECT.tasks)) as Task[];

    // Place agents at their starting positions (entrance area)
    agents.forEach((agent, idx) => {
      agent.position = { x: 150 + idx * 50, y: 350 };
      agent.targetPosition = null;
      agent.direction = 'up';
      agent.status = 'idle';
      agent.currentStationId = null;
    });

    return {
      agents,
      stations,
      tasks,
      project: { ...MOCK_PROJECT, tasks, stations },
      actionLog: [
        {
          id: 'init',
          timestamp: new Date(),
          agentId: 'system',
          agentName: 'System',
          action: 'Team has arrived at Apartment 4A',
          type: 'system',
        },
      ],
      isPaused: false,
      overallProgress: 0,
      claudeUsage: 0,
    };
  }

  // Movement tick - updates positions smoothly
  const movementTick = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused) return prev;

      let hasChanges = false;
      const newAgents = prev.agents.map((agent) => {
        if (!agent.targetPosition) return agent;

        if (hasReachedTarget(agent.position, agent.targetPosition)) {
          hasChanges = true;
          return {
            ...agent,
            position: { ...agent.targetPosition },
            targetPosition: null,
            status: 'idle' as const,
          };
        }

        hasChanges = true;
        const newPosition = moveTowards(agent.position, agent.targetPosition, MOVEMENT_SPEED);
        const newDirection = getDirection(agent.position, agent.targetPosition);

        return {
          ...agent,
          position: newPosition,
          direction: newDirection,
          status: 'moving' as const,
        };
      });

      if (!hasChanges) return prev;
      return { ...prev, agents: newAgents };
    });
  }, []);

  // Decision tick - agents decide what to do
  const decisionTick = useCallback(() => {
    setState((prev) => {
      if (prev.isPaused) return prev;

      let newAgents = [...prev.agents];
      let newStations = [...prev.stations];
      let newTasks = [...prev.tasks];
      const newLogs: ActionLogEntry[] = [];

      newAgents = newAgents.map((agent) => {
        // Skip if agent is moving
        if (agent.targetPosition) return agent;

        // Find current station (if any)
        const currentStation = newStations.find(
          (s) => s.currentAgentIds.includes(agent.id)
        );

        // If at a break area, maybe go to work
        if (currentStation && ['break', 'lounge'].includes(currentStation.taskType)) {
          if (Math.random() > 0.6) {
            // Find incomplete work
            const incompleteTasks = newTasks.filter((t) => t.status !== 'completed');
            if (incompleteTasks.length > 0) {
              const task = incompleteTasks[Math.floor(Math.random() * incompleteTasks.length)];
              const targetStation = newStations.find((s) => s.id === task.stationId);

              if (targetStation && targetStation.currentAgentIds.length < targetStation.capacity) {
                // Get available spot
                const spotIndex = targetStation.currentAgentIds.length;
                const targetSpot = targetStation.agentSpots[spotIndex];

                if (targetSpot) {
                  // Remove from current station
                  newStations = newStations.map((s) => ({
                    ...s,
                    currentAgentIds: s.currentAgentIds.filter((id) => id !== agent.id),
                  }));

                  // Add to target station
                  const targetIdx = newStations.findIndex((s) => s.id === targetStation.id);
                  newStations[targetIdx].currentAgentIds.push(agent.id);

                  newLogs.push({
                    id: `${Date.now()}-${agent.id}`,
                    timestamp: new Date(),
                    agentId: agent.id,
                    agentName: agent.name,
                    action: `heading to ${targetStation.name}`,
                    type: 'move',
                  });

                  return {
                    ...agent,
                    targetPosition: targetSpot,
                    currentStationId: targetStation.id,
                    status: 'moving' as const,
                  };
                }
              }
            }
          }
          return agent;
        }

        // If idle and not at a station, find work
        if (!currentStation) {
          const availableStations = newStations.filter(
            (s) => s.currentAgentIds.length < s.capacity
          );
          if (availableStations.length > 0) {
            const targetStation = availableStations[Math.floor(Math.random() * availableStations.length)];
            const spotIndex = targetStation.currentAgentIds.length;
            const targetSpot = targetStation.agentSpots[spotIndex];

            if (targetSpot) {
              const targetIdx = newStations.findIndex((s) => s.id === targetStation.id);
              newStations[targetIdx].currentAgentIds.push(agent.id);

              newLogs.push({
                id: `${Date.now()}-${agent.id}`,
                timestamp: new Date(),
                agentId: agent.id,
                agentName: agent.name,
                action: `heading to ${targetStation.name}`,
                type: 'move',
              });

              return {
                ...agent,
                targetPosition: targetSpot,
                currentStationId: targetStation.id,
                status: 'moving' as const,
              };
            }
          }
          return agent;
        }

        // At a work station - do work
        const task = newTasks.find((t) => t.stationId === currentStation.id);
        if (task && task.status !== 'completed') {
          const speedBonus = agent.stats.speed / 20;
          const progressIncrease = Math.floor(Math.random() * 3 + 1 + speedBonus);

          const taskIdx = newTasks.findIndex((t) => t.id === task.id);
          const newProgress = Math.min(100, newTasks[taskIdx].progress + progressIncrease);

          newTasks[taskIdx] = {
            ...newTasks[taskIdx],
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'in_progress',
            assignedAgentId: agent.id,
          };

          if (newProgress >= 100 && task.progress < 100) {
            newLogs.push({
              id: `${Date.now()}-${agent.id}-complete`,
              timestamp: new Date(),
              agentId: agent.id,
              agentName: agent.name,
              action: `completed "${task.name}" ✓`,
              type: 'task_complete',
            });
          } else if (Math.random() > 0.7) {
            const actions = [
              `working on "${task.name}"`,
              `thinking deeply...`,
              `making progress`,
              `in the zone`,
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

        // Task at this station is done, maybe go somewhere else
        if (Math.random() > 0.5) {
          const otherStations = newStations.filter(
            (s) => s.id !== currentStation.id && s.currentAgentIds.length < s.capacity
          );
          if (otherStations.length > 0) {
            const targetStation = otherStations[Math.floor(Math.random() * otherStations.length)];
            const spotIndex = targetStation.currentAgentIds.length;
            const targetSpot = targetStation.agentSpots[spotIndex];

            if (targetSpot) {
              // Remove from current
              newStations = newStations.map((s) => ({
                ...s,
                currentAgentIds: s.currentAgentIds.filter((id) => id !== agent.id),
              }));

              // Add to target
              const targetIdx = newStations.findIndex((s) => s.id === targetStation.id);
              newStations[targetIdx].currentAgentIds.push(agent.id);

              newLogs.push({
                id: `${Date.now()}-${agent.id}-move`,
                timestamp: new Date(),
                agentId: agent.id,
                agentName: agent.name,
                action: `heading to ${targetStation.name}`,
                type: 'move',
              });

              return {
                ...agent,
                targetPosition: targetSpot,
                currentStationId: targetStation.id,
                status: 'moving' as const,
              };
            }
          }
        }

        return { ...agent, status: 'idle' as const };
      });

      // Calculate overall progress
      const totalProgress = newTasks.reduce((sum, t) => sum + t.progress, 0);
      const overallProgress = Math.floor(totalProgress / newTasks.length);

      // Simulate Claude usage (each action costs a small amount)
      const usageIncrement = newLogs.length * 0.3; // Each logged action uses ~0.3%
      const newClaudeUsage = Math.min(100, prev.claudeUsage + usageIncrement);

      return {
        ...prev,
        agents: newAgents,
        stations: newStations,
        tasks: newTasks,
        actionLog: [...prev.actionLog, ...newLogs],
        overallProgress,
        claudeUsage: newClaudeUsage,
      };
    });
  }, []);

  // Start/stop simulation loops
  useEffect(() => {
    if (!state.isPaused) {
      movementTickRef.current = window.setInterval(movementTick, MOVEMENT_INTERVAL);
      decisionTickRef.current = window.setInterval(decisionTick, DECISION_INTERVAL);
    }
    return () => {
      if (movementTickRef.current) clearInterval(movementTickRef.current);
      if (decisionTickRef.current) clearInterval(decisionTickRef.current);
    };
  }, [state.isPaused, movementTick, decisionTick]);

  const pause = useCallback(() => {
    setState((prev) => {
      const newLogs = [
        ...prev.actionLog,
        {
          id: `${Date.now()}-pause`,
          timestamp: new Date(),
          agentId: 'system',
          agentName: 'System',
          action: 'Simulation paused',
          type: 'system' as const,
        },
      ];
      return { ...prev, isPaused: true, actionLog: newLogs };
    });
  }, []);

  const resume = useCallback(() => {
    setState((prev) => {
      const newLogs = [
        ...prev.actionLog,
        {
          id: `${Date.now()}-resume`,
          timestamp: new Date(),
          agentId: 'system',
          agentName: 'System',
          action: 'Simulation resumed',
          type: 'system' as const,
        },
      ];
      return { ...prev, isPaused: false, actionLog: newLogs };
    });
  }, []);

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
    claudeUsage: Math.round(state.claudeUsage),
    pause,
    resume,
    restart,
  };
}
