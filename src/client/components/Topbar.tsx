import { useEffect, useState } from "react";
import { useSyncEvents } from "../hooks/useSyncEvents";

function pad(n: number) {
	return String(n).padStart(2, "0");
}

function fmtUTC(d: Date) {
	return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function relTime(d: Date) {
	const diff = Math.floor((Date.now() - d.getTime()) / 1000);
	if (diff < 60) return `${diff}s ago`;
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

export function Topbar() {
	const { psd2Status, lastSyncAt } = useSyncEvents();
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<div
			className="font-mono flex items-center justify-between px-4 border-b border-table-border bg-page-bg text-page-text-subdued"
			style={{
				height: "var(--topbar-height)",
				fontSize: 11,
				letterSpacing: "0.04em",
			}}
		>
			<div className="flex gap-4">
				<span>EUROFLOW · /var/lib/euroflow</span>
				<span
					className={psd2Status === "up" ? "text-status-ok" : "text-status-err"}
				>
					● PSD2 LINK {psd2Status === "up" ? "UP" : "DOWN"}
				</span>
			</div>
			<div className="flex gap-4">
				<span>LAST SYNC {relTime(lastSyncAt)}</span>
				<span className="text-sidebar-text-selected">{fmtUTC(now)} UTC</span>
			</div>
		</div>
	);
}
