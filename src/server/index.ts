import { resolve } from "node:path";
import express from "express";
import pino from "pino";
import { createDb } from "./db/client";

const DATA_DIR = process.env.DATA_DIR ?? "./data";
const PORT = Number(process.env.PORT ?? 3001);
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";

const log = pino({ level: LOG_LEVEL });

export const db = createDb(resolve(DATA_DIR, "euroflow.db"));
log.info({ path: resolve(DATA_DIR, "euroflow.db") }, "database ready");

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ ok: true });
});

const server = app.listen(PORT, () => {
	log.info({ port: PORT }, "server listening");
});

process.on("SIGTERM", () => {
	log.info("SIGTERM received, shutting down");
	server.close(() => process.exit(0));
});
