# ClinicQ

ClinicQ is a small clinic appointment booking app, built the way a production app would be. It is also the textbook for a hands-on code-literacy course: each week reads one layer of this codebase. **Start the course at [docs/course/README.md](docs/course/README.md).**
or access the course using the public github pages link [Reading ClinicQ : Learn by reverse engineering](https://vijayperi.github.io/ClinicQ/)

Patients register, browse doctors, book a free time slot, see their appointments and cancel them. Admins see every appointment and its status.

## Business rules

- A doctor's slot can't be double-booked.
- Appointments can't be booked in the past.
- Patients can cancel only their own appointments, and only more than 2 hours before the start time.
- Admins see everything.

## Repository layout

| Path                         | What it is                                                         |
| ---------------------------- | ------------------------------------------------------------------ |
| `apps/api`                   | Backend: Node.js + Express + Prisma (PostgreSQL). See its README.  |
| `apps/web`                   | Frontend: React + Vite + React Router. See its README.             |
| `apps/web/e2e`               | The Playwright end-to-end test                                     |
| `docker-compose.yml`         | Runs the database, API and web app together in Docker              |
| `docker/db/init`             | SQL that creates the test databases the first time Postgres starts |
| `.github/workflows/ci.yml`   | GitHub Actions: lint, typecheck, tests, build, E2E, Docker build   |
| `.github/workflows/docs.yml` | GitHub Actions: publishes the course website to GitHub Pages       |
| `package.json`               | npm workspaces root; scripts that run across every app             |
| `eslint.config.js`           | Lint rules shared by all apps                                      |
| `.prettierrc.json`           | Code formatting rules                                              |
| `tsconfig.base.json`         | TypeScript settings shared by all apps                             |
| `PROGRESS.md`                | Session log: what was built, decisions, versions, known issues     |
| `docs/course`                | The course lessons (Markdown): start at `docs/course/README.md`    |
| `docs/.vitepress`            | The course website (VitePress) built from those lessons            |

## Read the course

The course lives in [`docs/course/`](docs/course/README.md) and reads fine on GitHub. For the best experience (sidebar, search, diagrams, previous/next), run it as a website:

```bash
npm install
npm run dev:docs      # course website on http://localhost:5180
```

To publish it online, switch on GitHub Pages once: repository **Settings → Pages → Build and deployment → Source: GitHub Actions**. After that, every merge to `main` publishes the site at `https://<your-github-username>.github.io/ClinicQ/` (the **Course website** workflow in the Actions tab shows the exact URL).

## Install the tools (once)

You need four things. Each link has a Windows and a Mac installer.

| Tool           | Why                                            | Windows                                                                                                 | Mac                                                                                                  |
| -------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Git            | Download the code and track changes            | Install [Git for Windows](https://git-scm.com/download/win). It includes **Git Bash**.                  | Run `xcode-select --install` in Terminal, or `brew install git`                                      |
| Node.js 22 LTS | Runs the API, the web dev server, tests        | Installer from [nodejs.org](https://nodejs.org) (choose 22.x LTS)                                       | Installer from [nodejs.org](https://nodejs.org), or `brew install node@22`                           |
| Docker Desktop | Runs PostgreSQL (and optionally the whole app) | [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/). Accept the WSL 2 prompt. | [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/). Pick Apple chip or Intel. |
| VS Code        | Read and edit the code                         | [code.visualstudio.com](https://code.visualstudio.com)                                                  | [code.visualstudio.com](https://code.visualstudio.com)                                               |

Check them in a terminal (on Windows use **PowerShell** or **Git Bash**; on Mac use **Terminal**):

```bash
git --version
node -v        # must be v22.22 or newer
npm -v
docker --version
```

Docker Desktop must be **running** (whale icon in the taskbar or menu bar) before any `docker` command works.

## Get the code

```bash
git clone https://github.com/Vijayperi/ClinicQ.git
cd ClinicQ
```

Windows only: if Git asks about line endings, keep the default. The repo's `.gitattributes` makes sure files are checked out with Linux-style line endings, which Docker needs.

## Option A: run everything in Docker (quickest way to click around)

```bash
docker compose up --build
```

The first build takes a few minutes. When the logs settle, open a **second** terminal in the same folder and load the sample data:

```bash
npm run docker:seed
```

Then open **http://localhost:8080**. Stop everything with `Ctrl+C`, or `docker compose down` from another terminal. `docker compose down -v` also deletes the database.

## Option B: run the apps on your machine (for development)

This is the setup you'll use while reading and changing code. Docker runs only the database; the API and web app run directly with Node, and reload when you save a file.

**1. Start the database**

```bash
docker compose up -d db
```

This starts PostgreSQL on port 5432 with a user `clinicq` (password `clinicq`) and three databases: `clinicq` (development), `clinicq_test` (API tests) and `clinicq_e2e` (end-to-end test).

**2. Install dependencies**

```bash
npm install
```

**3. Create the API's settings file**

Mac, Git Bash or Linux:

```bash
cp apps/api/.env.example apps/api/.env
```

Windows PowerShell:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` and replace `JWT_SECRET` with a long random string. This command prints one:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**4. Create the tables and load sample data**

```bash
npm run db:migrate
npm run db:seed
```

**5. Start the API and the web app, each in its own terminal**

```bash
npm run dev:api     # API on http://localhost:3000
```

```bash
npm run dev:web     # web app on http://localhost:5173
```

Open **http://localhost:5173**.

## Sample accounts

| Email                | Password     | Role    |
| -------------------- | ------------ | ------- |
| `admin@clinicq.test` | Admin123!    | Admin   |
| `alice@clinicq.test` | Password123! | Patient |
| `bob@clinicq.test`   | Password123! | Patient |

The seed creates slots for the 7 days after the day you run it. Run it again to get fresh future slots. It deletes all existing data first.

## Everyday commands (run from the repo root)

```bash
npm test               # API and web tests, plus the lesson checks (needs the database running)
npm run test:e2e       # the browser test: log in → book → view → cancel
npm run lint           # check code for common mistakes
npm run format         # auto-format all files
npm run typecheck      # check TypeScript types without building
npm run build          # compile the API, build the web app and the course website
```

The first time you run `npm run test:e2e`, download the browser it uses:

```bash
npx playwright install chromium
```

## Continuous integration

Every pull request and every push to `main` runs `.github/workflows/ci.yml` on GitHub. It has three jobs: lint, format check, typecheck, unit/API tests and build; the Playwright E2E test; and a build of both Docker images. A red cross on the PR means one of them failed; click it to see which step.

## Troubleshooting

- **`port 5432 is already allocated`** or **`address already in use`**: another PostgreSQL is running on your machine. Stop it, or start Docker's on another port: `DB_PORT=5433 docker compose up -d db` (Mac/Git Bash), or `$env:DB_PORT=5433; docker compose up -d db` (PowerShell). Then change `5432` to `5433` in `apps/api/.env` and `apps/api/.env.test`.
- **`Invalid environment variables`** when the API starts: `apps/api/.env` is missing or `JWT_SECRET` is shorter than 32 characters.
- **No available times for any doctor**: the seed data is more than a week old. Run `npm run db:seed` again.
- **Windows: `npm` scripts fail with "running scripts is disabled"** in PowerShell: run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use Git Bash.
- **`docker: command not found`** or **cannot connect to the Docker daemon**: open Docker Desktop and wait until it says it's running.
