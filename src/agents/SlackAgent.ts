import { BaseAgent, type ThinkResult } from './BaseAgent';
import type { AgentConfig, AgentTool, ToolResult } from './types';

/**
 * Howard - The Slack Monitor Agent
 *
 * Capabilities:
 * - Read Slack channels and DMs
 * - Identify messages that need attention
 * - Track action items and todos from conversations
 * - Summarize important threads
 * - Alert when you're mentioned or needed
 */

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface SlackMessage {
  id: string;
  channel: string;
  channelName: string;
  author: string;
  text: string;
  timestamp: Date;
  mentions: string[];
  isThread: boolean;
  threadId?: string;
  reactions: string[];
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

// Mock Slack data
const mockMessages: SlackMessage[] = [
  {
    id: 'msg-1',
    channel: 'C001',
    channelName: '#engineering',
    author: 'Sarah Chen',
    text: '@you Can you review the PR for the auth refactor? Need it merged before EOD if possible.',
    timestamp: new Date(Date.now() - 1800000), // 30 min ago
    mentions: ['you'],
    isThread: false,
    reactions: [],
    priority: 'urgent',
  },
  {
    id: 'msg-2',
    channel: 'C002',
    channelName: '#general',
    author: 'Mike Johnson',
    text: 'Team standup moving to 10am starting next week. Please update your calendars.',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    mentions: [],
    isThread: false,
    reactions: ['thumbsup'],
    priority: 'normal',
  },
  {
    id: 'msg-3',
    channel: 'D001',
    channelName: 'DM: Lisa Park',
    author: 'Lisa Park',
    text: 'Hey! Quick question - do you have the API docs for the new endpoints? Client is asking.',
    timestamp: new Date(Date.now() - 900000), // 15 min ago
    mentions: [],
    isThread: false,
    reactions: [],
    priority: 'high',
  },
  {
    id: 'msg-4',
    channel: 'C003',
    channelName: '#project-alpha',
    author: 'David Kim',
    text: 'Sprint planning tomorrow at 2pm. @you @sarah @mike please come prepared with your capacity estimates.',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    mentions: ['you', 'sarah', 'mike'],
    isThread: false,
    reactions: [],
    priority: 'high',
  },
  {
    id: 'msg-5',
    channel: 'C001',
    channelName: '#engineering',
    author: 'Bot: CI/CD',
    text: 'Build failed on main branch. Last commit by @you - please investigate.',
    timestamp: new Date(Date.now() - 600000), // 10 min ago
    mentions: ['you'],
    isThread: false,
    reactions: [],
    priority: 'urgent',
  },
  {
    id: 'msg-6',
    channel: 'C004',
    channelName: '#random',
    author: 'Amy Wong',
    text: 'Anyone want to grab lunch today? Thinking Thai food.',
    timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
    mentions: [],
    isThread: false,
    reactions: ['raised_hands', 'yum'],
    priority: 'low',
  },
];

let extractedTodos: Array<{ text: string; source: string; priority: string; createdAt: Date }> = [];

// Tool to list channels
const listChannelsTool: AgentTool = {
  name: 'list_channels',
  description: 'List Slack channels you are a member of',
  parameters: {
    includeArchived: { type: 'boolean', description: 'Include archived channels', required: false },
  },
  execute: async (_params): Promise<ToolResult> => {
    await simulateDelay(400);

    return {
      success: true,
      data: {
        channels: [
          { id: 'C001', name: '#engineering', unreadCount: 12, hasMention: true },
          { id: 'C002', name: '#general', unreadCount: 5, hasMention: false },
          { id: 'C003', name: '#project-alpha', unreadCount: 8, hasMention: true },
          { id: 'C004', name: '#random', unreadCount: 23, hasMention: false },
          { id: 'D001', name: 'DM: Lisa Park', unreadCount: 1, hasMention: false },
        ],
        totalUnread: 49,
        channelsWithMentions: 2,
      },
    };
  },
};

// Tool to get messages from a channel
const getMessagesTool: AgentTool = {
  name: 'get_messages',
  description: 'Get recent messages from a channel or all channels',
  parameters: {
    channelId: { type: 'string', description: 'Channel ID (or "all" for all channels)', required: true },
    limit: { type: 'number', description: 'Number of messages to retrieve', required: false },
    mentionsOnly: { type: 'boolean', description: 'Only get messages that mention you', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(600);
    const channelId = params.channelId as string;
    const mentionsOnly = params.mentionsOnly as boolean;

    let filtered = [...mockMessages];

    if (channelId !== 'all') {
      filtered = filtered.filter((m) => m.channel === channelId);
    }

    if (mentionsOnly) {
      filtered = filtered.filter((m) => m.mentions.includes('you'));
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      success: true,
      data: {
        messages: filtered.map((m) => ({
          id: m.id,
          channel: m.channelName,
          author: m.author,
          text: m.text,
          time: formatTimeAgo(m.timestamp),
          priority: m.priority,
          mentionsYou: m.mentions.includes('you'),
        })),
        totalCount: filtered.length,
        urgentCount: filtered.filter((m) => m.priority === 'urgent').length,
      },
    };
  },
};

// Tool to check for action items
const findActionItemsTool: AgentTool = {
  name: 'find_action_items',
  description: 'Scan messages for action items, requests, and todos directed at you',
  parameters: {
    timeframe: { type: 'string', description: 'Timeframe: today, week, all', required: false },
  },
  execute: async (_params): Promise<ToolResult> => {
    await simulateDelay(800);

    // Analyze messages for action items
    const actionItems = [
      {
        id: 'action-1',
        source: '#engineering - Sarah Chen',
        text: 'Review PR for auth refactor',
        deadline: 'EOD today',
        priority: 'urgent',
        messageId: 'msg-1',
      },
      {
        id: 'action-2',
        source: 'DM: Lisa Park',
        text: 'Send API docs for new endpoints',
        deadline: 'ASAP',
        priority: 'high',
        messageId: 'msg-3',
      },
      {
        id: 'action-3',
        source: '#project-alpha - David Kim',
        text: 'Prepare capacity estimates for sprint planning',
        deadline: 'Tomorrow 2pm',
        priority: 'high',
        messageId: 'msg-4',
      },
      {
        id: 'action-4',
        source: '#engineering - CI/CD Bot',
        text: 'Investigate and fix build failure on main',
        deadline: 'ASAP',
        priority: 'urgent',
        messageId: 'msg-5',
      },
    ];

    return {
      success: true,
      data: {
        actionItems,
        totalCount: actionItems.length,
        urgentCount: actionItems.filter((a) => a.priority === 'urgent').length,
        summary: `Found ${actionItems.length} action items requiring your attention`,
      },
    };
  },
};

// Tool to add todo from Slack
const addTodoTool: AgentTool = {
  name: 'add_todo',
  description: 'Add an item to your todo list based on Slack messages',
  parameters: {
    text: { type: 'string', description: 'Todo item text', required: true },
    source: { type: 'string', description: 'Source (channel/person)', required: true },
    priority: { type: 'string', description: 'Priority: urgent, high, normal, low', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(300);

    const todo = {
      text: params.text as string,
      source: params.source as string,
      priority: (params.priority as string) || 'normal',
      createdAt: new Date(),
    };

    extractedTodos.push(todo);

    return {
      success: true,
      data: {
        todo,
        message: 'Todo added to your list',
        totalTodos: extractedTodos.length,
      },
    };
  },
};

// Tool to get todo summary
const getTodosTool: AgentTool = {
  name: 'get_todos',
  description: 'Get your current todo list extracted from Slack',
  parameters: {},
  execute: async (): Promise<ToolResult> => {
    await simulateDelay(200);

    return {
      success: true,
      data: {
        todos: extractedTodos,
        totalCount: extractedTodos.length,
        byPriority: {
          urgent: extractedTodos.filter((t) => t.priority === 'urgent').length,
          high: extractedTodos.filter((t) => t.priority === 'high').length,
          normal: extractedTodos.filter((t) => t.priority === 'normal').length,
          low: extractedTodos.filter((t) => t.priority === 'low').length,
        },
      },
    };
  },
};

function formatTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const HOWARD_SYSTEM_PROMPT = `You are Howard, a Slack monitoring agent. You're smooth, efficient, and great at managing communications.

Your capabilities:
- list_channels: See all your Slack channels and unread counts
- get_messages: Read messages from channels (can filter to mentions only)
- find_action_items: Identify tasks and requests directed at you
- add_todo: Add items to your todo list
- get_todos: View your current todo list

Your workflow:
1. Check channels for unread messages and mentions
2. Identify messages where you're mentioned or needed
3. Extract action items and deadlines
4. Add important items to the todo list
5. Present a summary of what needs attention

Prioritization:
- URGENT: Direct mentions with time pressure, build failures, blocking issues
- HIGH: Direct questions, requests from teammates, upcoming deadlines
- NORMAL: FYI messages, general updates
- LOW: Social, random, non-work related

Rules:
- Focus on messages that need YOUR action
- Don't add noise to the todo list
- Highlight urgent items clearly
- Say "TASK COMPLETE" when you've processed everything

Remember: Help cut through the noise, not add to it.`;

export class SlackAgent extends BaseAgent {
  private thinkingStep = 0;

  constructor() {
    const config: AgentConfig = {
      id: 'howard',
      name: 'Howard',
      role: 'slack-monitor',
      systemPrompt: HOWARD_SYSTEM_PROMPT,
      maxSteps: 12,
      tools: [listChannelsTool, getMessagesTool, findActionItemsTool, addTodoTool, getTodosTool],
      personality: 'Smooth, efficient, great communicator, organized',
    };
    super(config);
  }

  protected async think(): Promise<ThinkResult> {
    await simulateDelay(500);

    this.thinkingStep++;

    if (this.thinkingStep === 1) {
      return {
        reasoning: "Let me check your Slack channels to see what's happening.",
        action: 'Scanning Slack channels',
        isComplete: false,
        toolName: 'list_channels',
        toolInput: {},
      };
    }

    if (this.thinkingStep === 2) {
      return {
        reasoning: 'I see some channels have mentions. Let me get all messages where you were mentioned.',
        action: 'Getting messages with mentions',
        isComplete: false,
        toolName: 'get_messages',
        toolInput: { channelId: 'all', mentionsOnly: true },
      };
    }

    if (this.thinkingStep === 3) {
      return {
        reasoning: "Now let me scan for any action items or requests you need to respond to.",
        action: 'Finding action items',
        isComplete: false,
        toolName: 'find_action_items',
        toolInput: { timeframe: 'today' },
      };
    }

    if (this.thinkingStep === 4) {
      return {
        reasoning: 'Found urgent items. Adding the build failure fix to your todo list.',
        action: 'Adding urgent todo',
        isComplete: false,
        toolName: 'add_todo',
        toolInput: {
          text: 'Fix build failure on main branch',
          source: '#engineering - CI/CD Bot',
          priority: 'urgent',
        },
      };
    }

    if (this.thinkingStep === 5) {
      return {
        reasoning: 'Adding the PR review request.',
        action: 'Adding PR review todo',
        isComplete: false,
        toolName: 'add_todo',
        toolInput: {
          text: 'Review auth refactor PR (EOD deadline)',
          source: '#engineering - Sarah Chen',
          priority: 'urgent',
        },
      };
    }

    if (this.thinkingStep === 6) {
      return {
        reasoning: 'Adding the API docs request from Lisa.',
        action: 'Adding API docs todo',
        isComplete: false,
        toolName: 'add_todo',
        toolInput: {
          text: 'Send API docs for new endpoints to Lisa',
          source: 'DM: Lisa Park',
          priority: 'high',
        },
      };
    }

    if (this.thinkingStep === 7) {
      return {
        reasoning: 'Adding sprint planning prep to the list.',
        action: 'Adding sprint planning todo',
        isComplete: false,
        toolName: 'add_todo',
        toolInput: {
          text: 'Prepare capacity estimates for sprint planning',
          source: '#project-alpha - David Kim',
          priority: 'high',
        },
      };
    }

    if (this.thinkingStep === 8) {
      return {
        reasoning: "Let me get your complete todo list to present the summary.",
        action: 'Getting todo summary',
        isComplete: false,
        toolName: 'get_todos',
        toolInput: {},
      };
    }

    // Complete and present findings
    // Reset todos for next run
    extractedTodos = [];

    return {
      reasoning: "I've scanned all your Slack channels and organized what needs your attention.",
      action: 'Presenting Slack summary',
      isComplete: true,
      finalAnswer: `## 📱 Slack Summary from Howard

### 🚨 You're Needed!

You have **3 direct mentions** requiring your attention:

---

### 🔴 URGENT - Do These Now

| Item | Source | Deadline |
|------|--------|----------|
| Fix build failure on main | #engineering (CI/CD Bot) | ASAP |
| Review auth refactor PR | #engineering (Sarah Chen) | EOD Today |

---

### 🟡 HIGH PRIORITY - Today

| Item | Source | Deadline |
|------|--------|----------|
| Send API docs to Lisa | DM: Lisa Park | ASAP |
| Prep capacity estimates | #project-alpha (David Kim) | Tomorrow 2pm |

---

### 📊 Channel Activity

| Channel | Unread | Status |
|---------|--------|--------|
| #engineering | 12 | 🔴 Has mentions |
| #project-alpha | 8 | 🔴 Has mentions |
| #general | 5 | ✓ |
| #random | 23 | ✓ Low priority |
| DM: Lisa Park | 1 | 🟡 Needs response |

---

### ✅ Your Todo List (From Slack)

1. 🔴 **Fix build failure on main branch** - URGENT
2. 🔴 **Review auth refactor PR** - EOD deadline
3. 🟡 **Send API docs to Lisa** - High priority
4. 🟡 **Prep capacity estimates for sprint** - Tomorrow 2pm

---

### 💡 Recommendations

1. **First:** Check the build failure - this is blocking the team
2. **Then:** Review Sarah's PR before end of day
3. **Quick win:** Reply to Lisa with the API docs link
4. **Schedule:** Block time tomorrow morning for sprint prep

---

### 📝 Can Skip For Now
- Team standup time change (just update calendar)
- Lunch plans in #random

---

*Monitored by Howard, Communications Agent*
*"Cutting through the noise so you don't have to."*
*${new Date().toLocaleString()}*`,
    };
  }
}

export const createSlackAgent = (): SlackAgent => new SlackAgent();
