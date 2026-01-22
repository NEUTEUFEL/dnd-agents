// Agent exports
export * from './types';
export * from './BaseAgent';
export { ResearchAgent, createResearchAgent } from './ResearchAgent';
export { CodeReviewAgent, createCodeReviewAgent } from './CodeReviewAgent';
export { InternAgent, createInternAgent } from './InternAgent';
export { SlackAgent, createSlackAgent } from './SlackAgent';

// Convenience function to create all agents
import { createResearchAgent } from './ResearchAgent';
import { createCodeReviewAgent } from './CodeReviewAgent';
import { createInternAgent } from './InternAgent';
import { createSlackAgent } from './SlackAgent';
import type { BaseAgent } from './BaseAgent';

export interface AgentTeam {
  raj: ReturnType<typeof createResearchAgent>;
  sheldon: ReturnType<typeof createCodeReviewAgent>;
  penny: ReturnType<typeof createInternAgent>;
  howard: ReturnType<typeof createSlackAgent>;
}

export function createAgentTeam(): AgentTeam {
  return {
    raj: createResearchAgent(),
    sheldon: createCodeReviewAgent(),
    penny: createInternAgent(),
    howard: createSlackAgent(),
  };
}

// Agent registry for looking up by ID
export function getAgentById(team: AgentTeam, id: string): BaseAgent | undefined {
  switch (id) {
    case 'raj':
      return team.raj;
    case 'sheldon':
      return team.sheldon;
    case 'penny':
      return team.penny;
    case 'howard':
      return team.howard;
    default:
      return undefined;
  }
}
