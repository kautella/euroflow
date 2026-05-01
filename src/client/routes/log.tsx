import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusPill } from "../components/StatusPill";
import { fmtDate, fmtTime } from "../lib/fmt";
import { syncRuns } from "../seed/status";

export const Route = createFileRoute("/log")({
	component: LogPage,
});

type Filter = "all" | "ok" | "warn" | "err";

const FILTERS: { id: Filter; label: string }[] = [
	{ id: "all", label: "All" },
	{ id: "ok", label: "OK" },
	{ id: "warn", label: "Warn" },
	{ id: "err", label: "Errors" },
];

const COLUMNS = [
	"Ran at",
	"Trigger",
	"Status",
	"Imported",
	"Skipped",
	"Message",
	"Duration",
];

function LogPage() {
	const [filter, setFilter] = useState<Filter>("all");

	const runs =
		filter === "all" ? syncRuns : syncRuns.filter((r) => r.status === filter);

	return (
		<div className="h-full flex flex-col px-7 py-6 overflow-hidden">
			{/* Page header */}
			<div className="flex-shrink-0 flex items-end justify-between pb-5 mb-5 border-b border-table-border">
				<div>
					<div
						className="font-mono text-page-text-subdued mb-1"
						style={{ fontSize: 11, letterSpacing: "0.06em" }}
					>
						/ SYNC LOG
					</div>
					<h1 className="text-page-text-dark font-semibold text-large">
						Sync history
					</h1>
				</div>
			</div>

			{/* Filter strip */}
			<div className="flex-shrink-0 flex items-center justify-between px-4 py-2 mb-4 bg-card-bg border border-table-border rounded-[3px]">
				<div className="flex items-center gap-3">
					<span
						className="font-mono text-page-text-subdued uppercase"
						style={{ fontSize: 11, letterSpacing: "0.1em" }}
					>
						Filter
					</span>
					<div className="flex gap-1">
						{FILTERS.map((f) => (
							<button
								key={f.id}
								type="button"
								onClick={() => setFilter(f.id)}
								className={`px-3 py-1.5 rounded-[3px] text-small font-mono transition-colors ${
									filter === f.id
										? "bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border"
										: "text-page-text-subdued hover:text-page-text hover:bg-table-row-hover"
								}`}
							>
								{f.label}
							</button>
						))}
					</div>
				</div>
				<span
					className="font-mono text-page-text-subdued uppercase"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					{runs.length} entries
				</span>
			</div>

			{/* Table */}
			<div className="flex-1 min-h-0 bg-card-bg border border-table-border rounded-[3px] overflow-hidden">
				<div className="h-full overflow-auto">
					<table className="w-full border-separate border-spacing-0 bg-table-bg">
						<thead className="sticky top-0 z-10">
							<tr>
								{COLUMNS.map((h) => (
									<th
										key={h}
										className="font-mono text-table-header-text uppercase text-left px-4 py-2 border-b border-r border-table-header-border bg-table-header-bg last:border-r-0"
										style={{ fontSize: 11, letterSpacing: "0.08em" }}
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{runs.map((r) => (
								<tr key={r.id} className="hover:bg-table-row-hover">
									<td className="font-mono px-4 py-2 whitespace-nowrap border-b border-r border-table-border align-top">
										<div className="text-page-text" style={{ fontSize: 12 }}>
											{fmtDate(r.at)}
										</div>
										<div
											className="text-page-text-subdued"
											style={{ fontSize: 11 }}
										>
											{fmtTime(r.at)}
										</div>
									</td>
									<td
										className="font-mono text-page-text-subdued uppercase px-4 py-2 whitespace-nowrap border-b border-r border-table-border align-top"
										style={{ fontSize: 11, letterSpacing: "0.06em" }}
									>
										{r.trigger}
									</td>
									<td className="px-4 py-2 border-b border-r border-table-border align-top">
										<StatusPill status={r.status} label={r.statusLabel} />
									</td>
									<td
										className={`font-mono text-right px-4 py-2 border-b border-r border-table-border align-top ${r.imported > 0 ? "text-status-ok" : "text-page-text-subdued"}`}
										style={{ fontSize: 12 }}
									>
										{r.imported > 0 ? `+${r.imported}` : "0"}
									</td>
									<td
										className="font-mono text-page-text-subdued text-right px-4 py-2 border-b border-r border-table-border align-top"
										style={{ fontSize: 12 }}
									>
										{r.skipped}
									</td>
									<td
										className="font-mono text-page-text-light px-4 py-2 border-b border-r border-table-border align-top"
										style={{ fontSize: 12 }}
									>
										{r.message}
									</td>
									<td
										className="font-mono text-page-text-subdued text-right px-4 py-2 whitespace-nowrap border-b border-table-border align-top"
										style={{ fontSize: 12 }}
									>
										{r.durationMs}ms
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
