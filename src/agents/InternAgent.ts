import { BaseAgent, type ThinkResult } from './BaseAgent';
import type { AgentConfig, AgentTool, ToolResult, Email, TodoItem, DraftResponse } from './types';

/**
 * Penny - The Intern Agent
 *
 * Capabilities:
 * - Read and process emails
 * - Draft email responses
 * - Manage todo list
 * - Complete simple tasks autonomously
 * - Present completed work for approval
 */

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulated email inbox
const mockEmails: Email[] = [
  {
    id: 'email-1',
    from: 'client@company.com',
    subject: 'Project Status Update Request',
    body: 'Hi, could you please send me an update on the current project status? I need it for the board meeting tomorrow. Thanks!',
    receivedAt: new Date(Date.now() - 3600000),
    isRead: false,
    priority: 'high',
  },
  {
    id: 'email-2',
    from: 'team@internal.com',
    subject: 'Weekly Team Sync - Agenda Items',
    body: 'Please add any agenda items for this week\'s team sync. Meeting is Thursday at 2pm.',
    receivedAt: new Date(Date.now() - 7200000),
    isRead: false,
    priority: 'medium',
  },
  {
    id: 'email-3',
    from: 'newsletter@techsite.com',
    subject: 'This Week in Tech: AI Advances',
    body: 'Check out the latest developments in AI technology...',
    receivedAt: new Date(Date.now() - 86400000),
    isRead: true,
    priority: 'low',
  },
];

// Simulated todo list
let mockTodos: TodoItem[] = [];
let mockDrafts: DraftResponse[] = [];

