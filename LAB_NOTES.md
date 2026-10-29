# College Laboratory Record / Manual

## Department of Computer Science & Engineering / Information Technology
### Lab Course: Full Stack Web Development & Node.js Laboratory
**Experiment Name:** Implementation of Secure User Authentication System using React.js, Node.js, Express, and MongoDB

---

## 1. Title of the Experiment
**Design and Implementation of a Full-Stack User Authentication and Authorization System with JSON Web Tokens (JWT), HttpOnly Cookies, and Bcrypt Hashing.**

---

## 2. Aim
To design, implement, test, and demonstrate a robust, secure, and user-friendly web application for user authentication using React.js on the client side, Express.js and Node.js on the server side, and MongoDB for database storage, ensuring industry-standard security practices including password hashing, HttpOnly session cookies, CSRF protection, and rate limiting.

---

## 3. Problem Statement
Traditional web applications that rely on plaintext credentials or client-side storage of authentication tokens (such as `localStorage` or `sessionStorage`) are severely vulnerable to Cross-Site Scripting (XSS), credential interception, and session hijacking. The objective of this experiment is to construct an end-to-end full-stack solution where:
- Passwords are never stored in plaintext.
- Session tokens cannot be accessed or manipulated by malicious frontend JavaScript.
- Unauthorized users cannot access protected views or sensitive backend API routes.
- The user session remains persistent across page reloads without re-entering credentials.
- All errors and validations are handled cleanly and gracefully.

---

## 4. Software and Hardware Requirements

### Software Requirements:
- **Operating System:** Windows 10/11, Ubuntu 20.04+, or macOS
- **Runtime Environment:** Node.js v18.x or v20.x LTS
- **Package Manager:** npm v9.x or v10.x
- **Database:** MongoDB Community Server v6.x/v7.x or MongoDB Atlas Cloud Cluster
- **Code Editor / IDE:** Google Antigravity / Visual Studio Code
- **Browser:** Google Chrome / Mozilla Firefox / Microsoft Edge with Developer Tools

### Hardware Requirements:
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher
- **RAM:** Minimum 4 GB (8 GB recommended)
- **Disk Space:** Minimum 500 MB free storage

---

## 5. Theory of User Authentication

### 5.1 What is Authentication vs. Authorization?
- **Authentication (AuthN):** The process of verifying *who* a user is (e.g. verifying email and password match).
- **Authorization (AuthZ):** The process of verifying *what permissions* an authenticated user has (e.g. regular `'user'` vs. `'admin'`).

### 5.2 Stateful Sessions vs. Stateless Token Authentication
- **Stateful (Session-based):** The server creates a session identifier, saves session state in server memory or a database (e.g. Redis), and sends a session cookie to the client. On every request, the server performs a database lookup to validate the session ID.
- **Stateless (JWT-based):** The server cryptographically signs a token containing user identity and claims. The client transmits this token with each request. The server verifies the token signature mathematically using a private secret, removing the need for session lookup tables in memory.

### 5.3 Anatomy of a JSON Web Token (JWT)
A JWT consists of three Base64URL-encoded strings separated by dots (`.`):
$$\text{JWT} = \text{Header} \,.\, \text{Payload} \,.\, \text{Signature}$$
1. **Header:** Contains token type (`JWT`) and signing algorithm (e.g. `HS256`).
2. **Payload:** Contains claims such as user ID (`id`), role (`role`), issue timestamp (`iat`), and expiration timestamp (`exp`).
3. **Signature:** Calculated using the formula:
   $$\text{HMACSHA256}(\text{base64UrlEncode}(\text{Header}) + "." + \text{base64UrlEncode}(\text{Payload}), \text{secret})$$

### 5.4 Password Salting and Hashing with Bcrypt
- **Hashing:** A cryptographic one-way mathematical function that converts arbitrary data into a fixed-length string ($60$ characters for bcrypt). It cannot be reversed.
- **Salt:** A cryptographically random string generated and prepended to the plaintext password before hashing. This defeats pre-computed rainbow table attacks.
- **Work Factor (Cost):** Dictates how many rounds of key derivation ($2^{\text{cost}}$ iterations) are performed. We use **10 rounds**, providing an optimal balance between security and server throughput.

