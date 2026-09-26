You are the lead engineer for a Neo4j hackathon project.

Build a polished hackathon-winning prototype called:

# MEMORA

### Your Personal Decision Graph

## 1. PRODUCT VISION

Memora is an AI-powered Personal Productivity & Decision Memory Agent.

The core idea:

> AI assistants remember conversations. Memora remembers decisions.

Memora stores a user's:

* Preferences
* Tasks
* Commitments
* Decisions
* Reasons behind decisions
* Outcomes
* Goals
* Past experiences

It stores these as a connected knowledge graph in Neo4j.

When the user asks for a recommendation later, the system retrieves relevant memories using both:

1. Semantic relevance
2. Graph relationships

The LLM then uses this context to provide a personalized recommendation.

The key differentiator is that Memora should understand:

WHAT the user did
+
WHY they did it
+
WHAT happened afterward
+
HOW that should influence future recommendations.

---

# 2. HACKATHON DEMO SCENARIO

The entire application must be optimized around this demo.

Initial conversation:

User:

"I have an important client presentation on Wednesday. I usually need two days to prepare for important presentations. I prefer doing important work in the morning. Last time I started preparing only one day before and felt stressed. I'll start preparing Monday."

The system should automatically extract and store:

Preference:

* Important work → morning

Task:

* Client presentation
* Deadline → Wednesday

Historical experience:

* Late preparation → stress

Decision:

* Start preparation Monday

Reason:

* Important presentation
* Usually requires two days

The graph should connect these entities.

Later the user asks:

"Plan my week."

The agent should retrieve the relevant graph context and respond with a personalized schedule.

For example:

Monday morning:

* Research and outline presentation

Tuesday morning:

* Finalize slides and rehearse

Wednesday:

* Client presentation

Then the user asks:

"Why did you schedule presentation work on Monday morning?"

The system should answer:

"Because you previously said important work is best done in the morning, you usually need two days to prepare for important presentations, and you previously decided to begin this presentation on Monday."

This "WHY" explanation is a critical feature.

---

# 3. SIGNATURE FEATURE — DECISION REPLAY

Implement a feature called:

## Decision Replay

When a user asks a decision-support question, Memora should search their historical decisions and outcomes.

Example:

User:
"Should I take this internship?"

Memora should look for:

* Similar previous decisions
* Reasons for those decisions
* Related preferences
* Related goals
* Outcomes of previous decisions

Then produce:

DECISION REPLAY

Previous similar decision:
Startup internship

Why:
Wanted startup exposure + AI experience

Outcome:
Built production features + learned backend

Current opportunity:
AI startup internship

Recommendation:
Strongly consider it.

Reasoning:
The current opportunity shares characteristics with a previous decision that produced a positive outcome.

This should be visually presented in the UI.

---

# 4. MEMORY GRAPH

Neo4j is the central database and MUST be genuinely used.

Do not fake graph functionality.

Use Neo4j to store connected entities.

Recommended nodes:

(:User)
(:Preference)
(:Task)
(:Commitment)
(:Decision)
(:Reason)
(:Outcome)
(:Goal)
(:Experience)
(:Project)

Recommended relationships:

(:User)-[:HAS_PREFERENCE]->(:Preference)

(:User)-[:HAS_TASK]->(:Task)

(:User)-[:HAS_COMMITMENT]->(:Commitment)

(:User)-[:MADE_DECISION]->(:Decision)

(:Decision)-[:BASED_ON]->(:Reason)

(:Decision)-[:FOR_TASK]->(:Task)

(:Decision)-[:RELATED_TO]->(:Goal)

(:Decision)-[:LED_TO]->(:Outcome)

(:User)-[:HAS_GOAL]->(:Goal)

(:User)-[:HAD_EXPERIENCE]->(:Experience)

(:Experience)-[:INFLUENCED]->(:Decision)

(:Outcome)-[:INFLUENCES]->(:Decision)

Use properties such as:

id
content
type
createdAt
updatedAt
confidence
importance
status
source

Design the graph so that multi-hop traversal is useful.

Example:

User
→ Decision
→ Reason
→ Task
→ Outcome
→ Future Recommendation

---

# 5. GRAPH-BASED RETRIEVAL

Do NOT simply retrieve raw text from Neo4j.

Build relationship-aware retrieval.

For a user question:

"How should I prepare for my next presentation?"

Retrieve:

1. Relevant presentation tasks
2. Previous presentation decisions
3. Preparation preferences
4. Historical experiences
5. Outcomes
6. Related goals

Then combine these relationships into a context object for the LLM.

Example:

{
"preferences": [...],
"tasks": [...],
"decisions": [...],
"experiences": [...],
"outcomes": [...],
"goals": [...]
}

The LLM must use this context to produce the recommendation.

---

# 6. MEMORY EXTRACTION

When the user sends a natural-language message, use the LLM to extract structured memories.

For example:

User:
"I hate meetings before 9 AM and I usually need two days before an important presentation."

Extract:

