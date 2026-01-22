export interface AgentStats {
  speed: number;      // 1-20, how fast the agent works
  creativity: number; // 1-20, how novel/exploratory
  precision: number;  // 1-20, how accurate/careful
  intel: number;      // 1-20, reasoning capability
}

export type AgentPersonality =
  | 'Cautious'
  | 'Bold'
  | 'Methodical'
  | 'Creative'
  | 'Analytical'
  | 'Chaotic';

export type AgentStatus = 'idle' | 'working' | 'moving' | 'completed' | 'blocked';
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface Agent {
  id: string;
  name: string;
  title: string;           // e.g., "The Dreamer", "The Strategist"
  personality: AgentPersonality;
  stats: AgentStats;
  color: string;           // Primary color for avatar
  secondaryColor: string;  // Secondary/accent color
  strengths: string[];     // What they're good at
  weaknesses: string[];    // What they struggle with
  currentTaskId: string | null;
  status: AgentStatus;
  goal: string;
  // Position tracking for game-like movement
  position: Position;
  targetPosition: Position | null;
  direction: Direction;
  currentStationId: string | null;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  stationId: string;
  requiredStats?: Partial<AgentStats>; // Minimum stats needed
  progress: number;        // 0-100
  assignedAgentId: string | null;
  status: 'pending' | 'in_progress' | 'completed';
}

export type TaskType = 'idea' | 'research' | 'build' | 'review' | 'lounge' | 'break';

export interface TaskStation {
  id: string;
  name: string;
  position: Position;
  // Multiple spots at each station for agents to stand
  agentSpots: Position[];
  capacity: number;
  currentAgentIds: string[];
  taskType: TaskType;
}

export interface ActionLogEntry {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  action: string;
  type: 'move' | 'task_start' | 'task_complete' | 'thinking' | 'blocked' | 'system';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  overallProgress: number;
  tasks: Task[];
  stations: TaskStation[];
}
