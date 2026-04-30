import { Link } from "@tanstack/react-router";
import { useSyncEvents } from "../hooks/useSyncEvents";
import { Icons } from "./Icon";

function pad(n: number) {
	return String(n).padStart(2, "0");
}

function fmtTime(d: Date) {
	return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function ProcessRow({
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
					<img
						src="/logo-mark.svg"
						width={32}
						height={32}
						alt=""
						style={{ borderRadius: 2, flexShrink: 0 }}
					/>
					<div>
						<img
							src="/wordmark.svg"
							alt="euroflow"
							style={{ height: 14, width: "auto", display: "block" }}
						/>
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

			{/* Sync status card */}
			<div
				className="px-4 py-3.5 border-t"
				style={{ borderColor: "rgba(255,255,255,0.08)" }}
			>
				<div
					className="uppercase tracking-widest mb-2 text-sidebar-text"
					style={{ fontSize: 11, opacity: 0.5 }}
				>
					Sync process status
				</div>
				<div
					className="font-mono text-sidebar-text"
					style={{ fontSize: 12, lineHeight: 1.7 }}
				>
					<ProcessRow
						label="status"
						value={<span className={statusColor}>{statusLabel}</span>}
					/>
					<ProcessRow label="last" value={fmtTime(lastSyncAt)} />
					<ProcessRow label="next" value={nextSyncIn} />
					<ProcessRow label="accts" value={accountsCount} />
				</div>
			</div>
		</aside>
	);
}
