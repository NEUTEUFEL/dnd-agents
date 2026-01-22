import { BaseAgent, type ThinkResult } from './BaseAgent';
import type { AgentConfig, AgentTool, ToolResult } from './types';

/**
 * Sheldon - The Code Review Agent
 *
 * Capabilities:
 * - Read source files
 * - Analyze code patterns
 * - Find bugs and issues
 * - Suggest improvements
 * - Check for best practices
 */

function simulateDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tool to list files in a directory
const listFilesTool: AgentTool = {
  name: 'list_files',
  description: 'List files in a directory matching a pattern',
  parameters: {
    path: { type: 'string', description: 'Directory path to search', required: true },
    pattern: { type: 'string', description: 'File pattern (e.g., "*.ts", "*.tsx")', required: false },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(500);
    const path = params.path as string;
    const pattern = (params.pattern as string) || '*';

    // Mock file listing - in production, this would use actual file system
    return {
      success: true,
      data: {
        path,
        pattern,
        files: [
          { name: 'App.tsx', size: 3200, modified: '2026-01-22' },
          { name: 'hooks/useAgentSimulation.ts', size: 8500, modified: '2026-01-22' },
          { name: 'components/GameWorld.tsx', size: 5600, modified: '2026-01-22' },
          { name: 'agents/BaseAgent.ts', size: 4200, modified: '2026-01-22' },
          { name: 'types/agent.ts', size: 2100, modified: '2026-01-22' },
        ],
        totalFiles: 5,
      },
    };
  },
};

