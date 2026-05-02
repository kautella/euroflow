import { createFileRoute } from "@tanstack/react-router";
import { Cron } from "croner";
import { useEffect, useMemo, useState } from "react";
import { Icons } from "../components/Icon";
import { ConfirmModal } from "../components/Modal";
import { StatusPill } from "../components/StatusPill";
import { useBanners } from "../contexts/BannerContext";
import { type CertInfo, cert as seedCert } from "../seed/banks";
import {
	hasPassword,
	type SettingsActual,
	type SettingsAdvanced,
	type SettingsNotifications,
	type SettingsSchedule,
	settingsActual,
	settingsAdvanced,
	settingsNotifications,
	settingsSchedule,
} from "../seed/settings";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});

// ---- Layout helpers ----

function SectionCard({
	title,
	desc,
	children,
}: {
	title: string;
	desc: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-card-bg border border-table-border rounded-[3px] mb-4 overflow-hidden">
			<div className="px-6 py-4 border-b border-table-border">
				<h2 className="text-page-text-dark font-semibold text-small mb-0.5">
					{title}
				</h2>
				<div
					className="font-mono text-page-text-subdued"
					style={{ fontSize: 11, letterSpacing: "0.04em" }}
				>
					{desc}
				</div>
			</div>
			<div className="px-6 py-5">{children}</div>
		</div>
	);
}

function FormGrid({ children }: { children: React.ReactNode }) {
	return (
		<div
			className="grid gap-x-5 gap-y-4"
			style={{ gridTemplateColumns: "1fr 1fr" }}
		>
			{children}
		</div>
	);
}

function Field({
	label,
	help,
	full,
	children,
}: {
	label: string;
	help?: string;
	full?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div style={full ? { gridColumn: "1 / -1" } : undefined}>
			<div
				className="font-mono text-form-label-text uppercase mb-1.5"
				style={{ fontSize: 11, letterSpacing: "0.06em" }}
			>
				{label}
			</div>
			{children}
			{help && (
				<div className="text-page-text-light mt-1" style={{ fontSize: 11 }}>
					{help}
				</div>
			)}
		</div>
	);
}

const inputCls =
	"w-full px-2.5 py-1.5 rounded-[3px] text-small bg-form-input-bg text-form-input-text border border-form-input-border focus:outline-none focus:border-form-input-border-selected disabled:opacity-40";

const selectCls =
	"w-full px-2.5 py-1.5 rounded-[3px] text-small bg-form-input-bg text-form-input-text border border-form-input-border focus:outline-none focus:border-form-input-border-selected";

function Toggle({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
	label: string;
}) {
	return (
		<label className="flex items-center gap-2.5 cursor-pointer select-none">
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className="relative flex-shrink-0 rounded-full transition-colors"
				style={{
					width: 32,
					height: 18,
					background: checked
						? "var(--color-toggle-bg-selected)"
						: "var(--color-toggle-bg)",
				}}
			>
				<span
					className="absolute top-0.5 rounded-full bg-white transition-all"
					style={{
						width: 14,
						height: 14,
						left: checked ? 16 : 2,
					}}
				/>
			</button>
			<span className="text-small text-page-text">{label}</span>
		</label>
	);
}

function CheckRow({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="w-3.5 h-3.5 rounded-sm accent-checkbox-bg-selected"
			/>
			<span className="text-small text-page-text">{label}</span>
		</label>
	);
}

function SectionActions({
	dirty,
	onReset,
	onSave,
	extra,
}: {
	dirty: boolean;
	onReset: () => void;
	onSave: () => void;
	extra?: React.ReactNode;
}) {
	if (!dirty && !extra) return null;
	return (
		<div className="flex items-center gap-2 mt-5">
			{extra}
			<div className="flex-1" />
			{dirty && (
				<>
					<button
						type="button"
						onClick={onReset}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-transparent border border-transparent text-btn-bare-text hover:bg-btn-bare-bg-hover hover:text-btn-bare-text-hover"
					>
						Reset
					</button>
					<button
						type="button"
						onClick={onSave}
						className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
					>
						Save
					</button>
				</>
			)}
		</div>
	);
}

// ---- Exported sections (shared with wizard) ----

