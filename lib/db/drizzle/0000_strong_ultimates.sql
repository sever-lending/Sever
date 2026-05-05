CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "activity" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"loan_id" varchar,
	"kind" varchar NOT NULL,
	"message" text NOT NULL,
	"amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fundings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" varchar NOT NULL,
	"lender_id" varchar NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" varchar NOT NULL,
	"sequence" integer NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"late_fee" numeric(14, 2) DEFAULT '0' NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"borrower_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"purpose" varchar NOT NULL,
	"principal" numeric(14, 2) NOT NULL,
	"interest_rate" numeric(6, 3) NOT NULL,
	"term_months" integer NOT NULL,
	"funded_amount" numeric(14, 2) DEFAULT '0' NOT NULL,
	"origination_fee" numeric(14, 2) DEFAULT '0' NOT NULL,
	"total_repayment" numeric(14, 2) DEFAULT '0' NOT NULL,
	"monthly_payment" numeric(14, 2) DEFAULT '0' NOT NULL,
	"status" varchar DEFAULT 'open' NOT NULL,
	"funded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"loan_id" varchar,
	"kind" varchar NOT NULL,
	"title" varchar NOT NULL,
	"body" text NOT NULL,
	"read" varchar DEFAULT 'false' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_revenue" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" varchar,
	"kind" varchar NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"display_name" varchar NOT NULL,
	"bio" text,
	"wallet_balance" numeric(14, 2) DEFAULT '0' NOT NULL,
	"trust_score" integer DEFAULT 500 NOT NULL,
	"on_time_payments" integer DEFAULT 0 NOT NULL,
	"late_payments" integer DEFAULT 0 NOT NULL,
	"stripe_connect_id" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundings" ADD CONSTRAINT "fundings_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundings" ADD CONSTRAINT "fundings_lender_id_users_id_fk" FOREIGN KEY ("lender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_borrower_id_users_id_fk" FOREIGN KEY ("borrower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "IDX_activity_user" ON "activity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_fundings_loan" ON "fundings" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "IDX_fundings_lender" ON "fundings" USING btree ("lender_id");--> statement-breakpoint
CREATE INDEX "IDX_installments_loan" ON "installments" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX "IDX_installments_due" ON "installments" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "IDX_loans_status" ON "loans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_loans_borrower" ON "loans" USING btree ("borrower_id");--> statement-breakpoint
CREATE INDEX "IDX_notifications_user" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "IDX_notifications_read" ON "notifications" USING btree ("read");