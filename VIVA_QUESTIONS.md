# Viva Voce Examination Questions & Answers
## Subject: Full-Stack Web Development & Node.js Authentication Lab

This document contains 26 high-frequency practical viva examination questions with concise, technically accurate answers designed for college laboratory evaluations.

---

### Q1. What is the fundamental difference between Authentication and Authorization?
**Answer:**
- **Authentication (AuthN):** Verifying the identity of a user (e.g., verifying who the user is via email and password).
- **Authorization (AuthZ):** Verifying whether the authenticated user has permission to access a specific resource or perform an action (e.g., verifying if a user has the `'admin'` role to delete accounts).

---

### Q2. What is a JSON Web Token (JWT) and what are its three components?
**Answer:**
A JWT is an open, stateless standard (RFC 7519) for securely transmitting information between parties as a compact JSON object. It consists of three parts separated by dots (`.`):
1. **Header:** Specifies the token type (`JWT`) and hashing algorithm (e.g., `HS256`).
2. **Payload:** Contains claims such as user ID, role, and expiration timestamp (`exp`).
3. **Signature:** Formed by hashing the encoded header and payload with a secret key (`HMACSHA256`).

---

### Q3. Why should authentication tokens NOT be stored in `localStorage` or `sessionStorage`?
**Answer:**
Data stored in `localStorage` or `sessionStorage` is directly accessible to any JavaScript running on the page via `window.localStorage`. If the application has any Cross-Site Scripting (XSS) vulnerability, an attacker can steal the JWT and hijack the user session.

---

### Q4. What is an `HttpOnly` cookie and how does it prevent token theft?
**Answer:**
An `HttpOnly` cookie is an HTTP response cookie configured with the `HttpOnly` flag. The browser ensures that client-side scripts (e.g., `document.cookie`) cannot read or access this cookie. The browser automatically includes the cookie in subsequent HTTP requests to the origin, immunizing the token against JavaScript-based XSS theft.

---

### Q5. What is the purpose of the `SameSite` cookie attribute?
**Answer:**
`SameSite` controls whether cookies are sent with cross-site requests, mitigating Cross-Site Request Forgery (CSRF):
- `Strict`: Cookie is never sent on cross-site requests.
- `Lax`: Cookie is withheld on cross-site subrequests (images, iframes) but sent when navigating to the origin site (e.g., following a link).
- `None`: Cookie is sent on all cross-site requests (requires `Secure` HTTPS).

---

### Q6. Why do we hash passwords instead of encrypting them?
**Answer:**
- **Encryption is two-way:** Encrypted data can be decrypted back to plaintext if the key is compromised.
- **Hashing is one-way:** A cryptographic hash cannot be reversed. When a user logs in, the server hashes the submitted password and compares the resulting hash with the stored hash.

---

### Q7. What is a "Salt" in password hashing and why is it used?
**Answer:**
A salt is a cryptographically random string generated and prepended to the password before hashing. It prevents attackers from using precomputed lookup tables (Rainbow Tables) and ensures that two users with identical passwords will have completely different stored hashes.

---

### Q8. What is bcrypt's "Work Factor" (or Salt Rounds)?
**Answer:**
The work factor (e.g., 10 rounds) specifies the computational cost of hashing, running $2^{\text{cost}}$ iterations ($2^{10} = 1024$ rounds). It intentionally slows down the hashing process to make brute-force and dictionary attacks computationally infeasible, while remaining fast enough for single user logins.

---

### Q9. What is CORS and why is it required when connecting React and Express?
**Answer:**
Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts web pages from making AJAX requests to a different domain, protocol, or port than the one serving the web page. Because Vite runs on `http://localhost:5173` and Express runs on `http://localhost:5000`, the server must explicitly declare that requests from `http://localhost:5173` with `credentials: true` are permitted.

---

### Q10. Why should wildcard `*` never be used with `credentials: true` in CORS?
**Answer:**
The CORS specification strictly forbids `Access-Control-Allow-Origin: *` when `Access-Control-Allow-Credentials: true` is set. Browsers will reject credentialed requests (cookies and authorization headers) with wildcard origins to prevent malicious third-party websites from harvesting private user sessions.

---

### Q11. What is Express Middleware and how does the `next()` function work?
**Answer:**
Middleware functions are functions that have access to the request object (`req`), response object (`res`), and the `next` function in the application's request-response cycle. Calling `next()` passes execution to the next middleware in the pipeline; omitting it or returning a response ends the cycle.

---

### Q12. How does the `authMiddleware.protect` verify user sessions?
**Answer:**
1. Extracts the JWT from `req.cookies.auth_token`.
2. Verifies the token signature using `jwt.verify(token, JWT_SECRET)`.
3. Queries MongoDB to ensure the user still exists.
4. Checks if the user changed their password after the token was issued (`passwordChangedAt > decoded.iat`).
5. Attaches the user document to `req.user` and calls `next()`.

---

### Q13. Why should the login endpoint return a generic message ("Invalid email or password")?
**Answer:**
If the server returns "Email not found" or "Incorrect password", attackers can use this feedback to enumerate which email addresses are registered on the platform. A generic message prevents user enumeration attacks.

---

