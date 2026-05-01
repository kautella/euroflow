import { createFileRoute, Link } from "@tanstack/react-router";
import { Icons } from "../components/Icon";
import { Readout } from "../components/Readout";
import { StatusPill } from "../components/StatusPill";
import { useBanners } from "../contexts/BannerContext";
import { fmtDateTime, relTime } from "../lib/fmt";
import { accounts, lastSync, nextSync, syncRuns } from "../seed/status";

export const Route = createFileRoute("/status")({
	component: StatusPage,
});

function Kpi({
	label,
	value,
	sub,
}: {
	label: string;
	value: React.ReactNode;
	sub: React.ReactNode;
}) {
	return (
		<div className="p-5 [&:not(:last-child)]:border-r border-table-border">
			<div
				className="font-mono text-page-text-subdued uppercase mb-2"
				style={{ fontSize: 10, letterSpacing: "0.1em" }}
			>
				{label}
			</div>
			<div
				className="font-mono text-page-text-dark font-semibold mb-1.5"
				style={{ fontSize: 28, lineHeight: 1.1 }}
			>
				{value}
			</div>
			<div style={{ fontSize: 11 }}>{sub}</div>
		</div>
	);
}

function StatusPage() {
	const { dismissed, dismiss } = useBanners();
	const ok = accounts.filter((a) => a.status === "ok").length;
	const warn = accounts.filter((a) => a.status === "warn").length;
	const err = accounts.filter((a) => a.status === "err").length;
	const totalImported = syncRuns.reduce((s, r) => s + r.imported, 0);
	const recentRuns = syncRuns.slice(0, 30);

	const lastRun = syncRuns[0];
	const syncBannerStatus =
		err > 0 ? "err" : warn > 0 || lastRun?.status !== "ok" ? "warn" : "ok";
	const syncBannerMsg =
		syncBannerStatus === "err"
			? `${err} ACCOUNT${err > 1 ? "S" : ""} FAILED LAST SYNC — check the sync log for details.`
			: syncBannerStatus === "warn"
				? `${warn} ACCOUNT${warn > 1 ? "S" : ""} DEGRADED — last sync completed with warnings.`
				: `ALL SYNCS HEALTHY · ${lastRun?.imported ?? 0} txns imported · last run ${relTime(lastRun?.at)} ago`;
	const SyncBannerIcon =
		syncBannerStatus === "err"
			? Icons.AlertTriangle
			: syncBannerStatus === "warn"
				? Icons.AlertTriangle
				: Icons.Check;
	const syncBannerCls =
		syncBannerStatus === "err"
			? "text-error-text border-[rgba(255,155,155,0.3)]"
			: syncBannerStatus === "warn"
				? "text-warning-text border-warning-border"
				: "text-notice-text border-notice-border";

	return (
		<div className="h-full flex flex-col px-7 py-6 overflow-hidden">
			{/* Page header */}
			<div className="flex-shrink-0 flex items-end justify-between pb-5 mb-5 border-b border-table-border">
				<div>
					<div
						className="font-mono text-page-text-subdued mb-1"
						style={{ fontSize: 11, letterSpacing: "0.06em" }}
					>
						/ STATUS
					</div>
					<h1 className="text-page-text-dark font-semibold text-large">
						Sync overview
					</h1>
				</div>
			</div>

			{/* Sync status banner */}
			{!dismissed.has("sync-status") && (
				<button
					type="button"
					className={`flex-shrink-0 w-full flex items-center gap-3 px-3 py-2.5 rounded-[3px] bg-transparent mb-5 font-mono border cursor-pointer text-left ${syncBannerCls}`}
					style={{ fontSize: 12, letterSpacing: "0.04em", minHeight: 44 }}
					onClick={() => dismiss("sync-status")}
				>
					<SyncBannerIcon size={14} className="flex-shrink-0" />
					<span>{syncBannerMsg}</span>
				</button>
			)}

			{/* KPI strip */}
			<div className="flex-shrink-0 bg-card-bg border border-table-border rounded-[3px] mb-4 overflow-hidden">
				<div className="grid grid-cols-4">
					<Kpi
						label="Accounts linked"
						value={accounts.length}
						sub={
							<span>
								<span className="font-mono text-status-ok">{ok} OK</span>
								{warn > 0 && (
									<span>
										{" "}
										·{" "}
										<span className="font-mono text-status-warn">
											{warn} WARN
										</span>
									</span>
								)}
								{err > 0 && (
									<span>
										{" "}
										·{" "}
										<span className="font-mono text-status-err">{err} ERR</span>
									</span>
								)}
							</span>
						}
					/>
					<Kpi
						label="Transactions imported (30d)"
						value={totalImported.toLocaleString("en-GB")}
						sub={
							<span className="font-mono text-status-ok">
								+ 142 since yesterday
							</span>
						}
					/>
					<Kpi
						label="Last sync"
						value={
							<span className="font-mono">
								{fmtDateTime(lastSync).slice(11)}
							</span>
						}
						sub={
							<span className="font-mono text-page-text-subdued">
								{fmtDateTime(lastSync).slice(0, 10)} · {relTime(lastSync)}
							</span>
						}
					/>
					<Kpi
						label="Next sync"
						value={
							<span className="font-mono">
								{fmtDateTime(nextSync).slice(11)}
							</span>
						}
						sub={
							<span className="font-mono text-sidebar-text-selected">
								EVERY 6H · CRON 0 */6 * * *
							</span>
						}
					/>
				</div>
			</div>

			{/* Two-column layout — flex-1 so cards fill remaining height */}
			<div
				className="flex-1 min-h-0 grid gap-4"
				style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}
			>
				{/* Connected accounts */}
				<div className="flex flex-col bg-card-bg border border-table-border rounded-[3px] overflow-hidden">
					<div className="flex-shrink-0 flex items-baseline justify-between px-5 py-4 border-b border-table-border">
						<div>
							<h2 className="text-page-text-dark font-semibold text-small mb-0.5">
								Connected accounts
							</h2>
							<div
								className="font-mono text-page-text-subdued uppercase"
								style={{ fontSize: 11, letterSpacing: "0.06em" }}
							>
								{accounts.length} total · {ok} healthy
							</div>
						</div>
						<Link
							to="/banks"
							className="text-small text-sidebar-text-selected hover:underline"
						>
							Manage →
						</Link>
					</div>
					<div className="flex-1 overflow-auto">
						{accounts.map((a, i) => (
							<div
								key={a.id}
								className="flex items-center gap-3 px-5 py-3.5"
								style={{
									borderBottom:
										i < accounts.length - 1
											? "1px solid var(--color-table-border)"
											: undefined,
								}}
							>
								<div
									className="flex-shrink-0 flex items-center justify-center font-mono font-bold text-white rounded"
									style={{
										width: 32,
										height: 32,
										borderRadius: 4,
										background: a.brandColor,
										fontSize: 11,
										letterSpacing: "-0.02em",
									}}
								>
									{a.brandInitials}
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-semibold text-page-text-dark text-small truncate">
										{a.name}
									</div>
									<div
										className="font-mono text-page-text-subdued truncate"
										style={{ fontSize: 11 }}
									>
										{a.iban}
									</div>
								</div>
								<div className="flex-shrink-0 text-right mr-2">
									<div
										className="font-mono text-page-text-subdued uppercase"
										style={{ fontSize: 10, letterSpacing: "0.06em" }}
									>
										exp {a.expiresInDays}d
									</div>
								</div>
								<div className="flex-shrink-0">
									<StatusPill
										status={a.status}
										label={a.statusLabel}
										tooltip={
											a.status !== "ok"
												? `Consent expires in ${a.expiresInDays} days — re-authorise via Banks page`
												: undefined
										}
									/>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Recent runs */}
				<div className="flex flex-col bg-card-bg border border-table-border rounded-[3px] overflow-hidden">
					<div className="flex-shrink-0 flex items-baseline justify-between px-5 py-4 border-b border-table-border">
						<div>
							<h2 className="text-page-text-dark font-semibold text-small mb-0.5">
								Recent runs
							</h2>
							<div
								className="font-mono text-page-text-subdued uppercase"
								style={{ fontSize: 11, letterSpacing: "0.06em" }}
							>
								Showing last {recentRuns.length}
							</div>
						</div>
						<Link
							to="/log"
							className="text-small text-sidebar-text-selected hover:underline"
						>
							Full log →
						</Link>
					</div>
					<div className="flex-1 overflow-auto">
						<table className="w-full border-separate border-spacing-0 bg-table-bg">
							<thead className="sticky top-0 z-10">
								<tr className="bg-table-header-bg">
									{["Ran at", "Status", "Imported", "Message", "Duration"].map(
										(h) => (
											<th
												key={h}
												className="font-mono text-table-header-text uppercase text-left px-4 py-2 border-b border-r border-table-header-border bg-table-header-bg last:border-r-0"
												style={{ fontSize: 11, letterSpacing: "0.08em" }}
											>
												{h}
											</th>
										),
									)}
								</tr>
							</thead>
							<tbody>
								{recentRuns.map((r) => (
									<tr key={r.id} className="hover:bg-table-row-hover">
										<td
											className="font-mono text-page-text px-4 py-2 whitespace-nowrap border-b border-r border-table-border"
											style={{ fontSize: 12 }}
										>
											{fmtDateTime(r.at)}
										</td>
										<td className="px-4 py-2 border-b border-r border-table-border">
											<StatusPill status={r.status} label={r.statusLabel} />
										</td>
										<td
											className={`font-mono text-right px-4 py-2 border-b border-r border-table-border ${r.imported > 0 ? "text-status-ok" : "text-page-text-subdued"}`}
											style={{ fontSize: 12 }}
										>
											{r.imported > 0 ? `+${r.imported}` : "0"}
										</td>
										<td
											className="font-mono text-page-text-light px-4 py-2 border-b border-r border-table-border"
											style={{ fontSize: 12 }}
										>
											{r.message}
										</td>
										<td
											className="font-mono text-page-text-subdued text-right px-4 py-2 whitespace-nowrap border-b border-table-border"
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

			{/* Live activity readout */}
			<div className="flex-shrink-0 mt-4 bg-card-bg border border-table-border rounded-[3px] px-4 py-3.5">
				<Readout
					items={[
						{
							k: "session",
							v: "sess_b8a4...3f1e",
							color: "var(--color-page-text-dark)",
						},
						{
							k: "host",
							v: "euroflow.local:8080",
							color: "var(--color-page-text-dark)",
						},
						{
							k: "actual",
							v: "OK · v26.4",
							color: "var(--color-status-ok)",
						},
						{
							k: "gocardless",
							v: "OK · 28 req/h",
							color: "var(--color-status-ok)",
						},
						{ k: "webhook", v: "OK · 200", color: "var(--color-status-ok)" },
						{
							k: "cron",
							v: "0 */6 * * *",
							color: "var(--color-sidebar-text-selected)",
						},
					]}
				/>
			</div>
		</div>
	);
}
