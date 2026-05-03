import { importPKCS8, SignJWT } from "jose";

const BASE_URL = "https://api.enablebanking.com";

export type AspspInfo = {
	id: string;
	name: string;
	country: string;
	bic: string;
	maxDays: number;
};

export type AuthAccount = {
	name: string;
	type: string;
	iban?: string;
};

export type AuthResult = {
	sessionId: string;
	consentExpires: string;
	accounts: AuthAccount[];
};

type Config = {
	applicationId: string;
	privateKeyPem: string;
	baseUrl?: string;
};

export class EnableBankingClient {
	private readonly applicationId: string;
	private readonly privateKeyPem: string;
	private readonly baseUrl: string;
	private banksCache: { data: AspspInfo[]; expiresAt: number } | null = null;

	constructor(config: Config) {
		this.applicationId = config.applicationId;
		this.privateKeyPem = config.privateKeyPem;
		this.baseUrl = config.baseUrl ?? BASE_URL;
	}

	private async makeJwt(): Promise<string> {
		const key = await importPKCS8(this.privateKeyPem, "RS256");
		const now = Math.floor(Date.now() / 1000);
		return new SignJWT({})
			.setProtectedHeader({ alg: "RS256", kid: this.applicationId })
			.setIssuer("enablebanking.com")
			.setAudience("api.enablebanking.com")
			.setIssuedAt(now)
			.setExpirationTime(now + 3600)
			.sign(key);
	}

	private async request<T>(
		path: string,
		params?: Record<string, string>,
	): Promise<T> {
		const url = new URL(path, this.baseUrl);
		if (params) {
			for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
		}
		const token = await this.makeJwt();
		const res = await fetch(url.toString(), {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) throw new Error(`Enable Banking ${res.status}: ${path}`);
		return res.json() as Promise<T>;
	}

	private async post<T>(path: string, body: unknown): Promise<T> {
		const token = await this.makeJwt();
		const res = await fetch(new URL(path, this.baseUrl).toString(), {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});
		if (!res.ok) throw new Error(`Enable Banking ${res.status}: ${path}`);
		return res.json() as Promise<T>;
	}

	async startAuth(params: {
		aspspId: string;
		redirectUri: string;
		state: string;
	}): Promise<string> {
		const body = await this.post<{ url: string }>("/auth", {
			aspsp: { name: params.aspspId, country: "" },
			redirect_url: params.redirectUri,
			state: params.state,
			psu_type: "personal",
			credentials_type: "redirect",
		});
		return body.url;
	}

	async completeAuth(params: {
		code: string;
		aspspId: string;
	}): Promise<AuthResult> {
		const body = await this.post<{
			session_id: string;
			valid_until: string;
			accounts: { details?: { iban?: string }; identification_hash: string }[];
		}>("/sessions", {
			code: params.code,
			aspsp: { name: params.aspspId, country: "" },
		});
		return {
			sessionId: body.session_id,
			consentExpires: body.valid_until,
			accounts: body.accounts.map((a) => ({
				name: a.identification_hash,
				type: "checking",
				iban: a.details?.iban,
			})),
		};
	}

	async getBanks(country?: string): Promise<AspspInfo[]> {
		const now = Date.now();
		if (this.banksCache && this.banksCache.expiresAt > now) {
			return this.banksCache.data;
		}
		const params: Record<string, string> = {};
		if (country) params.country = country;
		const body = await this.request<{ aspsps: AspspInfo[] }>("/aspsps", params);
		this.banksCache = {
			data: body.aspsps,
			expiresAt: now + 24 * 60 * 60 * 1000,
		};
		return body.aspsps;
	}
}
