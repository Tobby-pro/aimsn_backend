CREATE TABLE "enrolled_courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" serial NOT NULL,
	"program_id" varchar(50) NOT NULL,
	"enrolled_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" serial NOT NULL,
	"program_id" varchar(50) NOT NULL,
	"reference" varchar(100) NOT NULL,
	"amount" text NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
