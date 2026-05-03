import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		try {
			const res = await fetch("/api/settings");
			if (res.ok) {
				const kv = (await res.json()) as Record<string, string>;
				throw redirect({
					to: kv.is_configured === "true" ? "/status" : "/setup",
				});
			}
		} catch (e) {
			if (
				e instanceof Response ||
				(e as { _isRedirect?: boolean })?._isRedirect
			)
				throw e;
		}
		throw redirect({ to: "/setup" });
	},
	component: () => null,
});
