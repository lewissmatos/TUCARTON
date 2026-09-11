CREATE TYPE "public"."business_member_role" AS ENUM('OWNER', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."debt_status" AS ENUM('PENDING_CUSTOMER_ACK', 'CONFIRMED');--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "business_members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "business_member_role" DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_members_business_user" UNIQUE("business_id","user_id")
);--> statement-breakpoint
CREATE TABLE "customer_relationships" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_relationships_business_customer" UNIQUE("business_id","customer_user_id")
);--> statement-breakpoint
CREATE TABLE "debts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"business_id" uuid NOT NULL,
	"customer_user_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" text DEFAULT 'DOP' NOT NULL,
	"note" text,
	"status" "debt_status" DEFAULT 'PENDING_CUSTOMER_ACK' NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_relationships" ADD CONSTRAINT "customer_relationships_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_relationships" ADD CONSTRAINT "customer_relationships_customer_user_id_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_customer_user_id_users_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
