import { BaseAgent, type ThinkResult } from './BaseAgent';
import type { AgentConfig, AgentTool, ToolResult } from './types';

/**
 * Raj - The Research Agent
 *
 * Capabilities:
 * - Web search
 * - Summarize content
 * - Extract key findings
 * - Compile research reports
 */

// Mock web search tool (in production, use real search API)
const webSearchTool: AgentTool = {
  name: 'web_search',
  description: 'Search the web for information on a topic',
  parameters: {
    query: { type: 'string', description: 'The search query', required: true },
    maxResults: { type: 'number', description: 'Maximum results to return', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const query = params.query as string;
    // In production, this would call a real search API (Brave, Google, etc.)
    // For now, return mock results
    await simulateDelay(1000);

    return {
      success: true,
      data: {
        query,
        results: [
          {
            title: `Top result for "${query}"`,
            url: `https://example.com/result1`,
            snippet: `This is a comprehensive overview of ${query}. Key findings include market trends, best practices, and industry insights.`,
          },
          {
            title: `${query} - Industry Analysis`,
            url: `https://example.com/result2`,
            snippet: `Recent studies show that ${query} has grown 25% year over year. Major players include...`,
          },
          {
            title: `How to understand ${query}`,
            url: `https://example.com/result3`,
            snippet: `A beginner's guide to ${query}. This article covers the fundamentals and advanced concepts.`,
          },
        ],
      },
    };
  },
};

const readUrlTool: AgentTool = {
  name: 'read_url',
  description: 'Read and extract content from a URL',
  parameters: {
    url: { type: 'string', description: 'The URL to read', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    const url = params.url as string;
    await simulateDelay(800);

    // Mock URL reading
    return {
      success: true,
      data: {
        url,
        title: `Content from ${url}`,
        content: `This is the extracted content from the webpage. It contains detailed information about the topic including:

1. **Overview**: A comprehensive introduction to the subject matter.
2. **Key Points**:
   - First important finding with supporting data
   - Second critical insight backed by research
   - Third notable trend in the industry
3. **Analysis**: Expert opinions and market analysis suggest positive growth trajectory.
4. **Conclusion**: Summary of main takeaways and recommended next steps.

Data last updated: January 2026.`,
        wordCount: 150,
      },
    };
  },
};

const summarizeTool: AgentTool = {
  name: 'summarize',
  description: 'Summarize collected research into a concise report',
  parameters: {
    content: { type: 'string', description: 'Content to summarize', required: true },
    format: { type: 'string', description: 'Output format: bullet_points, paragraph, or executive_summary', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    const content = params.content as string;
    const format = (params.format as string) || 'bullet_points';
    await simulateDelay(600);

    return {
      success: true,
      data: {
        format,
        summary: format === 'bullet_points'
          ? `• Key finding #1: Market showing strong growth signals
• Key finding #2: Competition is increasing but opportunities exist
• Key finding #3: Technology adoption is accelerating
• Recommendation: Consider early market entry with differentiated offering`
          : `Research indicates a favorable market environment with strong growth potential. Key trends suggest increasing adoption rates and expanding market size. Competition exists but differentiation opportunities are available. Recommended approach involves strategic positioning and early action.`,
        originalLength: content.length,
        summaryLength: 250,
      },
    };
  },
};

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RAJ_SYSTEM_PROMPT = `You are Raj, a skilled research agent. Your personality is thorough, detail-oriented, and you excel at finding patterns in data.

Your capabilities:
- web_search: Search the internet for information
- read_url: Read and extract content from web pages
- summarize: Compile findings into clear summaries

When given a research task:
1. Break down what you need to find
2. Search for relevant information
3. Read promising sources
4. Synthesize findings
5. Present a clear summary

Rules:
- Be thorough but efficient
- Cite your sources
- Distinguish facts from opinions
- If you can't find reliable information, say so
- Say "TASK COMPLETE" when you have a final answer

Think step by step and explain your reasoning.`;

export class ResearchAgent extends BaseAgent {
  private thinkingStep = 0;

  constructor() {
    const config: AgentConfig = {
      id: 'raj',
      name: 'Raj',
      role: 'research',
      systemPrompt: RAJ_SYSTEM_PROMPT,
      maxSteps: 10,
      tools: [webSearchTool, readUrlTool, summarizeTool],
      personality: 'Thorough, analytical, pattern-recognition expert',
    };
    super(config);
  }

  protected async think(): Promise<ThinkResult> {
    // Simulate thinking time
    await simulateDelay(500);

    this.thinkingStep++;
    const history = this.state.conversationHistory;
    const lastMessage = history[history.length - 1];

    // Simple state machine for demo purposes
    // In production, this would call Claude API to decide next action

    if (this.thinkingStep === 1) {
      // First step: search for information
      const task = this.state.currentTask?.description || '';
      return {
        reasoning: `I need to research "${task}". Let me start by searching for relevant information.`,
        action: 'Searching the web for information',
        isComplete: false,
        toolName: 'web_search',
        toolInput: { query: task, maxResults: 5 },
      };
    }

    if (this.thinkingStep === 2) {
      // Second step: read a URL from search results
      return {
        reasoning: 'Found some promising results. Let me read the top result for more details.',
        action: 'Reading detailed content from source',
        isComplete: false,
        toolName: 'read_url',
        toolInput: { url: 'https://example.com/result1' },
      };
    }

    if (this.thinkingStep === 3) {
      // Third step: summarize findings
      return {
        reasoning: 'I have gathered enough information. Let me compile a summary of my findings.',
        action: 'Summarizing research findings',
        isComplete: false,
        toolName: 'summarize',
        toolInput: {
          content: JSON.stringify(lastMessage?.content || ''),
          format: 'bullet_points',
        },
      };
    }

    // Final step: complete the task
    return {
      reasoning: 'I have completed my research and compiled the findings.',
      action: 'Presenting final research report',
      isComplete: true,
      finalAnswer: `## Research Report: ${this.state.currentTask?.description}

### Key Findings:
• Market showing strong growth signals with 25% YoY increase
• Competition is increasing but differentiation opportunities exist
• Technology adoption is accelerating across industries

### Sources Consulted:
1. example.com/result1 - Comprehensive overview
2. example.com/result2 - Industry analysis

### Recommendations:
Based on my research, I recommend considering early market entry with a differentiated offering that addresses emerging trends.

---
*Research conducted by Raj, The Researcher*
*Completed: ${new Date().toLocaleString()}*`,
    };
  }
}

export const createResearchAgent = (): ResearchAgent => new ResearchAgent();
