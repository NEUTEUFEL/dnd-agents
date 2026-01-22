import type {
  AgentConfig,
  AgentState,
  AgentTask,
  AgentStep,
} from './types';

export type AgentEventType =
  | 'thinking'
  | 'tool_call'
  | 'tool_result'
  | 'step_complete'
  | 'task_complete'
  | 'error'
  | 'needs_approval';

export interface AgentEvent {
  type: AgentEventType;
  agentId: string;
  agentName: string;
  data: unknown;
  timestamp: Date;
}

export type AgentEventListener = (event: AgentEvent) => void;

/**
 * Base Agent class that implements the core agent loop
 *
 * The loop:
 * 1. Receive task
 * 2. Think about what to do
 * 3. Choose and execute a tool (or respond)
 * 4. Observe result
 * 5. Repeat until done or max steps reached
 */
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected state: AgentState;
  protected eventListeners: AgentEventListener[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.state = {
      currentTask: null,
      conversationHistory: [],
      stepCount: 0,
      isRunning: false,
    };
  }

  // Subscribe to agent events
  onEvent(listener: AgentEventListener): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter((l) => l !== listener);
    };
  }

  protected emit(type: AgentEventType, data: unknown): void {
    const event: AgentEvent = {
      type,
      agentId: this.config.id,
      agentName: this.config.name,
      data,
      timestamp: new Date(),
    };
    this.eventListeners.forEach((listener) => listener(event));
  }

  // Main entry point - assign a task to the agent
  async runTask(taskDescription: string): Promise<AgentTask> {
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      description: taskDescription,
      assignedAgentId: this.config.id,
      status: 'in_progress',
      steps: [],
      createdAt: new Date(),
    };

    this.state.currentTask = task;
    this.state.stepCount = 0;
    this.state.isRunning = true;
    this.state.conversationHistory = [];

    try {
      // Add the task as the first user message
      this.state.conversationHistory.push({
        role: 'user',
        content: `Task: ${taskDescription}\n\nPlease complete this task. Think step by step and use your available tools. Say "TASK COMPLETE" when finished.`,
      });

      // Run the agent loop
      while (this.state.isRunning && this.state.stepCount < this.config.maxSteps) {
        await this.executeStep();

        // Check if task is complete
        if (task.status === 'completed' || task.status === 'failed' || task.status === 'needs_approval') {
          break;
        }
      }

      // If we hit max steps without completing
      if (this.state.stepCount >= this.config.maxSteps && task.status === 'in_progress') {
        task.status = 'failed';
        task.result = `Max steps (${this.config.maxSteps}) reached without completion. Partial progress saved.`;
        this.emit('error', { message: 'Max steps reached' });
      }

    } catch (error) {
      task.status = 'failed';
      task.result = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      this.state.lastError = task.result;
      this.emit('error', { message: task.result });
    } finally {
      this.state.isRunning = false;
      task.completedAt = new Date();
    }

    return task;
  }

  // Execute a single step in the agent loop
  protected async executeStep(): Promise<void> {
    this.state.stepCount++;

    const step: AgentStep = {
      id: `step-${this.state.stepCount}`,
      action: '',
      thought: '',
      timestamp: new Date(),
    };

    // 1. Think - get the agent's next action
    this.emit('thinking', { step: this.state.stepCount });

    const thought = await this.think();
    step.thought = thought.reasoning;
    step.action = thought.action;

    // 2. Check if the agent wants to complete the task
    if (thought.isComplete) {
      this.state.currentTask!.status = 'completed';
      this.state.currentTask!.result = thought.finalAnswer;
      this.state.currentTask!.steps.push(step);
      this.emit('task_complete', { result: thought.finalAnswer });
      return;
    }

    // 3. Check if the agent needs human approval
    if (thought.needsApproval) {
      this.state.currentTask!.status = 'needs_approval';
      this.state.currentTask!.steps.push(step);
      this.emit('needs_approval', { question: thought.approvalQuestion });
      return;
    }

    // 4. Execute tool if specified
    if (thought.toolName) {
      step.toolUsed = thought.toolName;
      step.toolInput = thought.toolInput;

      this.emit('tool_call', {
        tool: thought.toolName,
        input: thought.toolInput,
      });

      const tool = this.config.tools.find((t) => t.name === thought.toolName);
      if (tool) {
        const result = await tool.execute(thought.toolInput || {});
        step.toolOutput = result;

        this.emit('tool_result', {
          tool: thought.toolName,
          result,
        });

        // Add tool result to conversation
        this.state.conversationHistory.push({
          role: 'tool',
          content: JSON.stringify(result),
          toolName: thought.toolName,
        });
      } else {
        step.toolOutput = { success: false, error: `Unknown tool: ${thought.toolName}` };
      }
    }

    // 5. Record the step
    this.state.currentTask!.steps.push(step);
    this.emit('step_complete', { step });
  }

  // Abstract method - subclasses implement their specific thinking logic
  protected abstract think(): Promise<ThinkResult>;

  // Stop the agent
  stop(): void {
    this.state.isRunning = false;
    if (this.state.currentTask) {
      this.state.currentTask.status = 'failed';
      this.state.currentTask.result = 'Agent stopped by user';
    }
  }

  // Get current state
  getState(): AgentState {
    return { ...this.state };
  }

  // Get config
  getConfig(): AgentConfig {
    return { ...this.config };
  }
}

export interface ThinkResult {
  reasoning: string;
  action: string;
  isComplete: boolean;
  finalAnswer?: string;
  needsApproval?: boolean;
  approvalQuestion?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
}
