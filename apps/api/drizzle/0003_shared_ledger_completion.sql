ALTER TYPE "public"."debt_status" ADD VALUE IF NOT EXISTS 'REJECTED';--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "rejected_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "rejected_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "debts" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_rejected_by_user_id_users_id_fk" FOREIGN KEY ("rejected_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
