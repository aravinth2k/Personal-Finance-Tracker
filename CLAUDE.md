# Personal Finance Application — Project Plan

## Overview

An open-source personal finance tracker that mirrors the structure of a Notion-based budget system. Users can record and track their **Income**, **Expenses**, and **Investments** on a month-by-month basis, with a consolidated **Yearly Overview** tab for a full-year financial picture.

Designed to be fully responsive and usable across **mobile**, **tablet**, and **desktop** devices.

---

## Tech Stack

### Backend
- **Runtime:** Python 3.12+
- **Framework:** FastAPI
- **Database:** PostgreSQL (via SQLAlchemy ORM + Alembic for migrations)
- **Auth:** JWT-based authentication (python-jose + passlib)
- **Validation:** Pydantic v2
- **Server:** Uvicorn

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (responsive-first utility classes)
- **State Management:** TanStack Query (React Query) for server state
- **Routing:** React Router v6
- **Charts:** Recharts (for overview/summary visualizations)
- **UI Components:** shadcn/ui (accessible, unstyled base components)
- **Forms:** React Hook Form + Zod

### Infrastructure / DevOps
- **Containerization:** Docker + Docker Compose (postgres, backend, frontend)
- **API Docs:** Auto-generated via FastAPI (Swagger UI at `/docs`)
- **Env Management:** `.env` files (`.env.example` committed, `.env` gitignored)

---

## Project Structure

```
personal-finance-app/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── routes/
│   │   │       │   ├── auth.py
│   │   │       │   ├── income.py
│   │   │       │   ├── expenses.py
│   │   │       │   ├── investments.py
│   │   │       │   ├── settings.py      # User-customizable lookup options
│   │   │       │   └── overview.py
│   │   │       └── __init__.py
│   │   ├── core/
│   │   │   ├── config.py        # Settings via pydantic-settings
│   │   │   ├── database.py      # SQLAlchemy engine + session
│   │   │   └── security.py      # JWT helpers
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── income.py
│   │   │   ├── expense.py
│   │   │   ├── investment.py
│   │   │   └── lookup.py        # income_sources, expense_categories, investment_types
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   │   ├── income.py
│   │   │   ├── expense.py
│   │   │   ├── investment.py
│   │   │   ├── lookup.py
│   │   │   └── overview.py
│   │   ├── crud/                # DB query logic
│   │   │   ├── income.py
│   │   │   ├── expense.py
│   │   │   ├── investment.py
│   │   │   └── lookup.py
│   │   └── main.py              # FastAPI app entry point
│   ├── alembic/                 # DB migrations
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios/fetch wrappers per resource
│   │   ├── components/
│   │   │   ├── layout/          # Sidebar, Navbar, MobileNav
│   │   │   ├── income/
│   │   │   ├── expenses/
│   │   │   ├── investments/
│   │   │   ├── settings/        # Manage lookup option lists
│   │   │   └── overview/
│   │   ├── pages/
│   │   │   ├── Overview.tsx
│   │   │   ├── MonthDetail.tsx  # Income + Expenses + Investments tabs
│   │   │   ├── Settings.tsx     # Manage income sources, categories, investment types
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── hooks/               # Custom React Query hooks
│   │   ├── store/               # Auth state (Zustand or Context)
│   │   ├── types/               # TypeScript interfaces
│   │   ├── utils/               # Formatters, currency helpers
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
├── LICENSE                      # MIT
├── INSTALLATION.md              # Full step-by-step setup guide
└── README.md
```

---

## Database Schema

### Design Note — User-Customizable Lookup Tables

`income_sources`, `expense_categories`, and `investment_types` are stored as dedicated tables
per user instead of hardcoded enums. Each table is seeded with sensible defaults on user
registration. Users can add, rename, or delete their own options from the Settings page.
The `income`, `expenses`, and `investments` tables reference these via FK.

`risk_type` on investments is a fixed system enum (Low / Medium / High / Very High) and
is not user-customizable.

---

### users
| Column        | Type      | Notes        |
|--------------|-----------|--------------|
| id           | UUID (PK) |              |
| email        | VARCHAR   | unique       |
| name         | VARCHAR   |              |
| password_hash | VARCHAR  |              |
| currency     | VARCHAR   | default: INR |
| created_at   | TIMESTAMP |              |

---

