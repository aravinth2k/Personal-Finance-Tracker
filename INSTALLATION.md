# Installation Guide

This guide walks you through every step to get the Personal Finance Tracker running locally — from installing the required tools to opening the app in your browser.

Two installation paths are available:

| Method | Best for |
|--------|----------|
| [Method A — Docker](#method-a--docker-recommended) | Quickest setup, no manual DB config needed |
| [Method B — Manual](#method-b--manual-setup) | Running without Docker, full control over each service |

---

## Prerequisites

Install the following tools before proceeding.

### 1. Git

Used to clone the repository.

- **Download:** https://git-scm.com/downloads
- **Verify:** `git --version` → should print `git version 2.x.x`

---

### 2. Python 3.12+

Required for the backend *(skip if using Docker)*.

- **Download:** https://www.python.org/downloads/
- During installation on Windows, check **"Add Python to PATH"**
- **Verify:**
  ```bash
  python --version    # or python3 --version
  # Expected: Python 3.12.x
  ```

---

### 3. Node.js 20+ (includes npm)

Required for the frontend *(skip if using Docker)*.

- **Download:** https://nodejs.org/ — choose the **LTS** release
- **Verify:**
  ```bash
  node --version   # Expected: v20.x.x
  npm --version    # Expected: 10.x.x
  ```

---

### 4. PostgreSQL 16+

Required as the database *(skip if using Docker — it spins one up automatically)*.

- **Download:** https://www.postgresql.org/download/
- During installation, note the **superuser password** you set for the `postgres` user
- Default port: `5432`
- **Verify:**
  ```bash
  psql --version   # Expected: psql (PostgreSQL) 16.x
  ```

---

### 5. Docker & Docker Compose *(Method A only)*

- **Download:** https://www.docker.com/products/docker-desktop/
- Docker Desktop includes Docker Compose
- **Verify:**
  ```bash
  docker --version           # Expected: Docker version 24.x.x
  docker compose version     # Expected: Docker Compose version v2.x.x
  ```

---

## Clone the Repository

```bash
git clone https://github.com/aravinth2k/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker
```

---

## Method A — Docker (Recommended)

The fastest way to run the full stack (PostgreSQL + backend + frontend) with a single command.

### Step 1 — Create environment files

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Open `backend/.env` and set a strong secret key:

```env
DATABASE_URL=postgresql://finance_user:finance_pass@postgres:5432/finance_db
SECRET_KEY=replace-this-with-a-long-random-string-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> The `DATABASE_URL` host is `postgres` (the Docker service name), not `localhost`.

`frontend/.env` can be left as-is:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Step 2 — Build and start all services

```bash
docker compose up --build
```

First run downloads images and installs dependencies — this takes a few minutes.
Database migrations run automatically on every startup — watch the backend logs for `Running Alembic migrations...` then `Starting server...`.

### Step 3 — Open the app

| Service        | URL                        |
|----------------|----------------------------|
| Frontend       | http://localhost:5173      |
| Backend API    | http://localhost:8000      |
| API Docs (Swagger) | http://localhost:8000/docs |

### Stopping the app

```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop containers AND delete database volume (data lost)
```

---

## Data Persistence

The database is stored in the `postgres_data` named Docker volume on your host machine — completely independent of the containers themselves.

| Command | Containers | Volume | Data |
|---------|------------|--------|------|
| `docker compose down` | Stopped | Kept | Safe |
| `docker compose down -v` | Stopped | **Deleted** | **Lost** |
| `docker compose up` (after down) | Restarted | Reused | Restored |
| `make db-backup` | Running | Untouched | Dumped to `.sql` file |

> **Warning:** `docker compose down -v` permanently deletes all your data. Use `make db-backup` first if you need to preserve it.

---

## Makefile Commands

A `Makefile` is included for common dev tasks (requires `make` to be installed):

| Command | Description |
|---------|-------------|
| `make up` | Build and start all services |
| `make down` | Stop all containers |
| `make logs` | Tail backend logs |
| `make shell` | Open a shell inside the backend container |
| `make db-shell` | Open a psql session in the postgres container |
| `make db-backup` | Dump the database to a timestamped `.sql` file in the project root |
| `make db-restore FILE=backup.sql` | Restore the database from a `.sql` file |

---

## Method B — Manual Setup

Run each service directly on your machine without Docker.

### Step 1 — Create the PostgreSQL database

Open a terminal and connect to PostgreSQL:

```bash
psql -U postgres
```

Run the following SQL commands:

```sql
CREATE USER finance_user WITH PASSWORD 'finance_pass';
CREATE DATABASE finance_db OWNER finance_user;
GRANT ALL PRIVILEGES ON DATABASE finance_db TO finance_user;
\q
```

---

### Step 2 — Set up the backend

#### 2a — Create and activate a virtual environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

Your prompt should now show `(venv)`.

#### 2b — Install Python dependencies

```bash
pip install -r requirements.txt
```

#### 2c — Configure environment variables

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://finance_user:finance_pass@localhost:5432/finance_db
SECRET_KEY=replace-this-with-a-long-random-string-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

> For the secret key, you can generate one with:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

#### 2d — Run database migrations

```bash
alembic upgrade head
```

#### 2e — Start the backend server

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now running at **http://localhost:8000**.
Interactive docs are available at **http://localhost:8000/docs**.

---

### Step 3 — Set up the frontend

Open a **new terminal** (keep the backend terminal running).

#### 3a — Install Node dependencies

```bash
cd frontend
npm install
```

#### 3b — Configure environment variables

```bash
cp .env.example .env
```

`frontend/.env` can be left as-is:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

#### 3c — Start the frontend dev server

```bash
npm run dev
```

The frontend is now running at **http://localhost:5173**.

---

## Verify Everything Works

1. Open **http://localhost:5173** — you should see the app landing screen
2. Open **http://localhost:8000/docs** — you should see the Swagger API explorer
3. Call the health check:
   ```bash
   curl http://localhost:8000/health
   # Expected: {"status":"ok"}
   ```

---

## Troubleshooting

### `psycopg2` fails to install (Manual setup)
Install the system PostgreSQL client libraries first:
```bash
# Ubuntu/Debian
sudo apt-get install libpq-dev

# macOS (Homebrew)
brew install postgresql
```

### Port already in use
Change the port in the relevant command:
```bash
uvicorn app.main:app --reload --port 8001   # backend
npm run dev -- --port 5174                  # frontend
```

### Docker — permission denied on Linux
Add your user to the `docker` group:
```bash
sudo usermod -aG docker $USER
# then log out and back in
```

### `alembic upgrade head` — connection refused
Make sure PostgreSQL is running:
```bash
# Windows — check Services or:
pg_ctl start -D "C:\Program Files\PostgreSQL\16\data"

# macOS (Homebrew)
brew services start postgresql@16

# Linux
sudo systemctl start postgresql
```

### Frontend shows blank page / API errors
Ensure `VITE_API_BASE_URL` in `frontend/.env` points to the correct backend URL and the backend is running.

---

## What's Next?

Once the app is running, you can:

- Register a new account at **http://localhost:5173/register**
- Log in and start tracking your income, expenses, and investments
- Explore the API at **http://localhost:8000/docs**
