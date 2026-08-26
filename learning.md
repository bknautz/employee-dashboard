# Learning Notes: Auth Middleware

Notes on `server/middleware/auth.js`, `server/middleware/roleCheck.js`, and the
protected test routes added to `server/routes/auth.js`. Written so I can
explain every line in an interview, not just that it "works."

---

## 1. What a middleware even is

Express middleware is just a function with the signature `(req, res, next)`.
When a request comes in, Express runs matching middleware **in the order
they're registered**, and each one decides:

- call `next()` → pass control to the next function in the chain
- call `res.status(...).json(...)` (or similar) and **not** call `next()` →
  short-circuit the chain and respond immediately

That's the entire mechanism. There's no magic — `requireAuth` and
`requireRole` are just functions dropped into the chain in front of a route
handler:

```js
router.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin' });
});
```

Express calls `requireAuth` first. If it calls `next()`, Express calls
`requireRole('admin')`'s returned function next. If *that* calls `next()`,
Express finally calls the route handler. If either middleware responds
instead of calling `next()`, the route handler never runs.

---

## 2. `middleware/auth.js` — verifying the access token

```js
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

**Why `Authorization: Bearer <token>` instead of a custom header?**
It's the standard HTTP scheme (RFC 6750) for token-based auth. Any client
library, API tool (Postman/curl), or future frontend code already knows this
convention — `fetch(url, { headers: { Authorization: 'Bearer ' + token } })`.
Rolling a custom header (`x-auth-token`) works too, but it's non-standard for
no benefit.

**Why check `authHeader.startsWith('Bearer ')` before splitting?**
Defends against a missing/malformed header crashing `.split(' ')[1]` into
`undefined`, which would then get handed to `jwt.verify(undefined, ...)` and
throw an error we'd have to catch anyway. Checking first makes the "no token"
case an explicit, readable branch instead of relying on the try/catch to
paper over it.

**What does `jwt.verify` actually do?**
A JWT is three base64url-encoded segments — `header.payload.signature`. The
payload (here: `{ userId, role, iat, exp }`) is **not encrypted, just
encoded** — anyone can base64-decode it and read it (try pasting a token into
jwt.io). What `jwt.verify` checks is the **signature**: it recomputes an
HMAC-SHA256 over `header.payload` using `JWT_ACCESS_SECRET` and confirms it
matches the signature segment. That's what makes the token trustworthy — an
attacker can *read* the payload but can't forge a new one without knowing the
secret, because they can't produce a matching signature. `jwt.verify` also
checks `exp` and throws `TokenExpiredError` if the token is past its 15-minute
lifetime.

**Why `req.user = { userId, role }` and not just `req.user = decoded`?**
The decoded payload also contains `iat`/`exp` (issued-at/expiry timestamps).
Pulling out only the fields the rest of the app actually needs keeps
`req.user` a clean, intentional shape — anything reading `req.user.role` later
doesn't have to know or care about JWT internals.

**Why 401 for both "no token" and "bad token"?**
Same reasoning already applied to login in `routes/auth.js` (symmetric error
messages for "user not found" vs "wrong password"): 401 means "you are not
authenticated," full stop. It doesn't leak *why* — expired vs. tampered vs.
missing — which isn't useful to a legitimate client (the fix is always "log in
again") and isn't information worth handing an attacker either.

---

## 3. `middleware/roleCheck.js` — restricting by role

```js
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

**Why does this return a function instead of being middleware directly?**
This is a **middleware factory** (a higher-order function). `requireRole` is
called *once*, at route-definition time, with the specific roles that route
allows (`requireRole('admin')`, `requireRole('manager', 'admin')`, etc.), and
it **returns** the actual `(req, res, next)` middleware, which closes over
`allowedRoles` via closure. Express then calls that returned function per
request. This is the same pattern as `express.static('public')` —
`express.static` isn't middleware, it's a function that *produces* middleware
configured with the path you gave it.

**Why check `!req.user` at all — doesn't `requireAuth` already guarantee it exists?**
In practice yes, since `requireRole` is always chained after `requireAuth` in
this codebase. The check is defensive: it stops `requireRole` from throwing a
`TypeError: Cannot read properties of undefined` if someone ever mounts it
without `requireAuth` first, and turns that mistake into a clean 403 instead
of an unhandled server error.

