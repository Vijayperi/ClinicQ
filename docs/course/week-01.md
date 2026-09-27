# Week 1: The big picture

[← Course home](README.md) · [Previous: Week 0](week-00.md)

## 1. Goal

By the end of this week you can:

- explain, without notes, what happens between clicking a button in ClinicQ and seeing the result;
- read an HTTP request and response in the browser's Network tab and with `curl`: method, URL, headers, status code, body;
- read JSON and relate every field to a screen in the app;
- find your way around any project using its README, its `package.json` files and its `.env.example`;
- use the folder map to predict which files a feature touches, before looking.

This is the week that makes every later week easier. Everything else in the course is a closer look at one box in this week's diagram.

## 2. Concept primer

### Client and server

A **client** asks for something; a **server** answers. In ClinicQ the client is the React app running in your browser, and the server is the API running on Node.js. The same machine can run both (it does on your laptop), but they are still two separate programs that talk over the network.

Why split them? The browser is not trustworthy. Anyone can open the developer tools and change the JavaScript running in their own browser. So everything that must be true, like "you can only cancel your own appointment" or "this slot is free", is decided on the server, where users can't tamper with it. The client's job is to be pleasant to use; the server's job is to be correct.

### HTTP: the language they speak

Client and server talk in **HTTP**. Every conversation is one **request** and one **response**. This is a real ClinicQ request, as the browser sends it when Alice books an appointment:

```http
POST /api/appointments HTTP/1.1
Host: localhost:5173
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{"slotId":"5c2d6a81-a0b0-4a04-b038-53188e797253"}
```

It has four parts:

- **Method** (`POST`): what kind of action this is. **GET** reads something and changes nothing. **POST** creates something or triggers an action. You'll also meet **PUT**/**PATCH** (update) and **DELETE**; ClinicQ only needs GET and POST.
- **Path** (`/api/appointments`): which thing the request is about.
- **Headers**: extra information as `Name: value` lines. `Authorization` carries the login token (Week 6). `Content-Type` says the body is JSON.
- **Body**: the data being sent. GET requests have no body.

And the response:

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"appointment":{"id":"81c3b54c-...","status":"BOOKED","slot":{"startsAt":"2026-09-28T09:00:00.000Z", ...}}}
```

It has three parts:

- **Status code** (`201`): did it work? The first digit tells you the family.
  - **2xx**: success. `200 OK`, `201 Created`.
  - **4xx**: the client did something wrong. `400` bad input, `401` not logged in, `403` not allowed, `404` doesn't exist, `409` conflicts with the current state, `422` breaks a business rule.
  - **5xx**: the server broke. `500` is always a bug.
- **Headers**: information about the response.
- **Body**: the data, here the new appointment.

**Master:** the status code families. When a UAT tester says "it failed", the first question is "which status code?". A 4xx means the rules said no; a 5xx means something is broken.

HTTP is **stateless**: each request stands alone, and the server doesn't remember the previous one. That's why the browser sends the login token with every request instead of logging in once.

### URLs

```text
http://localhost:3000/api/doctors/2ef47b99-31f8-466c-ac6d-98652526ae06/slots?date=2026-09-28#top
└┬─┘   └───┬───┘ └┬─┘└───────────────────────┬────────────────────────────┘└──────┬──────┘└┬─┘
scheme    host   port                      path                                 query  fragment
```

- **scheme** (`http`): the protocol. `https` is the encrypted version, used on every real site.
- **host** (`localhost`): which machine.
- **port** (`3000`): which program on that machine (Week 0).
- **path** (`/api/doctors/…/slots`): which resource. Parts of a path can be variables. Here the long ID picks the doctor. In the code this is written `/:id/slots`, and `:id` is a **path parameter**.
- **query** (`?date=…`): optional filters, as `key=value` pairs joined with `&`. ClinicQ doesn't use any yet; this one is only for illustration.
- **fragment** (`#top`): a position within a page. It is never sent to the server.

