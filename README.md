# Personal Finance Application

An open-source personal finance tracker that mirrors the structure of a Notion-based budget system. Track your **Income**, **Expenses**, and **Investments** on a month-by-month basis, with a consolidated **Yearly Overview** for a full-year financial picture.

Fully responsive across **mobile**, **tablet**, and **desktop** devices.

---

## Features

- **Monthly View** — Track income, expenses, and investments per month with add/edit/delete support
- **Yearly Overview** — Summary cards, monthly breakdown table, and charts (bar, pie, line)
- **Custom Lookup Lists** — Personalize income sources, expense categories, and investment types from the Settings page
- **JWT Auth** — Secure registration and login
- **INR Default Currency** — Configurable per user

---

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Backend    | Python 3.12+, FastAPI, PostgreSQL, SQLAlchemy, Alembic  |
| Frontend   | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui     |
| State      | TanStack Query, React Router v6, React Hook Form + Zod  |
| Charts     | Recharts                                                |
| DevOps     | Docker, Docker Compose                                  |

---

## Getting Started

For a complete step-by-step walkthrough — including installing Python, Node.js, PostgreSQL, and Docker — see the **[Installation Guide](./INSTALLATION.md)**.

### Quick start (Docker)

```bash
git clone https://github.com/aravinth2k/Personal-Finance-Tracker.git
cd Personal-Finance-Tracker

cp backend/.env.example backend/.env   # set SECRET_KEY inside
cp frontend/.env.example frontend/.env

docker compose up --build
docker compose exec backend alembic upgrade head
```

| Service            | URL                        |
|--------------------|----------------------------|
| Frontend           | http://localhost:5173      |
| Backend API        | http://localhost:8000      |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Project Structure

```
personal-finance-app/
├── backend/          # FastAPI app, models, CRUD, migrations
├── frontend/         # React + TypeScript app
├── docker-compose.yml
├── INSTALLATION.md   # Full setup guide
└── README.md
```

See [CLAUDE.md](./CLAUDE.md) for detailed schema, API reference, and development phases.

---

## API Overview

- `POST /api/v1/auth/register` — Register
- `POST /api/v1/auth/login` — Login (returns JWT)
- `GET/POST/PUT/DELETE /api/v1/income` — Income entries
- `GET/POST/PUT/DELETE /api/v1/expenses` — Expense entries
- `GET/POST/PUT/DELETE /api/v1/investments` — Investment entries
- `GET/POST/PUT/DELETE /api/v1/settings/income-sources` — Custom income sources
- `GET/POST/PUT/DELETE /api/v1/settings/expense-categories` — Custom expense categories
- `GET/POST/PUT/DELETE /api/v1/settings/investment-types` — Custom investment types
- `GET /api/v1/overview?year=` — Yearly summary
- `GET /api/v1/overview/month?month=&year=` — Monthly summary

Full interactive docs available at `/docs` when the backend is running.

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and open a pull request against the `main` branch.

- **Branch naming:** `feat/`, `fix/`, `chore/`, `docs/`
- **Commit style:** [Conventional Commits](https://www.conventionalcommits.org/) — one logical change per commit

---

## License

[MIT](./LICENSE)
