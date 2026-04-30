import { Link } from "@tanstack/react-router";
import { useSyncEvents } from "../hooks/useSyncEvents";
import { Icons } from "./Icon";

function pad(n: number) {
	return String(n).padStart(2, "0");
}

function fmtTime(d: Date) {
	return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function DaemonRow({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex justify-between gap-2">
			<span className="text-sidebar-text" style={{ opacity: 0.5 }}>
				{label}
			</span>
			<span>{value}</span>
		</div>
	);
}

const navItems = [
	{ to: "/status" as const, label: "Status", Icon: Icons.Status },
	{ to: "/banks" as const, label: "Banks", Icon: Icons.Bank },
	{ to: "/log" as const, label: "Sync log", Icon: Icons.Log },
	{ to: "/settings" as const, label: "Settings", Icon: Icons.Settings },
];

export function Sidebar() {
	const { syncStatus, lastSyncAt, nextSyncIn, accountsCount } = useSyncEvents();

	const statusColor =
		syncStatus === "ok"
			? "text-status-ok"
			: syncStatus === "warn"
				? "text-status-warn"
				: "text-status-err";

	const statusLabel =
		syncStatus === "ok"
			? "● running"
			: syncStatus === "warn"
				? "● degraded"
				: "● error";

	return (
		<aside
			className="flex flex-col flex-shrink-0 border-r"
			style={{
				width: "var(--sidebar-width)",
				background: "var(--color-sidebar-bg)",
				color: "var(--color-sidebar-text)",
				borderColor: "rgba(255,255,255,0.04)",
			}}
		>
			{/* Brand */}
			<div
				className="px-4 pt-5 pb-4 border-b"
				style={{ borderColor: "rgba(255,255,255,0.08)" }}
			>
				<div className="flex items-center gap-2">
					<div
						className="flex flex-col items-center justify-center font-mono text-white flex-shrink-0"
						style={{
							width: 32,
							height: 32,
							borderRadius: 4,
							background: "linear-gradient(135deg, #a368fc, #7a0ecc)",
							lineHeight: 1,
							padding: "2px 3px",
						}}
					>
						<span style={{ fontSize: 6, opacity: 0.75 }}>63</span>
						<span
							style={{
								fontSize: 15,
								fontWeight: 800,
								letterSpacing: "-0.04em",
							}}
						>
							Ef
						</span>
						<span
							style={{ fontSize: 5, opacity: 0.75, letterSpacing: "0.06em" }}
						>
							euroflow
						</span>
					</div>
					<div>
						<div className="font-semibold text-sidebar-text-selected text-medium">
							euroflow
						</div>
						<div
							className="font-mono text-page-text-light"
							style={{ fontSize: 11 }}
						>
							v0.4.2 · self-hosted
						</div>
					</div>
				</div>
			</div>

			{/* Nav */}
			<nav className="py-3 flex-1">
				{navItems.map(({ to, label, Icon }) => (
					<Link
						key={to}
						to={to}
						activeProps={{
							className:
								"flex items-center gap-2 px-4 py-2 text-small text-sidebar-text-selected border-l-[3px] border-nav-active-border hover:bg-sidebar-item-hover cursor-pointer",
						}}
						inactiveProps={{
							className:
								"flex items-center gap-2 px-4 py-2 text-small text-sidebar-text hover:bg-sidebar-item-hover border-l-[3px] border-transparent cursor-pointer",
						}}
					>
						<Icon size={16} />
						<span>{label}</span>
					</Link>
				))}
			</nav>

			{/* Sync daemon card */}
			<div
				className="px-4 py-3.5 border-t"
				style={{ borderColor: "rgba(255,255,255,0.08)" }}
			>
				<div
					className="uppercase tracking-widest mb-2 text-sidebar-text"
					style={{ fontSize: 11, opacity: 0.5 }}
				>
					Sync daemon
				</div>
				<div
					className="font-mono text-sidebar-text"
					style={{ fontSize: 12, lineHeight: 1.7 }}
				>
					<DaemonRow
						label="status"
						value={<span className={statusColor}>{statusLabel}</span>}
					/>
					<DaemonRow label="last" value={fmtTime(lastSyncAt)} />
					<DaemonRow label="next" value={nextSyncIn} />
					<DaemonRow label="accts" value={accountsCount} />
				</div>
				<button
					type="button"
					className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover cursor-pointer"
				>
					<Icons.Refresh size={14} />
					Sync now
				</button>
			</div>
		</aside>
	);
}
