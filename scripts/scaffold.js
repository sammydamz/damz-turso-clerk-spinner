import fs from 'fs';
import path from 'path';

const CWD = process.cwd();

// Helper to ensure target directories exist
function ensureDirExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Helper to write file safely
function writeFile(relativeTarget, content) {
  const targetPath = path.join(CWD, relativeTarget);
  if (fs.existsSync(targetPath)) {
    console.log(`[INFO] File already exists, skipping: ${relativeTarget}`);
    return;
  }
  ensureDirExists(targetPath);
  fs.writeFileSync(targetPath, content.trim() + '\n');
  console.log(`[SUCCESS] Created file: ${relativeTarget}`);
}

console.log('Starting Turso-Clerk-Drizzle setup scaffolding (damz-turso-clerk-spinner)...\n');

// 1. Create drizzle.config.ts
writeFile('drizzle.config.ts', `
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
`);

// 2. Create src/db/index.ts
writeFile('src/db/index.ts', `
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
`);

// 3. Create src/db/schema.ts
writeFile('src/db/schema.ts', `
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  uid: text("uid").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  photoURL: text("photo_url"),
  createdAt: text("created_at").notNull(),
  lastSeen: text("last_seen"),
  role: text("role"),
});

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").references(() => users.uid, { onDelete: "cascade" }).notNull(),
  createdAt: text("created_at").notNull(),
});
`);

// 4. Create types/globals.d.ts
writeFile('types/globals.d.ts', `
/// <reference types="@clerk/express/env" />
`);

// 5. Create basic .env.example if no .env exists
writeFile('.env.example', `
TURSO_DATABASE_URL=libsql://your-db-name-your-org.turso.io
TURSO_AUTH_TOKEN=your_auth_token
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
`);

console.log('\nScaffolding completed successfully!');
console.log('\nNext steps:');
console.log('1. Run package installation command to install dependencies:');
console.log('   pnpm add @libsql/client drizzle-orm @clerk/express @clerk/react');
console.log('   pnpm add -D drizzle-kit');
console.log('2. Populate your database credentials in `.env`');
console.log('   node --env-file=".env" turso.mjs  # To verify remote connection');
console.log('3. Run `pnpm drizzle-kit generate` and `pnpm drizzle-kit push` to synchronize migrations.');

