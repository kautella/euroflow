import type {
	SettingsActual,
	SettingsAdvanced,
	SettingsNotifications,
	SettingsSchedule,
} from "../seed/settings";
import {
	settingsActual,
	settingsAdvanced,
	settingsNotifications,
	settingsSchedule,
} from "../seed/settings";

type KV = Record<string, string>;

const bool = (v: string | undefined, fallback: boolean): boolean =>
	v === undefined ? fallback : v === "true";

const num = (v: string | undefined, fallback: number): number =>
	v === undefined || v === "" ? fallback : Number(v);

export function decodeActual(kv: KV): SettingsActual {
	return {
		url: kv.actual_url ?? settingsActual.url,
		password: kv.actual_password ?? settingsActual.password,
		syncId: kv.actual_sync_id ?? settingsActual.syncId,
		e2ePassword: kv.actual_e2e_password ?? settingsActual.e2ePassword,
	};
}

export function encodeActual(d: SettingsActual): KV {
	return {
		actual_url: d.url,
		actual_password: d.password,
		actual_sync_id: d.syncId,
		actual_e2e_password: d.e2ePassword,
	};
}

export function decodeNotifications(kv: KV): SettingsNotifications {
	const s = settingsNotifications;
	return {
		email: bool(kv.notifications_email, s.email),
		webhook: bool(kv.notifications_webhook, s.webhook),
		ntfy: bool(kv.notifications_ntfy, s.ntfy),
		smtpHost: kv.smtp_host ?? s.smtpHost,
		smtpPort: kv.smtp_port ?? s.smtpPort,
		smtpUser: kv.smtp_user ?? s.smtpUser,
		smtpPass: kv.smtp_password ?? s.smtpPass,
		smtpFrom: kv.smtp_from ?? s.smtpFrom,
		webhookUrl: kv.webhook_url ?? s.webhookUrl,
		ntfyUrl: kv.ntfy_url ?? s.ntfyUrl,
		onFailure: bool(kv.notify_on_failure, s.onFailure),
		onExpiring: bool(kv.notify_on_expiring, s.onExpiring),
		onExpired: bool(kv.notify_on_expired, s.onExpired),
		dailySummary: bool(kv.notify_daily_summary, s.dailySummary),
	};
}

export function encodeNotifications(d: SettingsNotifications): KV {
	return {
		notifications_email: String(d.email),
		notifications_webhook: String(d.webhook),
		notifications_ntfy: String(d.ntfy),
		smtp_host: d.smtpHost,
		smtp_port: d.smtpPort,
		smtp_user: d.smtpUser,
		smtp_password: d.smtpPass,
		smtp_from: d.smtpFrom,
		webhook_url: d.webhookUrl,
		ntfy_url: d.ntfyUrl,
		notify_on_failure: String(d.onFailure),
		notify_on_expiring: String(d.onExpiring),
		notify_on_expired: String(d.onExpired),
		notify_daily_summary: String(d.dailySummary),
	};
}

export function decodeSchedule(kv: KV): SettingsSchedule {
	const s = settingsSchedule;
	const freq =
		(kv.sync_frequency as SettingsSchedule["frequency"]) ?? s.frequency;
	return {
		frequency: freq,
		customCron: kv.sync_custom_cron ?? s.customCron,
		anchorTime: kv.sync_anchor_time ?? s.anchorTime,
		timezone: kv.sync_timezone ?? s.timezone,
		catchUp: bool(kv.sync_catch_up, s.catchUp),
		skipWeekends: bool(kv.sync_skip_weekends, s.skipWeekends),
	};
}

export function encodeSchedule(d: SettingsSchedule): KV {
	return {
		sync_frequency: d.frequency,
		sync_custom_cron: d.customCron,
		sync_anchor_time: d.anchorTime,
		sync_timezone: d.timezone,
		sync_catch_up: String(d.catchUp),
		sync_skip_weekends: String(d.skipWeekends),
	};
}

export function decodeAdvanced(kv: KV): SettingsAdvanced {
	const s = settingsAdvanced;
	return {
		logLevel: (kv.log_level as SettingsAdvanced["logLevel"]) ?? s.logLevel,
		httpTimeoutMs: num(kv.http_timeout_ms, s.httpTimeoutMs),
		batchSize: num(kv.batch_size, s.batchSize),
		maxRetries: num(kv.max_retries, s.maxRetries),
		dedup: bool(kv.dedup, s.dedup),
		importPending: bool(kv.import_pending, s.importPending),
		resetPayees: bool(kv.reset_payees, s.resetPayees),
	};
}

export function encodeAdvanced(d: SettingsAdvanced): KV {
	return {
		log_level: d.logLevel,
		http_timeout_ms: String(d.httpTimeoutMs),
		batch_size: String(d.batchSize),
		max_retries: String(d.maxRetries),
		dedup: String(d.dedup),
		import_pending: String(d.importPending),
		reset_payees: String(d.resetPayees),
	};
}

export type SettingsEb = {
	appId: string;
	privateKey: string;
};

export function decodeEb(kv: KV): SettingsEb {
	return {
		appId: kv.eb_application_id ?? "",
		privateKey: kv.eb_private_key ?? "",
	};
}

export function encodeEb(d: SettingsEb): KV {
	return {
		eb_application_id: d.appId,
		eb_private_key: d.privateKey,
	};
}

export function decodeIsConfigured(kv: KV): boolean {
	return bool(kv.is_configured, false);
}
