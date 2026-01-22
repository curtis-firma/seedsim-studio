# SeedSIM Studio — Execution Handoff

## Role Definitions
- ChatGPT (this chat): SYSTEM ARCHITECT + PRODUCT LOGIC
- Agent Chat: IMPLEMENTATION ONLY (code changes, fixes, wiring)

Agent MUST NOT:
- invent new engine logic
- rename schema fields
- redesign UI
- add features not explicitly listed

Agent MUST:
- follow instructions exactly
- ask for clarification instead of guessing

---

## Goal (Current Phase)
Unblock SeedSIM Studio so it:
1. Compiles cleanly
2. Runs locally with `npm run dev`
3. Has a working API stub at `/api/seedsim/parse`
4. Displays deterministic engine output (no GPT dependency yet)

NO feature expansion until build is stable.

---

## Repo Structure (Canonical)

/seedsim
  /seedsim-studio   ← Next.js app (ONLY package.json here)
    /src
      /app
      /engine        ← copied engine code
      /components
  /engine (ARCHIVE ONLY — do not import from here)

---

## Known Problems
- Duplicate `package.json` files (tests folder, engine folder)
- Missing deps (`zod`, `recharts`)
- Duplicate POST handler in `/api/seedsim/parse`
- Confusion about where UI blocks go in `page.tsx`

---

## Current Truths
- `runSimulation` lives in `src/engine/simulate.ts`
- It is exported via `src/engine/index.ts`
- UI imports must be:
  `import { runSimulation } from "../engine"`

---

## Milestones (DO IN ORDER)

### Milestone 1 — Normalize project
- Delete extra `package.json` files
- One `node_modules`
- One `package-lock.json`

### Milestone 2 — Build fixes
- Install missing deps
- Fix API route duplication
- Confirm `curl POST /api/seedsim/parse` returns JSON

### Milestone 3 — UI safety
- Charts render
- No schema assumptions
- No engine edits

---

## Definition of Done
- `npm run dev` works
- Home page renders
- No red build errors
- API stub returns JSON

STOP when done. Ask before continuing.

