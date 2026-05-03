import { randomBytes } from "node:crypto";
import { Router } from "express";
import type { Db } from "../db/client";
import { bankAccounts } from "../db/schema";
import type { EnableBankingClient } from "../lib/enable-banking";

declare module "express-session" {
	interface SessionData {
		nonce?: string;
		aspspId?: string;
		aspspName?: string;
		country?: string;
		pendingAccounts?: string;
	}
}

type AuthRouterDeps = {
	db: Db;
	eb: EnableBankingClient;
	redirectUri: string;
};

export function authRouter({ db, eb, redirectUri }: AuthRouterDeps) {
	const router = Router();

	router.post("/start", async (req, res) => {
		const { aspspId, aspspName, country } = req.body as {
			aspspId: string;
			aspspName: string;
			country: string;
		};

		const nonce = randomBytes(16).toString("hex");
		(req as unknown as { session: Record<string, string> }).session.nonce =
			nonce;
		(req as unknown as { session: Record<string, string> }).session.aspspId =
			aspspId;
		(req as unknown as { session: Record<string, string> }).session.aspspName =
			aspspName;
		(req as unknown as { session: Record<string, string> }).session.country =
			country;

		const authUrl = await eb.startAuth({ aspspId, redirectUri, state: nonce });
		res.json({ authUrl });
	});

	router.get("/callback", async (req, res) => {
		const { code, state } = req.query as { code: string; state: string };
		const session = (req as unknown as { session: Record<string, string> })
			.session;

		if (!session.nonce || session.nonce !== state) {
			res.status(400).json({ error: "nonce mismatch" });
			return;
		}

		const result = await eb.completeAuth({ code, aspspId: session.aspspId });

		if (result.accounts.length === 1) {
			const acct = result.accounts[0];
			db.insert(bankAccounts)
				.values({
					aspspId: session.aspspId,
					institutionName: session.aspspName,
					country: session.country,
					iban: acct.iban ?? null,
					accountName: acct.name,
					accountType: acct.type,
					sessionId: result.sessionId,
					consentExpires: result.consentExpires,
					createdAt: new Date().toISOString(),
				})
				.run();
			session.nonce = "";
			res.redirect("/banks?step=done");
		} else {
			session.sessionId = result.sessionId;
			session.consentExpires = result.consentExpires;
			session.pendingAccounts = JSON.stringify(result.accounts);
			res.redirect("/banks?step=pick");
		}
	});

	router.get("/pending-accounts", (req, res) => {
		const session = (req as unknown as { session: Record<string, string> })
			.session;
		if (!session.pendingAccounts) {
			res.status(404).json({ error: "no pending accounts" });
			return;
		}
		res.json({
			aspspId: session.aspspId,
			aspspName: session.aspspName,
			country: session.country,
			sessionId: session.sessionId,
			consentExpires: session.consentExpires,
			accounts: JSON.parse(session.pendingAccounts),
		});
	});

	router.post("/select-account", (req, res) => {
		const {
			sessionId,
			aspspId,
			aspspName,
			country,
			iban,
			accountName,
			accountType,
			consentExpires,
		} = req.body as {
			sessionId: string;
			aspspId: string;
			aspspName: string;
			country: string;
			iban?: string;
			accountName: string;
			accountType: string;
			consentExpires: string;
		};

		db.insert(bankAccounts)
			.values({
				aspspId,
				institutionName: aspspName,
				country,
				iban: iban ?? null,
				accountName,
				accountType,
				sessionId,
				consentExpires,
				createdAt: new Date().toISOString(),
			})
			.run();

		res.json({ ok: true });
	});

	return router;
}
