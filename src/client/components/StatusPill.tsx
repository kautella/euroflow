import * as Tooltip from "@radix-ui/react-tooltip";

type Status = "ok" | "warn" | "err";

const styles: Record<Status, { dot: string; text: string; bg: string }> = {
	ok: {
		dot: "bg-status-ok",
		text: "text-status-ok",
		bg: "bg-status-ok/10",
	},
	warn: {
		text: "text-status-warn",
		dot: "bg-status-warn",
		bg: "bg-status-warn/10",
	},
	err: {
		dot: "bg-status-err",
		text: "text-status-err",
		bg: "bg-status-err/10",
	},
};

export function StatusPill({
	status,
	label,
	tooltip,
}: {
	status: Status;
	label: string;
	tooltip?: string;
}) {
	const s = styles[status];
	const pill = (
		<span
			className={`inline-flex items-center gap-1.5 font-mono px-2 py-0.5 rounded-[2px] ${s.text} ${s.bg}`}
			style={{ fontSize: 11, letterSpacing: "0.06em" }}
		>
			<span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
			{label}
		</span>
	);

	if (!tooltip) return pill;

	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>{pill}</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content
					side="top"
					sideOffset={6}
					className="font-mono px-2.5 py-1.5 rounded-[3px] text-tooltip-text bg-tooltip-bg border border-tooltip-border"
					style={{ fontSize: 11, letterSpacing: "0.04em", maxWidth: 260 }}
				>
					{tooltip}
					<Tooltip.Arrow style={{ fill: "var(--color-tooltip-border)" }} />
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	);
}
