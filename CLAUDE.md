# DND Agents

AI agent visualization and management tool with a D&D/Pokemon-inspired interface.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Mock agent simulation (no backend required)

## Commands

- `npm run dev` - Start dev server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/       # React components
│   ├── AgentAvatar   # Visual avatar for agents
│   ├── AgentCard     # DND-style stat card
│   ├── AgentsModal   # Grid view of all agents
│   ├── ActionLog     # Activity log
│   ├── ControlPanel  # Pause/resume/restart controls
│   ├── ProgressBar   # Overall progress indicator
│   ├── StatBar       # Individual stat visualization
│   ├── TaskStation   # Work tables where agents sit
│   └── Workspace     # Main visualization area
├── hooks/
│   └── useAgentSimulation  # Core simulation logic
├── types/
│   └── agent.ts      # TypeScript types
├── data/
│   └── mockAgents.ts # Mock agent/station/task data
└── App.tsx           # Main application
```

## Key Concepts

### Agent Stats (D&D-style)
- **Speed** (1-20): How fast the agent works
- **Creativity** (1-20): How novel/exploratory
- **Precision** (1-20): How accurate/careful
- **Intel** (1-20): Reasoning capability

### Agent Personalities
- Cautious, Bold, Methodical, Creative, Analytical, Chaotic

### Task Stations
Agents move between stations to work on tasks:
- **Work Tables**: Idea, Research, MVP, Plan
- **Rest Areas**: Bar, Lounge

### Simulation
The `useAgentSimulation` hook runs a tick-based simulation:
- Agents work on tasks at their current station
- Progress increases based on agent stats
- Agents move between stations autonomously
- All actions are logged

## Future Enhancements

- Real Claude API integration for actual agent orchestration
- Supabase backend for persistence
- Custom project/task configuration
- Agent assignment controls
- Usage tracking and cost estimates
