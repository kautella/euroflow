import { Router } from "express";
import type { Db } from "../db/client";
import { bankAccounts } from "../db/schema";
import type { EnableBankingClient } from "../lib/enable-banking";

type BanksRouterDeps = { db: Db; getEb: () => EnableBankingClient };

export function banksRouter({ db, getEb }: BanksRouterDeps) {
	const router = Router();

	router.get("/", async (req, res) => {
		const country = req.query.country as string | undefined;
		const banks = await getEb().getBanks(country);
		res.json({ banks });
	});

	router.get("/connected", (_req, res) => {
		const rows = db.select().from(bankAccounts).all();
		const now = Date.now();

		const groupMap = new Map<string, typeof rows>();
		for (const row of rows) {
			const key = `${row.aspspId}::${row.sessionId}`;
			const existing = groupMap.get(key) ?? [];
			existing.push(row);
			groupMap.set(key, existing);
		}

		const groups = [...groupMap.values()].map((accounts) => {
			const first = accounts[0];
			return {
				bank: {
					id: first.aspspId,
					name: first.institutionName,
					country: first.country,
				},
				consentId: first.sessionId,
				accounts: accounts.map((a) => ({
					id: a.id,
					name: a.accountName,
					iban: a.iban,
					type: a.accountType,
					consentExpires: a.consentExpires,
					expiresInDays: Math.floor(
						(new Date(a.consentExpires).getTime() - now) / 86_400_000,
					),
				})),
			};
		});

		res.json({ groups });
	});

	return router;
}
