import { createFileRoute, Link } from "@tanstack/react-router";
import { Icons } from "../components/Icon";
import { Readout } from "../components/Readout";
import { StatusPill } from "../components/StatusPill";
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
	const ok = accounts.filter((a) => a.status === "ok").length;
	const warn = accounts.filter((a) => a.status === "warn").length;
	const err = accounts.filter((a) => a.status === "err").length;
	const totalImported = syncRuns.reduce((s, r) => s + r.imported, 0);
	const recentRuns = syncRuns.slice(0, 8);

	return (
		<div className="px-7 py-6">
			{/* Page header */}
			<div className="flex items-start justify-between pb-5 mb-5 border-b border-table-border">
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
				<div className="flex gap-2">
					<Link
						to="/log"
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
					>
						<Icons.Eye size={14} /> View daemon log
					</Link>
					<button
						type="button"
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
					>
						<Icons.Refresh size={14} /> Sync now
					</button>
				</div>
			</div>

			{/* KPI strip */}
			<div className="bg-card-bg border border-table-border rounded-[6px] mb-4 overflow-hidden">
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

			{/* Two-column layout */}
			<div
				className="grid gap-4 mb-4"
				style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1.6fr)" }}
			>
				{/* Connected accounts */}
				<div className="bg-card-bg border border-table-border rounded-[6px] overflow-hidden">
					<div className="flex items-baseline justify-between px-5 py-4 border-b border-table-border">
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

				{/* Recent runs */}
				<div className="bg-card-bg border border-table-border rounded-[6px] overflow-hidden">
					<div className="flex items-baseline justify-between px-5 py-4 border-b border-table-border">
						<div>
							<h2 className="text-page-text-dark font-semibold text-small mb-0.5">
								Recent runs
							</h2>
							<div
								className="font-mono text-page-text-subdued uppercase"
								style={{ fontSize: 11, letterSpacing: "0.06em" }}
							>
								Showing last 8 of {syncRuns.length}
							</div>
						</div>
						<Link
							to="/log"
							className="text-small text-sidebar-text-selected hover:underline"
						>
							Full log →
						</Link>
					</div>
					<div className="overflow-auto">
						<table className="w-full border-collapse bg-table-bg">
							<thead>
								<tr className="bg-table-header-bg">
									{["Ran at", "Status", "Imported", "Message", "Duration"].map(
										(h) => (
											<th
												key={h}
												className="font-mono text-table-header-text text-left px-4 py-2 border-b border-table-border"
												style={{ fontSize: 11, letterSpacing: "0.06em" }}
											>
												{h}
											</th>
										),
									)}
								</tr>
							</thead>
							<tbody>
								{recentRuns.map((r) => (
									<tr
										key={r.id}
										className="border-b border-table-border last:border-0 hover:bg-table-row-hover"
									>
										<td
											className="font-mono text-page-text px-4 py-2 whitespace-nowrap"
											style={{ fontSize: 12 }}
										>
											{fmtDateTime(r.at)}
										</td>
										<td className="px-4 py-2">
											<StatusPill status={r.status} label={r.statusLabel} />
										</td>
										<td
											className={`font-mono text-right px-4 py-2 ${r.imported > 0 ? "text-status-ok" : "text-page-text-subdued"}`}
											style={{ fontSize: 12 }}
										>
											{r.imported > 0 ? `+${r.imported}` : "0"}
										</td>
										<td
											className="font-mono text-page-text-light px-4 py-2"
											style={{ fontSize: 12 }}
										>
											{r.message}
										</td>
										<td
											className="font-mono text-page-text-subdued text-right px-4 py-2 whitespace-nowrap"
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
			<div className="bg-card-bg border border-table-border rounded-[6px] px-4 py-3.5">
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