{
"preferences": [
{
"type": "meeting_time",
"value": "after 9 AM"
}
],
"constraints": [
{
"type": "presentation_preparation",
"value": "2 days"
}
]
}

The extraction should be robust enough to identify:

* Preferences
* Tasks
* Commitments
* Decisions
* Reasons
* Goals
* Experiences
* Outcomes

Only create memories that are meaningful and useful.

Do not store every sentence as a memory.

---

# 7. MEMORY CONFIDENCE

Each extracted memory should have a confidence score.

Example:

{
"confidence": 0.91
}

If the user explicitly says:

"I always work best in the morning."

High confidence.

If the system infers:

"The user may prefer mornings."

Lower confidence.

Do not treat low-confidence inferred memories as strong facts.

---

# 8. MEMORY CONFLICT DETECTION

Implement a lightweight conflict mechanism.

Example:

Old memory:

"I prefer morning meetings."

Later:

"I've been taking evening meetings lately."

The system should detect a potential conflict.

Show:

MEMORY CONFLICT

Previous:
"I prefer morning meetings."

Recent:
"Taking evening meetings."

Ask:

"Your recent behavior seems different from your previous preference. Should I update your preference?"

Do not silently overwrite important memories.

---

# 9. UI/UX

Create a premium, modern AI product interface.

Use:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide icons
* Clean dark/light visual system
* Smooth animations
* Responsive layout

The UI should feel like a serious AI product, not a college CRUD project.

Main layout:

SIDEBAR

* Chat
* Memory
* Decisions
* Timeline
* Graph

MAIN AREA

Chat interface.

The user can ask questions naturally.

Example:

"Plan my week."

Response should contain:

### Personalized Plan

Monday
09:00 — Presentation research
10:30 — Deep work
...

Then:

### Why this plan?

Show the memory evidence.

Example chips:

[Morning preference]
[2-day preparation habit]
[Wednesday deadline]
[Previous outcome]

---

# 10. MEMORY PANEL

Create a Memory page.

Display cards for:

Preferences
Tasks
Decisions
Goals
Outcomes

Each card should show:

Type
Content
Confidence
Created date
Related memories

Example:

DECISION

"Start presentation preparation Monday"

Reason:
"Important presentation requires two days."

Confidence:
94%

Related:
Client Presentation
Wednesday Deadline

---

# 11. DECISION REPLAY UI

Create a dedicated Decision Replay component.

Example:

┌────────────────────────────────────┐
│ DECISION REPLAY                    │
├────────────────────────────────────┤
│ Current Decision                   │
│ Should I take this internship?     │
│                                    │
│ Similar Past Decision              │
│ Startup internship                 │
│                                    │
│ WHY                                │
│ AI exposure + startup experience   │
│                                    │
│ OUTCOME                            │
│ Positive                           │
│                                    │
│ CURRENT RECOMMENDATION             │
│ Strongly consider                  │
│                                    │
│ Confidence: 82%                    │
└────────────────────────────────────┘

Make this visually impressive.

---

# 12. GRAPH VISUALIZATION

Add an interactive Memory Graph page.

Use a suitable graph visualization library.

Display nodes and relationships.

Example:

User
↓
Preference
↓
Decision
↓
Task
↓
Outcome

Allow the user to click a node and inspect its details.

The graph visualization should use actual data from Neo4j.

Do not create a fake hardcoded graph.

---

# 13. "WHY?" EXPLAINABILITY

Every major AI recommendation should provide an explanation.

Example:

RECOMMENDATION

Start preparing Monday morning.

WHY?

1. You usually need two days for important presentations.
2. You prefer doing important work in the morning.
3. Your presentation is Wednesday.
4. Your previous late preparation resulted in stress.

Each reason should correspond to an actual retrieved memory.

Add a button:

[Explore Memory Graph]

Clicking it should highlight the relevant graph nodes/relationships.

This is one of the most important demo features.

---

# 14. AGENT ARCHITECTURE

Build the backend with a clean architecture.

Frontend:
Next.js + React + Tailwind

Backend:
Node.js + Express + TypeScript

Database:
Neo4j Aura

AI:
Use the LLM API configured through environment variables.

Neo4j:
Use the official Neo4j JavaScript driver.

Architecture:

Frontend
↓
Backend API
↓
AI Agent
↓
Memory Extraction / Intent Detection
↓
Neo4j Retrieval
↓
Context Assembly
↓
LLM Recommendation
↓
Response

---

# 15. API ENDPOINTS

Create:

POST /api/chat

POST /api/memory

GET /api/memories

GET /api/memories/:id

GET /api/graph

POST /api/decisions/replay

POST /api/outcomes

POST /api/memory/conflicts

Keep the API clean.

---

# 16. AGENT BEHAVIOR

The agent should classify user messages into:

1. New memory
2. Question
3. Planning request
4. Decision-support request
5. Outcome update
6. Memory correction
7. General conversation

For memory-related messages:

Extract → validate → store in Neo4j.

For recommendation questions:

Retrieve → reason → answer.

