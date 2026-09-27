# ClinicQ progress log

Newest session first. Each entry records what was built, the decisions behind it, exact versions, known issues, learner notes and what comes next.

---

## Session 3 — 2026-09-27 — Course home and Week 0

Branch: `claude/serene-ptolemy-jc4dmy` (restarted from `main` after PR #2 was merged)

### What was written

- **`docs/course/README.md`, the course home:**
  - how to use the course: pace for 4–6 hours a week, the eight-part lesson structure, "master" vs "skim" labels, how to follow links, and a questions log;
  - an architecture overview with two Mermaid diagrams: a sequence diagram of one booking request (browser → React page → API client → Express → middleware → controller → service → Prisma → PostgreSQL and back, with the 409 double-booking path) and a container diagram of the Docker setup;
  - a folder map with a one-line description of every tracked file;
  - the curriculum (Weeks 0–10);
  - a "How to build with AI" guide covering the loop (spec → small prompt → read the diff → test → commit), a spec template, a four-part prompt pattern, a diff-review checklist, and when to distrust AI output. The distrust section uses real examples from this repo's own history: the Prisma RC on npm's `latest` tag, TypeScript 7 vs typescript-eslint, the unformatted test in Session 2, the inaccurate auto-generated PR #1 description, and Prisma refusing an AI-initiated database reset.
- **`docs/course/week-00.md`, Week 0 (setup and tour):**
  - step-by-step Mac setup: Terminal basics, Homebrew and Git, git config, the GitHub CLI and login, Node 22, Docker Desktop, VS Code with the `code` command, and an optional AI assistant;
  - cloning, then running ClinicQ both ways (all in Docker, or local development);
  - a 12-step guided tour mapped to the features and business rules;
  - running all the tests, and the everyday Git commands;
  - the reading path (8 files), a block-by-block walkthrough of `docker-compose.yml`, the PA lens, a Build with AI exercise (add a neurologist to the seed data), 15 vocabulary terms and a 5-question quiz.
- **`.vscode/extensions.json`:** VS Code now recommends ESLint, Prettier, Prisma, Markdown Mermaid preview and Playwright when the repo is opened. Week 0's setup relies on it.
- **Root README:** now points to the course home.

### Key decisions

- **Week 0 is Mac-only**, as requested. Windows setup lives in the root README, which Week 0 links to for troubleshooting.
- **Setup path chosen for fewest moving parts:** Homebrew (which brings Git via the Command Line Tools) and the GitHub CLI for login and cloning; Node from the nodejs.org installer, with nvm mentioned as a "skim" alternative; Docker Desktop and VS Code from their own websites. I avoided exact Homebrew cask names and the nvm install script version, because I couldn't verify them from here.
- **Week 0 teaches both ways of running the app.** Option A (everything in Docker) is for clicking around; Option B (local development) is for reading and changing code. Option B is the setup later weeks assume.
- **Extra sections in Week 0:** besides the eight standard parts, Week 0 has hands-on sections (setup, run, tour, tests, Git) placed between the concept primer and the reading path. The standard parts keep their order.
- **Tables are used only for the folder map and the vocabulary,** per CLAUDE.md's teaching rules. Ports and sample accounts are lists.
- **Later weeks are listed as "coming soon" without links,** so the course home has no broken links.

### Verified in this session

- All four Mermaid diagrams render without errors in Chromium, using the latest Mermaid release (the version GitHub runs may differ). I checked the rendered images; the step numbers the text cites (13–14) match the drawn diagram.
- All 18 relative links in both documents resolve to existing files; of the 6 external links, nodejs.org, docker.com and the Claude Code docs responded; brew.sh, code.visualstudio.com and the nvm GitHub page couldn't be reached from this sandbox (its network policy blocks them), so those three are unchecked.
- The folder map covers every tracked file (checked by script; only the timestamped migration SQL is covered by its folder's row).
- Every line of YAML quoted in Week 0's walkthrough exists verbatim in `docker-compose.yml`.
- A dry run of the Build with AI exercise printed exactly the output the lesson predicts: `Seeded 5 doctors, 210 slots, 3 users and 3 appointments.` The change was reverted afterwards.
- `npm run format:check` passes.

### Known issues and open questions

- **The Mac setup steps were written, not performed.** This cloud environment is Linux, so the Homebrew, Docker Desktop, VS Code and `gh auth login` steps are untested here. If a step doesn't match what you see, note it in your learner notes and I'll fix the lesson.
- **`docker compose up` with the built images still hasn't been run end to end** (carried over from Session 2). Week 0's Option A is that run.
- **External setup commands can change.** The Homebrew one-liner is quoted "at the time of writing"; the lesson tells you to copy it from brew.sh.
- All earlier known issues and refinement questions still stand (Sessions 1–2).

### Learner notes

None given for this session.

### Next session

Session 4: Week 1 (the big picture: client/server, HTTP, URLs, JSON, APIs, the request lifecycle, README, `package.json`, `.env` and the folder map) and Week 2 (TypeScript as it appears in ClinicQ).

---

## Session 2 — 2026-09-27 — Web app, Docker, CI and E2E test

Branch: `claude/serene-ptolemy-jc4dmy` (restarted from `main` after PR #1 was merged)

### What was built

- **`apps/web`:** a React 19 + Vite + React Router single-page app.
  - Pages: log in, register, doctors, a doctor's available times with a confirm-to-book bar, my appointments (upcoming, and past/cancelled, with a Cancel button), the admin view of all appointments with a status filter, and a 404 page.
  - `AuthContext` holds the logged-in user. The token is saved in `localStorage`, so a page reload restores the session through `GET /api/auth/me`. An expired token logs the user out everywhere.
  - `ProtectedRoute` sends logged-out users to login (and back again afterwards) and sends users with the wrong role to their own home page. Patients land on `/doctors`, admins on `/admin`.
  - API client (`src/api/client.ts`): adds the token, sends and reads JSON, and turns API errors into an `ApiError` carrying the API's code and message. Network failures get a plain-language message.
  - Loading, error (with "Try again") and empty states on every data page, through one `useApiData` hook.
  - Clean, simple styling in one CSS file with colour variables; it works down to phone width, where the admin table scrolls sideways.
  - 10 Vitest unit tests: the API client (token, errors, network failure, auto-logout on 401) and the cancel/upcoming checks, including the exact 2-hour boundary.
- **API change (additive):** `GET /api/doctors/:id/slots` now returns `{ doctor, slots }` instead of `{ slots }`, so the booking page gets its heading without a second request. The test and API README were updated.
- **Playwright E2E test** (`apps/web/e2e/booking.spec.ts`): log in as Alice → book Dr. Chloe Nguyen's first free time → see it in My appointments → cancel → see it marked Cancelled. Playwright starts its own API (port 3100) and web server (port 5174) against a separate `clinicq_e2e` database, which is migrated and reseeded before each run.
- **Docker:** `apps/api/Dockerfile` (it runs `prisma migrate deploy` and then starts the server, as a non-root user); `apps/web/Dockerfile` (a two-stage build: Node builds the site, nginx serves it); `apps/web/nginx.conf` (serves the SPA and forwards `/api/` to the API); `docker-compose.yml` (db + api + web, with health checks); and `docker/db/init/01-create-databases.sql` (creates `clinicq_test` and `clinicq_e2e`). Also `.dockerignore`, and `.gitattributes` to force LF line endings for Windows users.
- **GitHub Actions CI** (`.github/workflows/ci.yml`), with three jobs: checks (lint, format check, typecheck, unit/API tests, build, against a Postgres service), e2e (Playwright, uploading its report on failure) and docker (`docker compose build`).
- **README** rewritten with tool installs for Windows and Mac, and two ways to run the app: all in Docker, or Docker for the database only with the apps running locally. It also has PowerShell variants and troubleshooting. `apps/web/README.md` has the page table and folder map.
- New root scripts: `dev:web`, `test:e2e`, `db:migrate`, `db:seed`, `docker:seed`.

### Key decisions

- **Declarative React Router** (`<BrowserRouter>` + `<Routes>`) rather than the data-router APIs, because it reads like a table of URLs and pages. React Router 8 still supports it.
- **The browser only ever calls `/api/...` on its own origin.** Vite's dev proxy (development) and nginx (Docker) forward those calls to the API. This avoids CORS configuration differences between environments and needs no API URL setting in the web app.
- **The token is kept in `localStorage`.** It's simple and common, but any script injected into the page could read it. The safer alternative (an httpOnly cookie) belongs in the Week 6 security discussion. Logout is client-side only.
- **The web app repeats the 2-hour rule** (`utils/appointments.ts`), so it can hide the Cancel button. The API remains the source of truth, and the rule is duplicated in two places (see Known issues).
- **The API Docker image is a single stage and keeps dev dependencies.** It needs the Prisma CLI to run migrations when it starts and `tsx` to run the seed. A slimmer multi-stage image is a later improvement.
- **Docker Compose runs the API with `NODE_ENV=production`.** Seeding therefore has to override it: `npm run docker:seed` sets `NODE_ENV=development` for that one command, because the seed refuses to run in production.
- **The E2E test uses its own database and ports** so it can't collide with a running dev setup, and it reseeds each time so it is repeatable.
- **GitHub Actions pinned to the current majors:** `actions/checkout@v7`, `actions/setup-node@v7`, `actions/upload-artifact@v7`.
- The root `engines` field now requires Node ≥ 22.22.0, because React Router 8 declares that minimum.

### Exact versions added this session

| Package                                                 | Version                                                                                        |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| react / react-dom                                       | 19.3.0                                                                                         |
| react-router                                            | 8.4.0                                                                                          |
| vite                                                    | 8.3.1                                                                                          |
| @vitejs/plugin-react                                    | 6.1.1                                                                                          |
| @types/react / @types/react-dom                         | 19.3.0                                                                                         |
| @playwright/test                                        | 1.63.0                                                                                         |
| eslint-plugin-react-hooks / eslint-plugin-react-refresh | 7.1.1 / 0.5.7                                                                                  |
| Docker base images                                      | `node:22-slim` (22.23.3 at time of writing), `nginx:1.30-alpine`, `postgres:16-alpine` (16.15) |

### Verified in this session

- `npm run lint`, `format:check`, `typecheck`, `npm test` (42 API + 10 web tests) and `npm run build` all pass.
- `npm run test:e2e` passes, and passes again on a second run (so it is repeatable).
- `docker compose config` is valid; `docker compose up db` starts and the init script creates all three databases; nginx accepts `nginx.conf` (`nginx -t`).
- Each Dockerfile's install and build steps were replayed in a clean directory holding only the files that Dockerfile copies. Both succeed.
- The production-style stack was run by hand: the compiled API with its container start command and `NODE_ENV=production` against the Compose database, and the real `nginx:1.30-alpine` image serving the built site and proxying `/api`. A scripted browser walkthrough on it passed: a protected page redirects to login; wrong password shows an error; register; new-patient empty state; book; a patient gets 403 from the admin API and is redirected away from `/admin`; admin sees all 4 appointments and the Cancelled filter shows 1; a reload keeps the session; the 404 page works; and the phone-width layout looks right.

### Known issues and open questions

- **The Docker images couldn't be built in the cloud sandbox,** because containers there can't reach the npm registry. The first CI run on PR #2 built both images successfully (`docker compose build`, job "Docker images build"). `docker compose up` with the built images hasn't been run end to end yet; see "Verified" above for the stack checked by hand.
- **CI passed on its first run** (PR #2, commit `b25d647`): all three jobs (checks, E2E and Docker build) are green. In CI, the E2E job downloads Chromium with `npx playwright install --with-deps chromium`; locally I used the sandbox's pre-installed Chromium through the optional `CHROMIUM_PATH` setting.
- **The 2-hour rule now lives in two places** (the API and the web app). If the rule changes, both must change. A refinement-friendly fix: have the API return a `canCancel` flag with each appointment.
- **Seed data goes stale** after 7 days (unchanged from Session 1).
- **Times show in the browser's time zone**, while seed slots are 09:00–12:00 UTC, so in India they appear as 14:30–17:30. A real clinic would store the clinic's time zone.
- **Refinement questions from Session 1 are still open:** can admins cancel? Can a patient hold overlapping appointments? Should cancelling someone else's appointment return 403 or 404?

### Learner notes

None given for this session.

### Next session

Session 3: write the course home (`docs/course/README.md`) and Week 0 (setup and tour) and Week 1 (the big picture), following the lesson structure in CLAUDE.md and linking to the files built in Sessions 1–2.

---

## Session 1 — 2026-09-27 — Monorepo root and backend API

Branch: `claude/serene-ptolemy-jc4dmy`

### What was built

- **Monorepo root:** npm workspaces (`apps/*`), shared `tsconfig.base.json`, ESLint flat config, Prettier, `.editorconfig`, `.nvmrc`, `.gitignore`, root scripts (`lint`, `format`, `format:check`, `typecheck`, `test`, `build`, `dev:api`), and a rewritten root README with setup steps and seed accounts.
- **`apps/api`:** Express 5 + TypeScript REST API, layered as routes → controllers → services → Prisma.
  - Prisma schema with `User`, `Doctor`, `TimeSlot`, `Appointment` and enums `Role` and `AppointmentStatus`; one migration (`init`); a seed that creates 4 doctors (General Practice, Cardiology, Dermatology, Pediatrics), 168 slots (30-minute slots from 09:00 to 12:00 UTC for the next 7 days), 1 admin, 2 patients and 3 sample appointments (2 booked, 1 cancelled).
  - Auth: register (always creates a patient), login, `GET /api/auth/me`; bcrypt password hashing; JWT (HS256) with the role inside the token.
  - Endpoints: list doctors, list a doctor's available slots, book, list my appointments, cancel, and an admin list of all appointments. The full table is in `apps/api/README.md`.
  - Middleware: `authenticate`, `requireRole`, `validate` (Zod), `notFound`, `errorHandler`. Also `helmet`, CORS, a JSON body size limit, pino request logging (one line per request, 4xx logged as warn and 5xx as error, with auth headers and passwords redacted), and environment variables validated at startup.
  - Tests: 42 Vitest + Supertest tests in 6 files. There are unit tests for the rule functions (including the exact 2-hour boundary) and API tests for every business rule, including a concurrent double-booking race. Tests run against a separate `clinicq_test` database.

### How each business rule is enforced

| Rule                    | Where                                                                                                                                                                    | Test                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| No double-booking       | Partial unique index `Appointment_slotId_booked_key` (one `BOOKED` appointment per slot) in the database; the service turns the violation into `409 SLOT_ALREADY_BOOKED` | `appointments.test.ts`: "cannot be double-booked", "same moment" race, "rebook after cancel" |
| No booking in the past  | `isInPast()` in `appointment.rules.ts`, called by `bookAppointment` → `422 SLOT_IN_PAST`; past slots are also hidden from the slot list                                  | `appointments.test.ts`, `doctors.test.ts`, `appointment.rules.test.ts`                       |
| Cancel own only         | `cancelAppointment` compares owner to the logged-in user → `403 NOT_YOUR_APPOINTMENT`                                                                                    | `appointments.test.ts`                                                                       |
| Cancel only > 2 h ahead | `isOutsideCancellationWindow()` → `422 CANCELLATION_WINDOW_PASSED`; exactly 2 h is too late                                                                              | `appointments.test.ts`, `appointment.rules.test.ts`                                          |
| Admins see everything   | `GET /api/admin/appointments` behind `requireRole('ADMIN')`                                                                                                              | `admin.test.ts`                                                                              |

### Key decisions

- **Prisma 7.10.0, not 8.** On npm, Prisma's `latest` tag currently points to `8.0.0-rc.17`, a release candidate. The brief forbids RCs, so I used 7.10.0, the newest stable release. Prisma 7 needs a driver adapter (`@prisma/adapter-pg`) and `prisma.config.ts`, and it generates the client into `apps/api/src/generated/prisma` (gitignored, regenerated by `postinstall`).
- **TypeScript 6.0.3, not 7.0.2.** TypeScript 7 is stable, but typescript-eslint 8.70.1 (the latest) supports TypeScript only below 6.1. TypeScript 6.0.3 is the newest version that works with the linter. Revisit when typescript-eslint supports 7.
- **Double-booking uses Prisma's `partialIndexes` preview feature.** A plain unique index on `slotId` would stop a cancelled slot from ever being booked again. The partial index counts only `BOOKED` rows. Because it lives in the database, it also stops two simultaneous requests, which an "is it free?" check in code can't. "Preview" means the Prisma schema syntax could change in a future Prisma release. The generated SQL is ordinary PostgreSQL.
- **ES modules with `.js` import extensions** (`module: nodenext`). This is Node's official TypeScript setup, and Prisma 7 generates ESM. Imports say `./app.js` even though the file is `app.ts`, because they name the file that will exist after compiling.
- **Status codes:** 400 for malformed input, 409 for conflicts with current state, 422 for well-formed requests that break a business rule. The error body always has a stable `code` (e.g. `SLOT_ALREADY_BOOKED`) for the frontend and for UAT scripts.
- **Only patients can book and cancel.** The brief doesn't say admins can do either, so the appointment routes are patient-only and an admin gets 403. This is a refinement question for Vijay (see Known issues).
- **Cancelled appointments stay in the database** with `status = CANCELLED` and a `cancelledAt` time, so there's a history for the admin view.
- **Doctor and slot lists are public** (no login), so people can browse before registering. They contain no patient data.
- **Login returns the same error for an unknown email and a wrong password**, so attackers can't use it to discover which emails are registered.
- **Time zones:** all times are stored and returned in UTC, and seed slots are 09:00–12:00 UTC. The frontend will need to display local time.
- **`.env.test` is committed.** It holds only local, non-secret test values; `.env` stays gitignored.

### Exact versions

Runtime: Node.js 22.22.2, npm 10.9.7, PostgreSQL 16.13.

| Package                                      | Version                   |
| -------------------------------------------- | ------------------------- |
| express                                      | 5.2.1                     |
| zod                                          | 4.6.5                     |
| prisma / @prisma/client / @prisma/adapter-pg | 7.10.0                    |
| pg                                           | 8.23.0                    |
| jsonwebtoken                                 | 9.0.3                     |
| bcrypt                                       | 6.0.0                     |
| pino / pino-http / pino-pretty               | 10.3.1 / 11.0.0 / 13.1.3  |
| helmet / cors / dotenv                       | 8.3.0 / 2.8.6 / 18.0.4    |
| typescript                                   | 6.0.3                     |
| tsx                                          | 4.23.15                   |
| vitest / supertest                           | 5.0.2 / 7.3.0             |
| eslint / @eslint/js / typescript-eslint      | 10.11.0 / 10.0.1 / 8.70.1 |
| prettier / eslint-config-prettier / globals  | 3.9.9 / 10.1.8 / 17.12.0  |
| @types/node                                  | 22.20.4 (matches Node 22) |

### Verified in this session

`npm ci` from a clean checkout (which generates the Prisma client), `prisma migrate deploy` and seed on a brand-new database, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test` (42/42 passing), `npm run build`, and a smoke test of the compiled server (`/health`, doctors list, admin login and admin appointments list). To check that the tests really guard the rules, I changed the 2-hour rule from "more than" to "at least" and confirmed the boundary test failed, then put the rule back.

### Known issues and open questions

- **`npm run db:reset` was not run.** Prisma 7 refuses `migrate reset` when an AI agent runs it, unless the user gives explicit consent. The script is standard and should work when Vijay runs it himself.
- **`npm audit` reports 4 high-severity advisories** in `deepmerge-ts` and `mysql2`. Both come in through the `prisma` CLI (a dev tool); the API doesn't load them at runtime. npm's only suggested fix is downgrading to Prisma 6. Re-check when a Prisma 7.x patch ships.
- **Seed data goes stale.** Slots cover the 7 days after the seed runs; after that, re-run `npm run db:seed`.
- **Refinement questions (not in the brief):**
  - Should admins be able to cancel an appointment for a patient? If so, does the 2-hour rule apply to them?
  - Can a patient hold two appointments at the same time with different doctors? Nothing prevents it today.
  - If an appointment belongs to another patient, should the API say "forbidden" (403, today) or "not found" (404)? The 404 hides that the appointment exists, which some healthcare teams prefer.
- **Not yet in place:** rate limiting on login, audit logging of who viewed which patient's data, and token revocation or logout on the server. These come up in Week 6 (security).

### Learner notes

None given for this session.

### Next session

Session 2: `apps/web`, a React + Vite frontend with React Router. It covers login/register, the doctor list, booking a slot, my appointments with cancel, and the admin view, plus an auth context and loading, error and empty states. Docker, docker-compose, GitHub Actions CI and the Playwright E2E test follow after that, then the course docs in `docs/course/`.
