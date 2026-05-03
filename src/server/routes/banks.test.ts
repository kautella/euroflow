import { resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import * as schema from "../db/schema";
import type { EnableBankingClient } from "../lib/enable-banking";
import { banksRouter } from "./banks";

function makeDb() {
	const sqlite = new Database(":memory:");
	sqlite.pragma("foreign_keys = ON");
	const db = drizzle(sqlite, { schema });
	migrate(db, { migrationsFolder: resolve("drizzle") });
	return db;
}

function makeApp(eb: Partial<EnableBankingClient>) {
	const db = makeDb();
	const app = express();
	app.use(express.json());
	app.use("/api/banks", banksRouter({ db, eb: eb as EnableBankingClient }));
	return { app, db };
}

describe("GET /api/banks", () => {
	test("returns banks from eb.getBanks()", async () => {
		const banks = [
			{ id: "n26", name: "N26", country: "DE", bic: "NTSBDEB1", maxDays: 90 },
		];
		const getBanks = vi.fn().mockResolvedValue(banks);
		const { app } = makeApp({ getBanks });

		const res = await request(app).get("/api/banks?country=DE");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ banks });
		expect(getBanks).toHaveBeenCalledWith("DE");
	});

	test("calls getBanks without country when param omitted", async () => {
		const getBanks = vi.fn().mockResolvedValue([]);
		const { app } = makeApp({ getBanks });

		await request(app).get("/api/banks");

		expect(getBanks).toHaveBeenCalledWith(undefined);
	});
});

describe("GET /api/banks/connected", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
	});

	test("returns empty groups when no accounts stored", async () => {
		const { app } = makeApp({ getBanks: vi.fn() });

		const res = await request(app).get("/api/banks/connected");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ groups: [] });
	});

	test("groups accounts by aspspId + sessionId", async () => {
		const { app, db } = makeApp({ getBanks: vi.fn() });

		db.insert(schema.bankAccounts)
			.values([
				{
					aspspId: "n26",
					institutionName: "N26",
					country: "DE",
					iban: "DE89370400440532013000",
					accountName: "Main",
					accountType: "checking",
					sessionId: "sess-1",
					consentExpires: "2026-07-01T00:00:00Z",
					createdAt: "2026-01-01T00:00:00Z",
				},
				{
					aspspId: "n26",
					institutionName: "N26",
					country: "DE",
					iban: "DE89370400440532013001",
					accountName: "Savings",
					accountType: "savings",
					sessionId: "sess-1",
					consentExpires: "2026-07-01T00:00:00Z",
					createdAt: "2026-01-01T00:00:00Z",
				},
			])
			.run();

		const res = await request(app).get("/api/banks/connected");

		expect(res.status).toBe(200);
		expect(res.body.groups).toHaveLength(1);
		expect(res.body.groups[0].bank).toMatchObject({
			id: "n26",
			name: "N26",
			country: "DE",
		});
		expect(res.body.groups[0].accounts).toHaveLength(2);
	});

	test("computes expiresInDays from consentExpires", async () => {
		const { app, db } = makeApp({ getBanks: vi.fn() });

		db.insert(schema.bankAccounts)
			.values({
				aspspId: "bcp",
				institutionName: "BCP",
				country: "PT",
				iban: null,
				accountName: "Checking",
				accountType: "checking",
				sessionId: "sess-2",
				consentExpires: "2026-01-11T00:00:00Z",
				createdAt: "2026-01-01T00:00:00Z",
			})
			.run();

		const res = await request(app).get("/api/banks/connected");

		expect(res.body.groups[0].accounts[0].expiresInDays).toBe(10);
	});
});
