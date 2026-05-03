import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Icons } from "../components/Icon";
import { useSettingsMutation } from "../hooks/useSettings";
import {
	encodeActual,
	encodeEb,
	encodeNotifications,
	encodeSchedule,
	type SettingsEb,
} from "../lib/settings-codec";
import {
	type SettingsActual,
	type SettingsNotifications,
	type SettingsSchedule,
	settingsActual,
	settingsNotifications,
	settingsSchedule,
} from "../seed/settings";
import {
	ActualSection,
	NotificationsSection,
	ScheduleSection,
	SecuritySection,
} from "./settings";

export const Route = createFileRoute("/setup")({
	component: SetupWizard,
});

const STEPS = [
	{ n: 1, title: "Security", sub: "Protect your euroflow instance" },
	{ n: 2, title: "Sync schedule", sub: "How often to fetch transactions" },
	{ n: 3, title: "Notifications", sub: "Tell euroflow how to reach you" },
	{ n: 4, title: "Actual Budget", sub: "Connect to Actual" },
	{ n: 5, title: "Confirm", sub: "Review and start syncing" },
] as const;

function SetupWizard() {
	const navigate = useNavigate();
	const [step, setStep] = useState(1);

	const [hp, setHp] = useState(false);
	const [eb, setEb] = useState<SettingsEb>({ appId: "", privateKey: "" });
	const [actual, setActual] = useState<SettingsActual>(settingsActual);
	const [notifications, setNotifications] = useState<SettingsNotifications>(
		settingsNotifications,
	);
	const [schedule, setSchedule] = useState<SettingsSchedule>(settingsSchedule);

	const mutation = useSettingsMutation();

	const finish = () => {
		mutation.mutate(
			{
				...encodeEb(eb),
				...encodeSchedule(schedule),
				...encodeNotifications(notifications),
				...encodeActual(actual),
				is_configured: "true",
			},
			{ onSuccess: () => navigate({ to: "/banks" }) },
		);
	};

	return (
		<div
			className="fixed inset-0 overflow-auto flex items-start justify-center"
			style={{
				background:
					"radial-gradient(ellipse at top left, var(--color-sidebar-bg), var(--color-page-bg) 60%)",
				zIndex: 50,
			}}
		>
			<div className="w-full px-6 py-10" style={{ maxWidth: "80vw" }}>
				{/* Brand header */}
				<div className="flex items-center gap-3 mb-7">
					<img
						src="/logo-icon.svg"
						width={44}
						height={44}
						alt=""
						style={{ flexShrink: 0 }}
					/>
					<div>
						<img
							src="/wordmark.svg"
							alt="euroflow"
							style={{
								height: 16,
								width: "auto",
								display: "block",
								marginBottom: 2,
							}}
						/>
						<div
							className="font-mono text-page-text-subdued uppercase"
							style={{ fontSize: 11, letterSpacing: "0.08em" }}
						>
							First-run wizard
						</div>
					</div>
					<div className="ml-auto">
						<button
							type="button"
							onClick={finish}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-transparent text-btn-bare-text hover:bg-btn-bare-bg-hover hover:text-btn-bare-text-hover"
						>
							Skip for now
						</button>
					</div>
				</div>
				{/* Stepper */}
				<div
					className="bg-card-bg border border-table-border rounded-[3px] mb-4 overflow-hidden"
					style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)" }}
				>
					{STEPS.map((s) => {
						const done = step > s.n;
						const active = step === s.n;
						return (
							<button
								key={s.n}
								type="button"
								onClick={() => setStep(s.n)}
								className="px-4 py-3.5 text-left"
								style={{
									borderRight:
										s.n < 5 ? "1px solid var(--color-table-border)" : undefined,
									borderBottom: active
										? "2px solid var(--color-btn-primary-bg)"
										: "2px solid transparent",
									background: active ? "rgba(148,70,237,0.06)" : "transparent",
									cursor: "pointer",
								}}
							>
								<div className="flex items-center gap-2.5">
									<div
										className="flex-shrink-0 flex items-center justify-center font-mono font-bold rounded"
										style={{
											width: 22,
											height: 22,
											borderRadius: 4,
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
											fontSize: 11,
										}}
									>
										{done ? <Icons.Check size={12} /> : s.n}
									</div>
									<div>
										<div
											className={`font-semibold ${active ? "text-page-text-dark" : "text-page-text-light"}`}
											style={{ fontSize: 13 }}
										>
											{s.title}
										</div>
										<div
											className="text-page-text-subdued"
											style={{ fontSize: 11 }}
										>
											{s.sub}
										</div>
									</div>
								</div>
							</button>
						);
					})}
				</div>

				{/* Step content */}
				<div className="bg-card-bg border border-table-border rounded-[3px]">
					{/* Nav */}
					<div className="flex items-center justify-between px-7 py-5 border-b border-table-border">
						<button
							type="button"
							disabled={step === 1}
							onClick={() => setStep((s) => s - 1)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover disabled:opacity-40"
						>
							<Icons.ChevronLeft size={14} /> Back
						</button>
						<span
							className="font-mono text-page-text-subdued uppercase"
							style={{ fontSize: 11, letterSpacing: "0.06em" }}
						>
							Step {step} of {STEPS.length}
						</span>
						{step < STEPS.length ? (
							<button
								type="button"
								onClick={() => setStep((s) => s + 1)}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
							>
								Continue <Icons.ChevronRight size={14} />
							</button>
						) : (
							<button
								type="button"
								onClick={finish}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-small bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
							>
								<Icons.Check size={14} /> Finish &amp; connect a bank
							</button>
						)}
					</div>
					<div className="p-7">
						{step === 1 && (
							<SecurityStep hp={hp} setHp={setHp} eb={eb} setEb={setEb} />
						)}
						{step === 2 && (
							<ScheduleSection value={schedule} onChange={setSchedule} />
						)}
						{step === 3 && (
							<NotificationsSection
								value={notifications}
								onChange={setNotifications}
							/>
						)}
						{step === 4 && (
							<ActualSection value={actual} onChange={setActual} />
						)}
						{step === 5 && (
							<ConfirmStep
								hp={hp}
								eb={eb}
								actual={actual}
								notifications={notifications}
								schedule={schedule}
							/>
						)}
					</div>
				</div>

				<div
					className="font-mono text-page-text-subdued uppercase text-center mt-4"
					style={{ fontSize: 10, letterSpacing: "0.1em" }}
				>
					── Self-hosted · MIT licensed ·{" "}
					<a
						href="https://github.com/kautella/euroflow"
						target="_blank"
						rel="noreferrer"
						className="hover:text-page-text"
					>
						github.com/kautella/euroflow
					</a>{" "}
					──
				</div>
			</div>
		</div>
	);
}

