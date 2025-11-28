CREATE TABLE "emergencyContacts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emergencyContacts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"relationship" varchar(100),
	"phoneNumber" varchar(20) NOT NULL,
	"email" varchar(255),
	"isPrimary" integer DEFAULT 0,
	"createdOn" varchar
);
--> statement-breakpoint
CREATE TABLE "emergencyHistory" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emergencyHistory_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar NOT NULL,
	"sessionId" varchar,
	"emergencyType" varchar(50),
	"urgencyLevel" varchar(20),
	"status" varchar(50),
	"contactsNotified" json,
	"location" json,
	"emergencyReport" json,
	"triggeredAt" varchar,
	"resolvedAt" varchar,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "emergencyProfile" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emergencyProfile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar NOT NULL,
	"bloodType" varchar(10),
	"allergies" text,
	"medications" text,
	"medicalConditions" text,
	"emergencyNotes" text,
	"shareLocation" integer DEFAULT 1,
	"updatedOn" varchar,
	CONSTRAINT "emergencyProfile_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "sessionChatTable" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessionChatTable_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sessionId" varchar NOT NULL,
	"notes" text,
	"selectedDoctor" json,
	"conversation" json,
	"report" json,
	"createdBy" varchar,
	"createdOn" varchar
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"credits" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "emergencyContacts" ADD CONSTRAINT "emergencyContacts_userId_users_email_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergencyHistory" ADD CONSTRAINT "emergencyHistory_userId_users_email_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergencyHistory" ADD CONSTRAINT "emergencyHistory_sessionId_sessionChatTable_sessionId_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."sessionChatTable"("sessionId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergencyProfile" ADD CONSTRAINT "emergencyProfile_userId_users_email_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessionChatTable" ADD CONSTRAINT "sessionChatTable_createdBy_users_email_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;