import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { settings } from "../db/schema";

const SENSITIVE_KEYS = new Set([
	"smtp_password",
	"actual_password",
	"actual_e2e_password",
]);

const MASKED = "••••••••";

function encrypt(value: string, keyHex: string): string {
	const key = Buffer.from(keyHex, "hex");
	const iv = randomBytes(16);
	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(value, "utf8"),
		cipher.final(),
	]);
	const tag = cipher.getAuthTag();
	return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(stored: string, keyHex: string): string {
	const [ivHex, tagHex, dataHex] = stored.split(":");
	const key = Buffer.from(keyHex, "hex");
	const iv = Buffer.from(ivHex, "hex");
	const tag = Buffer.from(tagHex, "hex");
	const data = Buffer.from(dataHex, "hex");
	const decipher = createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(tag);
	return decipher.update(data) + decipher.final("utf8");
}

export class SettingsStore {
	constructor(private readonly db: Db) {}

	bootstrap() {
		const encKey = this.getRaw("encryption_key");
		if (!encKey) {
			this.setRaw("encryption_key", randomBytes(32).toString("hex"));
		}
		const sessionSecret = this.getRaw("session_secret");
		if (!sessionSecret) {
			this.setRaw("session_secret", randomBytes(64).toString("hex"));
		}
	}

	private getRaw(key: string): string | null {
		const row = this.db
			.select({ value: settings.value })
			.from(settings)
			.where(eq(settings.key, key))
			.get();
		return row?.value ?? null;
	}

	private setRaw(key: string, value: string) {
		this.db
			.insert(settings)
			.values({ key, value })
			.onConflictDoUpdate({ target: settings.key, set: { value } })
			.run();
	}

	get(key: string): string | null {
		const raw = this.getRaw(key);
		if (raw === null) return null;
		if (SENSITIVE_KEYS.has(key) && raw !== "") {
			const encKey = this.getRaw("encryption_key");
			if (!encKey) return null;
			try {
				return decrypt(raw, encKey);
			} catch {
				return null;
			}
		}
		return raw;
	}

	set(key: string, value: string) {
		let stored = value;
		if (SENSITIVE_KEYS.has(key) && value !== "") {
			const encKey = this.getRaw("encryption_key");
			if (!encKey) throw new Error("encryption_key not initialised");
			stored = encrypt(value, encKey);
		}
		this.setRaw(key, stored);
	}

	setMany(entries: Record<string, string>) {
		for (const [key, value] of Object.entries(entries)) {
			this.set(key, value);
		}
	}

	getAll(): Record<string, string> {
		const rows = this.db.select().from(settings).all();
		const _encKey = this.getRaw("encryption_key");
		const result: Record<string, string> = {};
		for (const row of rows) {
			if (row.key === "encryption_key" || row.key === "session_secret") {
				continue;
			}
			if (SENSITIVE_KEYS.has(row.key)) {
				result[row.key] = MASKED;
			} else {
				result[row.key] = row.value;
			}
		}
		return result;
	}
}
