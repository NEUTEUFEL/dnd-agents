// Core agent types for real AI agent implementation

export type AgentRole = 'research' | 'code-review' | 'intern' | 'slack-monitor' | 'coordinator';

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  systemPrompt: string;
  maxSteps: number;
  tools: AgentTool[];
  personality: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  execute: (params: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
}

export interface ToolResult {
  success: boolean;
  data: unknown;
  error?: string;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string;
  toolCallId?: string;
}

export interface AgentTask {
  id: string;
  description: string;
  assignedAgentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'needs_approval';
  steps: AgentStep[];
  result?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AgentStep {
  id: string;
  action: string;
  thought: string;
  toolUsed?: string;
  toolInput?: Record<string, unknown>;
  toolOutput?: unknown;
  timestamp: Date;
}

export interface AgentState {
  currentTask: AgentTask | null;
  conversationHistory: AgentMessage[];
  stepCount: number;
  isRunning: boolean;
  lastError?: string;
}

// Email types for Intern agent
export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  source: 'email' | 'manual' | 'agent';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignedAgentId?: string;
  createdAt: Date;
  dueDate?: Date;
}

export interface DraftResponse {
  emailId: string;
  to: string;
  subject: string;
  body: string;
  status: 'draft' | 'approved' | 'sent';
}