export function SecuritySection({
	hp,
	setHp,
	certInfo,
	setCertInfo,
	onValidPasswordChange,
	standalone = false,
}: {
	hp: boolean;
	setHp: (v: boolean) => void;
	certInfo: CertInfo | null;
	setCertInfo: (v: CertInfo | null) => void;
	onValidPasswordChange?: (hasValidPassword: boolean) => void;
	standalone?: boolean;
}) {
	const [pw, setPw] = useState("");
	const [confirm, setConfirm] = useState("");
	const mismatch = pw !== confirm && confirm.length > 0;
	const canSave = pw.length > 0 && !mismatch;

	useEffect(() => {
		onValidPasswordChange?.(canSave);
	}, [canSave, onValidPasswordChange]);

	const save = () => {
		setHp(true);
		setPw("");
		setConfirm("");
	};

	const inner = (
		<div className="flex flex-col gap-5">
			{/* Password */}
			<div>
				<div
					className="font-mono text-form-label-text uppercase mb-1"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					Web UI password
				</div>
				{!standalone && (
					<div className="text-page-text-subdued mb-3" style={{ fontSize: 12 }}>
						Leave blank to allow open access — anyone on your network can use
						euroflow.
					</div>
				)}
				{standalone && <div className="mb-3" />}
				<FormGrid>
					<Field label={hp ? "New password" : "Set password"}>
						<input
							className={inputCls}
							type="password"
							value={pw}
							placeholder="••••••••"
							onChange={(e) => setPw(e.target.value)}
						/>
					</Field>
					<Field label="Confirm password">
						<input
							className={`${inputCls} ${mismatch ? "border-status-err" : ""}`}
							type="password"
							value={confirm}
							placeholder="••••••••"
							onChange={(e) => setConfirm(e.target.value)}
						/>
						{mismatch && (
							<div className="text-status-err mt-1" style={{ fontSize: 11 }}>
								Passwords do not match.
							</div>
						)}
					</Field>
				</FormGrid>
				{standalone && (
					<div className="flex items-center justify-end gap-2 mt-3">
						{hp && (
							<button
								type="button"
								onClick={() => {
									setHp(false);
									setPw("");
									setConfirm("");
								}}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-transparent text-error-text border border-[rgba(255,155,155,0.3)] hover:bg-[rgba(255,155,155,0.08)] hover:border-error-border"
							>
								Remove password
							</button>
						)}
						<button
							type="button"
							onClick={save}
							disabled={!canSave}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover disabled:opacity-40"
						>
							{hp ? "Update password" : "Set password"}
						</button>
					</div>
				)}
			</div>

			{/* PSD2 certificate */}
			<div className="border-t border-table-border pt-5">
				<div
					className="font-mono text-form-label-text uppercase mb-3"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					PSD2 client certificate (QWAC)
				</div>
				<div className="flex flex-col gap-3">
					{certInfo ? (
						<div
							className="font-mono text-page-text-light"
							style={{ fontSize: 12, letterSpacing: "0.04em" }}
						>
							CN={certInfo.cn} · ISSUED BY {certInfo.issuer} · EXPIRES{" "}
							{certInfo.expires}
						</div>
					) : (
						<div
							className="font-mono text-page-text-subdued"
							style={{ fontSize: 12, letterSpacing: "0.04em" }}
						>
							No certificate uploaded.
						</div>
					)}
					<label className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small cursor-pointer text-btn-bare-text hover:bg-btn-bare-bg-hover hover:text-btn-bare-text-hover">
						<Icons.Upload size={14} />
						{certInfo ? "Replace .pem" : "Upload .pem"}
						<input
							type="file"
							accept=".pem,.crt,.cer"
							className="hidden"
							onChange={() => setCertInfo(seedCert)}
						/>
					</label>
				</div>
			</div>
		</div>
	);

	if (!standalone) return inner;
	return (
		<SectionCard
			title="Security"
			desc="Password protection and PSD2 client certificate."
		>
			{inner}
		</SectionCard>
	);
}