function SecurityStep({
	hp,
	setHp,
	eb,
	setEb,
}: {
	hp: boolean;
	setHp: (v: boolean) => void;
	eb: SettingsEb;
	setEb: (v: SettingsEb) => void;
}) {
	return (
		<SecuritySection
			hp={hp}
			setHp={setHp}
			ebAppId={eb.appId}
			onEbAppIdChange={(v) => setEb({ ...eb, appId: v })}
			ebKeyLoaded={!!eb.privateKey}
			onEbKeyUpload={(pem) => setEb({ ...eb, privateKey: pem })}
		/>
	);
}

function ConfirmStep({
	hp,
	eb,
	actual,
	notifications,
	schedule,
}: {
	hp: boolean;
	eb: SettingsEb;
	actual: SettingsActual;
	notifications: SettingsNotifications;
	schedule: SettingsSchedule;
}) {
	const notifyOn = [
		notifications.onFailure && "failure",
		notifications.onExpiring && "expiring",
		notifications.onExpired && "expired",
		notifications.dailySummary && "daily-summary",
	]
		.filter(Boolean)
		.join(", ");

	const yaml = `# /var/lib/euroflow/config.yml
security:
  password:       ${hp ? "********" : "(not set — open access)"}
enable_banking:
  app_id:         ${eb.appId || "(not set)"}
  private_key:    ${eb.privateKey ? "*** loaded ***" : "(not set)"}
schedule:
  frequency: ${schedule.frequency}
  anchor:    ${schedule.anchorTime}
  timezone:  ${schedule.timezone}
  catch_up:  ${schedule.catchUp}
notifications:
  email:     ${notifications.email ? "on" : "off"}
  webhook:   ${notifications.webhook ? notifications.webhookUrl || "on" : "off"}
  ntfy:      ${notifications.ntfy ? notifications.ntfyUrl || "on" : "off"}
  on:        ${notifyOn || "none"}
actual:
  url:       ${actual.url || "(not set)"}
  sync_id:   ${actual.syncId || "(not set)"}
  password:  ********`;

	return (
		<div>
			<h2
				className="text-page-text-dark font-semibold mb-1"
				style={{ fontSize: 18 }}
			>
				Review configuration
			</h2>
			<p
				className="text-page-text-light mb-5"
				style={{ fontSize: 13, lineHeight: 1.5 }}
			>
				On finish, euroflow writes these settings and starts the daemon.
			</p>

			<pre
				className="font-mono text-page-text bg-table-bg border border-table-border rounded-[3px] p-4 overflow-auto"
				style={{ fontSize: 12, lineHeight: 1.75 }}
			>
				{yaml}
			</pre>

			<div className="flex items-center gap-3 px-3 py-2.5 rounded-[3px] font-mono text-notice-text border border-notice-border mt-4">
				<Icons.Check size={14} className="flex-shrink-0" />
				<span style={{ fontSize: 12, letterSpacing: "0.04em" }}>
					READY — next: link your first bank
				</span>
			</div>
		</div>
	);
}
