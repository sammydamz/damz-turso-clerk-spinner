---
name: damz-turso-clerk-spinner
description: Configure and integrate a full-stack project using Turso DB, Clerk Authentication, and Drizzle ORM. Use when the user wants to set up, initialize, or manage database sync, user auth, Express session middlewares, React auth wrappers, or Clerk webhook event synchronization.
---

# Turso, Clerk, and Drizzle Integration (damz-turso-clerk-spinner)

This skill provides step-by-step setup guides, configurations, code templates, and automated helper scripts to connect a Node.js/Express backend and a React frontend to Turso DB and Clerk Auth using Drizzle ORM.

## Quick start

To scaffold standard files in a project, run the setup script:
```bash
node .agents/skills/damz-turso-clerk-spinner/scripts/scaffold.js
```

Ensure the following environment variables are defined in `.env`:
```env
TURSO_DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

## Workflows

### 1. Database Setup with Drizzle & Turso
- Install dependencies: `@libsql/client`, `drizzle-orm`, `drizzle-kit`.
- Configure `drizzle.config.ts` with the `turso` dialect.
- Define schema using `sqliteTable` mapping.
- Run migrations: `pnpm drizzle-kit generate` then `pnpm drizzle-kit push`.

### 2. Frontend Clerk Setup
- Wrap App with `ClerkProvider` in `src/main.tsx`.
- Create a `ClerkAppWrapper` component to pass authenticated properties to `App.tsx`.
- In components requiring sign-in or signup modal UI, embed `<SignIn>` / `<SignUp>` with custom layouts.

### 3. Backend Express Setup
- Add `@clerk/express` global `clerkMiddleware()` middleware, excluding raw body webhook endpoints.
- Establish `requireAuthMiddleware` using `getAuth(req)` to inject `req.auth = { userId: auth.userId }`.
- Read raw webhook body streams for verification.

For architectural references and webhook guides, see [REFERENCE.md](REFERENCE.md).
For copy-pasteable files, see [EXAMPLES.md](EXAMPLES.md).