// Tool to read emails
const readEmailsTool: AgentTool = {
  name: 'read_emails',
  description: 'Read emails from the inbox, optionally filtered by read status or priority',
  parameters: {
    unreadOnly: { type: 'boolean', description: 'Only show unread emails', required: false },
    priority: { type: 'string', description: 'Filter by priority: high, medium, low', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(800);
    const unreadOnly = params.unreadOnly as boolean;
    const priority = params.priority as string;

    let filtered = [...mockEmails];
    if (unreadOnly) {
      filtered = filtered.filter(e => !e.isRead);
    }
    if (priority) {
      filtered = filtered.filter(e => e.priority === priority);
    }

    return {
      success: true,
      data: {
        emails: filtered.map(e => ({
          id: e.id,
          from: e.from,
          subject: e.subject,
          preview: e.body.substring(0, 100) + '...',
          priority: e.priority,
          isRead: e.isRead,
          receivedAt: e.receivedAt.toISOString(),
        })),
        totalCount: filtered.length,
        unreadCount: filtered.filter(e => !e.isRead).length,
      },
    };
  },
};

// Tool to get full email content
const getEmailTool: AgentTool = {
  name: 'get_email',
  description: 'Get the full content of a specific email',
  parameters: {
    emailId: { type: 'string', description: 'The email ID', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(400);
    const emailId = params.emailId as string;
    const email = mockEmails.find(e => e.id === emailId);

    if (!email) {
      return { success: false, data: null, error: 'Email not found' };
    }

    // Mark as read
    email.isRead = true;

    return {
      success: true,
      data: email,
    };
  },
};

// Tool to draft email response
const draftResponseTool: AgentTool = {
  name: 'draft_response',
  description: 'Create a draft response to an email',
  parameters: {
    emailId: { type: 'string', description: 'The email ID to respond to', required: true },
    responseBody: { type: 'string', description: 'The response content', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(600);
    const emailId = params.emailId as string;
    const responseBody = params.responseBody as string;
    const email = mockEmails.find(e => e.id === emailId);

    if (!email) {
      return { success: false, data: null, error: 'Email not found' };
    }

    const draft: DraftResponse = {
      emailId,
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: responseBody,
      status: 'draft',
    };

    mockDrafts.push(draft);

    return {
      success: true,
      data: {
        draft,
        message: 'Draft created and ready for your review',
      },
    };
  },
};

// Tool to manage todos
const manageTodoTool: AgentTool = {
  name: 'manage_todo',
  description: 'Add, update, or list todo items',
  parameters: {
    action: { type: 'string', description: 'Action: add, complete, list', required: true },
    title: { type: 'string', description: 'Todo title (for add)', required: false },
    priority: { type: 'string', description: 'Priority: low, medium, high', required: false },
    todoId: { type: 'string', description: 'Todo ID (for complete)', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(400);
    const action = params.action as string;

    if (action === 'list') {
      return {
        success: true,
        data: {
          todos: mockTodos,
          totalCount: mockTodos.length,
          pendingCount: mockTodos.filter(t => t.status === 'pending').length,
        },
      };
    }

    if (action === 'add') {
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}`,
        title: params.title as string,
        priority: (params.priority as 'low' | 'medium' | 'high') || 'medium',
        status: 'pending',
        source: 'agent',
        createdAt: new Date(),
      };
      mockTodos.push(newTodo);
      return {
        success: true,
        data: { todo: newTodo, message: 'Todo added successfully' },
      };
    }

    if (action === 'complete') {
      const todo = mockTodos.find(t => t.id === params.todoId);
      if (todo) {
        todo.status = 'completed';
        return {
          success: true,
          data: { todo, message: 'Todo marked as complete' },
        };
      }
      return { success: false, data: null, error: 'Todo not found' };
    }

    return { success: false, data: null, error: 'Unknown action' };
  },
};

// Tool to complete simple tasks
const completeTaskTool: AgentTool = {
  name: 'complete_task',
  description: 'Attempt to complete a simple task autonomously',
  parameters: {
    taskType: { type: 'string', description: 'Type: summarize, schedule, research_quick', required: true },
    input: { type: 'string', description: 'Input for the task', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(1000);
    const taskType = params.taskType as string;
    const input = params.input as string;

    if (taskType === 'summarize') {
      return {
        success: true,
        data: {
          taskType,
          result: `Summary of "${input.substring(0, 50)}...":\n\n• Main point: Request for project status update\n• Deadline: Tomorrow (board meeting)\n• Action needed: Prepare and send status report\n• Priority: High`,
        },
      };
    }

    if (taskType === 'schedule') {
      return {
        success: true,
        data: {
          taskType,
          result: `Scheduling suggestion for "${input}":\n\nRecommended time slots:\n• Tomorrow 9:00 AM - 10:00 AM (high focus time)\n• Tomorrow 2:00 PM - 3:00 PM (after lunch)\n\nI've prepared a calendar invite draft for your approval.`,
        },
      };
    }

    return {
      success: true,
      data: {
        taskType,
        result: `Task "${taskType}" completed with input: ${input}`,
      },
    };
  },
};

const PENNY_SYSTEM_PROMPT = `You are Penny, a capable and efficient intern agent. You're practical, good with people, and excellent at cutting through complexity to get things done.

Your capabilities:
- read_emails: Check inbox for new messages
- get_email: Read full email content
- draft_response: Create email response drafts
- manage_todo: Add, complete, or list todo items
- complete_task: Handle simple tasks autonomously

Your workflow:
1. Check for new/important emails
2. Identify action items and add to todo list
3. Draft responses for emails that need replies
4. Complete tasks you can handle autonomously
5. Present everything for human approval

Rules:
- Always ask approval before sending emails
- Flag urgent items clearly
- Be concise but friendly in communications
- Don't overcommit - flag tasks that need human expertise
- Say "TASK COMPLETE" when you've processed everything

Remember: You're here to help, not to take over. Present options, don't make big decisions alone.`;

export class InternAgent extends BaseAgent {
  private thinkingStep = 0;

  constructor() {
    const config: AgentConfig = {
      id: 'penny',
      name: 'Penny',
      role: 'intern',
      systemPrompt: PENNY_SYSTEM_PROMPT,
      maxSteps: 15,
      tools: [readEmailsTool, getEmailTool, draftResponseTool, manageTodoTool, completeTaskTool],
      personality: 'Practical, efficient, friendly, action-oriented',
    };
    super(config);
  }

  protected async think(): Promise<ThinkResult> {
    await simulateDelay(500);

    this.thinkingStep++;

    if (this.thinkingStep === 1) {
      return {
        reasoning: 'Let me check the inbox for any unread or high-priority emails.',
        action: 'Checking email inbox',
        isComplete: false,
        toolName: 'read_emails',
        toolInput: { unreadOnly: true },
      };
    }

    if (this.thinkingStep === 2) {
      return {
        reasoning: 'Found a high-priority email. Let me read the full content.',
        action: 'Reading priority email',
        isComplete: false,
        toolName: 'get_email',
        toolInput: { emailId: 'email-1' },
      };
    }

    if (this.thinkingStep === 3) {
      return {
        reasoning: 'This email needs a response. Let me add it to the todo list first.',
        action: 'Adding to todo list',
        isComplete: false,
        toolName: 'manage_todo',
        toolInput: {
          action: 'add',
          title: 'Send project status update to client',
          priority: 'high',
        },
      };
    }

    if (this.thinkingStep === 4) {
      return {
        reasoning: 'Let me summarize what needs to be done for this email.',
        action: 'Summarizing requirements',
        isComplete: false,
        toolName: 'complete_task',
        toolInput: {
          taskType: 'summarize',
          input: 'Project status update request for board meeting',
        },
      };
    }

    if (this.thinkingStep === 5) {
      return {
        reasoning: 'I\'ll draft a professional response for your review.',
        action: 'Drafting email response',
        isComplete: false,
        toolName: 'draft_response',
        toolInput: {
          emailId: 'email-1',
          responseBody: `Hi,

Thank you for reaching out. I'd be happy to provide the project status update for tomorrow's board meeting.

Here's a summary of our current progress:

**Project Status: On Track**

• Completed: Core functionality (100%)
• In Progress: Testing and QA (75%)
• Upcoming: Final review and deployment

**Key Highlights:**
- All major milestones met on schedule
- No blocking issues identified
- Team morale is high

I can provide more detailed metrics if needed. Let me know if you'd like me to join the meeting to answer any questions.

Best regards`,
        },
      };
    }

    if (this.thinkingStep === 6) {
      return {
        reasoning: 'Let me also add an item to follow up on the team sync email.',
        action: 'Adding team sync todo',
        isComplete: false,
        toolName: 'manage_todo',
        toolInput: {
          action: 'add',
          title: 'Add agenda items for Thursday team sync',
          priority: 'medium',
        },
      };
    }

    if (this.thinkingStep === 7) {
      return {
        reasoning: 'Let me get the full todo list to present everything together.',
        action: 'Getting complete todo list',
        isComplete: false,
        toolName: 'manage_todo',
        toolInput: { action: 'list' },
      };
    }

    // Complete and present findings
    return {
      reasoning: 'I\'ve processed all emails and organized the action items. Time to present for approval.',
      action: 'Presenting daily brief',
      isComplete: true,
      finalAnswer: `## 📋 Daily Brief from Penny (Intern Agent)

### 📧 Email Summary
**Processed:** 2 unread emails

#### 🔴 High Priority
**From:** client@company.com
**Subject:** Project Status Update Request
**Status:** Draft response ready for your review

#### 🟡 Medium Priority
**From:** team@internal.com
**Subject:** Weekly Team Sync - Agenda Items
**Status:** Added to todo list

---

### ✅ Todo List (Updated)

| Priority | Task | Status |
|----------|------|--------|
| 🔴 High | Send project status update to client | Pending - Draft ready |
| 🟡 Medium | Add agenda items for Thursday team sync | Pending |

---

### 📝 Drafts Awaiting Approval

**Re: Project Status Update Request**
\`\`\`
To: client@company.com

Hi,

Thank you for reaching out. I'd be happy to provide
the project status update for tomorrow's board meeting.

[Full response ready for review]
\`\`\`

**Action needed:** Please review and approve/edit the draft before I send it.

---

### 🎯 Recommendations

1. **Urgent:** Approve and send the status update email today
2. **This week:** Prepare agenda items for Thursday sync
3. **Consider:** Newsletter can be archived (low priority)

---

*Prepared by Penny, Your Intern Agent*
*"Let me know what you'd like me to tackle next!"*
*${new Date().toLocaleString()}*`,
    };
  }
}

export const createInternAgent = (): InternAgent => new InternAgent();
