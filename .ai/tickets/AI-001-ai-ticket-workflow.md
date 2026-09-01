# AI-001 — Add AI ticket workflow

## Asked
- Create a simple, Jira-like record for each AI session or commit: a one-page
  summary of the chat, decisions, and changes.

## Decisions
- Store tickets in `.ai/tickets/` so they are lightweight repository metadata.
- Use sequential `AI-###` identifiers and a short descriptive filename.
- Capture outcomes rather than raw chat transcripts.

## Changed
- Added the AI ticket workflow and reusable template in `.ai/tickets/README.md`.
- Added `AGENTS.md` so the workflow is discovered by default.
- Added this first ticket.