export function ActualSection({
	value: d,
	onChange,
	dirty = false,
	onSave,
	onReset,
	standalone = false,
}: {
	value: SettingsActual;
	onChange: (v: SettingsActual) => void;
	dirty?: boolean;
	onSave?: () => void;
	onReset?: () => void;
	standalone?: boolean;
}) {
	const [testing, setTesting] = useState<null | "pending" | "ok" | "err">(null);

	const test = () => {
		setTesting("pending");
		setTimeout(() => setTesting("ok"), 1100);
	};

	const inner = (
		<div>
			<FormGrid>
				<Field
					label="Server URL"
					full
					help="Self-hosted Actual instance, including protocol and port."
				>
					<input
						className={inputCls}
						value={d.url}
						placeholder="http://localhost:5006"
						onChange={(e) => onChange({ ...d, url: e.target.value })}
					/>
				</Field>
				<Field label="Server password">
					<input
						className={inputCls}
						type="password"
						placeholder="Actual server password"
						value={d.password}
						onChange={(e) => onChange({ ...d, password: e.target.value })}
					/>
				</Field>
				<Field
					label="Sync ID"
					help="Found under Settings → Advanced → Sync ID."
				>
					<input
						className={inputCls}
						value={d.syncId}
						placeholder="00000000-0000-0000-0000-000000000000"
						style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
						onChange={(e) => onChange({ ...d, syncId: e.target.value })}
					/>
				</Field>
				<Field label="E2E encryption password (if enabled)" full>
					<input
						className={inputCls}
						type="password"
						value={d.e2ePassword}
						onChange={(e) => onChange({ ...d, e2ePassword: e.target.value })}
					/>
				</Field>
			</FormGrid>

			{standalone && (
				<SectionActions
					dirty={dirty}
					onReset={onReset ?? (() => {})}
					onSave={onSave ?? (() => {})}
					extra={
						<div className="flex items-center gap-3">
							<button
								type="button"
								onClick={test}
								disabled={testing === "pending"}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover disabled:opacity-50"
							>
								{testing === "pending" ? (
									<span
										className="inline-block w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
										style={{
											borderColor: "currentColor",
											borderTopColor: "transparent",
										}}
									/>
								) : (
									<Icons.Wifi size={14} />
								)}
								Test connection
							</button>
							{testing === "ok" && (
								<StatusPill status="ok" label="CONNECTED · ACTUAL v26.4" />
							)}
							{testing === "err" && (
								<StatusPill status="err" label="HANDSHAKE FAILED" />
							)}
						</div>
					}
				/>
			)}
		</div>
	);

	if (!standalone) return inner;
	return (
		<SectionCard
			title="Actual Budget"
			desc="The Actual Budget server euroflow imports transactions into."
		>
			{inner}
		</SectionCard>
	);
}