For outcome updates:

Connect outcome to the original decision.

For corrections:

Update the appropriate memory rather than creating unnecessary duplicates.

---

# 17. DUPLICATE MEMORY PREVENTION

Before creating a new memory, check whether a similar memory already exists.

Do not create:

Preference:
"Morning work"

Preference:
"I prefer working in mornings"

as two unrelated permanent memories.

Instead update/merge where appropriate.

---

# 18. TECHNICAL QUALITY

Use:

* TypeScript
* Proper error handling
* Environment variables
* Clean folder structure
* Reusable components
* API validation
* Loading states
* Empty states
* Error states
* Secure API key handling

Never expose API keys in frontend code.

Create:

.env.example

with:

NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
LLM_API_KEY=

---

# 19. DEMO MODE

IMPORTANT:

Create a "Load Demo Memory" button.

When clicked, populate Neo4j with a realistic sample user and memories.

Demo data should include:

Preferences:

* Important work in morning
* No meetings before 9 AM
* Likes 90-minute focus sessions

Tasks:

* Client presentation
* Project deadline
* Internship application

Decisions:

* Start presentation Monday
* Work on project before gym
* Apply to AI internship

Experiences:

* Late preparation caused stress
* Early preparation produced a good presentation

Outcomes:

* Presentation went well
* Project completed on time

Goals:

* Get AI/backend internship
* Improve productivity
* Build strong projects

This allows us to demonstrate the entire system immediately.

---

# 20. DEMO FLOW

The application must support this exact hackathon demo.

STEP 1:

Click:

"Load Demo Memory"

Show Neo4j graph.

STEP 2:

Ask:

"Plan my week."

Agent produces a personalized schedule.

STEP 3:

Click:

"Why?"

Show the retrieved memories.

STEP 4:

Click:

"Explore Memory Graph"

Show relevant Neo4j relationships.

STEP 5:

Ask:

"I have another presentation next Wednesday. Should I start Monday or Tuesday?"

Agent should use previous presentation history.

STEP 6:

Show:

DECISION REPLAY

Previous decision:
Start two days early.

Outcome:
Positive.

Recommendation:
Start Monday.

STEP 7:

Add a new outcome:

"The presentation went really well."

Neo4j should create:

Decision → LED_TO → Outcome

STEP 8:

Ask the same question again.

The recommendation should now be influenced by the newly added positive outcome.

This demonstrates a learning feedback loop.

---

# 21. VISUAL STORY

The UI should communicate:

MEMORY
↓
RELATIONSHIPS
↓
REASONING
↓
RECOMMENDATION
↓
OUTCOME
↓
BETTER FUTURE RECOMMENDATION

Make this visually obvious.

---

# 22. HACKATHON JUDGING OPTIMIZATION

Optimize for these judging criteria:

### Innovation

Decision memory rather than simple chat memory.

### Technical depth

Neo4j graph + graph traversal + semantic retrieval + LLM.

### Use of Neo4j

Neo4j must be central to memory and reasoning.

### UX

Simple, beautiful and understandable.

### Impact

Personalized decision support that improves over time.

### Demo

Visible graph + personalized recommendation + explanation + decision replay.

---

# 23. IMPORTANT PRODUCT PRINCIPLE

Do NOT make the AI pretend to know things.

If there isn't enough memory:

Say:

"I don't have enough history to confidently recommend this."

If there is conflicting memory:

Say:

"I found conflicting preferences."

If the recommendation is based on weak evidence:

Say:

"This is an inference based on limited history."

Trust is more important than pretending.

---

# 24. DEVELOPMENT PROCESS

Before writing code:

1. Inspect the existing repository.
2. Understand the current stack.
3. Reuse existing code where possible.
4. Do not unnecessarily rewrite the project.
5. Create a concise implementation plan.
6. Then implement the MVP.

After implementation:

1. Run the project.
2. Fix build errors.
3. Fix TypeScript errors.
4. Test Neo4j connection.
5. Test memory creation.
6. Test graph retrieval.
7. Test recommendation generation.
8. Test demo flow.
9. Improve UI only after functionality works.

Do not stop at pseudocode.

Actually implement the working application.

If credentials are missing, create the necessary .env.example and clearly identify what must be configured.

---

# 25. PRIORITY ORDER

If time is limited, prioritize:

P0:

* Neo4j connection
* Memory extraction
* Graph storage
* Graph retrieval
* Personalized recommendation
* Why explanation
* Demo memory

P1:

* Decision Replay
* Graph visualization
* Outcome tracking

P2:

* Conflict detection
* Memory confidence
* Animations
* Extra polish

Never sacrifice the working Neo4j + AI workflow for visual polish.

---

# 26. FINAL REQUIREMENT

The finished product should make a hackathon judge understand this within 30 seconds:

> "This AI doesn't just remember what I said. It builds a graph of my decisions, understands why I made them, remembers what happened, and uses that history to make better decisions for me."

Build the project around that idea.

Start by inspecting the repository and then implement the complete MVP.
