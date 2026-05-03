import { describe, expect, test } from "vitest";
import { settingsActual, settingsNotifications } from "../seed/settings";
import {
	decodeActual,
	decodeIsConfigured,
	decodeNotifications,
	decodeSchedule,
	encodeActual,
	encodeNotifications,
	encodeSchedule,
} from "./settings-codec";

describe("settings-codec", () => {
	test("encodeActual → decodeActual round-trips all fields", () => {
		const input = {
			url: "http://localhost:5006",
			password: "pass",
			syncId: "abc-123",
			e2ePassword: "e2e",
		};
		expect(decodeActual(encodeActual(input))).toEqual(input);
	});

	test("decodeActual falls back to seed defaults for missing keys", () => {
		expect(decodeActual({})).toEqual(settingsActual);
	});

	test("encodeNotifications → decodeNotifications round-trips booleans", () => {
		const input = {
			...settingsNotifications,
			email: true,
			webhook: false,
			ntfy: true,
			onFailure: false,
			dailySummary: true,
		};
		expect(decodeNotifications(encodeNotifications(input))).toEqual(input);
	});

	test("encodeSchedule → decodeSchedule round-trips", () => {
		const input = {
			frequency: "6h" as const,
			customCron: "0 */6 * * *",
			anchorTime: "08:00",
			timezone: "Europe/Berlin",
			catchUp: false,
			skipWeekends: true,
		};
		expect(decodeSchedule(encodeSchedule(input))).toEqual(input);
	});

	test("decodeIsConfigured returns false when key absent", () => {
		expect(decodeIsConfigured({})).toBe(false);
	});

	test("decodeIsConfigured returns true when key is 'true'", () => {
		expect(decodeIsConfigured({ is_configured: "true" })).toBe(true);
	});
});