### JSON

**JSON** (JavaScript Object Notation) is the text format ClinicQ's API uses for request and response bodies. It has only six kinds of value:

<!-- example -->

```json
{
  "doctor": {
    "id": "2ef47b99-31f8-466c-ac6d-98652526ae06",
    "name": "Dr. Amara Okafor",
    "specialty": "General Practice"
  },
  "slots": [
    {
      "id": "5c2d6a81-a0b0-4a04-b038-53188e797253",
      "startsAt": "2026-09-28T09:00:00.000Z",
      "endsAt": "2026-09-28T09:30:00.000Z"
    }
  ],
  "count": 1,
  "isFull": false,
  "note": null
}
```

- An **object** `{ }` holds named fields: `"name": value`.
- An **array** `[ ]` holds a list of values.
- A **string** is text in double quotes, like `"Dr. Amara Okafor"`. Dates are sent as strings in ISO 8601 format; the `Z` at the end means UTC.
- A **number**: `1`.
- A **boolean**: `true` or `false`.
- **null** means "no value".

The top three lines of this example match the real response from `GET /api/doctors/:id/slots`. `count`, `isFull` and `note` were added to show the other kinds of value.

### API: the contract between the two sides

An **API** (Application Programming Interface) is the list of requests a server accepts and what it returns for each. ClinicQ's API is documented in [`apps/api/README.md`](../../apps/api/README.md) as a table of **endpoints**: a method plus a path, like `POST /api/appointments`. The web app is one client of this API; the automated tests are another; `curl` in your terminal is a third.

ClinicQ follows **REST** conventions. URLs name _things_ (`/doctors`, `/appointments`), methods say what to do with them, and status codes report the outcome. `POST /api/appointments/:id/cancel` bends the convention slightly, because cancelling is an action rather than a thing. Teams make judgement calls like this all the time.

### The life of a request

This is the whole trip for the Doctors page. Each box is covered in a later week.

```mermaid
sequenceDiagram
    participant B as Browser<br/>(React, Week 7–8)
    participant V as Vite dev server<br/>(port 5173)
    participant E as Express API<br/>(port 3000, Weeks 3–4)
    participant P as Prisma + PostgreSQL<br/>(Week 5)

    B->>V: GET /api/doctors
    V->>E: forwards GET /api/doctors
    E->>E: security headers, CORS, JSON parsing, logging
    E->>E: route /api/doctors matched → controller → service
    E->>P: prisma.doctor.findMany(...)
    P-->>E: rows from the Doctor table
    E-->>V: 200 OK, {"doctors":[...]}
    V-->>B: same response
    B->>B: React draws the doctor cards
```

**Why is Vite in the middle?** The browser loaded the page from `localhost:5173`. Browsers are cautious about pages calling a _different_ address (a different **origin**), such as `localhost:3000`. So Vite forwards (**proxies**) anything under `/api` to the API. The browser only ever talks to one origin. In Docker, nginx plays the same role (Week 10).

## 3. Hands-on: watch requests

Start ClinicQ the Option B way (Week 0, section 4.2).

**In the browser.** Open Chrome's developer tools (`Cmd+Option+I`) → **Network** → **Fetch/XHR**. Reload the Doctors page and click the `doctors` row. Look at:

- **Headers**: the request URL, method and status code.
- **Response**: the JSON body.

Now log in as Alice and book a time. Click the `appointments` row. Under **Payload** you'll see the `slotId` the browser sent; under **Headers** you'll see `Authorization: Bearer …`.

**With `curl`.** `curl` sends HTTP requests from the terminal. `-i` shows the status line and headers, not just the body.

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/api/doctors
curl -i http://localhost:3000/api/doctors/not-a-real-id/slots     # 400: the id isn't a UUID
curl -i http://localhost:3000/api/appointments                    # 401: no token
```

Log in and keep the token:

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@clinicq.test","password":"Password123!"}'
```

