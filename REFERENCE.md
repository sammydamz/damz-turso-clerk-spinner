# Reference & Technical Guide

This guide details best practices, critical configurations, and troubleshooting strategies when integrating Turso DB, Clerk, and Drizzle ORM.

## Critical Architectural Decisions

### 1. Webhook Raw Body Verification
The Clerk webhook verification library (`@clerk/express/webhooks`) requires the original raw request payload string to correctly verify webhook signatures. If the body has already been parsed by Express JSON parser, signature checks will fail.
* **Solution**: Place the webhook handler before `express.json()` and parse it using `express.raw()`:
  ```typescript
  app.post("/api/webhooks/clerk", express.raw({ type: 'application/json' }), async (req, res) => { ... });
  ```

### 2. Clerk Global Middleware Exclusions
By default, `@clerk/express` intercepts all requests. If public endpoints or the webhook endpoint are not excluded, Clerk will reject unauthenticated webhook calls.
* **Solution**: Explicitly configure excluded routes:
  ```typescript
  app.use(clerkMiddleware({
    excludedRoutes: ['/api/webhooks/clerk', '/api/health']
  }));
  ```

### 3. User Creation Race Conditions
When a user signs up, Clerk sends a `user.created` webhook event. If the frontend immediately redirects the user to `/api/users/me` before the webhook finishes inserting the user profile in the database, the API will throw a `404` or `500` error.
* **Solution**: Implement an on-the-fly user creation fallback on the profile endpoint:
  ```typescript
  let profile = await db.select().from(users).where(eq(users.uid, userId));
  if (!profile) {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    // Insert into database and assign as new profile
  }
  ```

### 4. Cascade Deletion Logic
If your database schema has multi-tenant structures where a Clerk organization maps to a DB workspace, deleting an organization requires purging all workspace records.
* **Solution**: Ensure your schema specifies foreign key constraints with `onDelete: "cascade"`. For SQLite/Turso:
  ```typescript
  export const accounts = sqliteTable("accounts", {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }),
    ...
  });
  ```
  Alternatively, implement code-level cleanups within the `organization.deleted` webhook handler using transactions.

### 5. TypeScript Global Type References
Express does not know about the `auth` object on the request.
* **Solution**: Create a `types/globals.d.ts` file with:
  ```typescript
  /// <reference types="@clerk/express/env" />
  ```
