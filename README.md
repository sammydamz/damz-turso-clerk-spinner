# damz-turso-clerk-spinner

[![Install Count](https://skills.sh/b/sammydamz/damz-turso-clerk-spinner)](https://skills.sh/sammydamz/damz-turso-clerk-spinner)

A comprehensive development tool, integration guide, and boilerplate generator for connecting a React SPA (Vite) and Express backend with **Turso DB** (database), **Clerk** (auth), and **Drizzle ORM**.

This repository serves as both:
1. An **Agent Skill** that AI coding assistants can use to initialize and configure full-stack auth and database connections.
2. A **Developer Boilerplate** with complete reference code and automated scaffolding scripts.

---

## Installation as an Agent Skill

You can install this skill into your local AI coding agent environment (such as Claude Code, Cursor, Windsurf, or Copilot) via the official [skills.sh](https://skills.sh) registry:

```bash
npx skills add sammydamz/damz-turso-clerk-spinner
```

---

## Quick Start (Developer Scaffolding)

To quickly scaffold standard configuration and schema files in your project, execute:
```bash
node scripts/scaffold.js
```

This generates the following files:
* `drizzle.config.ts` - Drizzle configuration using the `turso` dialect.
* `src/db/index.ts` - LibSQL client initialization and Drizzle database binding.
* `src/db/schema.ts` - Basic schema defining `users` and multi-tenant `workspaces`.
* `types/globals.d.ts` - TypeScript definitions for Clerk authentication middlewares.
* `.env.example` - Environment configuration template.

---

## Environment Variables

Add the following credentials to your `.env` file:
```env
# Database Credentials
TURSO_DATABASE_URL=libsql://your-db-url-your-org.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here

# Clerk Credentials
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

---

## Installation

Install required dependencies in your application root:

```bash
# Package dependencies
pnpm add @libsql/client drizzle-orm @clerk/express @clerk/react

# Dev dependencies
pnpm add -D drizzle-kit
```

---

## Repository Structure

* [SKILL.md](SKILL.md) - Main agent skill configuration detailing triggers and workflows.
* [REFERENCE.md](REFERENCE.md) - Technical deep-dive on webhooks signature verification, global middleware exclusions, race-conditions, and organization cascade deletes.
* [EXAMPLES.md](EXAMPLES.md) - Full, copy-pasteable files showing how to build backend Express handlers, frontend wrappers, and API services.
* [scripts/scaffold.js](scripts/scaffold.js) - Automation setup script.

---

## Webhooks & Security Best Practices

### Raw Request Body
Clerk requires signature verification using the original raw string of the body payload. Generic body-parsers (like `express.json()`) modify this stream, causing verification failures. 
Ensure the webhook route uses `express.raw({ type: 'application/json' })` and is registered **before** any global JSON parsers.

### Global Clerk Exclusions
Exclude `/api/webhooks/clerk` and `/api/health` from Clerk's global `clerkMiddleware()` check to avoid blocking unauthenticated requests.

### Sign-Up Race Conditions
During signup, if a browser redirects a new user to `/api/users/me` before the Clerk webhook finishes creating the user in Turso, implement an on-the-fly fallback that fetches the profile directly from Clerk via `clerkClient` and inserts it into the database.

---

## License

MIT
