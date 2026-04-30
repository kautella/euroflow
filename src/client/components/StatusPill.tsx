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
}: {
	status: Status;
	label: string;
}) {
	const s = styles[status];
	return (
		<span
			className={`inline-flex items-center gap-1.5 font-mono px-2 py-0.5 rounded-pill ${s.text} ${s.bg}`}
			style={{ fontSize: 11, letterSpacing: "0.06em" }}
		>
			<span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
			{label}
		</span>
	);
}