### income_sources *(user-customizable)*
| Column     | Type      | Notes                                                         |
|-----------|-----------|---------------------------------------------------------------|
| id        | UUID (PK) |                                                               |
| user_id   | UUID (FK) | → users.id                                                    |
| name      | VARCHAR   | e.g. Salary, Freelance, Bonus, Dividend, Bond Interest, Investment Returns, Other |
| is_default | BOOLEAN  | True for system-seeded defaults; user can still edit/delete   |
| created_at | TIMESTAMP |                                                              |

### expense_categories *(user-customizable)*
| Column     | Type      | Notes                                                         |
|-----------|-----------|---------------------------------------------------------------|
| id        | UUID (PK) |                                                               |
| user_id   | UUID (FK) | → users.id                                                    |
| name      | VARCHAR   | e.g. Food & Dining, Rent/Housing, Transportation, Healthcare, Shopping, Entertainment, Utilities, Insurance, Travel, Tour, Self Care, Self Development, Internet Bill, Parents Health, Parents Household, Donation, Wedding/Birthday Gift, Other |
| is_default | BOOLEAN  | True for system-seeded defaults; user can still edit/delete   |
| created_at | TIMESTAMP |                                                              |

### investment_types *(user-customizable)*
| Column     | Type      | Notes                                                         |
|-----------|-----------|---------------------------------------------------------------|
| id        | UUID (PK) |                                                               |
| user_id   | UUID (FK) | → users.id                                                    |
| name      | VARCHAR   | e.g. Stocks, Mutual Fund, Gold, Bonds, PPF, Index SENSEX      |
| is_default | BOOLEAN  | True for system-seeded defaults; user can still edit/delete   |
| created_at | TIMESTAMP |                                                              |

---

### income
| Column           | Type      | Notes                            |
|-----------------|-----------|----------------------------------|
| id              | UUID (PK) |                                  |
| user_id         | UUID (FK) | → users.id                       |
| name            | VARCHAR   | Entry title                      |
| amount          | NUMERIC(12,2) |                              |
| date            | DATE      |                                  |
| month           | INTEGER   | 1–12                             |
| year            | INTEGER   |                                  |
| income_source_id | UUID (FK) | → income_sources.id             |
| description     | TEXT      | nullable                         |
| created_at      | TIMESTAMP |                                  |

### expenses
| Column              | Type      | Notes                              |
|--------------------|-----------|-------------------------------------|
| id                 | UUID (PK) |                                     |
| user_id            | UUID (FK) | → users.id                          |
| name               | VARCHAR   | Entry title                         |
| amount             | NUMERIC(12,2) |                                 |
| date               | DATE      |                                     |
| month              | INTEGER   | 1–12                                |
| year               | INTEGER   |                                     |
| expense_category_id | UUID (FK) | → expense_categories.id            |
| expense_type       | VARCHAR   | Need / Want (fixed enum, not customizable) |
| description        | TEXT      | nullable                            |
| created_at         | TIMESTAMP |                                     |

### investments
| Column              | Type      | Notes                                                    |
|--------------------|-----------|----------------------------------------------------------|
| id                 | UUID (PK) |                                                          |
| user_id            | UUID (FK) | → users.id                                               |
| name               | VARCHAR   | Entry title                                              |
| amount             | NUMERIC(12,2) |                                                      |
| date               | DATE      |                                                          |
| month              | INTEGER   | 1–12                                                     |
| year               | INTEGER   |                                                          |
| investment_type_id | UUID (FK) | → investment_types.id                                    |
| risk_type          | VARCHAR   | Low / Medium / High / Very High (fixed system enum)      |
| description        | TEXT      | nullable                                                 |
| created_at         | TIMESTAMP |                                                          |

---

## API Endpoints

### Auth
| Method | Path                  | Description        |
|--------|-----------------------|--------------------|
| POST   | `/api/v1/auth/register` | Register new user |
| POST   | `/api/v1/auth/login`    | Login, get JWT    |
| GET    | `/api/v1/auth/me`       | Current user info |

### Income
| Method | Path                              | Description                    |
|--------|-----------------------------------|--------------------------------|
| GET    | `/api/v1/income?month=&year=`     | List income entries (filtered) |
| POST   | `/api/v1/income`                  | Add income entry               |
| PUT    | `/api/v1/income/{id}`             | Update income entry            |
| DELETE | `/api/v1/income/{id}`             | Delete income entry            |

### Expenses
| Method | Path                              | Description                      |
|--------|-----------------------------------|----------------------------------|
| GET    | `/api/v1/expenses?month=&year=`   | List expense entries (filtered)  |
| POST   | `/api/v1/expenses`                | Add expense entry                |
| PUT    | `/api/v1/expenses/{id}`           | Update expense entry             |
| DELETE | `/api/v1/expenses/{id}`           | Delete expense entry             |

