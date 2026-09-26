# Memora — Project Context

Personal Decision Graph. AI-powered productivity/decision-memory agent built on Neo4j for a hackathon. See `prompt.md` for the full original spec.

## Status: P0 + P1 complete and verified working end-to-end against a live Neo4j Aura instance.

---

## Stack

- **Frontend**: `frontend/` — Next.js 16 (App Router, Turbopack), React, TypeScript, Tailwind v4, Lucide icons, `react-force-graph-2d`, `react-markdown`
- **Backend**: `server/` — Node.js, Express, TypeScript, `tsx` for dev
- **Database**: Neo4j Aura (official `neo4j-driver`)
- **LLM**: Anthropic Claude (`@anthropic-ai/sdk`), model `claude-sonnet-5`, used for intent classification, memory extraction, recommendation generation, and decision replay reasoning

Two independent processes, no monorepo tooling — run each with its own `npm run dev`.

---

## Folder structure

```
server/src/
  routes/          chat, memory, graph, decisions, outcomes, conflicts, demo
  services/
    neo4j.ts          driver singleton, constraints, toPlainNode() serializer
    llm.ts            Anthropic client, askJSON()/askText() helpers
    intent.ts         classifies message into 7 intents
    extraction.ts     LLM → structured ExtractionResult (memories + decision links)
    memoryStore.ts     dedupe, create/update, linking, getGraph(), addOutcome()
    retrieval.ts      full graph-context retrieval for planning/question answers
    recommendation.ts  builds LLM answer + why-evidence from graph context
    decisionReplay.ts  flagship feature — similarity-matches past decisions
    conflict.ts       lightweight preference-conflict detection
    demoSeed.ts       seeds the fixed demo user with realistic sample graph
  models/types.ts    shared TS types (MemoryNode, WhyEvidence, Intent, etc.)
  utils/similarity.ts  Jaccard token-overlap similarity (used for dedupe + replay matching)

frontend/src/
  app/
    page.tsx          Chat (main demo surface)
    memory/page.tsx    Memory panel (cards grouped by type, expandable relations)
    decisions/page.tsx  Standalone Decision Replay page
    timeline/page.tsx   Chronological memory feed
    graph/page.tsx      Live Neo4j graph visualization, click-to-inspect, ?focus= deep link
  components/
    Sidebar.tsx, WhyChips.tsx, MemoryTrail.tsx, DecisionReplayCard.tsx,
    MemoryCard.tsx, Markdown.tsx
  lib/
    api.ts   fetch client for the Express backend (NEXT_PUBLIC_API_URL)
    types.ts  mirrors server types
```

---

## Neo4j graph model (implemented as specified in prompt.md §4)

Nodes: `User, Preference, Task, Commitment, Decision, Reason, Outcome, Goal, Experience` — all user-owned nodes carry `userId` (multi-user-ready even though the UI hardcodes a single demo user, no auth).

Relationships: `HAS_PREFERENCE, HAS_TASK, HAS_COMMITMENT, MADE_DECISION, HAS_GOAL, HAD_EXPERIENCE, BASED_ON, FOR_TASK, RELATED_TO, LED_TO, INFLUENCES, INFLUENCED`.

Uniqueness constraints on `id` per label are created at server startup (`ensureConstraints()`).

**Important gotcha fixed**: Neo4j `datetime()` values are driver temporal objects, not JSON-serializable — `res.json()` was turning them into garbage nested objects. Fixed with `toPlainNode()` in `services/neo4j.ts`, used everywhere a node is read back.

---

## Core pipeline (per message)

1. `POST /api/chat {userId, message}` → `classifyIntent()` (LLM) → one of: `new_memory`, `question`, `planning_request`, `decision_support`, `outcome_update`, `memory_correction`, `general_conversation`
2. **new_memory / memory_correction** → `extractMemories()` (LLM → structured JSON) → `storeExtraction()` (dedupe via Jaccard similarity ≥0.6 against existing same-label nodes for that user, update in place if similar, else create + link to User + wire up Decision→Reason/Task/Goal relationships)
3. **planning_request / question** → `retrieveFullContext()` (multi-hop Cypher: preferences, tasks, goals, experiences, decisions+reasons+outcomes) → LLM answer grounded only in that context → `why` evidence array built directly from the retrieved nodes (memoryId, label, content, explanation) → if context is empty, honestly says "I don't have enough history"
4. **decision_support** → `replayDecision()` (flagship Decision Replay): fetches all past decisions+reasons+outcomes+task, Jaccard-scores each against the question, LLM produces a recommendation from the best match's reasons/outcomes, confidence is explicitly lower when no outcome exists yet
5. **outcome_update** → `resolveOutcomeUpdate()` matches the message to the most similar decision that doesn't yet have an outcome (Jaccard + falls back to most recent), LLM classifies sentiment, `addOutcome()` creates the `Outcome` node and wires `Decision-[:LED_TO]->Outcome` + `Outcome-[:INFLUENCES]->Decision`
6. **general_conversation** → plain LLM reply, no memory access

