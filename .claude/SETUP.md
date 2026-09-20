# Nova Claude Code Team Setup

This package contains project-level Claude Code agents and reusable skills for Nova.

## Installation

Copy `.claude/` and `CLAUDE.md` into the root of the Nova repository.

Expected location:

C:\Nova\
├── CLAUDE.md
└── .claude\
    ├── agents\
    └── skills\

## Start Claude Code

From the Nova repository:

```bash
cd C:\Nova
claude
```

## Verify agents

Inside Claude Code:

```text
/agents
```

You should see the project agents.

You can invoke a specialist by name when appropriate. Examples:

```text
Use the frontend-engineer to implement the product listing page.
```

```text
Use the payment-engineer and cybersecurity-engineer to review the checkout payment flow.
```

## Important

These agents are instructions and specialist roles. They are not 20 separate Claude subscriptions or automatically running servers.

Claude should use the smallest relevant team for each task.

## Recommended first command

After installing this package, ask Claude Code:

"Inspect this repository and audit the Nova engineering team configuration. Do not change application code. Identify the actual current stack, repository structure, existing conventions, and any conflicts between the team configuration and the codebase."

Then resolve configuration mismatches before starting implementation.
