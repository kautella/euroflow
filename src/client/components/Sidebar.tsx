import { Link } from "@tanstack/react-router";
import { useState } from "react";
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

const COLLAPSED_WIDTH = 52;

export function Sidebar() {
	const [collapsed, setCollapsed] = useState(false);
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
			className="flex flex-col flex-shrink-0 border-r transition-[width] duration-200"
			style={{
				width: collapsed ? COLLAPSED_WIDTH : "var(--sidebar-width)",
				background: "var(--color-sidebar-bg)",
				color: "var(--color-sidebar-text)",
				borderColor: "rgba(255,255,255,0.04)",
			}}
		>
			{/* Brand */}
			<div
				className="relative flex items-center border-b"
				style={{
					borderColor: "rgba(255,255,255,0.08)",
					padding: collapsed ? "18px 10px" : "20px 16px 16px",
					justifyContent: collapsed ? "center" : "flex-start",
					gap: collapsed ? 0 : 8,
					minHeight: 64,
				}}
			>
				{/* Collapse toggle — floats on the right border at the divider */}
				<button
					type="button"
					onClick={() => setCollapsed((c) => !c)}
					title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
					className="absolute z-20 flex items-center justify-center w-6 h-6 rounded-full border"
					style={{
						right: 0,
						bottom: 0,
						transform: "translateX(50%) translateY(50%)",
						background: "var(--color-sidebar-bg)",
						borderColor: "rgba(255,255,255,0.15)",
						color: "var(--color-sidebar-text)",
					}}
				>
					{collapsed ? (
						<Icons.Expand size={12} />
					) : (
						<Icons.Collapse size={12} />
					)}
				</button>
				<Link
					to="/status"
					className="flex items-center"
					style={{ gap: collapsed ? 0 : 8 }}
				>
					<img
						src="/logo-mark.svg"
						width={32}
						height={32}
						alt=""
						style={{ borderRadius: 2, flexShrink: 0 }}
					/>
					{!collapsed && (
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
					)}
				</Link>
			</div>

			{/* Nav */}
			<nav className="py-3 flex-1">
				{navItems.map(({ to, label, Icon }) => (
					<Link
						key={to}
						to={to}
						title={collapsed ? label : undefined}
						activeProps={{
							className: collapsed
								? "flex items-center justify-center py-2 text-sidebar-text-selected border-l-[3px] border-nav-active-border hover:bg-sidebar-item-hover cursor-pointer"
								: "flex items-center gap-2 px-4 py-2 text-small text-sidebar-text-selected border-l-[3px] border-nav-active-border hover:bg-sidebar-item-hover cursor-pointer",
						}}
						inactiveProps={{
							className: collapsed
								? "flex items-center justify-center py-2 text-sidebar-text hover:bg-sidebar-item-hover border-l-[3px] border-transparent cursor-pointer"
								: "flex items-center gap-2 px-4 py-2 text-small text-sidebar-text hover:bg-sidebar-item-hover border-l-[3px] border-transparent cursor-pointer",
						}}
					>
						<Icon size={16} />
						{!collapsed && <span>{label}</span>}
					</Link>
				))}
			</nav>

			{/* Sync now */}
			<div
				className="border-t"
				style={{
					borderColor: "rgba(255,255,255,0.08)",
					padding: collapsed ? "10px 8px" : "12px 16px",
				}}
			>
				<button
					type="button"
					title={collapsed ? "Sync now" : undefined}
					className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
				>
					<Icons.Refresh size={14} />
					{!collapsed && "Sync now"}
				</button>
			</div>

			{/* Sync status card — hidden when collapsed */}
			{!collapsed && (
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
			)}

		</aside>
	);
}
