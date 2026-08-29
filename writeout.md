# Auth Flow Write-Out

Fill this in yourself, in your own words — don't copy sentences out of
`learning.md`. That file is reference for *why* each decision was made;
this file is you proving you can reconstruct and explain the *order* of
events from memory, the way an interviewer would actually ask it
("walk me through what happens when...").

Write like you're saying it out loud, not like you're writing documentation.
Short, plain sentences. If you can't fill in a step, that's the signal to go
re-read the relevant part of the code (not `learning.md`) until you can.

---

## Part 1 — The order of events

Walk through the full lifecycle, start to finish, one step at a time.
Answer each prompt in 1–3 sentences.

**1. A new user registers. What does the server do, in order, before it sends a response back?**

_(hint: think about what happens to the password before it ever touches the database)_

> Before it does anything, it first ensures that the user does not exist already. It then uses bycrypt to hash the password using the genSalt function. It then calls the database to save the account created, and before the function ends, it generates an access and refresh token.

**2. What does the client receive back from `/register` (or `/login`)? What does it do with each piece?**

>The client recieves crucial information that is needed for the user, i.e. id, name, and role. As well as a refresh and access token. The access token is used to access the site, and the refresh token is used to "refresh" the access token when the access token runs out of access time. The non token items are used for ui generation, as if the role is admin it can see admin views, but if its not it cannot. Having a refresh token makes it much easier to create access tokens, as it gets rid of many of the steps for initial access token creation such as password input.

**3. The client now wants to hit a protected route — say, `GET /api/auth/me`. What does it have to include on that request, and why does it have to include it itself instead of the browser handling it automatically?**

>In order to hit a protected route the client must include the users access token. This access token has an authorization header which include Bearer prefix. If it does not include that it stops. Since the access tokens are sitting in local storage within the application, in order for the auth to know about the token, it must be passed as a header with this bearer prefix to allow it to authorize.

**4. Walk through what `requireAuth` does with that incoming request, step by step, from receiving it to either calling `next()` or rejecting it.**

>First thing is does is gets the authorization header, if this does not exist, or it is malformed without the bearer prefix it rejects it. From there it is separated into just the token. It then verifies the token, if it is verified it changes the user request to be updated with id and role, and calls next. If the token is invalid or expired it rejects it as well. 

**5. Say the route is also role-restricted, like `/admin-only`. What happens after `requireAuth` passes control along — what does `requireRole` check, and what does it need that only `requireAuth` could have provided it?**

>RequireRoles takes in a passed argument role from the the site. This is hardcoded for what the need is. From that it uses the passed req.user (which was passed from require auth with id and role) and checks that the user exists, and that the users role matches the passed role. From there it passes it along with next.

**6. Fifteen minutes pass. The user is still using the app and makes another request with their old access token. What does the server do, and what does the client see?**

>The server sees there is an error, in this case 401, and stops. The client sees there is an error returned from the server and pushes the next steps.

**7. What does the client do at that point to keep the user logged in without asking them to re-enter their password?**

>In the background it sees that there was a 401 error and calls the /refresh. Since we have refresh tokens, the user does not need to re-enter their password. It retrieves a new access token from this and retries the original request. The user does not see any of this, but the client does this in the background.

**8. Walk through what the server does with that refresh request, step by step, from receiving the refresh token to sending back a response.**

>

**9. Why does step 8 need to query the database when verifying the original access token (step 4) didn't?**

>

**10. Seven days pass and the refresh token itself expires. What happens now? What's the user's experience?**

>

---
## Part 2 — The design decisions

For each of these, write the one- or two-sentence version you'd actually say
if an interviewer asked "why did you do it that way?" Not the full essay —
the compressed answer you'd lead with, that invites a follow-up question.

**Why two separate tokens (access + refresh) instead of one long-lived token?**

>

**Why two separate secrets, one per token type?**

>

**Why does the refresh token's payload only contain `userId`, and not `role`?**

>

**Why do both `requireAuth` and the `/refresh` route return 401 for every failure case, instead of different codes for "expired" vs "malformed" vs "missing"?**

>

**Why does `requireRole` return 403 instead of 401 when the role doesn't match?**

>

**Why doesn't `/refresh` rotate the refresh token on every use? What would change if it did?**

>

**Why is the refresh token stored in the response body / client-side storage instead of an httpOnly cookie? What did that choice trade away, and why was that an acceptable trade for this project specifically?**

>

**What's still missing from this auth system that a production app would need? (Think about what happens if a user's laptop gets stolen with a valid refresh token still sitting in it.)**

>

---

## Part 3 — The 60-second version

Condense the whole thing into what you'd actually say if someone asked
"walk me through your auth flow" in an interview, with no follow-up prompts
from them — just you talking, start to finish, in about the time it'd take
to read this out loud once.

>

---

## Part 4 — Where I got stuck

Be honest here — this section is more useful the more specific it is. What
took more than one look at the code to explain? What would you *not* be able
to answer confidently right now if someone pushed back on it?

>