Every LLM call goes through `services/llm.ts`'s `askJSON`/`askText`, which extracts JSON from a fenced/unfenced response and throws on unparseable output (early bug: default `maxTokens` was too low for the planning answer and truncated mid-JSON — fixed by raising to 2500 and instructing the LLM to keep the markdown plan concise).

---

## Demo mode

`POST /api/demo/load` (fixed `userId = "demo-user"`) wipes and reseeds a realistic graph directly via Cypher (bypassing the LLM, for reliability): 3 preferences, 3 tasks, 3 goals, 2 experiences, 2 reasons, 3 decisions, 1 outcome, fully interlinked — matches prompt.md §19 exactly.

---

## Verified working (live, against real Aura + real Claude calls)

- `GET /api/health` → Neo4j connectivity check
- Demo seed → 17 memories, 18 graph nodes / 23 links
- "Plan my week." → grounded day-by-day plan + full why-evidence list
- "Why did you schedule presentation work on Monday morning?" → cites the actual preference/reason/experience nodes
- "I have another presentation next Wednesday. Should I start Monday or Tuesday?" → Decision Replay matched the seeded "Start presentation preparation Monday" decision, confidence 0.35 (honest — no outcome yet)
- `POST /api/outcomes` (positive, "The presentation went really well") → linked to that decision
- Re-asked the same decision question → confidence rose to 0.75, recommendation now explicitly cites the new outcome. **Learning feedback loop confirmed.**
- New free-text preference message → correctly extracted 2 new `Preference` memories
- `/api/memory/conflicts` → runs, returns `[]` (no conflicting preferences in current seed data)
- `GET /api/memories/:id` → returns node + all in/out relationships correctly labeled

Frontend: TypeScript, ESLint (0 warnings), and `next build` all pass. All 5 routes (`/`, `/memory`, `/decisions`, `/timeline`, `/graph`) render server-side without error. **Not yet manually verified in an actual browser** — only confirmed via build/lint/type-check + the fact that all API calls the UI makes were independently tested via curl.

---

## Environment / secrets

- `.env.example` (root) — blank placeholder template, safe to commit
- `server/.env` — **contains real credentials, gitignored**, not committed
- `frontend/.env.local` — just `NEXT_PUBLIC_API_URL=http://localhost:4000`
- **Security note**: real Neo4j Aura password and Anthropic API key were briefly pasted into the committed-looking `.env.example` mid-session. Moved to `server/.env` and `.env.example` restored to blanks. If this repo is ever pushed publicly, treat that Aura password and Anthropic key as compromised and rotate them.
- Root `.gitignore` added (`node_modules/`, `dist/`, `.next/`, `.env*`, `*.log`). Note: root itself is not yet a git repo; `frontend/` has its own `.git` from `create-next-app` (not yet reconciled into a single repo).

To run:
```
cd server && npm install && npm run dev      # localhost:4000
cd frontend && npm install && npm run dev    # localhost:3000
```

---

## Known gaps / not done (by design, per priority order in prompt.md §25)

- **P2 items only partially done**: dedupe/conflict thresholds are heuristic (Jaccard token overlap) and not always precise — e.g. "Dislikes meetings before 9 AM" vs seeded "No meetings before 9 AM" didn't dedupe (similarity was below the 0.6 threshold). Acceptable for MVP, would need embedding-based similarity to be more robust.
- No auth / multi-user UI — single hardcoded `demo-user`, per explicit instruction to skip auth for the 2-hour MVP. Backend schema is multi-user-ready (`userId` on every node).
- No semantic/vector retrieval yet — pure graph traversal + Jaccard similarity. Prompt explicitly said: get P0 working before adding embeddings, add embeddings only if time permits. Not yet added.
- No animations/visual polish pass beyond the initial dark UI.
- Browser/visual QA of the frontend has not been done — only automated checks (build/lint/typecheck) and API-level testing.

## Suggested next steps if resuming

1. Manually click through the demo flow in a real browser (Chat → Load Demo → Plan my week → Why? → Explore in Graph → Decisions → add outcome → re-ask).
2. Consider replacing Jaccard similarity with embedding-based similarity (P2/stretch) for better dedupe and decision-replay matching.
3. Reconcile the two separate git states (root has none, `frontend/` has its own `.git`) into one repo if the user wants version control.
