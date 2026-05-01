import * as Tooltip from "@radix-ui/react-tooltip";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { BannerProvider } from "../contexts/BannerContext";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

function AppShell() {
	return (
		<BannerProvider>
		<Tooltip.Provider delayDuration={300}>
			<div className="flex flex-col h-screen bg-page-bg text-page-text">
				<Topbar />
				<div className="flex flex-1 overflow-hidden">
					<Sidebar />
					<main
						className="flex-1 overflow-auto"
						style={{
							background:
								"radial-gradient(ellipse at top left, var(--color-sidebar-bg), var(--color-page-bg) 50%)",
						}}
					>
						<Outlet />
					</main>
				</div>
			</div>
		</Tooltip.Provider>
		</BannerProvider>
	);
}

export const Route = createRootRoute({
	component: AppShell,
});