### Investments
| Method | Path                                 | Description                         |
|--------|--------------------------------------|-------------------------------------|
| GET    | `/api/v1/investments?month=&year=`   | List investment entries (filtered)  |
| POST   | `/api/v1/investments`                | Add investment entry                |
| PUT    | `/api/v1/investments/{id}`           | Update investment entry             |
| DELETE | `/api/v1/investments/{id}`           | Delete investment entry             |

### Settings — User-Customizable Lookups

#### Income Sources
| Method | Path                               | Description              |
|--------|------------------------------------|--------------------------|
| GET    | `/api/v1/settings/income-sources`  | List user's income sources |
| POST   | `/api/v1/settings/income-sources`  | Add new income source    |
| PUT    | `/api/v1/settings/income-sources/{id}` | Rename income source |
| DELETE | `/api/v1/settings/income-sources/{id}` | Delete income source |

#### Expense Categories
| Method | Path                                   | Description                  |
|--------|----------------------------------------|------------------------------|
| GET    | `/api/v1/settings/expense-categories`  | List user's expense categories |
| POST   | `/api/v1/settings/expense-categories`  | Add new category             |
| PUT    | `/api/v1/settings/expense-categories/{id}` | Rename category          |
| DELETE | `/api/v1/settings/expense-categories/{id}` | Delete category          |

#### Investment Types
| Method | Path                                   | Description                   |
|--------|----------------------------------------|-------------------------------|
| GET    | `/api/v1/settings/investment-types`    | List user's investment types  |
| POST   | `/api/v1/settings/investment-types`    | Add new investment type       |
| PUT    | `/api/v1/settings/investment-types/{id}` | Rename investment type      |
| DELETE | `/api/v1/settings/investment-types/{id}` | Delete investment type      |

### Overview
| Method | Path                                | Description                                 |
|--------|-------------------------------------|---------------------------------------------|
| GET    | `/api/v1/overview?year=`            | Yearly summary (all 12 months consolidated) |
| GET    | `/api/v1/overview/month?month=&year=` | Single month summary                      |

---

## Frontend Pages & Features

### Settings Page (`/settings`)
- **Income Sources** — list, add, rename, delete
- **Expense Categories** — list, add, rename, delete
- **Investment Types** — list, add, rename, delete
- Changes reflect immediately in all add/edit forms across the app
- Cannot delete a source/category/type that is currently referenced by existing entries (show clear error)

### Monthly View (`/month/:year/:month`)
- Three tabs: **Income**, **Expenses**, **Investments**
- Each tab shows a data table of all entries for that month
- Add / Edit / Delete entries via modal/drawer (works on mobile too)
- Dropdowns for source/category/type are populated from the user's custom lookup lists
- Month totals shown at top of each tab

### Overview Page (`/overview`)
- Default landing page after login
- Year selector (defaults to current year)
- **Summary cards:** Total Income, Total Expenses, Total Investments, Net Savings
- **Monthly breakdown table:** One row per month with all totals + net saving
- **Charts:**
  - Bar chart: Income vs Expenses vs Investment per month
  - Pie chart: Expense breakdown by category
  - Line chart: Net savings trend across months

### Responsive Design Rules
- Mobile (`< 640px`): bottom navigation bar, full-screen modals, stacked cards
- Tablet (`640px–1024px`): sidebar collapsed, 2-column grid for cards
- Desktop (`> 1024px`): expanded sidebar, full data tables with all columns

---

## Development Phases

### Phase 1 — Project Setup ✅
- [x] Initialize repo with MIT license, README, .gitignore
- [x] Set up Docker Compose (postgres + backend + frontend)
- [x] FastAPI app skeleton with health check endpoint
- [x] Vite + React + Tailwind + shadcn/ui scaffold
- [x] Alembic migration setup
- [x] INSTALLATION.md — full step-by-step setup guide

### Phase 2 — Auth
- [ ] User registration & login endpoints
- [ ] JWT middleware on protected routes
- [ ] Login / Register pages on frontend
- [ ] Auth context + protected routes