### 5.5 HttpOnly Cookies vs. LocalStorage
Storing JWTs in `localStorage` or `sessionStorage` leaves them open to XSS theft via `window.localStorage.getItem('token')`. Setting the cookie attribute `httpOnly: true` prevents browser JavaScript from accessing the cookie, ensuring that even if an XSS vulnerability exists on the page, the attacker cannot steal the authentication token.

---

## 6. Technologies Used

- **React.js:** Component-driven frontend library providing a single-page application (SPA) with declarative state management.
- **Vite:** Next-generation frontend build tool that uses native ES modules in development for instant server start and lightning-fast Hot Module Replacement (HMR).
- **Node.js:** Asynchronous event-driven JavaScript runtime built on Chrome's V8 engine.
- **Express.js:** Minimal and flexible Node.js web application framework providing robust routing and middleware architectures.
- **MongoDB & Mongoose:** NoSQL document-oriented database with Mongoose ODM providing schema validation, type casting, query building, and middleware hooks.
- **Bcryptjs:** Pure JavaScript implementation of the bcrypt password-hashing algorithm.
- **Helmet:** Express middleware that sets security-focused HTTP response headers (`X-Content-Type-Options`, `X-Frame-Options`, etc.).

---

## 7. System Architecture & Component Interaction

```
[Browser Client]
       │
       ▼ (1) HTTP Request (with credentials: include)
[Express REST API - Port 5000]
       │
       ├─► Helmet (Sets Security Headers)
       ├─► Express-Rate-Limit (Brute-Force Shield)
       ├─► CORS Middleware (Strict Origin Validation)
       ├─► Cookie-Parser (Extracts HttpOnly auth_token)
       ├─► CSRF Middleware (Double-Submit Validation)
       │
       ▼ (2) Route Handlers
  ┌───────────────────────┬────────────────────────┐
  │ /api/auth             │ /api/users             │
  │ • register            │ • getProfile           │
  │ • login               │ • updateProfile        │
  │ • logout              │                        │
  │ • me (protected)      │                        │
  │ • change-password     │                        │
  └───────────────────────┴────────────────────────┘
       │
       ▼ (3) Protected Endpoints Check:
       authMiddleware.protect -> Verify JWT Signature -> User.findById()
       │
       ▼ (4) Mongoose Data Access
[MongoDB Database - auth_lab_db] (users collection)
```

---

## 8. Step-by-Step Procedure / Algorithm

### Algorithm 1: User Registration
1. **Input:** `name`, `email`, `password`, `confirmPassword`.
2. **Client Validation:**
   - Check if any field is empty.
   - Verify `email` matches standard email format.
   - Verify `password.length >= 8`.
   - Verify `password === confirmPassword`.
3. **Dispatch:** Send `POST /api/auth/register` to backend.
4. **Server Validation:**
   - Normalize email (lowercase and trimmed).
   - Check MongoDB for existing user with same email. If found, return HTTP 409 Conflict.
5. **Password Hashing:**
   - Execute Mongoose `pre('save')` hook: generate 10-round salt and hash password with `bcrypt.hash()`.
6. **Persistence:** Save user record to MongoDB.
7. **Session Issuance:**
   - Sign JWT containing `{ id: user._id, role: user.role }`.
   - Set cookie `auth_token` with `{ httpOnly: true, sameSite: 'lax', maxAge: 1 day }`.
   - Return HTTP 201 Created with safe user object (excluding password hash).

### Algorithm 2: User Login
1. **Input:** `email`, `password`.
2. **Dispatch:** Send `POST /api/auth/login` to backend.
3. **Server Lookup:** Query `User.findOne({ email }).select('+password')`.
4. **Verification:**
   - If user not found, return HTTP 401 ("Invalid email or password").
   - Execute `bcrypt.compare(password, user.password)`. If false, return HTTP 401.
5. **Session Issuance:**
   - Sign JWT and attach HttpOnly cookie.
   - Return HTTP 200 OK with sanitized user details.
6. **Client Navigation:** Update `AuthContext` user state and navigate to `/dashboard`.

