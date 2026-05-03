import * as Dialog from "@radix-ui/react-dialog";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import type { AspspInfo } from "../../server/lib/enable-banking";
import { Icons } from "../components/Icon";
import { ConfirmModal, ModalShell } from "../components/Modal";
import { StatusPill } from "../components/StatusPill";
import { useBanners } from "../contexts/BannerContext";
import {
	type ConnectedBankGroup,
	useBankSearchQuery,
	useConnectedBanksQuery,
	usePendingAccountsQuery,
	useSelectAccountMutation,
} from "../hooks/useBanks";
import { cert, countries } from "../seed/banks";

export const Route = createFileRoute("/banks")({
	component: BanksPage,
	validateSearch: (s: Record<string, unknown>) => ({
		step: (s.step as "done" | "pick" | undefined) ?? undefined,
	}),
});

function initials(name: string): string {
	return name
		.split(/\s+/)
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 3);
}

function brandColor(name: string): string {
	let h = 0;
	for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
	const hue = h % 360;
	return `hsl(${hue}, 45%, 35%)`;
}

function ExpiryPill({ days }: { days: number }) {
	const status = days < 0 ? "err" : days < 21 ? "warn" : "ok";
	const label = days < 0 ? "EXPIRED" : `${days}D LEFT`;
	return <StatusPill status={status} label={label} />;
}

function AccountPickerModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { data: pending } = usePendingAccountsQuery(open);
	const selectMutation = useSelectAccountMutation();
	const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

	if (!open || !pending) return null;

	async function handleConfirm() {
		if (selectedIdx === null || !pending) return;
		const acct = pending.accounts[selectedIdx];
		await selectMutation.mutateAsync({
			sessionId: pending.sessionId,
			aspspId: pending.aspspId,
			aspspName: pending.aspspName,
			country: pending.country,
			iban: acct.iban,
			accountName: acct.name,
			accountType: acct.type,
			consentExpires: pending.consentExpires,
		});
		onClose();
	}

	return (
		<ModalShell open={open} onClose={onClose} width={480}>
			<Dialog.Title className="sr-only">Select account</Dialog.Title>
			<div className="p-5 border-b border-table-border">
				<div className="text-page-text-dark font-semibold text-small mb-1">
					Select account to connect
				</div>
				<div
					className="font-mono text-page-text-subdued uppercase"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					{pending.aspspName} · {pending.accounts.length} accounts found
				</div>
			</div>
			<div className="p-5">
				{pending.accounts.map((acct, i) => (
					<button
						key={acct.iban ?? acct.name}
						type="button"
						onClick={() => setSelectedIdx(i)}
						className={`w-full flex items-center gap-3 px-3.5 py-2.5 mb-2 rounded-[3px] border text-left ${
							selectedIdx === i
								? "border-btn-primary-bg bg-[rgba(148,70,237,0.08)]"
								: "border-table-border bg-table-bg hover:bg-table-row-hover"
						}`}
					>
						<div className="flex-1">
							<div
								className="text-page-text font-medium"
								style={{ fontSize: 13 }}
							>
								{acct.name}
							</div>
							{acct.iban && (
								<div
									className="font-mono text-page-text-subdued"
									style={{ fontSize: 11 }}
								>
									{acct.iban}
								</div>
							)}
						</div>
						<span
							className="font-mono text-page-text-subdued uppercase"
							style={{ fontSize: 10 }}
						>
							{acct.type}
						</span>
					</button>
				))}
			</div>
			<div className="flex justify-end gap-2 px-5 py-3.5 border-t border-table-border bg-table-bg">
				<button
					type="button"
					onClick={onClose}
					className="px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
				>
					Cancel
				</button>
				<button
					type="button"
					disabled={selectedIdx === null || selectMutation.isPending}
					onClick={handleConfirm}
					className="px-3 py-1.5 rounded-[3px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover disabled:opacity-50"
				>
					Connect →
				</button>
			</div>
		</ModalShell>
	);
}

