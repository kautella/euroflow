import {
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});

export const bankAccounts = sqliteTable("bank_accounts", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	aspspId: text("aspsp_id").notNull(),
	institutionName: text("institution_name").notNull(),
	country: text("country").notNull(),
	iban: text("iban"),
	accountName: text("account_name").notNull(),
	accountType: text("account_type").notNull(),
	actualAccountId: text("actual_account_id"),
	sessionId: text("session_id").notNull(),
	consentExpires: text("consent_expires").notNull(),
	lastSyncDate: text("last_sync_date"),
	lastExpiryWarningSent: text("last_expiry_warning_sent"),
	skipPending: integer("skip_pending").notNull().default(0),
	createdAt: text("created_at").notNull(),
});

export const syncRefs = sqliteTable(
	"sync_refs",
	{
		accountId: integer("account_id")
			.notNull()
			.references(() => bankAccounts.id, { onDelete: "cascade" }),
		ref: text("ref").notNull(),
		bookingDate: text("booking_date").notNull(),
	},
	(t) => [uniqueIndex("sync_refs_account_ref").on(t.accountId, t.ref)],
);

export const syncLog = sqliteTable("sync_log", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	ranAt: text("ran_at").notNull(),
	trigger: text("trigger", { enum: ["cron", "manual"] }).notNull(),
	status: text("status", { enum: ["ok", "warn", "err"] }).notNull(),
	imported: integer("imported").notNull().default(0),
	skipped: integer("skipped").notNull().default(0),
	message: text("message"),
	durationMs: integer("duration_ms").notNull(),
});
