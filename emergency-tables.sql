-- Create emergency tables only (skip existing tables)

CREATE TABLE IF NOT EXISTS "emergencyContacts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emergencyContacts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar NOT NULL,
	"name" varchar(255) NOT NULL,
	"relationship" varchar(100),
	"phoneNumber" varchar(20) NOT NULL,
	"email" varchar(255),
	"isPrimary" integer DEFAULT 0,
	"createdOn" varchar
);

CREATE TABLE IF NOT EXISTS "emergencyHistory" (
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

CREATE TABLE IF NOT EXISTS "emergencyProfile" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "emergencyProfile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" varchar NOT NULL UNIQUE,
	"bloodType" varchar(10),
	"allergies" text,
	"medications" text,
	"medicalConditions" text,
	"emergencyNotes" text,
	"shareLocation" integer DEFAULT 1,
	"updatedOn" varchar
);

-- Add foreign keys (will skip if already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'emergencyContacts_userId_users_email_fk'
    ) THEN
        ALTER TABLE "emergencyContacts" ADD CONSTRAINT "emergencyContacts_userId_users_email_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'emergencyHistory_userId_users_email_fk'
    ) THEN
        ALTER TABLE "emergencyHistory" ADD CONSTRAINT "emergencyHistory_userId_users_email_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'emergencyHistory_sessionId_sessionChatTable_sessionId_fk'
    ) THEN
        ALTER TABLE "emergencyHistory" ADD CONSTRAINT "emergencyHistory_sessionId_sessionChatTable_sessionId_fk" 
        FOREIGN KEY ("sessionId") REFERENCES "public"."sessionChatTable"("sessionId") ON DELETE no action ON UPDATE no action;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'emergencyProfile_userId_users_email_fk'
    ) THEN
        ALTER TABLE "emergencyProfile" ADD CONSTRAINT "emergencyProfile_userId_users_email_fk" 
        FOREIGN KEY ("userId") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;