function OAuthConsentModal({
	bank,
	reauth,
	onClose,
}: {
	bank: AspspInfo;
	reauth?: boolean;
	onClose: () => void;
}) {
	const [starting, setStarting] = useState(false);

	async function handleContinue() {
		setStarting(true);
		try {
			const res = await fetch("/api/auth/start", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					aspspId: bank.id,
					aspspName: bank.name,
					country: bank.country,
				}),
			});
			if (!res.ok) throw new Error(`POST /api/auth/start ${res.status}`);
			const { authUrl } = (await res.json()) as { authUrl: string };
			window.location.href = authUrl;
		} catch {
			setStarting(false);
		}
	}

	const bInitials = initials(bank.name);
	const bColor = brandColor(bank.name);

	return (
		<ModalShell open onClose={onClose} width={520}>
			<Dialog.Title className="sr-only">
				{reauth ? "Re-authorise" : "Connect"} {bank.name}
			</Dialog.Title>

			{/* Header */}
			<div className="flex items-center gap-3 px-5 py-4 border-b border-table-border">
				<div
					className="flex-shrink-0 flex items-center justify-center font-mono font-bold text-white rounded"
					style={{
						width: 32,
						height: 32,
						borderRadius: 4,
						background: bColor,
						fontSize: 11,
					}}
				>
					{bInitials}
				</div>
				<div>
					<div className="text-page-text-dark font-semibold text-small">
						{reauth ? "Re-authorise" : "Connect"} {bank.name}
					</div>
					<div
						className="font-mono text-page-text-subdued uppercase"
						style={{ fontSize: 11, letterSpacing: "0.06em" }}
					>
						PSD2 SCA FLOW
					</div>
				</div>
			</div>

			{/* Permissions */}
			<div className="p-5">
				<div
					className="font-mono text-page-text-subdued uppercase mb-2.5"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					› Requested permissions
				</div>
				<ul className="border-t border-table-border list-none p-0 m-0">
					{[
						["Account details", "IBAN, holder name, currency"],
						["Balances", "current and available"],
						["Transactions", `up to ${bank.maxDays} days history`],
					].map(([title, desc]) => (
						<li
							key={title}
							className="flex items-center gap-3 py-2.5 border-b border-table-border"
						>
							<Icons.Check size={14} />
							<div className="flex-1">
								<div
									className="text-page-text font-medium"
									style={{ fontSize: 13 }}
								>
									{title}
								</div>
								<div className="text-page-text-light" style={{ fontSize: 12 }}>
									{desc}
								</div>
							</div>
						</li>
					))}
				</ul>
				<div
					className="font-mono text-page-text-subdued mt-3.5"
					style={{ fontSize: 11, letterSpacing: "0.04em" }}
				>
					CONSENT VALIDITY: 180 DAYS · YOU WILL BE ASKED TO RE-AUTHORISE BEFORE
					EXPIRY
				</div>
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between px-5 py-3.5 border-t border-table-border bg-table-bg">
				<span
					className="font-mono text-page-text-subdued uppercase"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					Click continue to redirect
				</span>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onClose}
						className="px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={handleContinue}
						disabled={starting}
						className="px-3 py-1.5 rounded-[3px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover disabled:opacity-50"
					>
						{starting ? "Redirecting…" : "Continue at bank →"}
					</button>
				</div>
			</div>
		</ModalShell>
	);
}

