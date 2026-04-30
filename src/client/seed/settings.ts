export type SettingsActual = {
	url: string;
	password: string;
	syncId: string;
	e2ePassword: string;
};

export type SettingsNotifications = {
	email: boolean;
	webhook: boolean;
	ntfy: boolean;
	smtpHost: string;
	smtpPort: string;
	smtpUser: string;
	smtpPass: string;
	smtpFrom: string;
	webhookUrl: string;
	ntfyUrl: string;
	onFailure: boolean;
	onExpiring: boolean;
	onExpired: boolean;
	dailySummary: boolean;
};

export type SettingsSchedule = {
	frequency: "6h" | "12h" | "24h";
	anchorTime: string;
	timezone: string;
	catchUp: boolean;
	skipWeekends: boolean;
};

export type SettingsAdvanced = {
	logLevel: "info" | "debug" | "warn" | "error";
	httpTimeoutMs: number;
	batchSize: number;
	maxRetries: number;
	dedup: boolean;
	importPending: boolean;
	resetPayees: boolean;
};

export const settingsActual: SettingsActual = {
	url: "https://actual.example.com",
	password: "••••••••",
	syncId: "00000000-0000-0000-0000-000000000000",
	e2ePassword: "",
};

export const settingsNotifications: SettingsNotifications = {
	email: false,
	webhook: false,
	ntfy: false,
	smtpHost: "",
	smtpPort: "587",
	smtpUser: "",
	smtpPass: "",
	smtpFrom: "",
	webhookUrl: "",
	ntfyUrl: "",
	onFailure: true,
	onExpiring: true,
	onExpired: true,
	dailySummary: false,
};

export const settingsSchedule: SettingsSchedule = {
	frequency: "6h",
	anchorTime: "06:00",
	timezone: "Europe/Lisbon",
	catchUp: true,
	skipWeekends: false,
};

export const settingsAdvanced: SettingsAdvanced = {
	logLevel: "info",
	httpTimeoutMs: 30000,
	batchSize: 500,
	maxRetries: 3,
	dedup: true,
	importPending: false,
	resetPayees: false,
};

export const hasPassword = true;
