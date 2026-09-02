import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  unique,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const accountsTable = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 32 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    providerEmail: varchar("provider_email", { length: 255 }),
    gmailRefreshToken: text("gmail_refresh_token"),
    gmailAccessToken: text("gmail_access_token"),
    gmailTokenExpiresAt: timestamp("gmail_token_expires_at"),
    gmailGrantedScopes: text("gmail_granted_scopes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    providerAccountUnique: unique().on(table.provider, table.providerAccountId),
  }),
);

export type SelectAccount = typeof accountsTable.$inferSelect;
export type InsertAccount = typeof accountsTable.$inferInsert;
