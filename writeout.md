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

>Refresh requires the refreshtoken to be passed in the request. First it make sure that the refresh token was passed. From there it decodes the refreshtoken, and if the refresh token is expired it throws an error. Using the decoded refreshtoken, it finds the user in the database, if the user does not exist, that means that the user was deleted. Since it got passed all those guards, it is a valid refresh and generates an accesstoken with the user. 

**9. Why does step 8 need to query the database when verifying the original access token (step 4) didn't?**

>It queries the database to confirm the user still exists — the account could have been deleted since the refresh token was issued. It also needs the user's current role: the access token payload includes { userId, role }, but the refresh token's payload only holds userId. So verifying an access token (step 4) never needs the database, since role is already sitting right there in the token. But minting a new access token during refresh does need a database read, purely to fetch the role that isn't in the refresh token.

**10. Seven days pass and the refresh token itself expires. What happens now? What's the user's experience?**

>On the next thing the user does that requires a token, the server will use the access token. This will be expired and will return an error. From here the client will get to where the refreshtoken tries to remint an access token. It will get another error and the user will be forced to take steps determined by the frontend design to remint an access and refresh token (requiring their password).

---
## Part 2 — The design decisions

For each of these, write the one- or two-sentence version you'd actually say
if an interviewer asked "why did you do it that way?" Not the full essay —
the compressed answer you'd lead with, that invites a follow-up question.

**Why two separate tokens (access + refresh) instead of one long-lived token?**

>It ensures if there is somehow a token breach it is only used for at most 15 minutes. Having only short lived tokens requires users to re-input their password, having only long lived tokens are a security issue since access tokens are passed many times throughout the api calls. Having both allows for the best of both worlds, the user is not required for repeat password input, and security is better.

**Why two separate secrets, one per token type?**

>Security reasons, if the access tokens secret is breached, then the refresh token is still not breached and vice versa. 

**Why do both `requireAuth` and the `/refresh` route return 401 for every failure case, instead of different codes for "expired" vs "malformed" vs "missing"?**

>Regardless of the outcome ("expired","missing", "malformed"). The client response is the same. They must reject the request and start the reminting process. IT is also a security benefit as if someone were trying to attack the site, there is no extra information for them to use, as they do not know why the token failed.

**Why does `requireRole` return 403 instead of 401 when the role doesn't match?**

>Its an important distiction for the frontend to know for them to not repeat api calls. If a 401 was returned it would mint a new token, but the role would not change, causing it to hit the same error. As well as if a 403 was returned, they know the roles do not match then the UI must be changed, or the user cannot access that part of the site.

**Why doesn't `/refresh` rotate the refresh token on every use? What would change if it did?**

>Without rotation (current design) if a users refresh token is taken, it is only an issue for at most 7 days. With rotation, if someone takes the stolen token before the user does, then there will be detection that the token is stolen. However, this also would require the server to hold data for validation on stolen tokens. This would slow the users flow in the site as it would require database write every time refresh is called.


**Why is the refresh token stored in the response body / client-side storage instead of an httpOnly cookie? What did that choice trade away, and why was that an acceptable trade for this project specifically?**

>It is stored in the response body to not worry about cross site cookie attacks. The tradeoff for using client side storage is exposure to XSS, since anything that gets into the page as JavaScript can read localStorage directly. Since the application does not have real user data, worrying about cookie attacks is not a real problem. 

**What's still missing from this auth system that a production app would need? (Think about what happens if a user's laptop gets stolen with a valid refresh token still sitting in it.)**

>Since the token validation and minting is done in stateless server there is no current auth system to check if a user had his laptop stole. This would require the ability to revoke a specific refresh token so it can no longer mint access tokens. In order to do this there would need to be a database entry that shows if it was revoked.

---

## Part 3 — The 60-second version

Condense the whole thing into what you'd actually say if someone asked
"walk me through your auth flow" in an interview, with no follow-up prompts
from them — just you talking, start to finish, in about the time it'd take
to read this out loud once.

>My auth flow utilizes JWTs. It starts out at signup which uses brypt to hash the password before it goes into the database. When a user logs in it grabs the password, uses bcrypts matching function and ensures that the passwords match. From there it passes crucial information such as role, name, and id, as well as mints a refresh and access token. The access token has a short life of 15 minutes and is initially generated through signing in. The refresh token has a life of 7 days and is also initially generated through signing in. The access token can be reminted using the refresh token. That flow starts as the access token runs out of time, it then returns a 401 error which is linked to access problems, next calls /refresh which uses the refresh token to mint a new token. During this minting process there is a database call to ensure that the account has not been deleted within the time frame that has occured. Refresh tokens can not be reminted and are exclusively minted through login, therefore if the refresh token runs out after the 7 days they must re-enter the password. As well as there is role authorization, since there are different roles with different privilages the role check is done server side. When role checks fail it returns a 403 error which is enough to differenciate when a problem occured from token authorization or role problems.

---

## Part 4 — Where I got stuck

Be honest here — this section is more useful the more specific it is. What
took more than one look at the code to explain? What would you *not* be able
to answer confidently right now if someone pushed back on it?

>The place I got stuck on the most was the reasoning to have an access and refresh token. To start the project, I knew I wanted to use JWTs, but I did not understand that one JWT is not enough security and there is a good tradeoff to pursue a 2 JWT token format. Due to my lack of teaching and skills when it comes to user security, I assumed that having a JWT would be enough security, but that is not correct. Having two tokens allows for security breaches on one token to be mitigated, expecially with the time constraint put on the access tokens. 
>Another place I got stuck was the reasoning to use local storage vs http cookies. I struggled to understand the tradeoffs to both. At the start, from my learning the reasoning to use cookies seemed like they were not worth it, but I learned that there are real security issues to both approaches. My implementation with JWTs and local storage can be breached and attacked by js script attacks, and if I had used a cookies implementation, it is open to cross cookies attack (cross-site request forgery-->CSRF)
