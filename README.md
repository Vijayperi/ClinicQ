# ClinicQ

ClinicQ is a small clinic appointment booking app, built the way a production app would be. It is also the textbook for a hands-on code-literacy course (coming in `docs/course/`): each week reads one layer of this codebase.

Patients register, browse doctors, book a free time slot, see their appointments and cancel them. Admins see every appointment.

## Business rules

- A doctor's slot can't be double-booked.
- Appointments can't be booked in the past.
- Patients can cancel only their own appointments, and only more than 2 hours before the start time.
- Admins see everything.

## Repository layout

| Path                 | What it is                                                        |
| -------------------- | ----------------------------------------------------------------- |
| `apps/api`           | Backend: Node.js + Express + Prisma (PostgreSQL). See its README. |
| `apps/web`           | Frontend: React + Vite (not built yet)                            |
| `docs/course`        | The course lessons (not written yet)                              |
| `package.json`       | npm workspaces root; scripts that run across every app            |
| `eslint.config.js`   | Lint rules shared by all apps                                     |
| `.prettierrc.json`   | Code formatting rules                                             |
| `tsconfig.base.json` | TypeScript settings shared by all apps                            |
| `PROGRESS.md`        | Session log: what was built, decisions, versions, known issues    |

## Prerequisites

- Node.js 22.12 or newer (`node -v`)
- PostgreSQL 16 running locally (Docker setup comes in a later session)

## Getting started

```bash
# 1. Install dependencies for every app (also generates the Prisma client)
npm install

# 2. Create a database user and two databases: one for development, one for tests
psql -U postgres -c "CREATE USER clinicq WITH PASSWORD 'clinicq' CREATEDB;"
psql -U postgres -c "CREATE DATABASE clinicq OWNER clinicq;"
psql -U postgres -c "CREATE DATABASE clinicq_test OWNER clinicq;"

# 3. Configure the API
cp apps/api/.env.example apps/api/.env   # then set JWT_SECRET to a long random string

# 4. Create the tables and load sample data
npm run db:migrate --workspace apps/api
npm run db:seed --workspace apps/api

# 5. Start the API on http://localhost:3000
npm run dev:api
```

Sample accounts created by the seed:

| Email                | Password     | Role    |
| -------------------- | ------------ | ------- |
| `admin@clinicq.test` | Admin123!    | Admin   |
| `alice@clinicq.test` | Password123! | Patient |
| `bob@clinicq.test`   | Password123! | Patient |

The seed creates slots for the 7 days after the day you run it. Run it again to get fresh future slots (it wipes existing data first).

## Everyday commands (from the repo root)

```bash
npm test               # run all tests (uses the clinicq_test database)
npm run lint           # check code for common mistakes
npm run format         # auto-format all files
npm run typecheck      # check TypeScript types without building
npm run build          # compile TypeScript to JavaScript in dist/
```
