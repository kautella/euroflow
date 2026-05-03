import { Router } from "express";
import type { SettingsStore } from "../lib/settings-store";

export function settingsRouter(store: SettingsStore) {
	const router = Router();

	router.get("/", (_req, res) => {
		res.json(store.getAll());
	});

	router.post("/", (req, res) => {
		const body = req.body as unknown;
		if (typeof body !== "object" || body === null || Array.isArray(body)) {
			res.status(400).json({ error: "body must be a JSON object" });
			return;
		}
		const entries = body as Record<string, unknown>;
		const stringEntries: Record<string, string> = {};
		for (const [key, value] of Object.entries(entries)) {
			if (typeof value !== "string") {
				res.status(400).json({ error: `value for ${key} must be a string` });
				return;
			}
			stringEntries[key] = value;
		}
		store.setMany(stringEntries);
		res.json({ ok: true });
	});

	return router;
}