**Why 403, not 401, when the role doesn't match?**
This is the standard distinction:
- **401 Unauthorized** = "I don't know who you are" (missing/invalid
  credentials — `requireAuth`'s job)
- **403 Forbidden** = "I know who you are, and you're not allowed" (valid
  identity, insufficient permission — `requireRole`'s job)

An employee hitting `/admin-only` *is* authenticated (they have a valid
token) — they're just not permitted. Returning 401 there would be misleading;
it would suggest their token is bad when it isn't.

---

## 4. Wiring it into `routes/auth.js`

```js
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin' });
});
```

`/me` exists purely to prove `requireAuth` alone works — it echoes back
whatever `requireAuth` attached to `req.user`, which is the cheapest possible
way to see "did the middleware correctly decode my token and attach the
payload." `/admin-only` stacks both middlewares to prove the *combination*
works — an authenticated non-admin should get 403, and an authenticated admin
should get through to the handler. These aren't meant to stay in the app long
term; they're scaffolding for verifying the auth layer before real protected
routes (Courses, Enrollment, Team CRUD) get built on top of it in Week 2.

---

## 5. How this was actually tested (manual, not automated)

No Jest tests yet — this was verified by hand against the running server with
curl, which is worth understanding since it's the same loop I'll use for any
new endpoint before writing automated tests for it:

1. Started the server (`node server.js`), confirmed it's listening.
2. `POST /api/auth/register` with `role: "employee"` → captured the
   `accessToken` from the JSON response.
3. `GET /api/auth/me` with `Authorization: Bearer <that token>` → got back
   `{ "user": { "userId": ..., "role": "employee" } }`, confirming
   `requireAuth` decodes and attaches correctly.
4. `GET /api/auth/me` with **no** `Authorization` header → 401
   (`"No token provided"`), confirming the missing-header branch.
5. `GET /api/auth/me` with a garbage string as the token → 401
   (`"Invalid or expired token"`), confirming `jwt.verify` throwing gets
   caught and turned into a clean response instead of crashing the server.
6. `GET /api/auth/admin-only` with the **employee** token → 403
   (`"Insufficient permissions"`), confirming `requireRole` blocks the wrong
   role even though the token itself is valid.
7. Registered a second user with `role: "admin"`, repeated step 6 with the
   admin's token → 200 (`"Welcome, admin"`), confirming the happy path.
8. Deleted both test users from Atlas afterward and killed the server — the
   goal was to prove the middleware behaves correctly under each condition,
   not to leave scratch data sitting in the real database.

This is the same matrix worth turning into actual Supertest cases later:
valid token / missing token / malformed token / expired token / wrong role /
correct role. Each one exercises a different `return` (or fallthrough) inside
`requireAuth` or `requireRole`.

---

## 5b. `POST /api/auth/refresh` — issuing a new access token

```js
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const accessToken = generateAccessToken(user);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**Why is this a separate try/catch nested inside the outer one?**
The outer `try/catch` is the standard "something unexpected blew up" safety net
(same shape as `/register` and `/login` — a DB connection blip becomes a 500,
not a crash). But `jwt.verify` throwing on a bad token isn't unexpected —
it's an *expected* failure mode with a specific, correct response (401, not
500). The inner try/catch turns "expired token" from an exception into a
deliberate branch, exactly like `requireAuth` does. Letting it fall through to
the outer catch would still technically work (it'd hit the generic 500
handler) but would return the wrong status code for a completely normal
"your token expired" situation.

**Why look the user up in the database at all — isn't verifying the signature enough?**
The refresh token's payload is `{ userId }` only (deliberately minimal — see
`generateTokens.js`), with no `role`. Since role can change (promotion,
demotion) and `generateAccessToken` needs a current role to sign into the new
access token, a DB read is unavoidable here. This is the actual tradeoff
being made: access tokens skip the DB on every request (fast, but the role
inside them can be up to 15 minutes stale), while refresh — happening at most
every 15 minutes — pays for one DB read to get a fresh role. It's also a
natural place to catch "this user no longer exists" (deleted account),
which `findById` returning `null` handles for free.

**Why two different secrets (`JWT_ACCESS_SECRET` vs `JWT_REFRESH_SECRET`) instead of one?**
Verified directly: signing a token with one secret and calling `jwt.verify`
against the other throws, exactly the same way a garbage string does. This
means an access token (short-lived, sent on every request, more exposed) can
never be replayed as a refresh token even if both use the same signing
algorithm and even if an access token leaked. Separate secrets = separate
blast radius.

**Why doesn't this rotate the refresh token?**
Every call to `/refresh` reuses the *same* refresh token the client already
has — it isn't replaced with a new one. Simpler to implement and reason
about, but it means a single refresh token stays valid for its full 7-day
life no matter how many times it's used. The more secure alternative —
**refresh token rotation** — issues a brand new refresh token on every use
and invalidates the old one (requires tracking issued/used tokens
server-side, e.g. a `usedTokens` set or a `tokenVersion` field on the user).
That's a real tradeoff, not an oversight: rotation shrinks the window a
leaked refresh token is useful for, at the cost of needing server-side state
for something JWTs are otherwise designed to avoid. Flagged in CLAUDE.md as
a decision to revisit, not settled yet.

**Why does the token arrive in the request body, not a cookie?**
Decided (2026-08-26): body over httpOnly cookie, deliberately.

- **httpOnly cookie** — JS can't read it, so it's immune to XSS theft. But
  the browser attaches it to *every* request to the domain automatically,
  which reopens CSRF (a malicious page can trigger a request that carries
  the cookie along without needing to know its value). Closing that back up
  needs `SameSite=Strict/Lax` and usually a separate CSRF token — more
  correct, more moving parts.
- **Body / response** (what's actually implemented) — the client has to
  read the token out of the JSON response and manually attach it as
  `Authorization: Bearer <token>` on every request. That manual-attach step
  is exactly why there's no CSRF surface: a malicious page can't make the
  browser do that automatically. The cost is the opposite one — if the app
  ever has an XSS bug, injected JS *can* read wherever the token ends up
  stored client-side (`localStorage`, memory, etc.) and steal it.

The call: for a resume project with no real user data behind it, the
httpOnly-cookie approach is more "correct" but not worth its complexity
here. Body was picked to keep the auth flow simple and finishable in scope,
accepting the XSS tradeoff consciously rather than by default. That's the
actual interview answer — not "I didn't think about cookies," but "I know
the production-grade answer is usually httpOnly + CSRF token, and chose not
to pay for it on a project with nothing sensitive behind it." Client-side
storage mechanism (`localStorage` vs in-memory) is still an open pick for
Week 3, when the auth context actually has to store and re-attach this.

---

## 6. Things deliberately *not* handled here (and why)

- **Logout / token invalidation.** JWTs are stateless — the server doesn't
  track "active" tokens anywhere, so there's nothing to delete on logout
  server-side (yet). A real logout strategy would need either a token
  blocklist or short-lived tokens plus refresh-token rotation. Still an open
  decision per the CLAUDE.md notes.
