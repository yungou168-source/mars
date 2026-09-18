# SNF Companion Plugin

AI companion system for the Sovereign Nation Framework. This plugin enables citizens to acquire, train, and grow AI companions that assist them throughout their sovereign journey.

## Companion Types

| Type | Description | Primary Attribute |
|------|-------------|-------------------|
| **Scholar** | Wise advisor focused on knowledge and strategy | Intelligence |
| **Merchant** | Trade expert who helps with commerce and negotiation | Charisma |
| **Diplomat** | Skilled in forming alliances and resolving conflicts | Wisdom |
| **Worker** | Dedicated builder focused on productivity and efficiency | Strength |
| **Artist** | Creative spirit that inspires and beautifies | Creativity |
| **Guardian** | Protective ally focused on defense and security | Defense |

## Key Features

- **Companion Claiming**: New citizens receive an invitation to claim their first companion
- **Daily Missions**: Companions have daily tasks that reward XP when completed
- **Growth System**: Companions level up and gain stats through training and missions
- **Marketplace**: Browse and discover new companion types
- **Training**: Dedicate resources to improve specific attributes

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companion` | List all companions owned by the citizen |
| GET | `/companion/:id` | Get detailed companion information |
| POST | `/companion/claim` | Claim a new companion |
| GET | `/companion/:id/missions` | Get daily missions for a companion |
| POST | `/companion/:id/missions/:missionId/complete` | Complete a mission and earn XP |
| GET | `/companion/:id/growth` | View companion growth statistics |
| GET | `/companion/marketplace` | Browse available companion types |
| POST | `/companion/:id/train` | Train companion to improve attributes |

## Companion Attributes

Each companion has the following attributes that increase with level and training:

- **Strength**: Physical power and endurance
- **Intelligence**: Learning and problem-solving ability
- **Charisma**: Social influence and persuasion
- **Wisdom**: Experience and judgment
- **Creativity**: Artistic and innovative thinking
- **Defense**: Protection and resilience

## Installation

This plugin is part of the `@sovereign-nation/core` monorepo. Install dependencies:

```bash
pnpm install
```

## Development

```bash
# Build the plugin
pnpm build

# Run type checking
pnpm typecheck

# Run tests
pnpm test
```

## Database Tables

The plugin creates the following tables:

- `companions`: Core companion data
- `companion_attributes`: Companion attribute values
- `companion_missions`: Daily mission tracking
