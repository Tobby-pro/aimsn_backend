CREATE TABLE "enrolled_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" serial NOT NULL,
	"fee_type" varchar(50) NOT NULL,
	"enrolled_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "enrolled_courses" CASCADE;--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "program_id" TO "fee_type";