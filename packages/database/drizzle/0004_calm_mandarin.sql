CREATE TABLE "layer1_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gmail_message_id" varchar(255) NOT NULL,
	"score" integer NOT NULL,
	"signals" jsonb NOT NULL,
	"authentication" jsonb NOT NULL,
	"received_hop_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "layer1_analyses" ADD CONSTRAINT "layer1_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "layer1_analyses_user_message_unique" ON "layer1_analyses" USING btree ("user_id","gmail_message_id");