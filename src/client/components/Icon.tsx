type IconProps = { size?: number; stroke?: number };
type SvgProps = { size?: number };

const I = ({ d, size = 16, stroke = 1.6 }: IconProps & { d: string }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={stroke}
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
		style={{ flexShrink: 0 }}
	>
		<path d={d} />
	</svg>
);

export const Icons = {
	Status: ({ size = 16 }: SvgProps) => (
		<I size={size} d="M3 12h4l2-7 4 14 2-7h6" />
	),
	Bank: ({ size = 16 }: SvgProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			style={{ flexShrink: 0 }}
		>
			<path d="M3 10l9-6 9 6" />
			<path d="M5 10v9" />
			<path d="M9 10v9" />
			<path d="M15 10v9" />
			<path d="M19 10v9" />
			<path d="M3 21h18" />
		</svg>
	),
	Log: ({ size = 16 }: SvgProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			style={{ flexShrink: 0 }}
		>
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<path d="M7 8h10M7 12h10M7 16h6" />
		</svg>
	),
	Settings: ({ size = 16 }: SvgProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			style={{ flexShrink: 0 }}
		>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
		</svg>
	),
	Refresh: ({ size = 16 }: SvgProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			style={{ flexShrink: 0 }}
		>
			<path d="M21 12a9 9 0 1 1-3-6.7" />
			<path d="M21 4v5h-5" />
		</svg>
	),
	Check: ({ size = 16 }: SvgProps) => <I size={size} d="M5 12l5 5L20 7" />,
	X: ({ size = 16 }: SvgProps) => <I size={size} d="M18 6 6 18M6 6l12 12" />,
	Arrow: ({ size = 16 }: SvgProps) => (
		<I size={size} d="M5 12h14M13 5l7 7-7 7" />
	),
	Dots: ({ size = 16 }: SvgProps) => (
		<I size={size} d="M5 12h.01M12 12h.01M19 12h.01" />
	),
	Lock: ({ size = 16 }: SvgProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			style={{ flexShrink: 0 }}
		>
			<rect x="3" y="11" width="18" height="11" rx="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	),
	Upload: ({ size = 16 }: SvgProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			style={{ flexShrink: 0 }}
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<path d="m17 8-5-5-5 5" />
			<path d="M12 3v12" />
		</svg>
	),
	Search: ({ size = 16 }: SvgProps) => (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			style={{ flexShrink: 0 }}
		>
			<circle cx="11" cy="11" r="7" />
			<path d="m21 21-4.3-4.3" />
		</svg>
	),
};