// Tool to read a specific file
const readFileTool: AgentTool = {
  name: 'read_file',
  description: 'Read the contents of a source file',
  parameters: {
    path: { type: 'string', description: 'Path to the file', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(600);
    const path = params.path as string;

    // Mock file reading - returns a simplified version
    return {
      success: true,
      data: {
        path,
        language: path.endsWith('.ts') ? 'typescript' : path.endsWith('.tsx') ? 'tsx' : 'unknown',
        lineCount: 150,
        content: `// File: ${path}
// This is a mock representation of the file content

import { useState, useEffect } from 'react';

interface Props {
  data: any; // TODO: Add proper typing
  onUpdate: (value: string) => void;
}

export function Component({ data, onUpdate }: Props) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Potential issue: missing dependency array check
    fetchData();
  }, []); // eslint-disable-line

  const handleClick = () => {
    console.log('clicked'); // Debug log left in code
    onUpdate(state);
  };

  return (
    <div onClick={handleClick}>
      {data.items.map(item => ( // Missing key prop
        <span>{item.name}</span>
      ))}
    </div>
  );
}`,
      },
    };
  },
};

// Tool to analyze code for issues
const analyzeCodeTool: AgentTool = {
  name: 'analyze_code',
  description: 'Analyze code for bugs, issues, and improvement opportunities',
  parameters: {
    code: { type: 'string', description: 'Code to analyze', required: true },
    focusAreas: { type: 'array', description: 'Areas to focus on: bugs, performance, security, style', required: false },
  },
  execute: async (_params): Promise<ToolResult> => {
    await simulateDelay(1000);

    // Mock code analysis
    return {
      success: true,
      data: {
        issues: [
          {
            severity: 'high',
            type: 'bug',
            line: 15,
            message: 'Missing key prop in list rendering',
            suggestion: 'Add a unique key prop to mapped elements',
          },
          {
            severity: 'medium',
            type: 'type-safety',
            line: 5,
            message: 'Using "any" type defeats TypeScript benefits',
            suggestion: 'Define a proper interface for the data prop',
          },
          {
            severity: 'low',
            type: 'code-quality',
            line: 18,
            message: 'Console.log left in production code',
            suggestion: 'Remove debug statements before committing',
          },
          {
            severity: 'medium',
            type: 'react-hooks',
            line: 12,
            message: 'useEffect with empty dependency array may cause stale closures',
            suggestion: 'Review dependencies or add eslint-disable comment with explanation',
          },
        ],
        metrics: {
          complexity: 'low',
          maintainability: 'B',
          testCoverage: 'unknown',
        },
        summary: '4 issues found: 1 high, 2 medium, 1 low severity',
      },
    };
  },
};

// Tool to suggest fixes
const suggestFixTool: AgentTool = {
  name: 'suggest_fix',
  description: 'Generate a suggested fix for a specific issue',
  parameters: {
    issue: { type: 'string', description: 'Description of the issue', required: true },
    context: { type: 'string', description: 'Code context around the issue', required: true },
  },
  execute: async (params): Promise<ToolResult> => {
    await simulateDelay(700);
    const issue = params.issue as string;

    return {
      success: true,
      data: {
        issue,
        suggestedFix: `// Suggested fix for: ${issue}

// Before:
{data.items.map(item => (
  <span>{item.name}</span>
))}

// After:
{data.items.map((item, index) => (
  <span key={item.id ?? index}>{item.name}</span>
))}

// Explanation:
// React requires a unique "key" prop for list items to efficiently
// track changes. Using the item's ID is preferred, with index as fallback.`,
        confidence: 'high',
      },
    };
  },
};

const SHELDON_SYSTEM_PROMPT = `You are Sheldon, a meticulous code review agent. You have exceptionally high standards and a keen eye for logical flaws.

Your capabilities:
- list_files: Browse the codebase structure
- read_file: Read source code files
- analyze_code: Deep analysis for bugs and issues
- suggest_fix: Generate fix suggestions

When reviewing code:
1. First, understand the scope of what to review
2. Read the relevant files
3. Analyze for issues (bugs, type safety, performance, security)
4. Provide specific, actionable feedback
5. Suggest fixes for serious issues

Rules:
- Be precise and specific with line numbers
- Explain WHY something is an issue
- Prioritize by severity (high/medium/low)
- Don't nitpick style unless asked
- Say "TASK COMPLETE" when review is finished

Remember: Correct code is more important than clever code.`;

export class CodeReviewAgent extends BaseAgent {
  private thinkingStep = 0;

  constructor() {
    const config: AgentConfig = {
      id: 'sheldon',
      name: 'Sheldon',
      role: 'code-review',
      systemPrompt: SHELDON_SYSTEM_PROMPT,
      maxSteps: 12,
      tools: [listFilesTool, readFileTool, analyzeCodeTool, suggestFixTool],
      personality: 'Meticulous, precise, high standards, logical',
    };
    super(config);
  }

  protected async think(): Promise<ThinkResult> {
    await simulateDelay(600);

    this.thinkingStep++;

    if (this.thinkingStep === 1) {
      return {
        reasoning: 'First, I need to understand the codebase structure and identify files to review.',
        action: 'Listing files in the project',
        isComplete: false,
        toolName: 'list_files',
        toolInput: { path: 'src', pattern: '*.tsx' },
      };
    }

    if (this.thinkingStep === 2) {
      return {
        reasoning: 'Found several files. Let me read the main application file to start the review.',
        action: 'Reading App.tsx',
        isComplete: false,
        toolName: 'read_file',
        toolInput: { path: 'src/App.tsx' },
      };
    }

    if (this.thinkingStep === 3) {
      return {
        reasoning: 'I have the code. Now I\'ll perform a thorough analysis for bugs and issues.',
        action: 'Analyzing code for issues',
        isComplete: false,
        toolName: 'analyze_code',
        toolInput: {
          code: 'App.tsx content',
          focusAreas: ['bugs', 'type-safety', 'react-hooks'],
        },
      };
    }

    if (this.thinkingStep === 4) {
      return {
        reasoning: 'Found a high-severity issue. Let me generate a suggested fix.',
        action: 'Generating fix suggestion',
        isComplete: false,
        toolName: 'suggest_fix',
        toolInput: {
          issue: 'Missing key prop in list rendering',
          context: 'data.items.map(item => ...)',
        },
      };
    }

    // Complete the review
    return {
      reasoning: 'I have thoroughly reviewed the code and compiled my findings.',
      action: 'Presenting code review report',
      isComplete: true,
      finalAnswer: `## Code Review Report
### Reviewer: Sheldon (Code Review Agent)

---

### Summary
Reviewed **5 files** in the codebase. Found **4 issues** requiring attention.

### Critical Issues (Fix Required)

#### 🔴 HIGH: Missing key prop in list rendering
**File:** src/App.tsx, Line 15
**Problem:** React list items without keys cause performance issues and bugs.
**Fix:**
\`\`\`tsx
// Change this:
{items.map(item => <span>{item.name}</span>)}

// To this:
{items.map(item => <span key={item.id}>{item.name}</span>)}
\`\`\`

---

### Medium Issues (Should Fix)

#### 🟡 Using \`any\` type
**File:** src/App.tsx, Line 5
**Problem:** Defeats TypeScript's type safety benefits.
**Suggestion:** Define proper interface for data prop.

#### 🟡 useEffect dependency array
**File:** src/App.tsx, Line 12
**Problem:** May cause stale closure issues.
**Suggestion:** Review and document intentional empty deps.

---

### Low Priority (Nice to Have)

#### 🟢 Console.log in code
**File:** src/App.tsx, Line 18
**Suggestion:** Remove before production deploy.

---

### Metrics
- **Complexity:** Low
- **Maintainability Grade:** B
- **Test Coverage:** Unknown (recommend adding tests)

---

*Review completed by Sheldon, The Theorist*
*"Correct code is more important than clever code."*
*${new Date().toLocaleString()}*`,
    };
  }
}

export const createCodeReviewAgent = (): CodeReviewAgent => new CodeReviewAgent();
