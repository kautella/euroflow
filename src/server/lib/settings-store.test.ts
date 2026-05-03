import { resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { beforeEach, describe, expect, test } from "vitest";
import * as schema from "../db/schema";
import { SettingsStore } from "./settings-store";

function makeStore() {
	const sqlite = new Database(":memory:");
	sqlite.pragma("journal_mode = WAL");
	sqlite.pragma("foreign_keys = ON");
	const db = drizzle(sqlite, { schema });
	migrate(db, { migrationsFolder: resolve("drizzle") });
	return new SettingsStore(db);
}

describe("SettingsStore", () => {
	let store: SettingsStore;

	beforeEach(() => {
		store = makeStore();
		store.bootstrap();
	});

	test("get returns null for a key that does not exist", () => {
		expect(store.get("nonexistent")).toBeNull();
	});

	test("set and get round-trips a plain value", () => {
		store.set("actual_url", "http://localhost:5006");
		expect(store.get("actual_url")).toBe("http://localhost:5006");
	});

	test("set and get round-trips a sensitive value", () => {
		store.set("smtp_password", "s3cr3t");
		expect(store.get("smtp_password")).toBe("s3cr3t");
	});

	test("getAll masks sensitive values", () => {
		store.set("smtp_password", "s3cr3t");
		const all = store.getAll();
		expect(all.smtp_password).toBe("••••••••");
	});

	test("getAll omits encryption_key and session_secret", () => {
		const all = store.getAll();
		expect(all).not.toHaveProperty("encryption_key");
		expect(all).not.toHaveProperty("session_secret");
	});

	test("setMany persists all entries", () => {
		store.setMany({ actual_url: "http://localhost:5006", log_level: "debug" });
		expect(store.get("actual_url")).toBe("http://localhost:5006");
		expect(store.get("log_level")).toBe("debug");
	});

	test("bootstrap generates keys that enable encryption on a fresh DB", () => {
		const fresh = makeStore();
		fresh.bootstrap();
		fresh.set("smtp_password", "test");
		expect(fresh.get("smtp_password")).toBe("test");
	});

	test("bootstrap is idempotent — calling it twice does not rotate keys", () => {
		store.set("smtp_password", "before");
		store.bootstrap();
		expect(store.get("smtp_password")).toBe("before");
	});
});
