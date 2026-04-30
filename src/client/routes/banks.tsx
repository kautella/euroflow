import * as Dialog from "@radix-ui/react-dialog";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icons } from "../components/Icon";
import { ConfirmModal, ModalShell } from "../components/Modal";
import { StatusPill } from "../components/StatusPill";
import {
	banksCatalog,
	type CatalogBank,
	type ConnectedAccount,
	cert,
	connectedBankGroups,
	countries,
} from "../seed/banks";

export const Route = createFileRoute("/banks")({
	component: BanksPage,
});

function ExpiryPill({ days }: { days: number }) {
	const status = days < 0 ? "err" : days < 21 ? "warn" : "ok";
	const label = days < 0 ? "EXPIRED" : `${days}D LEFT`;
	return <StatusPill status={status} label={label} />;
}

type OAuthState = {
	bank: CatalogBank;
	step: 1 | 2 | 3;
	reauth?: boolean;
} | null;

function OAuthModal({
	oauth,
	onClose,
}: {
	oauth: OAuthState;
	onClose: () => void;
}) {
	const [state, setState] = useState<OAuthState>(oauth);

	// sync external changes (e.g. opening for different bank)
	const prevOauth = useRef(oauth);
	if (oauth !== prevOauth.current) {
		prevOauth.current = oauth;
		setState(oauth);
	}

	useEffect(() => {
		if (state?.step === 2) {
			const t = setTimeout(() => setState((s) => s && { ...s, step: 3 }), 1800);
			return () => clearTimeout(t);
		}
	}, [state?.step]);

	if (!state) return null;
	const { bank, step, reauth } = state;
	const steps = ["Consent", "Authorise at bank", "Map accounts"];

	return (
		<ModalShell open={!!oauth} onClose={onClose} width={520}>
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
						background: bank.brand,
						fontSize: 11,
					}}
				>
					{bank.initials}
				</div>
				<div>
					<div className="text-page-text-dark font-semibold text-small">
						{reauth ? "Re-authorise" : "Connect"} {bank.name}
					</div>
					<div
						className="font-mono text-page-text-subdued uppercase"
						style={{ fontSize: 11, letterSpacing: "0.06em" }}
					>
						STEP {step} OF 3 · PSD2 SCA FLOW
					</div>
				</div>
			</div>

			{/* Stepper */}
			<div className="flex px-5 pt-4">
				{steps.map((lbl, i) => {
					const n = (i + 1) as 1 | 2 | 3;
					const done = step > n;
					const active = step === n;
					return (
						<div key={lbl} className="flex items-center gap-2 flex-1">
							<div
								className="flex-shrink-0 flex items-center justify-center font-mono font-bold rounded"
								style={{
									width: 22,
									height: 22,
									borderRadius: 4,
									fontSize: 11,
									border: `1px solid ${active || done ? "var(--color-btn-primary-bg)" : "var(--color-table-border)"}`,
									background: done
										? "var(--color-btn-primary-bg)"
										: active
											? "rgba(148,70,237,0.15)"
											: "transparent",
									color: done
										? "white"
										: active
											? "var(--color-sidebar-text-selected)"
											: "var(--color-page-text-subdued)",
								}}
							>
								{done ? <Icons.Check size={12} /> : n}
							</div>
							<span
								className={
									active ? "text-page-text-dark" : "text-page-text-light"
								}
								style={{ fontSize: 12 }}
							>
								{lbl}
							</span>
							{i < 2 && <div className="flex-1 h-px bg-table-border mr-1" />}
						</div>
					);
				})}
			</div>

			{/* Step content */}
			<div className="p-5">
				{step === 1 && (
					<div>
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
								["Transactions", "up to 90 days history"],
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
										<div
											className="text-page-text-light"
											style={{ fontSize: 12 }}
										>
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
							CONSENT VALIDITY: 180 DAYS · YOU WILL BE ASKED TO RE-AUTHORISE
							BEFORE EXPIRY
						</div>
					</div>
				)}

				{step === 2 && (
					<div className="text-center py-8">
						<div
							className="inline-block w-7 h-7 rounded-full border-2 border-t-transparent animate-spin mb-4"
							style={{
								borderColor: "var(--color-btn-primary-bg)",
								borderTopColor: "transparent",
							}}
						/>
						<div
							className="text-page-text font-medium mb-1.5"
							style={{ fontSize: 14 }}
						>
							Redirecting to {bank.name}…
						</div>
						<div
							className="font-mono text-page-text-subdued uppercase"
							style={{ fontSize: 11, letterSpacing: "0.06em" }}
						>
							Complete SCA in your bank's app, then return here
						</div>
						<pre
							className="font-mono text-page-text-light bg-table-bg border border-table-border rounded mt-4 p-3 text-left overflow-auto"
							style={{ fontSize: 11 }}
						>{`[14:32:01] POST /v2/agreements ... 201 Created
[14:32:02] GET  /v2/requisitions/sess_b8a4...3f1e
[14:32:02] redirect → ${bank.name.toLowerCase().replace(/\s+/g, "")}.bank/auth?consent=...
[14:32:03] awaiting user SCA…`}</pre>
					</div>
				)}

				{step === 3 && (
					<div>
						<div className="flex items-center gap-2 px-3 py-2.5 mb-3.5 rounded bg-notice-bg text-notice-text border border-notice-border">
							<Icons.Check size={14} />
							<span
								className="font-mono"
								style={{ fontSize: 12, letterSpacing: "0.04em" }}
							>
								AUTHORISED · 2 ACCOUNTS DISCOVERED
							</span>
						</div>
						<div
							className="font-mono text-page-text-subdued uppercase mb-2"
							style={{ fontSize: 11, letterSpacing: "0.06em" }}
						>
							› Map to Actual Budget accounts
						</div>
						{[
							{
								name: "Main checking",
								iban: "DE89 3704 0044 0532 0130 00",
								mapping: "Main checking",
							},
							{
								name: "Savings",
								iban: "DE89 3704 0044 0532 0130 01",
								mapping: "— create new —",
							},
						].map((a) => (
							<div
								key={a.iban}
								className="py-2.5 border-b border-table-border grid items-center gap-2.5"
								style={{ gridTemplateColumns: "1fr auto 1fr" }}
							>
								<div>
									<div
										className="text-page-text font-medium"
										style={{ fontSize: 13 }}
									>
										{a.name}
									</div>
									<div
										className="font-mono text-page-text-subdued"
										style={{ fontSize: 11 }}
									>
										{a.iban}
									</div>
								</div>
								<Icons.Arrow size={14} />
								<select className="w-full px-2 py-1.5 rounded-[4px] text-small bg-form-input-bg text-form-input-text border border-form-input-border focus:outline-none focus:border-form-input-border-selected">
									<option>{a.mapping}</option>
									<option>Main checking</option>
									<option>Savings</option>
									<option>— create new —</option>
								</select>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="flex items-center justify-between px-5 py-3.5 border-t border-table-border bg-table-bg">
				<span
					className="font-mono text-page-text-subdued uppercase"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					{step === 1 && "Click continue to redirect"}
					{step === 2 && "Waiting for callback…"}
					{step === 3 && "Mapping is editable later"}
				</span>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onClose}
						className="px-3 py-1.5 rounded-[4px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
					>
						Cancel
					</button>
					{step === 1 && (
						<button
							type="button"
							onClick={() => setState((s) => s && { ...s, step: 2 })}
							className="px-3 py-1.5 rounded-[4px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
						>
							Continue at bank →
						</button>
					)}
					{step === 3 && (
						<button
							type="button"
							onClick={onClose}
							className="px-3 py-1.5 rounded-[4px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
						>
							Finish
						</button>
					)}
				</div>
			</div>
		</ModalShell>
	);
}

function AccountRow({ account }: { account: ConnectedAccount }) {
	return (
		<tr className="border-b border-table-border last:border-0 hover:bg-table-row-hover">
			<td
				className="px-4 py-2 text-page-text font-medium"
				style={{ fontSize: 13 }}
			>
				{account.name}
			</td>
			<td
				className="font-mono text-page-text px-4 py-2"
				style={{ fontSize: 12 }}
			>
				{account.iban}
			</td>
			<td
				className="font-mono text-page-text-light px-4 py-2 uppercase"
				style={{ fontSize: 11, letterSpacing: "0.06em" }}
			>
				{account.type}
			</td>
			<td
				className="font-mono text-page-text-light px-4 py-2"
				style={{ fontSize: 12 }}
			>
				→ {account.actualMapping}
			</td>
			<td className="px-4 py-2">
				<ExpiryPill days={account.expiresInDays} />
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
	);
}

function BanksPage() {
	const [searchQ, setSearchQ] = useState("");
	const [country, setCountry] = useState<string>("DE");
	const [oauth, setOauth] = useState<OAuthState>(null);
	const [disconnectBank, setDisconnectBank] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const matches = useMemo(() => {
		if (!searchQ) return [];
		return banksCatalog
			.filter(
				(b) =>
					b.country === country &&
					b.name.toLowerCase().includes(searchQ.toLowerCase()),
			)
			.slice(0, 6);
	}, [searchQ, country]);

	const totalNeedReauth = connectedBankGroups
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

			{/* eIDAS cert card */}
			<div className="bg-card-bg border border-table-border rounded-[6px] p-5 mb-4">
				<div className="flex items-center gap-4">
					<div
						className="flex-shrink-0 flex items-center justify-center rounded"
						style={{
							width: 40,
							height: 40,
							borderRadius: 4,
							background: cert ? "rgba(20,125,100,0.15)" : "rgba(138,4,26,0.2)",
							border: `1px solid ${cert ? "rgba(101,214,173,0.3)" : "var(--color-error-border)"}`,
							color: cert
								? "var(--color-status-ok)"
								: "var(--color-status-err)",
						}}
					>
						<Icons.Lock size={18} />
					</div>
					<div className="flex-1">
						<div
							className="text-page-text-dark font-semibold"
							style={{ fontSize: 14 }}
						>
							{cert
								? "PSD2 client certificate · QWAC"
								: "No certificate uploaded"}
						</div>
						<div
							className="font-mono text-page-text-subdued mt-1"
							style={{ fontSize: 11, letterSpacing: "0.04em" }}
						>
							{cert ? (
								<>
									CN={cert.cn} · ISSUED BY {cert.issuer} · EXPIRES{" "}
									{cert.expires}
								</>
							) : (
								<>UPLOAD A .PEM FILE TO AUTHENTICATE WITH PSD2 ENDPOINTS</>
							)}
						</div>
					</div>
					<label className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-small cursor-pointer bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover">
						<Icons.Upload size={14} /> {cert ? "Replace .pem" : "Upload .pem"}
						<input type="file" accept=".pem,.crt,.cer" className="hidden" />
					</label>
				</div>
			</div>

			{/* Connect a new bank */}
			<div className="bg-card-bg border border-table-border rounded-[6px] p-5 mb-6">
				<h2 className="text-page-text-dark font-semibold text-small mb-1">
					Connect a new bank
				</h2>
				<p className="text-page-text-light text-small mb-3.5">
					Search by name across {banksCatalog.length} institutions in 31 EEA
					countries (via GoCardless / Nordigen).
				</p>
				<div
					className="grid gap-2"
					style={{ gridTemplateColumns: "120px 1fr" }}
				>
					<select
						className="px-2 py-1.5 rounded-[4px] text-small bg-form-input-bg text-form-input-text border border-form-input-border focus:outline-none focus:border-form-input-border-selected disabled:opacity-50"
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
							className="w-full pl-8 pr-3 py-1.5 rounded-[4px] text-small bg-form-input-bg text-form-input-text border border-form-input-border focus:outline-none focus:border-form-input-border-selected disabled:opacity-50"
							placeholder="Bank name (e.g. N26, Revolut, ING…)"
							value={searchQ}
							onChange={(e) => setSearchQ(e.target.value)}
							disabled={!cert}
						/>
					</div>
				</div>

				{matches.length > 0 && (
					<div className="mt-3 border border-table-border rounded overflow-hidden">
						{matches.map((b, i) => (
							<button
								key={b.id}
								type="button"
								className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-table-bg hover:bg-table-row-hover cursor-pointer text-left"
								style={{
									borderBottom:
										i < matches.length - 1
											? "1px solid var(--color-table-border)"
											: undefined,
								}}
								onClick={() => setOauth({ bank: b, step: 1 })}
							>
								<div
									className="flex-shrink-0 flex items-center justify-center font-mono font-bold text-white rounded"
									style={{
										width: 28,
										height: 28,
										borderRadius: 4,
										background: b.brand,
										fontSize: 11,
									}}
								>
									{b.initials}
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
					Connected ({connectedBankGroups.length})
				</h2>
				<span
					className="font-mono text-page-text-subdued uppercase"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					{connectedBankGroups.flatMap((g) => g.accounts).length} accounts
					{totalNeedReauth > 0 && ` · ${totalNeedReauth} need re-auth soon`}
				</span>
			</div>

			{connectedBankGroups.map((g) => {
				const minDays = Math.min(...g.accounts.map((a) => a.expiresInDays));
				const accentBorder =
					minDays < 0
						? "border-l-[4px] border-l-status-err"
						: minDays < 21
							? "border-l-[4px] border-l-status-warn"
							: "";
				return (
					<div
						key={g.bank.id}
						className={`bg-card-bg border border-table-border rounded-[6px] mb-3 overflow-hidden ${accentBorder}`}
					>
						{/* Bank header row */}
						<div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-table-border bg-table-bg">
							<div
								className="flex-shrink-0 flex items-center justify-center font-mono font-bold text-white rounded"
								style={{
									width: 36,
									height: 36,
									borderRadius: 4,
									background: g.bank.brand,
									fontSize: 12,
								}}
							>
								{g.bank.initials}
							</div>
							<div className="flex-1">
								<div
									className={`font-semibold ${minDays < 0 ? "text-status-err" : minDays < 21 ? "text-status-warn" : "text-page-text-dark"}`}
									style={{ fontSize: 14 }}
								>
									{g.bank.name}
								</div>
								<div
									className="font-mono text-page-text-subdued"
									style={{ fontSize: 11, letterSpacing: "0.04em" }}
								>
									{g.bank.country} · {g.accounts.length} account
									{g.accounts.length === 1 ? "" : "s"} · consent {g.consentId}
								</div>
							</div>
							<button
								type="button"
								onClick={() =>
									setDisconnectBank({ id: g.bank.id, name: g.bank.name })
								}
								className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
							>
								<Icons.X size={12} /> Disconnect
							</button>
							<button
								type="button"
								onClick={() =>
									setOauth({
										bank: { ...g.bank, maxDays: 90, bic: "" },
										step: 1,
										reauth: true,
									})
								}
								className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
							>
								<Icons.Refresh size={12} /> Re-authorise
							</button>
						</div>

						{/* Accounts table */}
						<div className="overflow-auto">
							<table className="w-full border-collapse bg-table-bg">
								<thead>
									<tr className="bg-table-header-bg">
										{[
											"Account name",
											"IBAN",
											"Type",
											"Sync to",
											"Consent",
											"",
										].map((h) => (
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
									{g.accounts.map((a) => (
										<AccountRow key={a.id} account={a} />
									))}
								</tbody>
							</table>
						</div>
					</div>
				);
			})}

			{/* OAuth modal */}
			<OAuthModal oauth={oauth} onClose={() => setOauth(null)} />

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
