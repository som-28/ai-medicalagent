import { integer, json, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer()
});

export const SessionChatTable=pgTable('sessionChatTable',{
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar().notNull(),
  notes:text(),
  selectedDoctor:json(),
  conversation:json(),
  report:json(),
  createdBy:varchar().references(()=>usersTable.email),
  createdOn:varchar(),
})

export const EmergencyContactsTable = pgTable('emergencyContacts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar().notNull().references(() => usersTable.email),
  name: varchar({ length: 255 }).notNull(),
  relationship: varchar({ length: 100 }), // e.g., "Spouse", "Parent", "Friend"
  phoneNumber: varchar({ length: 20 }).notNull(),
  email: varchar({ length: 255 }),
  isPrimary: integer().default(0), // 1 for primary contact, 0 for others
  createdOn: varchar(),
})

export const EmergencyProfileTable = pgTable('emergencyProfile', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar().notNull().unique().references(() => usersTable.email),
  bloodType: varchar({ length: 10 }),
  allergies: text(), // JSON string of allergies
  medications: text(), // JSON string of current medications
  medicalConditions: text(), // JSON string of conditions
  emergencyNotes: text(),
  shareLocation: integer().default(1), // 1 = yes, 0 = no
  updatedOn: varchar(),
})

export const EmergencyHistoryTable = pgTable('emergencyHistory', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar().notNull().references(() => usersTable.email),
  sessionId: varchar().references(() => SessionChatTable.sessionId),
  emergencyType: varchar({ length: 50 }), // "SOS", "Auto-detected", etc.
  urgencyLevel: varchar({ length: 20 }), // "Critical", "High", "Medium"
  status: varchar({ length: 50 }), // "Active", "Resolved", "Cancelled"
  contactsNotified: json(), // Array of notified contacts
  location: json(), // GPS coordinates if shared
  emergencyReport: json(), // Generated emergency summary
  triggeredAt: varchar(),
  resolvedAt: varchar(),
  notes: text(),
})