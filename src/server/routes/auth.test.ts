import { resolve } from "node:path";
import Database from "better-sqlite3";
import cookieSession from "cookie-session";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import express from "express";
import request from "supertest";
import { describe, expect, test, vi } from "vitest";
import * as schema from "../db/schema";
import type { EnableBankingClient } from "../lib/enable-banking";
import { authRouter } from "./auth";

function makeDb() {
	const sqlite = new Database(":memory:");
	sqlite.pragma("foreign_keys = ON");
	const db = drizzle(sqlite, { schema });
	migrate(db, { migrationsFolder: resolve("drizzle") });
	return db;
}

function makeApp(eb: Partial<EnableBankingClient>, db = makeDb()) {
	const app = express();
	app.use(express.json());
	app.use(
		cookieSession({ name: "session", secret: "test-secret", httpOnly: true }),
	);
	app.use(
		"/api/auth",
		authRouter({
			db,
			getEb: () => eb as EnableBankingClient,
			redirectUri: "http://localhost/api/auth/callback",
		}),
	);
	return { app, db };
}

describe("auth routes", () => {
	test("POST /api/auth/start returns auth URL and sets nonce cookie", async () => {
		const { app } = makeApp({
			startAuth: vi
				.fn()
				.mockResolvedValue("https://auth.enablebanking.com/connect"),
		});

		const res = await request(app)
			.post("/api/auth/start")
			.send({ aspspId: "nordea-fi", aspspName: "Nordea", country: "FI" });

		expect(res.status).toBe(200);
		expect(res.body.authUrl).toBe("https://auth.enablebanking.com/connect");
		expect(res.headers["set-cookie"]).toBeDefined();
	});

	test("GET /api/auth/callback with matching nonce redirects to step=done", async () => {
		let capturedState = "";
		const startAuth = vi
			.fn()
			.mockImplementation(({ state }: { state: string }) => {
				capturedState = state;
				return Promise.resolve("https://auth.enablebanking.com/connect");
			});
		const completeAuth = vi.fn().mockResolvedValue({
			sessionId: "sess-1",
			consentExpires: "2026-12-01T00:00:00Z",
			accounts: [{ name: "Main", type: "checking", iban: "FI12345" }],
		});

		const { app } = makeApp({ startAuth, completeAuth });
		const agent = request.agent(app);

		await agent
			.post("/api/auth/start")
			.send({ aspspId: "nordea-fi", aspspName: "Nordea", country: "FI" });

		const res = await agent.get(
			`/api/auth/callback?code=abc&state=${capturedState}`,
		);

		expect(res.status).toBe(302);
		expect(res.headers.location).toContain("step=done");
	});

	test("GET /api/auth/callback with mismatched nonce returns 400", async () => {
		const { app } = makeApp({ completeAuth: vi.fn() });

		const res = await request(app).get(
			"/api/auth/callback?code=abc&state=wrong-nonce",
		);

		expect(res.status).toBe(400);
		expect(res.body.error).toBe("nonce mismatch");
	});

	test("POST /api/auth/select-account inserts a bank account row", async () => {
		const db = makeDb();
		const { app } = makeApp({}, db);

		const res = await request(app).post("/api/auth/select-account").send({
			sessionId: "sess-1",
			accountIndex: 0,
			aspspId: "nordea-fi",
			aspspName: "Nordea",
			country: "FI",
			iban: "FI12345",
			accountName: "Main",
			accountType: "checking",
			consentExpires: "2026-12-01T00:00:00Z",
		});

		expect(res.status).toBe(200);
		expect(res.body.ok).toBe(true);

		const rows = db.select().from(schema.bankAccounts).all();
		expect(rows).toHaveLength(1);
		expect(rows[0].iban).toBe("FI12345");
	});
});