### Algorithm 3: Protected Session Verification (Page Reload)
1. On component mount (`useEffect` in `AuthContext`), client issues `GET /api/auth/me`.
2. Browser automatically transmits `auth_token` HttpOnly cookie.
3. Server `protect` middleware:
   - Reads `req.cookies.auth_token`.
   - Verifies JWT with `jwt.verify(token, process.env.JWT_SECRET)`.
   - Checks if user exists in database.
   - Checks if password was changed after token issue timestamp (`user.changedPasswordAfter(decoded.iat)`).
4. If valid, returns HTTP 200 with user profile; otherwise returns HTTP 401.
5. React updates `isAuthenticated` state without redirecting away from protected view.

---

## 9. Important Code Snippets & Explanations

### Snippet 1: Mongoose Pre-Save Password Hashing Hook (`server/models/User.js`)
```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // Generate cryptographic salt (10 work factor rounds)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  if (!this.isNew) {
    // Record password change timestamp (used for token invalidation)
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  next();
});
```
*Significance:* Guarantees that any password saved to MongoDB is automatically salted and hashed, even if a developer forgets to hash it in the controller.

---

### Snippet 2: Secure HttpOnly Cookie Attachment (`server/utils/token.js`)
```javascript
export const sendTokenCookie = (res, user, statusCode = 200, message = 'Success') => {
  const token = signToken(user._id || user.id, user.role);
  const cookieName = process.env.COOKIE_NAME || 'auth_token';
  const options = {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: '/'
  };

  res.cookie(cookieName, token, options);

  // Return safe response WITHOUT exposing token in JSON body
  return res.status(statusCode).json({
    success: true,
    message,
    user: user.toSafeObject()
  });
};
```
*Significance:* Completely conceals the raw JWT token from client-side scripts while ensuring automatic browser session persistence.

---

### Snippet 3: React Route Guard Component (`client/src/components/ProtectedRoute.jsx`)
```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Verifying session security with server..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};
```
*Significance:* Prevents unauthorized users from viewing the Dashboard, Profile, or Change Password pages while preserving the attempted URL for seamless redirection upon login.

---

## 10. Database Schema Design

```
Database Name: auth_lab_db
Collection:    users

Document Structure:
{
  "_id":               ObjectId("66150247a32..."),
  "name":              "John Doe",
  "email":             "john.doe@example.com",
  "password":          "$2b$10$wT37tq7B1Hk9uV... (60 character bcrypt hash)",
  "role":              "user",
  "passwordChangedAt": ISODate("2026-10-09T05:14:00Z"),
  "createdAt":         ISODate("2026-10-09T05:10:00Z"),
  "updatedAt":         ISODate("2026-10-09T05:14:00Z"),
  "__v":               0
}
```

---

## 11. API Descriptions & HTTP Status Codes

| Endpoint | Method | Expected Status | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | `201 Created` | Successful registration & cookie issuance |
| `/api/auth/register` | `POST` | `400 Bad Request` | Missing field or password < 8 characters |
| `/api/auth/register` | `POST` | `409 Conflict` | Duplicate email address |
| `/api/auth/login` | `POST` | `200 OK` | Valid credentials & cookie issuance |
| `/api/auth/login` | `POST` | `401 Unauthorized` | Invalid email or password |
| `/api/auth/logout` | `POST` | `200 OK` | Clears `auth_token` cookie |
| `/api/auth/me` | `GET` | `200 OK` | Valid cookie returned user profile |
| `/api/auth/me` | `GET` | `401 Unauthorized` | Missing, expired, or invalid cookie |
| `/api/users/profile` | `PATCH` | `200 OK` | Name updated |
| `/api/users/profile` | `PATCH` | `403 Forbidden` | Attempted unauthorized role change |
| `/api/auth/change-password` | `POST` | `401 Unauthorized` | Wrong current password |
| `/api/health` | `GET` | `200 OK` | Backend and database connectivity status |

---

## 12. Instructions for Capturing Lab Screenshots

When submitting your lab experiment report, capture and attach the following screenshots from your working system:

1. **Screenshot 1: Landing Page (`http://localhost:5173/`)**
   - Shows the project title, security badges, and the live green indicator showing `Backend API: OK | Database: Connected`.
