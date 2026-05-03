import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AspspInfo } from "../../server/lib/enable-banking";

export type ConnectedBankGroup = {
	bank: { id: string; name: string; country: string };
	consentId: string;
	accounts: {
		id: number;
		name: string;
		iban: string | null;
		type: string;
		consentExpires: string;
		expiresInDays: number;
	}[];
};

export type PendingAccounts = {
	aspspId: string;
	aspspName: string;
	country: string;
	sessionId: string;
	consentExpires: string;
	accounts: { name: string; type: string; iban?: string }[];
};

const CONNECTED_KEY = ["banks", "connected"] as const;

export function useBankSearchQuery(country: string, enabled: boolean) {
	return useQuery({
		queryKey: ["banks", "search", country],
		queryFn: async (): Promise<AspspInfo[]> => {
			const res = await fetch(
				`/api/banks?country=${encodeURIComponent(country)}`,
			);
			if (!res.ok) throw new Error(`GET /api/banks ${res.status}`);
			const data = (await res.json()) as { banks: AspspInfo[] };
			return data.banks;
		},
		enabled,
		staleTime: 24 * 60 * 60 * 1000,
	});
}

export function useConnectedBanksQuery() {
	return useQuery({
		queryKey: CONNECTED_KEY,
		queryFn: async (): Promise<ConnectedBankGroup[]> => {
			const res = await fetch("/api/banks/connected");
			if (!res.ok) throw new Error(`GET /api/banks/connected ${res.status}`);
			const data = (await res.json()) as { groups: ConnectedBankGroup[] };
			return data.groups;
		},
	});
}

export function usePendingAccountsQuery(enabled: boolean) {
	return useQuery({
		queryKey: ["banks", "pending"],
		queryFn: async (): Promise<PendingAccounts> => {
			const res = await fetch("/api/auth/pending-accounts");
			if (!res.ok)
				throw new Error(`GET /api/auth/pending-accounts ${res.status}`);
			return res.json() as Promise<PendingAccounts>;
		},
		enabled,
	});
}

export function useSelectAccountMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (body: {
			sessionId: string;
			aspspId: string;
			aspspName: string;
			country: string;
			iban?: string;
			accountName: string;
			accountType: string;
			consentExpires: string;
		}) => {
			const res = await fetch("/api/auth/select-account", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok)
				throw new Error(`POST /api/auth/select-account ${res.status}`);
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: CONNECTED_KEY }),
	});
}
