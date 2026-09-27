# ClinicQ API

Express + TypeScript REST API for ClinicQ, backed by PostgreSQL through Prisma.

## How a request flows

```
route  →  middleware (auth, role, validation)  →  controller  →  service  →  Prisma  →  PostgreSQL
                                                                     ↓
                                     errors thrown anywhere  →  errorHandler  →  JSON error response
```

| Folder / file          | Responsibility                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| `src/server.ts`        | Starts the HTTP server and shuts it down cleanly                 |
| `src/app.ts`           | Builds the Express app: security headers, CORS, JSON, logging    |
| `src/routes/`          | Maps URLs + HTTP methods to middleware and controllers           |
| `src/middleware/`      | Authentication, role checks, validation, 404 and error handling  |
| `src/controllers/`     | Reads the request, calls a service, sends the response           |
| `src/services/`        | Business logic and database access; the business rules live here |
| `src/schemas/`         | Zod schemas describing valid request bodies and URL params       |
| `src/config/env.ts`    | Reads and validates environment variables at startup             |
| `src/lib/`             | Shared Prisma client and logger                                  |
| `src/errors/`          | `HttpError`, the error type services throw on purpose            |
| `prisma/schema.prisma` | Database tables, relations and constraints                       |
| `prisma/migrations/`   | SQL that creates/changes the tables, in order                    |
| `prisma/seed.ts`       | Sample doctors, slots, users and appointments                    |
| `tests/`               | Vitest + Supertest tests                                         |

## Endpoints

All responses are JSON. Errors look like `{ "error": { "code": "SLOT_ALREADY_BOOKED", "message": "..." } }`.
Authenticated routes need the header `Authorization: Bearer <token>` (the token comes from register or login).

| Method | Path                           | Who       | What                                       |
| ------ | ------------------------------ | --------- | ------------------------------------------ |
| GET    | `/health`                      | anyone    | Is the API up?                             |
| POST   | `/api/auth/register`           | anyone    | Create a patient account; returns a token  |
| POST   | `/api/auth/login`              | anyone    | Log in; returns a token                    |
| GET    | `/api/auth/me`                 | logged in | The current user                           |
| GET    | `/api/doctors`                 | anyone    | Doctors with specialties                   |
| GET    | `/api/doctors/:id/slots`       | anyone    | A doctor and their future, unbooked slots  |
| GET    | `/api/appointments`            | patient   | My appointments                            |
| POST   | `/api/appointments`            | patient   | Book: body `{ "slotId": "..." }`           |
| POST   | `/api/appointments/:id/cancel` | patient   | Cancel one of my appointments              |
| GET    | `/api/admin/appointments`      | admin     | Every appointment, with patient and status |

## Status codes and error codes

| Status | Code(s)                                                                    | Meaning                                 |
| ------ | -------------------------------------------------------------------------- | --------------------------------------- |
| 400    | `VALIDATION_ERROR`, `INVALID_JSON`                                         | The request is malformed                |
| 401    | `UNAUTHENTICATED`, `INVALID_TOKEN`, `INVALID_CREDENTIALS`                  | Not logged in, or bad login             |
| 403    | `FORBIDDEN`, `NOT_YOUR_APPOINTMENT`                                        | Logged in but not allowed               |
| 404    | `NOT_FOUND`, `DOCTOR_NOT_FOUND`, `SLOT_NOT_FOUND`, `APPOINTMENT_NOT_FOUND` | It doesn't exist                        |
| 409    | `EMAIL_TAKEN`, `SLOT_ALREADY_BOOKED`, `ALREADY_CANCELLED`                  | Conflicts with the current state        |
| 422    | `SLOT_IN_PAST`, `CANCELLATION_WINDOW_PASSED`                               | Well-formed, but breaks a business rule |
| 500    | `INTERNAL_ERROR`                                                           | A bug; details are in the server log    |

## Scripts

```bash
npm run dev          # start with auto-reload (tsx watch)
npm run build        # compile to dist/
npm start            # run the compiled build
npm test             # run the tests against the clinicq_test database
npm run db:migrate   # create/apply migrations in development
npm run db:deploy    # apply existing migrations (CI, production)
npm run db:seed      # wipe and reload sample data
npm run db:reset     # drop everything, re-apply migrations
```

## Tests

Tests run against a separate database configured in `.env.test` (`clinicq_test`), which is
committed because it only contains local, non-secret values. Before the run, pending migrations are
applied to it; each test then empties the tables so tests don't affect each other.