2. **Screenshot 2: Registration Page (`/register`) with Inline Validation**
   - Attempt submitting with mismatched passwords to demonstrate inline error validation.
3. **Screenshot 3: Successful Registration & Cookie Inspection**
   - Open Chrome DevTools (`F12` or `Ctrl + Shift + I`) $\rightarrow$ Click `Application` tab $\rightarrow$ Click `Cookies` $\rightarrow$ `http://localhost:5173` (or `http://localhost:5000`).
   - Highlight the cookie named `auth_token` with the `HttpOnly` checkmark activated.
4. **Screenshot 4: Protected Dashboard (`/dashboard`)**
   - Displays user welcome banner with the registered student's name, email, member since date, and role badge.
5. **Screenshot 5: Profile Update & Change Password**
   - Displays successful notification banner after changing name or updating password.
6. **Screenshot 6: MongoDB Compass / Terminal Verification**
   - View the `users` collection to confirm that the `password` field contains a 60-character bcrypt hash (`$2b$10$...`) and no plaintext passwords.
7. **Screenshot 7: Terminal Test Execution**
   - Run `npm test` in the server folder and capture the 12 green passing test cases.

---

## 13. Test Cases and Actual Experimental Results

The test suite was executed using the Node.js test runner with an isolated in-memory MongoDB server:

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | `GET /api/health` | HTTP 200 with status `ok` and `database: connected` | HTTP 200 returned | **PASS** |
| **TC-02** | `POST /api/auth/register` (Valid data) | HTTP 201 Created and HttpOnly `Set-Cookie` | HTTP 201 + cookie received | **PASS** |
| **TC-03** | Database password inspection | Bcrypt hash prefix `$2b$10$`, never plaintext | Stored as bcrypt hash | **PASS** |
| **TC-04** | Duplicate email registration | HTTP 409 Conflict with duplicate email message | HTTP 409 Conflict returned | **PASS** |
| **TC-05** | Invalid registration payload | HTTP 400 Bad Request for short password or missing field | HTTP 400 Bad Request returned | **PASS** |
| **TC-06** | `POST /api/auth/login` (Valid credentials)| HTTP 200 OK + `auth_token` cookie | HTTP 200 + cookie received | **PASS** |
| **TC-07** | `POST /api/auth/login` (Wrong password) | HTTP 401 with generic "Invalid email or password" | HTTP 401 returned | **PASS** |
| **TC-08** | `GET /api/auth/me` without cookie | HTTP 401 Unauthorized | HTTP 401 returned | **PASS** |
| **TC-09** | `GET /api/auth/me` with valid cookie | HTTP 200 OK with safe user details | HTTP 200 + user returned | **PASS** |
| **TC-10** | `POST /api/auth/logout` | HTTP 200 OK and cookie expiry set to past | Cookie cleared | **PASS** |
| **TC-11** | Privilege escalation attempt (`role: admin`) | HTTP 403 Forbidden | HTTP 403 Forbidden returned | **PASS** |
| **TC-12** | `POST /api/auth/change-password` | Current password verified; new hash saved | HTTP 200; new login works | **PASS** |

**Summary:** 12 passed, 0 failed, 0 skipped.

---

## 14. Result and Conclusion
The User Authentication System using React.js and Node.js was successfully built, integrated, tested, and demonstrated. The application satisfies all security criteria:
- Credentials are cryptographically protected via bcrypt.
- JWT tokens are shielded from XSS via HttpOnly cookies.
- Unauthorized client access is intercepted by React Route Guards and Express authentication middleware.
- Full state persistence across page refreshes is achieved without client-side token exposure.

---

## 15. Limitations and Future Enhancements

### Current Limitations:
- The system currently supports email/password authentication without multi-factor authentication (MFA / 2FA).
- Password recovery via email reset link requires an SMTP email server integration.

### Future Enhancements:
- Implementation of **Time-based One-Time Password (TOTP)** two-factor authentication via Google Authenticator.
- Email verification workflow upon initial registration using Nodemailer.
- OAuth 2.0 social login integration (Sign in with Google / GitHub).
- Redis-based refresh token rotation for enterprise-grade distributed session revoking.
