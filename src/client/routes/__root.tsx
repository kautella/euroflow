import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

function AppShell() {
	return (
		<div className="flex flex-col min-h-screen bg-page-bg text-page-text">
			<Topbar />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar />
				<main className="flex-1 overflow-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}

export const Route = createRootRoute({
	component: AppShell,
});
