# Demo Video Script

Target length: 3-4 minutes. Screen recording, narrated live (not scripted
word-for-word — bullets to talk from, not a transcript to read). Goal is
"here's a working full-stack app I built and can explain," not a feature
tour of every button.

## Before recording

- [ ] `docker-compose up --build` from repo root (or `npm run dev` in both
      `server/` and `client/` if not using Docker) — confirm all three
      dashboards load with no console errors.
- [ ] `npm run seed` in `server/` for clean Faker-generated data if the DB
      is messy from manual testing.
- [ ] Have three browser tabs/windows ready, one per role, already logged in
      (or credentials handy) so you're not typing passwords on camera:
      one **employee**, one **manager**, one **admin**.
- [ ] Close devtools/console unless you're intentionally showing something
      there.
- [ ] Silence notifications.

## 1. Intro (~15s)

- "This is a full-stack dashboard for tracking employee reskilling/certification
  progress — three roles, each with a different view of the same data."
- One sentence on stack: React/Vite + Tailwind frontend, Express/MongoDB
  backend, JWT auth.

## 2. Employee view (~45s)

- Log in as (or show already-logged-in) employee.
- Show **Browse Courses** → enroll in one.
- Show **My Courses** → update progress on an existing enrollment, mark one
  complete.
- One line: "enrollment status and progress live in Mongo, fetched with
  TanStack Query, so the UI here invalidates and refetches automatically
  after a mutation instead of me manually patching state."

## 3. Manager view (~45s)

- Switch to manager tab.
- Show the team roster table and the status pie chart together.
- One line: "this is the same underlying enrollment data, aggregated by
  team — not a separate copy of it."

## 4. Admin view (~60s)

- Switch to admin tab.
- Create a course.
- Add it to a learning path (checkbox multi-select).
- Assign an employee to a team.
- **Optional, if time:** try deleting a course that's still enrolled in, to
  show the referential-integrity guard rejecting it with a clear error
  instead of silently orphaning the enrollment.

## 5. Auth, briefly (~30s)

- Don't demo login/refresh mechanics on screen — they're invisible by
  design. Just say it out loud:
- "Auth is JWT access + refresh tokens — 15-minute access token, 7-day
  refresh, axios interceptor refreshes automatically on a 401 so the user
  never sees it. Full writeup of the design tradeoffs — like why the
  refresh token lives in the response body instead of an httpOnly cookie —
  is in the README and `learning.md`."

## 6. Close (~15s)

- "Code, architecture notes, and setup instructions — including a Docker
  Compose path that doesn't need a Mongo Atlas account — are all in the
  README."
- Mention where the repo lives (GitHub link) if sharing publicly.

## Talking points to have ready if asked live (don't narrate unprompted)

- Why access/refresh tokens instead of one long-lived token.
- Why 401 vs 403 is a deliberate split, not arbitrary.
- Why course deletion is blocked instead of cascading — Mongoose
  `.populate()` resolves a dangling ref to `null` rather than throwing,
  which is what orphaned enrollments would hit at render time.
- Why learning-path progress is derived from enrollments on read, not
  stored redundantly.

See [`learning.md`](../learning.md) and [`writeout.md`](../writeout.md) at
the repo root for the long-form version of all of the above.
