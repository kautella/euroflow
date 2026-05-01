import { createContext, useContext, useState } from "react";

type BannerContextValue = {
	dismissed: Set<string>;
	dismiss: (id: string) => void;
};

const BannerContext = createContext<BannerContextValue | null>(null);

export function BannerProvider({ children }: { children: React.ReactNode }) {
	const [dismissed, setDismissed] = useState<Set<string>>(new Set());
	const dismiss = (id: string) =>
		setDismissed((s) => new Set(s).add(id));

	return (
		<BannerContext value={{ dismissed, dismiss }}>
			{children}
		</BannerContext>
	);
}

export function useBanners() {
	const ctx = useContext(BannerContext);
	if (!ctx) throw new Error("useBanners must be used within BannerProvider");
	return ctx;
}