export function NotificationsSection({
	value: d,
	onChange,
	dirty = false,
	onSave,
	onReset,
	standalone = false,
}: {
	value: SettingsNotifications;
	onChange: (v: SettingsNotifications) => void;
	dirty?: boolean;
	onSave?: () => void;
	onReset?: () => void;
	standalone?: boolean;
}) {
	const inner = (
		<div>
			<FormGrid>
				<div style={{ gridColumn: "1 / -1" }}>
					<div
						className="font-mono text-page-text-subdued uppercase mb-2"
						style={{ fontSize: 11, letterSpacing: "0.06em" }}
					>
						Channels
					</div>
					<div className="flex gap-6 flex-wrap">
						<Toggle
							label="Email (SMTP)"
							checked={d.email}
							onChange={(v) => onChange({ ...d, email: v })}
						/>
						<Toggle
							label="Webhook"
							checked={d.webhook}
							onChange={(v) => onChange({ ...d, webhook: v })}
						/>
						<Toggle
							label="ntfy.sh"
							checked={d.ntfy}
							onChange={(v) => onChange({ ...d, ntfy: v })}
						/>
					</div>
				</div>

				{d.email && (
					<>
						<Field label="SMTP user">
							<input
								className={inputCls}
								autoComplete="username"
								value={d.smtpUser}
								onChange={(e) => onChange({ ...d, smtpUser: e.target.value })}
							/>
						</Field>
						<Field label="SMTP password">
							<input
								className={inputCls}
								type="password"
								autoComplete="current-password"
								value={d.smtpPass}
								onChange={(e) => onChange({ ...d, smtpPass: e.target.value })}
							/>
						</Field>
						<Field label="SMTP host">
							<input
								className={inputCls}
								value={d.smtpHost}
								placeholder="smtp.example.com"
								onChange={(e) => onChange({ ...d, smtpHost: e.target.value })}
							/>
						</Field>
						<Field label="SMTP port">
							<input
								className={inputCls}
								value={d.smtpPort}
								style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
								onChange={(e) => onChange({ ...d, smtpPort: e.target.value })}
							/>
						</Field>
						<Field label="From address" full>
							<input
								className={inputCls}
								value={d.smtpFrom}
								placeholder="euroflow@example.com"
								onChange={(e) => onChange({ ...d, smtpFrom: e.target.value })}
							/>
						</Field>
					</>
				)}

				{d.webhook && (
					<Field
						label="Webhook URL"
						full
						help="POST with JSON body. Supports Slack & Discord webhook formats."
					>
						<input
							className={inputCls}
							value={d.webhookUrl}
							placeholder="https://hooks.example.com/euroflow"
							style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
							onChange={(e) => onChange({ ...d, webhookUrl: e.target.value })}
						/>
					</Field>
				)}

				{d.ntfy && (
					<Field
						label="ntfy topic URL"
						full
						help="e.g. https://ntfy.sh/my-topic"
					>
						<input
							className={inputCls}
							value={d.ntfyUrl}
							placeholder="https://ntfy.sh/my-topic"
							style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
							onChange={(e) => onChange({ ...d, ntfyUrl: e.target.value })}
						/>
					</Field>
				)}

				<div style={{ gridColumn: "1 / -1" }}>
					<div
						className="font-mono text-page-text-subdued uppercase mb-2"
						style={{ fontSize: 11, letterSpacing: "0.06em" }}
					>
						Notify when
					</div>
					<div className="flex flex-col">
						<CheckRow
							label="Sync fails (any account)"
							checked={d.onFailure}
							onChange={(v) => onChange({ ...d, onFailure: v })}
						/>
						<CheckRow
							label="Authentication is about to expire (≤ 7 days)"
							checked={d.onExpiring}
							onChange={(v) => onChange({ ...d, onExpiring: v })}
						/>
						<CheckRow
							label="Authentication has expired"
							checked={d.onExpired}
							onChange={(v) => onChange({ ...d, onExpired: v })}
						/>
						<CheckRow
							label="Daily summary (09:00 local)"
							checked={d.dailySummary}
							onChange={(v) => onChange({ ...d, dailySummary: v })}
						/>
					</div>
				</div>
			</FormGrid>

			{standalone && (
				<SectionActions
					dirty={dirty}
					onReset={onReset ?? (() => {})}
					onSave={onSave ?? (() => {})}
					extra={
						<button
							type="button"
							disabled={!d.email && !d.webhook && !d.ntfy}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover disabled:opacity-40"
						>
							<Icons.Bell size={14} />
							Send test notification
						</button>
					}
				/>
			)}
		</div>
	);

	if (!standalone) return inner;
	return (
		<SectionCard
			title="Notifications"
			desc="Where to send alerts when sync fails or sessions expire."
		>
			{inner}
		</SectionCard>
	);
}