Copy the long `token` value from the response, then:

```bash
TOKEN="paste-the-token-here"
curl -i http://localhost:3000/api/appointments -H "Authorization: Bearer $TOKEN"
curl -i http://localhost:3000/api/admin/appointments -H "Authorization: Bearer $TOKEN"   # 403: Alice isn't an admin
```

Each line ending in `\` continues on the next line. `-X POST` sets the method, `-H` adds a header and `-d` sends a body.

Watch the API's terminal while you do this: every request gets one log line with its method, URL, status code and how long it took.

## 4. Reading path

Read in this order. The first three tell you how the project is run; the rest show where the request above goes.

1. [`README.md`](../../README.md) (**master**). How to install, run and test. _Why projects have one:_ without it, setup lives in people's heads, and new starters (and AIs) guess.
2. [`package.json`](../../package.json) at the root (**master the scripts**). Declares the **workspaces** (`apps/*`, `docs`) and the scripts you run from the root. _Why:_ it's the project's command menu. Without it, everyone runs tools with slightly different options.
3. [`apps/api/package.json`](../../apps/api/package.json) and [`apps/web/package.json`](../../apps/web/package.json) (**master the idea, skim the list**). Each app's dependencies and scripts. _Why:_ they record exactly which libraries the code relies on, so `npm install` can reproduce the setup anywhere.
4. [`apps/api/.env.example`](../../apps/api/.env.example) (**master**). Every setting the API needs, with safe placeholder values. _Why:_ settings that differ per environment (database address, secrets) must not be written into the code. Without the example file, nobody knows which settings exist until the app crashes.
5. [`apps/api/README.md`](../../apps/api/README.md) (**master the endpoint and status-code tables**). The API contract. _Why:_ the frontend team, testers and other systems all need one agreed description of what the API does.
6. [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) (**skim**). The dev server and its `/api` proxy. _Why:_ without the proxy, the browser would block (or need special permission for) calls to a different origin.
7. [`apps/api/src/app.ts`](../../apps/api/src/app.ts) and [`apps/api/src/routes/index.ts`](../../apps/api/src/routes/index.ts) (**skim now, master in Week 3**). Where requests arrive in the API.
8. [`apps/web/src/api/doctors.ts`](../../apps/web/src/api/doctors.ts) and [`apps/web/src/api/client.ts`](../../apps/web/src/api/client.ts) (**skim now, master in Week 8**). Where requests leave the browser.
9. The [folder map](README.md#folder-map) (**use it all course**).

## 5. Block-by-block walkthrough

### The root `package.json`: workspaces and scripts

```json
  "workspaces": [
    "apps/*",
    "docs"
  ],
```

- **What it does:** it tells npm that this repo contains several packages: every folder under `apps/` (the API and the web app) plus `docs` (this course's website). One `npm install` at the root installs them all.
- **Syntax decoded:** this is JSON (see above). `"apps/*"` is a **glob pattern**: `*` means "any folder name".
- **Connects to:** [`apps/api/package.json`](../../apps/api/package.json), [`apps/web/package.json`](../../apps/web/package.json) and [`docs/package.json`](../../docs/package.json).
- **Dev-speak:** "It's a monorepo with npm workspaces: API, web and docs share one lockfile."

```json
    "dev:api": "npm run dev --workspace apps/api",
    "dev:web": "npm run dev --workspace apps/web",
```

```json
    "test": "npm run test --workspaces --if-present",
```

- **What it does:** these are **scripts**, names for commands. `npm run dev:api` from the root runs the `dev` script inside `apps/api`. `npm test` runs the `test` script in every workspace that has one.
- **Syntax decoded:** each script is `"name": "command"`. `--workspace apps/api` means "run this in that package". `--if-present` means "skip packages that don't have this script".
- **Connects to:** the `scripts` section of each app's `package.json`, below.
- **Dev-speak:** "Run `npm test` from the root; it fans out to every workspace."

### The API's `package.json`: scripts and dependencies

```json
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
```

- **What it does:** three ways of running the API.
  - `dev` runs the TypeScript source directly and restarts on every save.
  - `build` compiles TypeScript into plain JavaScript in `dist/`.
  - `start` runs that compiled JavaScript, which is how production runs it.
- **Syntax decoded:** `tsx` runs TypeScript without compiling first; `watch` restarts on changes. `tsc` is the TypeScript compiler. `-p` picks a settings file.
- **Connects to:** [`apps/api/src/server.ts`](../../apps/api/src/server.ts) (the entry point both run) and the `CMD` line in [`apps/api/Dockerfile`](../../apps/api/Dockerfile), which ends in `node dist/server.js`.
- **Dev-speak:** "Dev runs from source with hot reload; prod runs the compiled build."

```json
  "dependencies": {
    "@prisma/adapter-pg": "7.10.0",
    "@prisma/client": "7.10.0",
    "bcrypt": "6.0.0",
    "cors": "2.8.6",
    "dotenv": "18.0.4",
    "express": "5.2.1",
    "helmet": "8.3.0",
    "jsonwebtoken": "9.0.3",
    "pg": "8.23.0",
    "pino": "10.3.1",
    "pino-http": "11.0.0",
    "zod": "4.6.5"
  }
```

- **What it does:** it lists the libraries the API needs at runtime, each pinned to an exact version. `devDependencies`, just above it in the file, lists the tools needed only while developing: the test runner, TypeScript types and the Prisma command-line tool.
- **Syntax decoded:** `"name": "version"`. Versions use **semantic versioning**, `MAJOR.MINOR.PATCH`: a major bump (`4` → `5`) may break things; minor and patch bumps shouldn't. Names starting with `@` belong to an organisation (`@prisma/...`).
- **Connects to:** every `import ... from 'express'` (and so on) in `apps/api/src`. [`package-lock.json`](../../package-lock.json) records the exact versions of these libraries' own dependencies too.
- **Dev-speak:** "We pin exact versions; upgrades are deliberate PRs." You'll hear "bump Express" for an upgrade.

A rough guide to what each library does, so the names stop being noise: **express** receives HTTP requests; **zod** checks that data has the right shape; **@prisma/client**, **@prisma/adapter-pg** and **pg** talk to PostgreSQL; **bcrypt** hashes passwords; **jsonwebtoken** makes login tokens; **helmet** and **cors** add security headers; **pino** and **pino-http** write logs; **dotenv** loads `.env` files.

### `.env.example`: settings kept out of the code

```text
DATABASE_URL="postgresql://clinicq:clinicq@localhost:5432/clinicq"
```

```text
JWT_SECRET="replace-me-with-a-long-random-string-of-at-least-32-chars"
JWT_EXPIRES_IN=1h
```

```text
CORS_ORIGIN=http://localhost:5173
```

- **What it does:** it lists the **environment variables** the API reads when it starts: where the database is, the secret used to sign login tokens, how long a login lasts, and which web address may call the API. You copy it to `.env` and fill in real values; `.env` is ignored by Git.
- **Syntax decoded:** `NAME=value` per line; `#` starts a comment. `DATABASE_URL` is itself a URL: scheme `postgresql`, then `user:password@host:port/database`.
- **Connects to:** [`apps/api/src/config/env.ts`](../../apps/api/src/config/env.ts), which reads and checks these values (Week 4), and the `environment:` block of the `api` service in [`docker-compose.yml`](../../docker-compose.yml), which sets different values for Docker.
- **Dev-speak:** "Config comes from env vars. Twelve-factor style." ("Twelve-factor" is a well-known set of conventions for web apps; storing config in the environment is one of them.)

### `app.ts`: the first code a request meets

```ts
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);
```

- **What it does:** it wires the API's URLs.
  - `GET /health` answers `{"status":"ok"}`, so tools (Docker, monitoring) can check the API is alive.
  - Everything under `/api` goes to the API router.
  - Anything that matched nothing gets a 404.
  - Any error, from anywhere, goes to the error handler.
- **Syntax decoded:**
  - `app.get(path, handler)` means "for GET requests to this path, run this function".
  - `(_req, res) => { ... }` is an **arrow function** (Week 2). It receives the request and the response. The leading `_` in `_req` signals "I don't use this one".
  - `res.json(...)` sends a JSON response with status 200.
  - `app.use(...)` adds something that runs for every request that gets this far. Order matters: it's top to bottom.
- **Connects to:** [`routes/index.ts`](../../apps/api/src/routes/index.ts) (the `apiRouter`), [`middleware/notFound.ts`](../../apps/api/src/middleware/notFound.ts) and [`middleware/errorHandler.ts`](../../apps/api/src/middleware/errorHandler.ts).
- **Dev-speak:** "There's a health endpoint for the load balancer; everything else is mounted under `/api`, with a catch-all 404 and a central error handler."

### `routes/index.ts`: the table of contents

```ts
apiRouter.use('/auth', authRouter);
apiRouter.use('/doctors', doctorsRouter);
apiRouter.use('/appointments', appointmentsRouter);
apiRouter.use('/admin', adminRouter);
```

- **What it does:** it splits the API into four areas, each handled by its own file. A request to `/api/doctors/...` goes to the doctors router.
- **Syntax decoded:** `apiRouter.use(prefix, router)` means "requests starting with this prefix go to that router". Prefixes stack: `/api` (from `app.ts`) + `/doctors` (here) + `/:id/slots` (in `doctors.routes.ts`) = `/api/doctors/:id/slots`.
- **Connects to:** the four `*.routes.ts` files in [`apps/api/src/routes/`](../../apps/api/src/routes/).
- **Dev-speak:** "Routes are grouped by resource and mounted in the index."

### `vite.config.ts`: the proxy

```ts
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:3000';
```

```ts
    proxy: {
      '/api': apiTarget,
    },
```

- **What it does:** in development, any request the browser sends to `localhost:5173/api/...` is forwarded to `localhost:3000/api/...`. The E2E test sets `API_PROXY_TARGET` to point at its own API on port 3100 instead.
- **Syntax decoded:**
  - `process.env.API_PROXY_TARGET` reads an environment variable.
  - `??` means "if the left side is missing, use the right side".
  - `const` names a value that won't be reassigned (Week 2).
- **Connects to:** [`apps/web/playwright.config.ts`](../../apps/web/playwright.config.ts) (sets `API_PROXY_TARGET`) and [`apps/web/nginx.conf`](../../apps/web/nginx.conf) (does the same forwarding in Docker).
- **Dev-speak:** "Vite proxies `/api` in dev, so there are no CORS issues locally."

### `api/doctors.ts` and `client.ts`: where requests leave the browser

```ts
export function fetchDoctors() {
  return apiRequest<{ doctors: Doctor[] }>('/doctors');
}
```

```ts
response = await fetch(`/api${path}`, {
  method: options.method ?? 'GET',
  headers,
  body: options.body === undefined ? undefined : JSON.stringify(options.body),
});
```

- **What it does:** `fetchDoctors` asks the shared `apiRequest` helper for `/doctors`. The helper calls the browser's built-in `fetch`, with the path prefixed by `/api`, the method (GET unless told otherwise), the headers, and the body turned into JSON text.
- **Syntax decoded:** `` `/api${path}` `` is a **template string**: text in backticks where `${...}` inserts a value. `<{ doctors: Doctor[] }>` tells TypeScript what shape of JSON to expect back (Week 2). `await` waits for the response (Week 2).
- **Connects to:** [`pages/DoctorsPage.tsx`](../../apps/web/src/pages/DoctorsPage.tsx), which calls `fetchDoctors`, and the API's [`doctors.routes.ts`](../../apps/api/src/routes/doctors.routes.ts), which answers.
- **Dev-speak:** "All HTTP goes through one API client, so auth headers and error handling live in one place."

## 6. PA lens

**The API is where acceptance criteria become testable facts.** "The patient sees an error if the slot is taken" is a UI statement. Underneath it is a precise API behaviour: `POST /api/appointments` returns `409` with code `SLOT_ALREADY_BOOKED`. Writing ACs at both levels removes a lot of ambiguity:

<!-- example -->

```text
Given the slot is already booked by another patient
When I confirm the booking
Then I see "This time slot is already booked"
And the API responds 409 SLOT_ALREADY_BOOKED (no appointment is created)
```

**Refinement questions for this layer:**

- What is the endpoint (method and path)? What does the request body look like, and which fields are required?
- What does the response contain, and which screen uses which field?
- Which status code and error code for each unhappy path? Is it a 4xx (user can fix it) or can it be a 5xx?
- Does this endpoint need a login, and which roles may call it?
- Will the list grow large? Do we need filtering or paging (query parameters)?
- Are dates sent in UTC, and who converts them to local time?

**Typical UAT bugs that come from this layer:**

- **"It says error" with no detail.** Ask for the status code and the `code` field from the Network tab. That usually pins down the layer in seconds.
- **Frontend and API disagree on a field name** (`startTime` vs `startsAt`). The screen shows blank or "Invalid Date".
- **Times off by hours.** The API sends UTC (`...Z`) and the screen must convert it. Check whether the bug is in the data or in the display.
- **Stale data after an action.** The API succeeded (201), but the screen didn't reload the list.
- **401 vs 403 confusion.** A 401 means "log in again"; a 403 means "you're logged in but not allowed". Reporting the wrong one sends developers down the wrong path.
- **Works locally, fails in another environment.** Often a wrong or missing environment variable (`CORS_ORIGIN`, `DATABASE_URL`).

A strong API bug report includes the method, the path, the request body, the status code and the response body. The Network tab gives you all five.

## 7. Build with AI: add the server time to the health check

This week's change touches one line of API code and one test. The new skill is **predicting the HTTP response** before you run it.

### The spec

```markdown
## Story

As an operations engineer, I want the health check to report the server's current time,
so that I can spot servers whose clocks are wrong (cancellation rules depend on the time).

## Acceptance criteria

- Given the API is running, when I call GET /health,
  then I get 200 with JSON {"status":"ok","time":"<current time in ISO 8601 UTC>"}.
- The time ends in "Z" and is within a few seconds of the real time.
- Nothing else about the API changes.

## Out of scope

- Version numbers, database checks, uptime.

## Where I expect changes

- apps/api/src/app.ts (the /health handler)
- apps/api/tests/app.test.ts (the "reports health" test)

## How I'll test it

- Automated: npm test (the health test must check the new field).
- Manual: curl -i http://localhost:3000/health
```

### Example prompt

```text
In ClinicQ's API, GET /health is defined in apps/api/src/app.ts and tested in
apps/api/tests/app.test.ts ("reports health").

Change the response from {"status":"ok"} to {"status":"ok","time":"<ISO 8601 UTC>"},
using the current server time. Update the existing test so it checks that status is
"ok" and that time is a valid ISO date string within a few seconds of now.

Constraints: change only those two files; no new packages; keep the existing style.
Explain your plan in two sentences first, then make the change and show the diff.
```

### Checklist for reviewing the diff

- [ ] Only `app.ts` and `app.test.ts` changed.
- [ ] The handler still sends status 200 and still includes `status: 'ok'`.
- [ ] The time comes from `new Date().toISOString()` (or equivalent). That produces UTC with a trailing `Z`; a formatted local time would be wrong.
- [ ] The test no longer uses `toEqual({ status: 'ok' })` exactly (it would fail), but it didn't just delete the check either. It should check both fields.
- [ ] The test doesn't compare against an exact time string (that would fail randomly). It checks the format and closeness instead.

### How to test it

Predict first: write down the exact status line and body you expect. Then:

```bash
npm test --workspace apps/api
curl -i http://localhost:3000/health
```

Compare with your prediction. Run `curl` twice a few seconds apart; the time should change.

## 8. Vocabulary

| Term                  | Meaning, and where it shows up in ClinicQ                                                                             |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Client / server       | The side that asks and the side that answers. React in the browser asks; the Express API answers.                     |
| HTTP                  | The request/response protocol they use. Every call in the Network tab is one HTTP exchange.                           |
| Method                | The kind of request: GET reads, POST creates or acts. `GET /api/doctors`, `POST /api/appointments`.                   |
| Path / path parameter | The part of the URL naming the resource. `:id` in `/api/doctors/:id/slots` is filled with a real ID.                  |
| Query string          | Optional `?key=value` filters after the path. ClinicQ doesn't use any yet.                                            |
| Header                | A `Name: value` line of extra information, like `Authorization: Bearer <token>` and `Content-Type: application/json`. |
| Body                  | The data in a request or response, such as `{"slotId": "..."}` when booking.                                          |
| Status code           | A three-digit result. 201 booked, 401 not logged in, 409 slot taken, 422 rule broken, 500 bug.                        |
| JSON                  | The text format for bodies: objects, arrays, strings, numbers, booleans, null.                                        |
| API / endpoint        | The contract of requests the server accepts; one method + path is an endpoint. Listed in `apps/api/README.md`.        |
| Origin                | Scheme + host + port. `http://localhost:5173` and `http://localhost:3000` are different origins.                      |
| Proxy                 | A middleman that forwards requests: Vite in development, nginx in Docker.                                             |
| Workspace / monorepo  | One repo holding several packages that share one install: `apps/api`, `apps/web`, `docs`.                             |
| Dependency            | A library the code relies on, listed in `package.json`, like `express` and `zod`.                                     |
| Environment variable  | A setting supplied from outside the code, like `DATABASE_URL` and `JWT_SECRET` in `.env`.                             |

## 9. Quiz

1. A tester reports "booking fails". In the Network tab the booking request shows `422` with code `SLOT_IN_PAST`. Is this a bug? What do you check next?
2. Why must the rule "patients can only cancel their own appointments" be enforced in the API, even though the web app already hides other people's appointments?
3. In `http://localhost:5173/api/doctors`, which part does Vite forward, and to where?
4. What's the difference between `dependencies` and `devDependencies` in `apps/api/package.json`, and which list would `vitest` be in?
5. Name the method, path and expected status code for the request the browser makes when Alice cancels appointment `abc`.

<details>
<summary>Answers</summary>

1. Probably not a code bug: 422 means the API refused on purpose, because the slot's start time is not in the future. Check which slot was chosen and the current time (and time zone). If the slot was genuinely in the future, then check the server clock and the time zone handling. That's exactly what this week's Build with AI helps with.
2. The browser is under the user's control. Anyone can send a request with `curl` or edit the page's JavaScript, skipping the web app entirely. Only the server can enforce a rule.
3. The whole request to `/api/doctors` is forwarded unchanged to `http://localhost:3000/api/doctors`: same path, same method, same headers.
4. `dependencies` are needed when the API runs (Express, Prisma). `devDependencies` are only needed while developing and testing. `vitest` is a test runner, so it's a devDependency.
5. `POST /api/appointments/abc/cancel`. It returns `200` if it's hers and more than 2 hours away. (In practice `abc` would get `400` first, because IDs must be UUIDs.)

</details>

---

Next: [Week 2: TypeScript as it appears in ClinicQ](week-02.md)
