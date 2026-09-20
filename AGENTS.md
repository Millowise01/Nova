# Nova — Agent Instructions

The single authoritative instruction file for AI agents is [.claude/CLAUDE.md](.claude/CLAUDE.md). Read it first. It defines the engineering principles, the security and commerce rules, the documentation system, and the quality gates.

Agent definitions live in [.claude/agents/](.claude/agents/), reusable skills in [.claude/skills/](.claude/skills/), and slash commands in [.claude/commands/](.claude/commands/). [.claude/SETUP.md](.claude/SETUP.md) explains how they fit together.

In brief:

- Inspect first, plan second, implement third, validate fourth, document material decisions.
- Never assume generated code is correct. Run the relevant tests, typecheck and lint.
- Most files under `docs/` are stubs marked `STATUS: STUB — NOT SOURCE OF TRUTH`. Do not derive rules from them; see "Documentation system" in `.claude/CLAUDE.md` for the authoritative sources.
- Do not invent business rules, API contracts or database relationships. If a rule is undecided, ask.
