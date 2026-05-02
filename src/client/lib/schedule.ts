import { Cron } from "croner";
import type { SettingsSchedule } from "../seed/settings";

export function scheduleToCron(d: SettingsSchedule): string {
	const [h, m] = d.anchorTime.split(":").map(Number);
	if (d.frequency === "custom") return d.customCron;
	if (d.frequency === "24h") return `0 ${m} ${h} * * *`;
	if (d.frequency === "12h") return `0 ${m} ${h},${(h + 12) % 24} * * *`;
	if (d.frequency === "6h")
		return `0 ${m} ${h},${(h + 6) % 24},${(h + 12) % 24},${(h + 18) % 24} * * *`;
	return `0 ${m} * * * *`; // 1h
}

export function nextRunFormatted(
	cronExpr: string,
	timezone: string,
): string | null {
	try {
		const next = new Cron(cronExpr, { timezone }).nextRun();
		if (!next) return null;
		const fmt = new Intl.DateTimeFormat("en-CA", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
		return fmt.format(next).replace(", ", " ");
	} catch {
		return null;
	}
}
