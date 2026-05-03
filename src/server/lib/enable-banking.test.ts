import { generateKeyPair, importPKCS8, jwtVerify } from "jose";
import { beforeAll, describe, expect, test, vi } from "vitest";
import { EnableBankingClient } from "./enable-banking";

let privateKeyPem: string;
let publicKey: CryptoKey;

beforeAll(async () => {
	const { privateKey, publicKey: pub } = await generateKeyPair("RS256", {
		extractable: true,
	});
	const exported = await crypto.subtle.exportKey("pkcs8", privateKey);
	const b64 = Buffer.from(exported).toString("base64");
	privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${b64}\n-----END PRIVATE KEY-----`;
	publicKey = pub;
});

describe("EnableBankingClient", () => {
	// 1 — JWT structure and claims
	test("signs requests with RS256 and correct claims", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ aspsps: [] }),
			}),
		);

		const client = new EnableBankingClient({
			applicationId: "app-123",
			privateKeyPem,
		});
		await client.getBanks();

		const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
			string,
			RequestInit,
		];
		const token = (init.headers as Record<string, string>)[
			"Authorization"
		].replace("Bearer ", "");

		const { payload, protectedHeader } = await jwtVerify(token, publicKey);
		expect(protectedHeader.alg).toBe("RS256");
		expect(protectedHeader.kid).toBe("app-123");
		expect(payload.iss).toBe("enablebanking.com");
		expect(payload.aud).toBe("api.enablebanking.com");
		expect(payload.exp).toBeGreaterThan(payload.iat as number);

		vi.unstubAllGlobals();
	});

	// 2
	test("getBanks returns mapped bank list from /aspsps", async () => {
		const aspsps = [
			{
				id: "bank-1",
				name: "Test Bank",
				country: "FI",
				bic: "TESTFI",
				maxDays: 90,
			},
		];
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({ ok: true, json: async () => ({ aspsps }) }),
		);

		const client = new EnableBankingClient({
			applicationId: "app-123",
			privateKeyPem,
		});
		const result = await client.getBanks();

		expect(result).toEqual(aspsps);
		vi.unstubAllGlobals();
	});

	// 3
	test("getBanks returns cached result on second call", async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue({ ok: true, json: async () => ({ aspsps: [] }) });
		vi.stubGlobal("fetch", mockFetch);

		const client = new EnableBankingClient({
			applicationId: "app-123",
			privateKeyPem,
		});
		await client.getBanks();
		await client.getBanks();

		expect(mockFetch).toHaveBeenCalledTimes(1);
		vi.unstubAllGlobals();
	});

	// 4
	test("getBanks re-fetches after TTL expires", async () => {
		const mockFetch = vi
			.fn()
			.mockResolvedValue({ ok: true, json: async () => ({ aspsps: [] }) });
		vi.stubGlobal("fetch", mockFetch);

		const client = new EnableBankingClient({
			applicationId: "app-123",
			privateKeyPem,
		});
		await client.getBanks();

		// Expire the cache
		// @ts-expect-error accessing private field in test
		client.banksCache!.expiresAt = Date.now() - 1;
		await client.getBanks();

		expect(mockFetch).toHaveBeenCalledTimes(2);
		vi.unstubAllGlobals();
	});

	// 5
	test("getBanks passes country query param when provided", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue({ ok: true, json: async () => ({ aspsps: [] }) }),
		);

		const client = new EnableBankingClient({
			applicationId: "app-123",
			privateKeyPem,
		});
		await client.getBanks("FI");

		const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
		expect(new URL(url).searchParams.get("country")).toBe("FI");
		vi.unstubAllGlobals();
	});
});
