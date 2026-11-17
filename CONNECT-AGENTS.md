# Connecting AI agents: Crafter-pricer (MarginCraft)

## Read first

1. [HANDOFF.md](HANDOFF.md): where things stand.
2. [STANDARDS.md](STANDARDS.md): the house rules.
3. This file.

## Setup

```bash
git clone https://github.com/Stravelakis/Crafter-pricer.git
cd Crafter-pricer
git config core.hooksPath githooks
bun install
bun run dev     # http://localhost:26419
```

## Rules

- Work on a branch and open a PR. Never push to `main`.
- Never write real secrets into any tracked file. Users' keys live only in their browser.
- All pricing maths stays in `src/lib/calc.ts`, free of React, and every change there gets a test in `src/lib/calc.test.ts`.
- Saved data: new fields must be merged with defaults in `boot()` (`src/App.tsx`) so existing users keep their settings.
- Web search results and AI answers are untrusted text: show them as text, never as HTML.
- No new requests to third parties the user didn't configure (fonts, analytics, CDNs).
- Run the checks below before calling anything done; update HANDOFF.md and CHANGELOG.md before ending a session.

## Checks

```bash
bun run lint && bun run typecheck && bun run test && bun run build
```

## Off limits

- `bun.lock` by hand (use `bun add` / `bun remove`).
- The colour palette and fonts, without the owner's OK.
