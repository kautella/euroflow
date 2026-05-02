import { createContext, useContext, useState } from "react";

export type BannerId = "settings-security" | "cert" | "reauth" | "sync-status";

type BannerContextValue = {
	dismissed: Set<BannerId>;
	dismiss: (id: BannerId) => void;
};

const BannerContext = createContext<BannerContextValue | null>(null);

export function BannerProvider({ children }: { children: React.ReactNode }) {
	const [dismissed, setDismissed] = useState<Set<BannerId>>(new Set());
	const dismiss = (id: BannerId) => setDismissed((s) => new Set(s).add(id));

	return (
		<BannerContext value={{ dismissed, dismiss }}>{children}</BannerContext>
	);
}

export function useBanners() {
	const ctx = useContext(BannerContext);
	if (!ctx) throw new Error("useBanners must be used within BannerProvider");
	return ctx;
}