function ConnectedGroupCard({
	group,
	onDisconnect,
	onReauth,
}: {
	group: ConnectedBankGroup;
	onDisconnect: () => void;
	onReauth: () => void;
}) {
	const minDays = Math.min(...group.accounts.map((a) => a.expiresInDays));
	const bColor = brandColor(group.bank.name);
	const bInitials = initials(group.bank.name);
	const accentBorder =
		minDays < 0
			? "border-l-[4px] border-l-status-err"
			: minDays < 21
				? "border-l-[4px] border-l-status-warn"
				: "";

	return (
		<div
			className={`bg-card-bg border border-table-border rounded-[3px] mb-3 overflow-hidden ${accentBorder}`}
		>
			<div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-table-border bg-table-bg">
				<div
					className="flex-shrink-0 flex items-center justify-center font-mono font-bold text-white rounded"
					style={{
						width: 36,
						height: 36,
						borderRadius: 4,
						background: bColor,
						fontSize: 12,
					}}
				>
					{bInitials}
				</div>
				<div className="flex-1">
					<div
						className={`font-semibold ${minDays < 0 ? "text-status-err" : minDays < 21 ? "text-status-warn" : "text-page-text-dark"}`}
						style={{ fontSize: 14 }}
					>
						{group.bank.name}
					</div>
					<div
						className="font-mono text-page-text-subdued"
						style={{ fontSize: 11, letterSpacing: "0.04em" }}
					>
						{group.bank.country} · {group.accounts.length} account
						{group.accounts.length === 1 ? "" : "s"} · consent{" "}
						{group.consentId.slice(0, 12)}…
					</div>
				</div>
				<button
					type="button"
					onClick={onDisconnect}
					className="flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
				>
					<Icons.X size={12} /> Disconnect
				</button>
				<button
					type="button"
					onClick={onReauth}
					className="flex items-center gap-1 px-2.5 py-1 rounded-[3px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
				>
					<Icons.Refresh size={12} /> Re-authorise
				</button>
			</div>

			<div className="overflow-auto">
				<table className="w-full border-collapse bg-table-bg">
					<thead>
						<tr className="bg-table-header-bg">
							{["Account name", "IBAN", "Type", "Consent", ""].map((h) => (
								<th
									key={h}
									className="font-mono text-table-header-text text-left px-4 py-2 border-b border-table-border"
									style={{ fontSize: 11, letterSpacing: "0.06em" }}
								>
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{group.accounts.map((a) => (
							<tr
								key={a.id}
								className="border-b border-table-border last:border-0 hover:bg-table-row-hover"
							>
								<td
									className="px-4 py-2 text-page-text font-medium"
									style={{ fontSize: 13 }}
								>
									{a.name}
								</td>
								<td
									className="font-mono text-page-text px-4 py-2"
									style={{ fontSize: 12 }}
								>
									{a.iban ?? "—"}
								</td>
								<td
									className="font-mono text-page-text-light px-4 py-2 uppercase"
									style={{ fontSize: 11, letterSpacing: "0.06em" }}
								>
									{a.type}
								</td>
								<td className="px-4 py-2">
									<ExpiryPill days={a.expiresInDays} />
								</td>
								<td className="px-4 py-2 text-right w-12">
									<button
										type="button"
										className="text-page-text-subdued hover:text-page-text"
										title="More"
									>
										<Icons.Dots size={14} />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function BanksPage() {
	const search = useSearch({ from: "/banks" });
	const step = search.step;

	const [searchQ, setSearchQ] = useState("");
	const [country, setCountry] = useState<string>("DE");
	const [oauthBank, setOauthBank] = useState<AspspInfo | null>(null);
	const [reauthBank, setReauthBank] = useState<AspspInfo | null>(null);
	const [disconnectBank, setDisconnectBank] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [pickerOpen, setPickerOpen] = useState(step === "pick");
	const { dismissed: dismissedBanners, dismiss: dismissBanner } = useBanners();

	const searchEnabled = searchQ.length >= 2;
	const { data: searchResults = [], isFetching: searchLoading } =
		useBankSearchQuery(country, searchEnabled);

	const { data: connectedGroups = [] } = useConnectedBanksQuery();

	const matches = searchEnabled
		? searchResults.filter((b) =>
				b.name.toLowerCase().includes(searchQ.toLowerCase()),
			)
		: [];

	const totalNeedReauth = connectedGroups
		.flatMap((g) => g.accounts)
		.filter((a) => a.expiresInDays < 14).length;

	return (
		<div className="px-7 py-6">
			{/* Page header */}
			<div className="flex items-start justify-between pb-5 mb-5 border-b border-table-border">
				<div>
					<div
						className="font-mono text-page-text-subdued mb-1"
						style={{ fontSize: 11, letterSpacing: "0.06em" }}
					>
						/ BANKS
					</div>
					<h1 className="text-page-text-dark font-semibold text-large">
						Bank connections
					</h1>
				</div>
			</div>

			{/* Post-OAuth success banner */}
			{step === "done" && !dismissedBanners.has("oauth-done") && (
				<div
					className="flex items-center gap-3 px-3 py-2.5 rounded-[3px] mb-5 bg-transparent text-notice-text border border-notice-border font-mono"
					style={{ fontSize: 12, letterSpacing: "0.04em", minHeight: 44 }}
				>
					<Icons.Check size={14} className="flex-shrink-0" />
					<span className="flex-1">
						BANK CONNECTED SUCCESSFULLY — account added to sync list.
					</span>
					<button
						type="button"
						onClick={() => dismissBanner("oauth-done")}
						className="flex-shrink-0 text-current opacity-50 hover:opacity-100"
						aria-label="Dismiss"
					>
						<Icons.X size={14} />
					</button>
				</div>
			)}

			{/* Status banners */}
			{(!dismissedBanners.has("cert") ||
				(cert && totalNeedReauth > 0 && !dismissedBanners.has("reauth"))) && (
				<div className="flex flex-col gap-5 mb-5">
					{!dismissedBanners.has("cert") &&
						(!cert ? (
							<div
								className="flex items-center gap-3 px-3 py-2.5 rounded-[3px] bg-transparent text-error-text border border-[rgba(255,155,155,0.3)] font-mono"
								style={{ fontSize: 12, letterSpacing: "0.04em", minHeight: 44 }}
							>
								<Icons.Lock size={14} className="flex-shrink-0" />
								<span className="flex-1">
									NO PSD2 CERTIFICATE — bank connections are disabled.
								</span>
								<a
									href="/settings"
									className="flex-shrink-0 px-2.5 py-1 rounded-[3px] font-medium bg-btn-normal-bg text-page-text-dark border border-page-text-light hover:bg-btn-normal-bg-hover"
									style={{ fontSize: 11 }}
								>
									Settings → Security
								</a>
								<button
									type="button"
									onClick={() => dismissBanner("cert")}
									className="flex-shrink-0 text-current opacity-50 hover:opacity-100"
									aria-label="Dismiss"
								>
									<Icons.X size={14} />
								</button>
							</div>
						) : (
							<div
								className="flex items-center gap-3 px-3 py-2.5 rounded-[3px] bg-transparent text-notice-text border border-notice-border font-mono"
								style={{ fontSize: 12, letterSpacing: "0.04em", minHeight: 44 }}
							>
								<Icons.Shield size={14} className="flex-shrink-0" />
								<span className="flex-1">
									PSD2 CERTIFICATE ACTIVE ·{" "}
									{connectedGroups.flatMap((g) => g.accounts).length} accounts
									connected · valid until {cert.expires}
								</span>
								<a
									href="/settings"
									className="flex-shrink-0 px-2.5 py-1 rounded-[3px] bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
									style={{ fontSize: 11 }}
								>
									Manage →
								</a>
								<button
									type="button"
									onClick={() => dismissBanner("cert")}
									className="flex-shrink-0 text-current opacity-50 hover:opacity-100"
									aria-label="Dismiss"
								>
									<Icons.X size={14} />
								</button>
							</div>
						))}
					{cert && totalNeedReauth > 0 && !dismissedBanners.has("reauth") && (
						<div
							className="flex items-center gap-3 px-3 py-2.5 rounded-[3px] bg-transparent text-warning-text border border-warning-border font-mono"
							style={{ fontSize: 12, letterSpacing: "0.04em", minHeight: 44 }}
						>
							<Icons.AlertTriangle size={14} className="flex-shrink-0" />
							<span className="flex-1">
								{totalNeedReauth} ACCOUNT{totalNeedReauth > 1 ? "S" : ""} NEED
								RE-AUTHENTICATION — consent expiring within 14 days.
							</span>
							<button
								type="button"
								onClick={() => dismissBanner("reauth")}
								className="flex-shrink-0 text-current opacity-50 hover:opacity-100"
								aria-label="Dismiss"
							>
								<Icons.X size={14} />
							</button>
						</div>
					)}
				</div>
			)}

			{/* Connect a new bank */}
			<div className="bg-card-bg border border-table-border rounded-[3px] p-5 mb-6">
				<h2 className="text-page-text-dark font-semibold text-small mb-1">
					Connect a new bank
				</h2>
				<p className="text-page-text-light text-small mb-3.5">
					Search by name across EEA institutions via Enable Banking.
				</p>
				<div
					className="grid gap-2"
					style={{ gridTemplateColumns: "120px 1fr" }}
				>
					<select
						className="px-2 py-1.5 rounded-[3px] text-small bg-form-input-bg text-form-input-text border border-form-input-border focus:outline-none focus:border-form-input-border-selected disabled:opacity-50"
						value={country}
						onChange={(e) => setCountry(e.target.value)}
						disabled={!cert}
					>
						{countries.map((c) => (
							<option key={c} value={c}>
								{c}
							</option>
						))}
					</select>
					<div className="relative">
						<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-page-text-subdued">
							<Icons.Search size={14} />
						</span>
						<input
							className="w-full pl-8 pr-3 py-1.5 rounded-[3px] text-small bg-form-input-bg text-form-input-text border border-form-input-border focus:outline-none focus:border-form-input-border-selected disabled:opacity-50"
							placeholder="Bank name (e.g. N26, Revolut, ING…)"
							value={searchQ}
							onChange={(e) => setSearchQ(e.target.value)}
							disabled={!cert}
						/>
					</div>
				</div>

				{searchLoading && searchEnabled && (
					<div
						className="mt-3 font-mono text-page-text-subdued uppercase"
						style={{ fontSize: 11 }}
					>
						Searching…
					</div>
				)}

				{!searchLoading && matches.length > 0 && (
					<div className="mt-3 border border-table-border rounded overflow-hidden">
						{matches.slice(0, 6).map((b, i) => (
							<button
								key={b.id}
								type="button"
								className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-table-bg hover:bg-table-row-hover cursor-pointer text-left"
								style={{
									borderBottom:
										i < Math.min(matches.length, 6) - 1
											? "1px solid var(--color-table-border)"
											: undefined,
								}}
								onClick={() => setOauthBank(b)}
							>
								<div
									className="flex-shrink-0 flex items-center justify-center font-mono font-bold text-white rounded"
									style={{
										width: 28,
										height: 28,
										borderRadius: 4,
										background: brandColor(b.name),
										fontSize: 11,
									}}
								>
									{initials(b.name)}
								</div>
								<div className="flex-1">
									<div
										className="text-page-text font-medium"
										style={{ fontSize: 13 }}
									>
										{b.name}
									</div>
									<div
										className="font-mono text-page-text-subdued"
										style={{ fontSize: 11, letterSpacing: "0.04em" }}
									>
										{b.bic} · {b.country}
									</div>
								</div>
								<span
									className="font-mono text-page-text-subdued uppercase"
									style={{ fontSize: 10, letterSpacing: "0.08em" }}
								>
									{b.maxDays} day history
								</span>
								<Icons.Arrow size={14} />
							</button>
						))}
					</div>
				)}
			</div>

			{/* Connected banks */}
			<div className="flex items-baseline justify-between mb-2.5">
				<h2 className="text-page-text-dark font-bold" style={{ fontSize: 14 }}>
					Connected ({connectedGroups.length})
				</h2>
				<span
					className="font-mono text-page-text-subdued uppercase"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					{connectedGroups.flatMap((g) => g.accounts).length} accounts
					{totalNeedReauth > 0 && ` · ${totalNeedReauth} need re-auth soon`}
				</span>
			</div>

			{connectedGroups.map((g) => (
				<ConnectedGroupCard
					key={`${g.bank.id}::${g.consentId}`}
					group={g}
					onDisconnect={() =>
						setDisconnectBank({ id: g.bank.id, name: g.bank.name })
					}
					onReauth={() =>
						setReauthBank({
							id: g.bank.id,
							name: g.bank.name,
							country: g.bank.country,
							bic: "",
							maxDays: 90,
						})
					}
				/>
			))}

			{/* OAuth consent modal */}
			{oauthBank && (
				<OAuthConsentModal
					bank={oauthBank}
					onClose={() => setOauthBank(null)}
				/>
			)}
			{reauthBank && (
				<OAuthConsentModal
					bank={reauthBank}
					reauth
					onClose={() => setReauthBank(null)}
				/>
			)}

			{/* Account picker modal (post-callback, multiple accounts) */}
			<AccountPickerModal
				open={pickerOpen}
				onClose={() => setPickerOpen(false)}
			/>

			{/* Disconnect confirm modal */}
			<ConfirmModal
				open={!!disconnectBank}
				title={`Disconnect ${disconnectBank?.name ?? ""}?`}
				body="This revokes the PSD2 consent and stops syncing all accounts under this bank. Existing transactions in Actual Budget are preserved."
				confirmLabel="Disconnect"
				danger
				onCancel={() => setDisconnectBank(null)}
				onConfirm={() => setDisconnectBank(null)}
			/>
		</div>
	);
}