### Q14. What is Mongoose and what is the difference between Mongoose and MongoDB?
**Answer:**
- **MongoDB:** A document-oriented NoSQL database that stores data in flexible BSON (binary JSON) documents.
- **Mongoose:** An Object Data Modeling (ODM) library for Node.js that provides a schema-based solution to model application data, enforcing validation, type casting, query building, and middleware hooks.

---

### Q15. Why did we set `select: false` on the password field in the Mongoose User schema?
**Answer:**
`select: false` excludes the password hash from default database query projections (like `User.find()` or `User.findById()`). This prevents accidental leakage of password hashes in API responses or logs. When password verification is needed during login, it must be explicitly requested using `.select('+password')`.

---

### Q16. What is the role of React Router's `<ProtectedRoute />`?
**Answer:**
`<ProtectedRoute />` is a route wrapper component that evaluates the global authentication state from `AuthContext`. If the user is unauthenticated, it redirects them to the `/login` route using `<Navigate to="/login" replace />`, blocking access to private pages like Dashboard or Profile.

---

### Q17. How does the React app maintain authentication on page refresh?
**Answer:**
When the page reloads, `AuthContext` executes a `useEffect` hook that triggers `GET /api/auth/me` with `credentials: 'include'`. The browser automatically attaches the HttpOnly cookie. If the token is still valid, the backend responds with user details, restoring the authenticated state seamlessly without requiring manual re-login.

---

### Q18. What is Cross-Site Request Forgery (CSRF) and how does our application mitigate it?
**Answer:**
CSRF occurs when a malicious website tricks a user's browser into executing an unauthorized state-changing request to another application where the user is currently authenticated (because the browser automatically attaches cookies).
Our application mitigates CSRF through:
1. `SameSite: 'Lax'` on cookies.
2. A **Double-Submit Cookie Pattern**: The server issues a CSRF token; state-changing requests (`POST`, `PATCH`, `DELETE`) must send that token in the `x-csrf-token` header.

---

### Q19. What is Helmet and what does it do in an Express application?
**Answer:**
Helmet is a security middleware package that sets secure HTTP response headers, such as:
- `X-Content-Type-Options: nosniff` (prevents MIME type sniffing).
- `X-Frame-Options: SAMEORIGIN` (prevents clickjacking attacks).
- `Strict-Transport-Security` (enforces HTTPS).
- `X-XSS-Protection` (activates browser XSS filters).

---

### Q20. What is Rate Limiting and why is it applied to authentication endpoints?
**Answer:**
Rate limiting restricts the number of requests a single IP address can make to an API within a specified time window (e.g., 25 requests per 15 minutes). It protects endpoints like `/register` and `/login` from automated brute-force password guessing, credential stuffing, and denial-of-service (DoS) attacks.

---

### Q21. Explain the significance of HTTP Status Codes 200, 201, 400, 401, 403, 404, 409, and 500.
**Answer:**
- **200 OK:** Standard success response for queries and updates.
- **201 Created:** Successful creation of a new resource (e.g. user registration).
- **400 Bad Request:** Client error such as invalid format or missing required fields.
- **401 Unauthorized:** Authentication missing, invalid, or expired.
- **403 Forbidden:** Authenticated user lacks permission (e.g. attempting to change account role).
- **404 Not Found:** Requested route or database document does not exist.
- **409 Conflict:** State conflict, specifically duplicate unique fields (e.g. email already exists).
- **500 Internal Server Error:** Unexpected unhandled server exception.

---

### Q22. How does the server invalidate existing JWT tokens when a user changes their password?
**Answer:**
When the user changes their password, the database updates the `passwordChangedAt` timestamp. When `authMiddleware` verifies a JWT, it compares the token's issue timestamp (`iat`) against `passwordChangedAt`. If the password was modified after the token was issued, the token is rejected with HTTP 401, forcing re-authentication.

---

### Q23. What are ES Modules in Node.js and how are they enabled?
**Answer:**
ECMAScript Modules (ESM) are the official standard for packaging JavaScript code for reuse, using `import` and `export` statements rather than CommonJS `require()`. In Node.js, they are enabled by setting `"type": "module"` in `package.json` or by using the `.mjs` file extension.

---

### Q24. How does the frontend communicate with the backend securely using `fetch`?
**Answer:**
By specifying `{ credentials: 'include' }` in `fetch()` options:
```javascript
fetch('http://localhost:5000/api/auth/me', {
  method: 'GET',
  credentials: 'include' // Tells browser to transmit cookies across ports
});
```
Without `credentials: 'include'`, the browser withholds HttpOnly cookies on cross-origin requests.

---

### Q25. Why should `.env` files never be committed to Git?
**Answer:**
`.env` files contain sensitive credentials, database connection strings, and cryptographic secrets (`JWT_SECRET`). Committing them exposes private keys in source control history, allowing attackers to forge JWT tokens and access database records. `.env` should always be listed in `.gitignore` and accompanied by a sanitized `.env.example`.

---

### Q26. What happens if a user submits `{ role: 'admin' }` in the profile update request?
**Answer:**
The `updateProfile` controller strictly validates and filters input. If a `role` field is detected in `req.body`, it returns an immediate `HTTP 403 Forbidden` response (`"Unauthorized: You cannot modify your own account role"`). The backend never trusts client-supplied privilege fields.
