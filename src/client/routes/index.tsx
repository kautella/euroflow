import { createFileRoute, redirect } from "@tanstack/react-router";
import { isConfigured } from "../seed/settings";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({ to: isConfigured ? "/status" : "/setup" });
	},
	component: () => null,
});
