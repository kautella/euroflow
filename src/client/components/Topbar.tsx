import { useEffect, useState } from "react";
import { useSyncEvents } from "../hooks/useSyncEvents";
import { fmtUTC, relTime } from "../lib/fmt";

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