export function ScheduleSection({
	value: d,
	onChange,
	dirty = false,
	onSave,
	onReset,
	standalone = false,
}: {
	value: SettingsSchedule;
	onChange: (v: SettingsSchedule) => void;
	dirty?: boolean;
	onSave?: () => void;
	onReset?: () => void;
	standalone?: boolean;
}) {
	const [h, m] = d.anchorTime.split(":").map(Number);
	const cronExpr =
		d.frequency === "custom"
			? d.customCron
			: d.frequency === "24h"
				? `0 ${m} ${h} * * *`
				: d.frequency === "12h"
					? `0 ${m} ${h},${(h + 12) % 24} * * *`
					: d.frequency === "6h"
						? `0 ${m} ${h},${(h + 6) % 24},${(h + 12) % 24},${(h + 18) % 24} * * *`
						: `0 ${m} * * * *`;

	const nextRun = useMemo(() => {
		try {
			const next = new Cron(cronExpr, { timezone: d.timezone }).nextRun();
			if (!next) return null;
			const fmt = new Intl.DateTimeFormat("en-CA", {
				timeZone: d.timezone,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
			return fmt.format(next).replace(", ", " ");
		} catch {
			return null;
		}
	}, [cronExpr, d.timezone]);

	const timezones = [
		"Europe/Lisbon",
		"Europe/London",
		"Europe/Berlin",
		"Europe/Amsterdam",
		"Europe/Paris",
		"Europe/Madrid",
		"Europe/Rome",
		"Europe/Helsinki",
		"UTC",
	].map((tz) => {
		const offset =
			new Intl.DateTimeFormat("en", {
				timeZone: tz,
				timeZoneName: "shortOffset",
			})
				.formatToParts(new Date())
				.find((p) => p.type === "timeZoneName")?.value ?? tz;
		return { value: tz, label: `${tz.replace("Europe/", "")} (${offset})` };
	});

	const freqs: { value: SettingsSchedule["frequency"]; label: string }[] = [
		{ value: "1h", label: "Hourly" },
		{ value: "6h", label: "Every 6 hours" },
		{ value: "12h", label: "Every 12 hours" },
		{ value: "24h", label: "Daily" },
		{ value: "custom", label: "Custom" },
	];

	const inner = (
		<div>
			<FormGrid>
				<div style={{ gridColumn: "1 / -1" }}>
					<div
						className="font-mono text-page-text-subdued uppercase mb-2"
						style={{ fontSize: 11, letterSpacing: "0.06em" }}
					>
						Frequency
					</div>
					<div className="inline-flex rounded-[3px] border border-table-border overflow-hidden">
						{freqs.map(({ value, label }) => (
							<button
								key={value}
								type="button"
								onClick={() =>
									onChange({
										...d,
										frequency: value,
										...(value === "custom" && d.frequency !== "custom"
											? { customCron: cronExpr }
											: {}),
									})
								}
								className={`px-3.5 py-1.5 text-small border-r border-table-border last:border-r-0 ${
									d.frequency === value
										? "bg-btn-primary-bg text-btn-primary-text"
										: "bg-form-input-bg text-page-text hover:bg-table-row-hover"
								}`}
							>
								{label}
							</button>
						))}
					</div>
				</div>

				{d.frequency !== "custom" && (
					<Field
						label="Anchor time"
						help="First run of the day. Subsequent runs space out from here."
					>
						<input
							className={inputCls}
							type="time"
							value={d.anchorTime}
							style={{ fontFamily: "var(--font-mono)" }}
							onChange={(e) => onChange({ ...d, anchorTime: e.target.value })}
						/>
					</Field>
				)}
				<Field label="Timezone">
					<select
						className={selectCls}
						value={d.timezone}
						onChange={(e) => onChange({ ...d, timezone: e.target.value })}
					>
						{timezones.map((z) => (
							<option key={z.value} value={z.value}>
								{z.label}
							</option>
						))}
					</select>
				</Field>

				<div style={{ gridColumn: "1 / -1" }}>
					{d.frequency === "custom" ? (
						<textarea
							className="font-mono text-page-text-light bg-table-bg border border-table-border rounded-[3px] p-3 w-full resize-none focus:outline-none focus:border-btn-primary-bg"
							style={{ fontSize: 11, lineHeight: 1.7 }}
							rows={1}
							spellCheck={false}
							value={d.customCron}
							onChange={(e) => onChange({ ...d, customCron: e.target.value })}
						/>
					) : (
						<pre
							className="font-mono text-page-text-light bg-table-bg border border-table-border rounded-[3px] p-3"
							style={{ fontSize: 11, lineHeight: 1.7 }}
						>
							{`CRON  ${cronExpr}`}
						</pre>
					)}
					<div
						className="font-mono text-page-text-subdued mt-2"
						style={{ fontSize: 11 }}
					>
						{nextRun
							? `NEXT  ${nextRun} ${d.timezone.replace("Europe/", "").toUpperCase()}`
							: "NEXT  — invalid expression"}
					</div>
				</div>

				<div
					className="flex items-center justify-between"
					style={{ gridColumn: "1 / -1" }}
				>
					<div>
						<CheckRow
							label="Catch up missed runs after restart"
							checked={d.catchUp}
							onChange={(v) => onChange({ ...d, catchUp: v })}
						/>
						<CheckRow
							label="Skip during weekends"
							checked={d.skipWeekends}
							onChange={(v) => onChange({ ...d, skipWeekends: v })}
						/>
					</div>
				</div>
			</FormGrid>

			{standalone && (
				<SectionActions
					dirty={dirty}
					onReset={onReset ?? (() => {})}
					onSave={onSave ?? (() => {})}
				/>
			)}
		</div>
	);

	if (!standalone) return inner;
	return (
		<SectionCard
			title="Sync schedule"
			desc="When euroflow runs the import job."
		>
			{inner}
		</SectionCard>
	);
}

// ---- Advanced + Danger zone (settings-only) ----

function AdvancedSection() {
	const [d, setD] = useState<SettingsAdvanced>(settingsAdvanced);
	const dirty = JSON.stringify(d) !== JSON.stringify(settingsAdvanced);
	const [confirmWipe, setConfirmWipe] = useState(false);
	const [confirmDisconnect, setConfirmDisconnect] = useState(false);

	const logLevels = ["info", "debug", "warn", "error"] as const;

	return (
		<>
			<SectionCard
				title="Advanced"
				desc="Knobs you probably don't need to touch."
			>
				<FormGrid>
					<Field label="Log level">
						<select
							className={selectCls}
							value={d.logLevel}
							onChange={(e) =>
								setD({
									...d,
									logLevel: e.target.value as SettingsAdvanced["logLevel"],
								})
							}
						>
							{logLevels.map((l) => (
								<option key={l} value={l}>
									{l}
								</option>
							))}
						</select>
					</Field>
					<Field label="HTTP timeout (ms)">
						<input
							className={inputCls}
							value={d.httpTimeoutMs}
							style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
							onChange={(e) =>
								setD({ ...d, httpTimeoutMs: Number(e.target.value) })
							}
						/>
					</Field>
					<Field label="Transaction batch size">
						<input
							className={inputCls}
							value={d.batchSize}
							style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
							onChange={(e) =>
								setD({ ...d, batchSize: Number(e.target.value) })
							}
						/>
					</Field>
					<Field label="Max retries">
						<input
							className={inputCls}
							value={d.maxRetries}
							style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
							onChange={(e) =>
								setD({ ...d, maxRetries: Number(e.target.value) })
							}
						/>
					</Field>
					<div
						className="flex items-center justify-between"
						style={{ gridColumn: "1 / -1" }}
					>
						<div>
							<CheckRow
								label="Deduplicate by external ID + amount + date"
								checked={d.dedup}
								onChange={(v) => setD({ ...d, dedup: v })}
							/>
							<CheckRow
								label="Auto-import pending transactions"
								checked={d.importPending}
								onChange={(v) => setD({ ...d, importPending: v })}
							/>
							<CheckRow
								label="Reset learned payee categories on each sync"
								checked={d.resetPayees}
								onChange={(v) => setD({ ...d, resetPayees: v })}
							/>
						</div>
						{dirty && (
							<div className="flex gap-2 self-end">
								<button
									type="button"
									onClick={() => setD(settingsAdvanced)}
									className="inline-flex items-center px-3 py-1.5 rounded-[3px] text-small bg-transparent border border-transparent text-btn-bare-text hover:bg-btn-bare-bg-hover hover:text-btn-bare-text-hover"
								>
									Reset
								</button>
								<button
									type="button"
									className="inline-flex items-center px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
								>
									Save
								</button>
							</div>
						)}
					</div>
				</FormGrid>

				{/* Danger zone */}
				<div className="mt-5 pt-5 border-t border-table-border">
					<div
						className="font-mono text-page-text-subdued uppercase mb-3"
						style={{ fontSize: 11, letterSpacing: "0.08em" }}
					>
						› Danger zone
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
						>
							Re-run wizard
						</button>
						<button
							type="button"
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
						>
							<Icons.File size={14} />
							Export config (.yml)
						</button>
						<button
							type="button"
							onClick={() => setConfirmWipe(true)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-transparent text-error-text border border-[rgba(255,155,155,0.3)] hover:bg-[rgba(255,155,155,0.08)] hover:border-error-border"
						>
							<Icons.AlertTriangle size={14} />
							Wipe sync history
						</button>
						<button
							type="button"
							onClick={() => setConfirmDisconnect(true)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-transparent text-error-text border border-[rgba(255,155,155,0.3)] hover:bg-[rgba(255,155,155,0.08)] hover:border-error-border"
						>
							<Icons.AlertTriangle size={14} />
							Disconnect all banks
						</button>
					</div>
				</div>
			</SectionCard>

			<ConfirmModal
				open={confirmWipe}
				onCancel={() => setConfirmWipe(false)}
				title="Wipe sync history"
				body="This will permanently delete all sync log entries and transaction references. Connected banks and settings are preserved."
				confirmLabel="Wipe history"
				confirmWord="RESET"
				danger
				onConfirm={() => setConfirmWipe(false)}
			/>
			<ConfirmModal
				open={confirmDisconnect}
				onCancel={() => setConfirmDisconnect(false)}
				title="Disconnect all banks"
				body="This will remove all connected bank accounts and their consent sessions. You will need to reconnect each bank manually."
				confirmLabel="Disconnect all"
				confirmWord="RESET"
				danger
				onConfirm={() => setConfirmDisconnect(false)}
			/>
		</>
	);
}

// ---- Page ----

function SettingsPage() {
	const { dismissed, dismiss } = useBanners();

	const [hp, setHp] = useState(hasPassword);
	const [certInfo, setCertInfo] = useState<CertInfo | null>(seedCert);

	const [actual, setActual] = useState<SettingsActual>(settingsActual);
	const [notifications, setNotifications] = useState<SettingsNotifications>(
		settingsNotifications,
	);
	const [schedule, setSchedule] = useState<SettingsSchedule>(settingsSchedule);

	const actualDirty = JSON.stringify(actual) !== JSON.stringify(settingsActual);
	const notificationsDirty =
		JSON.stringify(notifications) !== JSON.stringify(settingsNotifications);
	const scheduleDirty =
		JSON.stringify(schedule) !== JSON.stringify(settingsSchedule);

	const bannerStatus = !certInfo ? "err" : !hp ? "warn" : "ok";
	const bannerMsg =
		bannerStatus === "err"
			? "NO PSD2 CERTIFICATE — bank connections are disabled until a certificate is uploaded."
			: bannerStatus === "warn"
				? "NO PASSWORD SET — all routes are accessible without authentication."
				: "ALL SECURE — password active · PSD2 certificate valid.";
	const BannerIcon = bannerStatus === "ok" ? Icons.Shield : Icons.ShieldOff;
	const bannerCls =
		bannerStatus === "err"
			? "text-error-text border-[rgba(255,155,155,0.3)]"
			: bannerStatus === "warn"
				? "text-warning-text border-warning-border"
				: "text-notice-text border-notice-border";

	return (
		<div className="px-7 py-6">
			<div className="pb-5 mb-5 border-b border-table-border">
				<div
					className="font-mono text-page-text-subdued mb-1"
					style={{ fontSize: 11, letterSpacing: "0.06em" }}
				>
					/ SETTINGS
				</div>
				<h1 className="text-page-text-dark font-semibold text-large">
					Settings
				</h1>
			</div>

			{/* Security status banner */}
			{!dismissed.has("settings-security") && (
				<button
					type="button"
					className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[3px] bg-transparent mb-5 font-mono cursor-pointer text-left ${bannerCls} border`}
					style={{ fontSize: 12, letterSpacing: "0.04em", minHeight: 44 }}
					onClick={() => dismiss("settings-security")}
				>
					<BannerIcon size={14} className="flex-shrink-0" />
					<span>{bannerMsg}</span>
				</button>
			)}

			<SecuritySection
				hp={hp}
				setHp={setHp}
				certInfo={certInfo}
				setCertInfo={setCertInfo}
				standalone
			/>
			<ScheduleSection
				value={schedule}
				onChange={setSchedule}
				dirty={scheduleDirty}
				onSave={() => {}}
				onReset={() => setSchedule(settingsSchedule)}
				standalone
			/>
			<NotificationsSection
				value={notifications}
				onChange={setNotifications}
				dirty={notificationsDirty}
				onSave={() => {}}
				onReset={() => setNotifications(settingsNotifications)}
				standalone
			/>
			<ActualSection
				value={actual}
				onChange={setActual}
				dirty={actualDirty}
				onSave={() => {}}
				onReset={() => setActual(settingsActual)}
				standalone
			/>
			<AdvancedSection />
		</div>
	);
}
