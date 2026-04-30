export type Account = {
	id: number;
	name: string;
	iban: string;
	brandInitials: string;
	brandColor: string;
	status: "ok" | "warn" | "err";
	statusLabel: string;
	expiresInDays: number;
	lastSync: Date;
};

export type SyncRun = {
	id: number;
	at: Date;
	trigger: "cron" | "manual";
	status: "ok" | "warn" | "err";
	statusLabel: string;
	imported: number;
	skipped: number;
	message: string;
	durationMs: number;
};

const now = new Date("2026-04-30T00:00:00Z");
const ago = (h: number) => new Date(now.getTime() - h * 3_600_000);
const future = (h: number) => new Date(now.getTime() + h * 3_600_000);

export const accounts: Account[] = [
	{
		id: 1,
		name: "Millennium BCP — Checking",
		iban: "PT50 0010 0001 2345 6789 1510 2",
		brandInitials: "BCP",
		brandColor: "#e30613",
		status: "ok",
		statusLabel: "OK",
		expiresInDays: 162,
		lastSync: ago(2),
	},
	{
		id: 2,
		name: "N26 — Main Account",
		iban: "DE89 3704 0044 0532 0130 00",
		brandInitials: "N26",
		brandColor: "#1a1a1a",
		status: "warn",
		statusLabel: "WARN",
		expiresInDays: 5,
		lastSync: ago(2),
	},
	{
		id: 3,
		name: "Revolut — EUR",
		iban: "LT12 3250 0718 9900 3578",
		brandInitials: "REV",
		brandColor: "#0075eb",
		status: "ok",
		statusLabel: "OK",
		expiresInDays: 89,
		lastSync: ago(2),
	},
];

export const syncRuns: SyncRun[] = [
	{
		id: 8,
		at: ago(2),
		trigger: "cron",
		status: "ok",
		statusLabel: "OK",
		imported: 3,
		skipped: 0,
		message: "3 new txns across 3 accounts",
		durationMs: 842,
	},
	{
		id: 7,
		at: ago(8),
		trigger: "cron",
		status: "ok",
		statusLabel: "OK",
		imported: 0,
		skipped: 0,
		message: "Nothing new",
		durationMs: 611,
	},
	{
		id: 6,
		at: ago(14),
		trigger: "cron",
		status: "ok",
		statusLabel: "OK",
		imported: 12,
		skipped: 2,
		message: "12 txns, 2 pending skipped",
		durationMs: 903,
	},
	{
		id: 5,
		at: ago(20),
		trigger: "cron",
		status: "ok",
		statusLabel: "OK",
		imported: 7,
		skipped: 0,
		message: "7 new txns",
		durationMs: 774,
	},
	{
		id: 4,
		at: ago(26),
		trigger: "manual",
		status: "warn",
		statusLabel: "WARN",
		imported: 4,
		skipped: 0,
		message: "N26 session expiring in 5d",
		durationMs: 991,
	},
	{
		id: 3,
		at: ago(32),
		trigger: "cron",
		status: "ok",
		statusLabel: "OK",
		imported: 1,
		skipped: 0,
		message: "1 new txn",
		durationMs: 558,
	},
	{
		id: 2,
		at: ago(44),
		trigger: "cron",
		status: "err",
		statusLabel: "ERR",
		imported: 0,
		skipped: 0,
		message: "GoCardless 429 — rate limited",
		durationMs: 1203,
	},
	{
		id: 1,
		at: ago(50),
		trigger: "cron",
		status: "ok",
		statusLabel: "OK",
		imported: 9,
		skipped: 1,
		message: "9 txns, 1 duplicate skipped",
		durationMs: 687,
	},
];

export const lastSync = ago(2);
export const nextSync = future(4);
