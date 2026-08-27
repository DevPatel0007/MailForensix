ALTER TABLE "users" ADD COLUMN "salt" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" text NOT NULL;