import { resolve } from "node:path";
import cookieSession from "cookie-session";
import express from "express";
import pino from "pino";
import { createDb } from "./db/client";
import { EnableBankingClient } from "./lib/enable-banking";
import { SettingsStore } from "./lib/settings-store";
import { authRouter } from "./routes/auth";
import { banksRouter } from "./routes/banks";
import { settingsRouter } from "./routes/settings";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const PORT = Number(process.env.PORT ?? 3001);
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
const REDIRECT_URI =
	process.env.REDIRECT_URI ?? `http://localhost:${PORT}/api/callback`;

const log = pino({ level: LOG_LEVEL });

export const db = createDb(resolve(DATA_DIR, "euroflow.db"));
log.info({ path: resolve(DATA_DIR, "euroflow.db") }, "database ready");

export const store = new SettingsStore(db);
store.bootstrap();

const eb = new EnableBankingClient({
	applicationId: store.get("eb_application_id") ?? "",
	privateKeyPem: store.get("eb_private_key") ?? "",
});

const app = express();
app.use(express.json());
app.use(
	cookieSession({
		name: "session",
		secret: store.get("session_secret") ?? "dev-secret",
		httpOnly: true,
		sameSite: "lax",
	}),
);

app.get("/health", (_req, res) => {
	res.json({ ok: true });
});

app.use("/api/settings", settingsRouter(store));
app.use("/api/auth", authRouter({ db, eb, redirectUri: REDIRECT_URI }));
app.use("/api/banks", banksRouter({ db, eb }));

const server = app.listen(PORT, () => {
	log.info({ port: PORT }, "server listening");
});

process.on("SIGTERM", () => {
	log.info("SIGTERM received, shutting down");
	server.close(() => process.exit(0));
});
