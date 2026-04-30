type ReadoutItem = {
	k: string;
	v: string;
	color?: string;
};

export function Readout({ items }: { items: ReadoutItem[] }) {
	return (
		<div
			className="font-mono flex flex-wrap text-page-text-light"
			style={{ gap: "4px 18px", fontSize: 11, letterSpacing: "0.06em" }}
		>
			{items.map((it) => (
				<span key={it.k} className="uppercase">
					<span className="text-page-text-subdued">{it.k}</span>
					<span> </span>
					<span style={{ color: it.color ?? "var(--color-page-text-dark)" }}>
						{it.v}
					</span>
				</span>
			))}
		</div>
	);
}
