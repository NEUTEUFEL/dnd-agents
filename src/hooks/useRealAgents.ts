import { useState, useCallback, useRef, useEffect } from 'react';
import {
  createAgentTeam,
  getAgentById,
  type AgentTeam,
  type AgentTask,
} from '../agents';
import type { AgentEvent } from '../agents/BaseAgent';

export interface RealAgentState {
  isRunning: boolean;
  currentAgentId: string | null;
  currentTask: AgentTask | null;
  events: AgentEvent[];
  completedTasks: AgentTask[];
}

export function useRealAgents() {
  const teamRef = useRef<AgentTeam | null>(null);
  const [state, setState] = useState<RealAgentState>({
    isRunning: false,
    currentAgentId: null,
    currentTask: null,
    events: [],
    completedTasks: [],
  });

  // Initialize team on mount
  useEffect(() => {
    if (!teamRef.current) {
      teamRef.current = createAgentTeam();

      // Subscribe to events from all agents
      Object.values(teamRef.current).forEach((agent) => {
        agent.onEvent((event: AgentEvent) => {
          setState((prev) => ({
            ...prev,
            events: [...prev.events.slice(-50), event], // Keep last 50 events
          }));
        });
      });
    }
  }, []);

  const assignTask = useCallback(async (agentId: string, taskDescription: string) => {
    if (!teamRef.current) return;

    const agent = getAgentById(teamRef.current, agentId);
    if (!agent) {
      console.error(`Agent ${agentId} not found`);
      return;
    }

    setState((prev) => ({
      ...prev,
      isRunning: true,
      currentAgentId: agentId,
      currentTask: null,
    }));

    try {
      const task = await agent.runTask(taskDescription);

      setState((prev) => ({
        ...prev,
        isRunning: false,
        currentAgentId: null,
        currentTask: null,
        completedTasks: [...prev.completedTasks, task],
      }));

      return task;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        currentAgentId: null,
      }));
      throw error;
    }
  }, []);

  const stopCurrentAgent = useCallback(() => {
    if (!teamRef.current || !state.currentAgentId) return;

    const agent = getAgentById(teamRef.current, state.currentAgentId);
    if (agent) {
      agent.stop();
    }

    setState((prev) => ({
      ...prev,
      isRunning: false,
      currentAgentId: null,
    }));
  }, [state.currentAgentId]);

  const clearEvents = useCallback(() => {
    setState((prev) => ({
      ...prev,
      events: [],
    }));
  }, []);

  const clearCompletedTasks = useCallback(() => {
    setState((prev) => ({
      ...prev,
      completedTasks: [],
    }));
  }, []);

  return {
    ...state,
    assignTask,
    stopCurrentAgent,
    clearEvents,
    clearCompletedTasks,
    team: teamRef.current,
  };
}
