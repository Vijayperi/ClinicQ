# ClinicQ web

React single-page app for ClinicQ, built with Vite and React Router. It talks to the API only through
`/api/...` URLs: in development Vite forwards them to `http://localhost:3000`; in Docker nginx forwards
them to the `api` container.

## Pages

| URL                  | Who     | Page                                                 |
| -------------------- | ------- | ---------------------------------------------------- |
| `/login`             | anyone  | Log in                                               |
| `/register`          | anyone  | Create a patient account                             |
| `/doctors`           | anyone  | Doctors and their specialties                        |
| `/doctors/:doctorId` | patient | A doctor's available times; pick one and confirm     |
| `/appointments`      | patient | My upcoming, past and cancelled appointments; cancel |
| `/admin`             | admin   | Every appointment with patient and status; filter    |
| `/`                  | anyone  | Redirects to the right starting page for the user    |

## Folder map

| Path                          | Responsibility                                                             |
| ----------------------------- | -------------------------------------------------------------------------- |
| `index.html`                  | The one HTML page; React fills in `<div id="root">`                        |
| `src/main.tsx`                | Starts React and wraps the app in the router and auth provider             |
| `src/App.tsx`                 | The route table: which URL shows which page, and which are protected       |
| `src/pages/`                  | One component per page                                                     |
| `src/components/`             | Shared pieces: layout, loading, error, empty state, status badge           |
| `src/auth/AuthContext.tsx`    | Who is logged in; login, register and logout for the whole app             |
| `src/auth/ProtectedRoute.tsx` | Sends logged-out users to login and wrong-role users to their home page    |
| `src/api/`                    | Functions that call the API; `client.ts` adds the token and handles errors |
| `src/hooks.ts`                | `useApiData`: load data with loading and error states                      |
| `src/utils/`                  | Date formatting and the "can this be cancelled?" check                     |
| `src/types.ts`                | The shapes of the data the API returns                                     |
| `src/styles.css`              | All styling, with colours defined once at the top                          |
| `e2e/`                        | Playwright end-to-end test                                                 |
| `nginx.conf`, `Dockerfile`    | How the built site is served in Docker                                     |

## Scripts

```bash
npm run dev        # dev server on http://localhost:5173 (needs the API running)
npm run build      # typecheck, then build static files into dist/
npm test           # unit tests (Vitest)
npm run test:e2e   # Playwright: starts its own API + web servers against clinicq_e2e
```
