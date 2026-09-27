# ClinicQ — project brief for Claude

This repository serves two purposes at once. It is a small, real, production-style web app, and it is the textbook for a code-literacy course. Read this file fully at the start of every session, then read `PROGRESS.md`.

## The student

Vijay is a Product Analyst at a healthcare software company. He has a CS degree but no professional coding practice. He writes PBIs and acceptance criteria and runs UAT. He has 4–6 hours per week.

His goals:

1. Read and understand real production code.
2. Understand his developers' language: standups, refinement, PR reviews.
3. Build basic software himself by directing AI, without writing code line by line. He specs, prompts, reviews and tests; the AI types.

## The app: ClinicQ (clinic appointment booking)

Features:

- patient register/login
- list doctors with specialties
- book an appointment in an available slot
- view my appointments
- cancel an appointment
- admin view of all appointments with status

Business rules:

- a doctor's slot can't be double-booked
- appointments can't be booked in the past
- patients can cancel only their own appointments, and only if the appointment is more than 2 hours away
- admins see everything

Stack (latest stable versions — check the registry, never use RC/beta; record exact versions in PROGRESS.md):

- TypeScript throughout
- apps/web: React + Vite, React Router
- apps/api: Node.js + Express, Zod validation, JWT auth + bcrypt, structured logging
- Database: PostgreSQL + Prisma ORM (schema, migrations, seed)
- Tests: Vitest + Supertest for unit/API tests; Playwright for one E2E test
- Tooling: ESLint + Prettier, npm workspaces monorepo
- Delivery: Dockerfiles, docker-compose.yml (db + api + web), GitHub Actions CI (lint, typecheck, test, build)

Code standards:

- Write the code the way a good mid-level developer would: conventional, readable, not clever. Keep comments short. The teaching lives in the course docs, not in the code.
- Layered backend: routes → controllers → services → Prisma, with middleware for auth, validation and errors.
- Include every file a real project has: README, .gitignore, .env.example, package.json scripts, tsconfig, lint config.
- The code MUST run. Before pushing, actually install, migrate, seed, test and build. In the cloud environment, PostgreSQL 16 is pre-installed but not running; start it with `service postgresql start`. Never push a branch with failing tests. If something can't be verified, say so in PROGRESS.md.

## The course (lives in `docs/course/`)

Each lesson is one Markdown file: `docs/course/week-00.md` … `week-10.md`. `docs/course/README.md` is the course home: how to use it, the curriculum, and links to each week. Use Mermaid diagrams, which GitHub renders.

Curriculum:

- **Week 0 — Setup and tour.** VS Code, terminal, Git, Node, Docker; clone and run ClinicQ locally; click through it.
- **Week 1 — The big picture.** Client/server, HTTP, URLs, JSON, APIs, the request lifecycle; README, package.json, .env, folder map.
- **Week 2 — TypeScript as it appears in ClinicQ.** Types, interfaces, functions, arrow functions, objects/arrays, imports/exports, async/await, promises.
- **Week 3 — Backend I.** Express setup, routes, controllers, middleware, status codes.
- **Week 4 — Backend II.** Services, business rules, Zod validation, error handling, logging.
- **Week 5 — Database.** Prisma schema, relations, migrations, seed, queries, transactions; how acceptance criteria become constraints.
- **Week 6 — Auth and security.** Hashing, JWT, roles/authorization, CORS, secrets; healthcare/PHI considerations.
- **Week 7 — Frontend I.** React components, JSX, props, state, hooks.
- **Week 8 — Frontend II.** Routing, forms, calling the API, loading/error/empty states, auth context.
- **Week 9 — Quality.** Unit/API/E2E tests, linting, Git branches, commits, PRs, code review, CI.
- **Week 10 — Shipping + capstone.** Docker, environments, deployment concepts; the capstone.

### Every weekly lesson contains

1. **Goal:** what he can do by the end of the week.
2. **Concept primer:** the minimum theory in plain English. Include a Mermaid diagram when the concept has flow or structure.
3. **Reading path:** the files to read, in order, with links to the files in the repo. For each file: its purpose in one line, and why real projects have it (what breaks without it).
4. **Block-by-block walkthrough.** Quote each functional block of code, then give:
   - **What it does:** plain English.
   - **Syntax decoded:** only symbols and keywords new to him, token by token. Link back to the earlier week for anything already covered.
   - **Connects to:** which files call it or are called by it.
   - **Dev-speak:** how developers would talk about it.
5. **PA lens:** how this layer maps to acceptance criteria, refinement questions to ask, and typical UAT bugs in this layer.
6. **Build with AI:** one small change to ClinicQ that he directs an AI to make. Provide:
   - the spec he writes first
   - an example prompt
   - a checklist for reviewing the diff
   - how to test the result
   Difficulty ramps up each week.
7. **Vocabulary:** 10–15 terms, each defined in one line and tied to where it appears in ClinicQ.
8. **Quiz:** 5 questions, with answers in a collapsed `<details>` block.

### Capstone (Week 10)

He writes a PBI for "Patients can reschedule an appointment", with acceptance criteria, and predicts which files will change. He then has AI implement it on a feature branch, reviews the PR, runs the tests, and fixes issues by further prompting. It ends with a retrospective: what the AI got wrong and why.

### Teaching rules

- Plain English first, precise term second. Define jargon on first use.
- Explain the WHY behind conventions.
- Flag what to skim versus what to master.
- Be honest about complexity; never oversimplify into something false.
- Use prose and code blocks. Use tables only for vocabulary and file maps.
- No filler, no praise, no recaps.

## Session workflow

- Each session does one job, on its own branch (e.g. `session-01-backend`). Vijay reviews the PR and merges it into `main` before the next session.
- Use clear, conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`), in small logical steps. The commit history is itself teaching material.
- Write the PR description for a Product Analyst reader. Cover:
  - what changed and why
  - how to test it
  - anything to look at closely
- At the end of every session, update `PROGRESS.md` with:
  - the date and session number
  - what was built or written
  - key decisions and exact versions
  - known issues
  - learner notes Vijay gave for this session
  - the next session
- If you are running out of room, stop at a clean point: tests passing, PROGRESS.md updated, branch pushed. Don't leave half-written files.
- Build on earlier decisions. Never silently rename or restructure what previous sessions created.
