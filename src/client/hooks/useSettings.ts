import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["settings"] as const;

async function fetchSettings(): Promise<Record<string, string>> {
	const res = await fetch("/api/settings");
	if (!res.ok) throw new Error(`GET /api/settings ${res.status}`);
	return res.json() as Promise<Record<string, string>>;
}

async function patchSettings(patch: Record<string, string>): Promise<void> {
	const res = await fetch("/api/settings", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(patch),
	});
	if (!res.ok) throw new Error(`POST /api/settings ${res.status}`);
}

export function useSettingsQuery() {
	return useQuery({ queryKey: QUERY_KEY, queryFn: fetchSettings });
}

export function useSettingsMutation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: patchSettings,
		onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
	});
}
