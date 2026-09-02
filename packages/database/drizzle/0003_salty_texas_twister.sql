ALTER TABLE "accounts" ADD COLUMN "gmail_refresh_token" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "gmail_access_token" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "gmail_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "gmail_granted_scopes" text;