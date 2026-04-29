export type SyncState = {
	psd2Status: "up" | "down" | "error";
	lastSyncAt: Date;
	nextSyncIn: string;
	syncStatus: "ok" | "warn" | "err";
	accountsCount: number;
};

const SEED: SyncState = {
	psd2Status: "up",
	lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
	nextSyncIn: "in 4h",
	syncStatus: "ok",
	accountsCount: 3,
};

export function useSyncEvents(): SyncState {
	return SEED;
}