### Phase 3 — Core CRUD
- [ ] Lookup table models (income_sources, expense_categories, investment_types) + migrations
- [ ] Seed default values for each lookup table on user registration
- [ ] Settings API endpoints (GET/POST/PUT/DELETE for all three lookup tables)
- [ ] Income, Expense, Investment models + migrations (FK to lookup tables)
- [ ] CRUD endpoints for all three (income, expenses, investments)
- [ ] Settings page on frontend (manage lookup options)
- [ ] Monthly view page with tabs and data tables
- [ ] Add/Edit/Delete modals (dropdowns populated from user's lookup lists)

### Phase 4 — Overview & Charts
- [ ] Overview API endpoint (yearly + monthly aggregation)
- [ ] Overview page with summary cards
- [ ] Bar, Pie, and Line charts via Recharts

### Phase 5 — Polish & Open Source Prep
- [ ] Responsive design QA (mobile, tablet, desktop)
- [ ] Error handling, loading states, empty states
- [ ] README with setup instructions + screenshots
- [ ] `.env.example` with all required variables documented
- [ ] GitHub Actions CI (lint + test on PR)

---

## Open Source Conventions

- **License:** MIT
- **Branch strategy:** `main` (stable) + feature branches (`feat/`, `fix/`)
- **Commit style:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) — see Granular Commit Strategy below
- **PR template:** included in `.github/`
- **Issue templates:** Bug report + Feature request
- **Contributing guide:** `CONTRIBUTING.md`
- **Installation guide:** `INSTALLATION.md`

---

## Granular Commit Strategy

Every commit must represent **one logical, independently identifiable change**. This makes the git history readable and makes it easy to trace when a specific feature was introduced, modified, or removed.

### Rules

1. **One file or one concern per commit** — do not mix backend model changes with frontend UI changes in the same commit.
2. **Commit immediately after each unit of work** — don't batch multiple features into one commit.
3. **The commit message must say what changed and why** (use the body when needed).
4. **Prefer small, frequent commits** over large, infrequent ones.

### Commit Type Reference

| Type       | When to use                                              |
|------------|----------------------------------------------------------|
| `feat`     | A new feature or endpoint added                          |
| `fix`      | A bug fix                                                |
| `chore`    | Tooling, config, dependency updates (no production code) |
| `docs`     | Documentation only changes                              |
| `refactor` | Code restructuring with no behavior change               |
| `test`     | Adding or updating tests                                 |
| `style`    | Formatting, whitespace (no logic change)                 |
| `migration`| A new Alembic migration file                             |

### Scope Convention

Use a scope in parentheses to identify the area of the codebase:

```
feat(auth): add JWT login endpoint
feat(income): add GET /income list endpoint
feat(expenses): add expense ORM model
migration(users): create users table
feat(frontend/login): add Login page UI
feat(frontend/auth): add auth context and protected routes
chore(deps): pin pydantic to 2.9.2
docs: add INSTALLATION.md
```

### Examples by Phase

**Phase 2 — Auth (ideal granular commits)**
```
feat(auth): add User ORM model
migration(users): create users table
feat(auth): add register endpoint with password hashing
feat(auth): add login endpoint returning JWT
feat(auth): add /me endpoint with JWT dependency
feat(auth): add get_current_user dependency
feat(frontend/register): add Register page and form validation
feat(frontend/login): add Login page and form validation
feat(frontend/auth): add auth context with Zustand store
feat(frontend/auth): add ProtectedRoute wrapper component
```

**Phase 3 — Core CRUD (ideal granular commits)**
```
feat(lookup): add income_sources ORM model
feat(lookup): add expense_categories ORM model
feat(lookup): add investment_types ORM model
migration(lookup): create lookup tables
feat(lookup): seed default lookup values on user registration
feat(settings): add GET/POST/PUT/DELETE income-sources endpoints
feat(settings): add GET/POST/PUT/DELETE expense-categories endpoints
feat(settings): add GET/POST/PUT/DELETE investment-types endpoints
feat(income): add income ORM model and migration
feat(income): add GET/POST/PUT/DELETE income endpoints
feat(expenses): add expense ORM model and migration
feat(expenses): add GET/POST/PUT/DELETE expenses endpoints
feat(investments): add investment ORM model and migration
feat(investments): add GET/POST/PUT/DELETE investments endpoints
feat(frontend/settings): add Settings page with lookup management UI
feat(frontend/month): add MonthDetail page with Income tab
feat(frontend/month): add Expenses tab to MonthDetail page
feat(frontend/month): add Investments tab to MonthDetail page
```

---

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/finance_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Currency

All monetary values are stored as `NUMERIC(12, 2)` in PostgreSQL.
Default display currency is **INR (₹)**. Currency symbol is configurable per user.
