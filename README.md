# Employee Progress Dashboard

A full-stack MERN dashboard that simulates tracking employee progress through
reskilling/certification programs. Three roles (employee, manager, admin)
see three different views of the same data: employees enroll in courses and
log progress, managers see their team's status at a glance, and admins manage
the course catalog, learning paths, and team assignments.

Built as a portfolio project to demonstrate auth design, role-based access
control, relational data modeling in MongoDB, and a dashboard/reporting UI —
not a production SaaS. Scope decisions throughout (see below) reflect that.

## Stack

- **Backend:** Node.js, Express 5, MongoDB (Atlas) via Mongoose, JWT auth, bcrypt, Zod validation
- **Frontend:** React 19 (Vite), Tailwind CSS v4, React Router v7, TanStack Query, React Hook Form, Recharts
- **Testing:** Jest + Supertest + mongodb-memory-server
- **Dev tooling:** ESLint, Prettier, Docker Compose, nodemon

## Architecture

### Auth: access + refresh tokens

Login/register issue two JWTs: a 15-minute **access token** (`{ userId, role }`)
sent as `Authorization: Bearer <token>` on every request, and a 7-day
**refresh token** (`{ userId }` only) used to mint a new access token without
re-entering a password. An axios interceptor on the client catches a 401,
calls `/api/auth/refresh`, and retries the original request transparently.

A few deliberate, defensible tradeoffs here (full reasoning in
[`learning.md`](learning.md)):

- **Symmetric error messages.** Login returns the same error for "no such
  user" and "wrong password"; `requireAuth` returns the same 401 for missing,
  malformed, or expired tokens. Neither leaks information an attacker could
  use, and the correct client action ("log in again") is identical either way.
- **401 vs 403 is a deliberate signal, not an accident.** 401 means "you're
  not authenticated — go refresh or log in again." 403 means "you *are*
  authenticated, but your role doesn't allow this" — the client shouldn't
  retry, it should change what it shows.
- **No refresh token rotation, and it's stored in the response body, not an
  httpOnly cookie.** Both are explicit scope calls for a resume project with
  no real user data behind it, trading some security-in-depth for a much
  simpler implementation. Both are things I'd point to unprompted in an
  interview as "here's the production-grade version and why I didn't build it
  here," not gaps I'm hoping nobody notices.

### Data model

```
User        — name, email, passwordHash, role (employee/manager/admin), team (ref Team)
Team        — name, manager (ref User)
Course      — title, provider, description, hours, expirationMonths
LearningPath— title, description, courses ([ref Course])
Enrollment  — user (ref), course (ref), status, progressPercent, completedAt
              unique index on (user, course)
```

Learning path progress is **derived**, not stored — it's computed on read by
aggregating each user's `Enrollment` records across the path's courses. That
avoids a second source of truth that could drift out of sync with the
underlying enrollments.

**Referential integrity is enforced at the delete boundary, not left to
cascade.** Deleting a `Course` that's still referenced by an `Enrollment` or a
`LearningPath` is blocked with a 400 rather than silently orphaning those
references — Mongoose's `.populate()` resolves a dangling ref to `null`
instead of throwing, so an unguarded delete would leave `enrollment.course ===
null` and crash any frontend code that assumes a course is always attached.
The same `countDocuments()`-before-delete pattern is used consistently for
`Team` (blocked if it still has assigned members) and `LearningPath` (blocked
if it still references courses that no longer exist).

### API

All routes below require `Authorization: Bearer <accessToken>` except
register/login/refresh. Role-restricted routes are noted.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | create account, returns tokens |
| POST | `/api/auth/login` | public | returns tokens |
| POST | `/api/auth/refresh` | public (valid refresh token) | mint new access token |
| GET | `/api/auth/me` | any authed user | echo decoded token payload |
| GET | `/api/courses` / `/:id` | any authed user | browse catalog |
| POST / PUT / DELETE | `/api/courses` | admin | manage catalog |
| GET | `/api/learning-paths` / `/:id` | any authed user | browse paths |
| POST / PUT / DELETE | `/api/learning-paths` | admin | manage paths |
| GET | `/api/teams` / `/:id` | any authed user | list/view teams |
| GET | `/api/teams/mine/progress` | manager | own team's enrollment status |
| GET | `/api/teams/:id/progress` | admin, manager | any team's status |
| POST / PUT / DELETE | `/api/teams` | admin | manage teams |
| POST | `/api/enrollments` | any authed user | enroll self in a course |
| GET | `/api/enrollments/me` | any authed user | own enrollments |
| PATCH | `/api/enrollments/:id/progress` | any authed user | update own progress |
| POST | `/api/enrollments/:id/complete` | any authed user | mark own enrollment complete |
| GET | `/api/users` | admin | list all users |
| PATCH | `/api/users/:id` | admin | assign a user to a team |

A Postman collection covering the auth flow lives in
[`postman/`](postman/employee-dashboard-auth.postman_collection.json).

### Frontend

- **Routing/guards:** React Router v7 with a role-aware `RoleDashboard`
  component that renders the employee, manager, or admin dashboard based on
  the logged-in user's role.
- **Data fetching:** TanStack Query for all server state — mutations
  (enroll, update progress, create course, assign team, etc.) invalidate the
  relevant query keys on success rather than manually patching cache.
- **Design system:** Tailwind v4 (config lives in `@theme` in `index.css`,
  no separate config file) implementing a Linear-inspired dark UI — a shared
  `AppShell` sidebar layout, consistent status badges, and card-bordered
  lists/forms across all three dashboards and the auth pages.
- **Chart:** a Recharts pie chart on the manager dashboard summarizing a
  team's enrollments by status (not started / in progress / completed).

## Testing

Backend: Jest + Supertest against an in-memory MongoDB
(`mongodb-memory-server`), covering the auth flow (register/login/refresh,
protected-route access by role) and enrollment logic.

```
cd server
npm test
```

Frontend: no automated tests yet — verified manually in-browser plus
`eslint` + `vite build` as a compile/lint gate on every change.

## Running locally

### Option 1 — Docker Compose (no Atlas account needed)

```
cp server/.env.example server/.env   # fill in JWT secrets; MONGO_URI is overridden by compose
docker-compose up --build
```

This starts the API server alongside a local MongoDB container. Verified
end-to-end, including the full Postman collection running against the
Dockerized server. The client isn't containerized — run it separately with
Option 2's frontend steps, pointed at `http://localhost:5000/api`.

### Option 2 — Run server and client directly

```
# server
cd server
cp .env.example .env    # fill in MONGO_URI (Atlas) + JWT secrets
npm install
npm run dev              # http://localhost:5000

# client
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Seed sample data (Faker-generated users/courses/teams) with `npm run seed`
from `server/`.

## Scope notes

Explicitly cut from this timeline, not overlooked: hosted deployment, CI
pipeline, cron jobs, CSV/PDF export, audit logging. A live public deploy
wasn't worth the ongoing hosting/security surface for a project with no real
users behind it — `docker-compose up` is the "run it live for an interviewer"
fallback instead.
