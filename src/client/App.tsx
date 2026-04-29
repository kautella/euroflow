import { useTheme } from "./components/ThemeProvider";

function App() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="min-h-screen bg-page-bg text-page-text p-8">
			<h1 className="text-very-large font-semibold mb-6">euroflow</h1>

			<div className="mb-4">
				<p className="text-page-text-subdued text-small uppercase tracking-widest mb-2">
					Theme
				</p>
				<div className="flex gap-2">
					{(["dark", "light", "midnight"] as const).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setTheme(t)}
							className={`px-3 py-1 rounded text-small border ${
								theme === t
									? "bg-btn-primary-bg text-btn-primary-text border-btn-primary-bg"
									: "bg-btn-normal-bg text-btn-normal-text border-btn-normal-border"
							}`}
						>
							{t}
						</button>
					))}
				</div>
			</div>

			<div className="bg-card-bg border border-card-border rounded-card p-spacing-card">
				<p className="text-page-text-subdued text-very-small uppercase tracking-widest mb-3">
					Numeric demo — tnum active
				</p>
				<table className="bg-table-bg border-collapse w-full">
					<thead>
						<tr className="bg-table-header-bg">
							<th className="font-mono text-table-header-text text-very-small uppercase tracking-widest px-4 py-2 border border-table-border text-left">
								Account
							</th>
							<th className="font-mono text-table-header-text text-very-small uppercase tracking-widest px-4 py-2 border border-table-border text-right">
								Balance
							</th>
							<th className="font-mono text-table-header-text text-very-small uppercase tracking-widest px-4 py-2 border border-table-border text-left">
								Last Sync
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="font-sans text-page-text px-4 py-2 border border-table-border">
								ING Direct
							</td>
							<td className="font-mono text-number-positive px-4 py-2 border border-table-border text-right">
								+1,234.56
							</td>
							<td className="font-mono text-page-text-subdued px-4 py-2 border border-table-border">
								2026-04-29 18:00:00
							</td>
						</tr>
						<tr className="hover:bg-table-row-hover">
							<td className="font-sans text-page-text px-4 py-2 border border-table-border">
								Millennium BCP
							</td>
							<td className="font-mono text-number-negative px-4 py-2 border border-table-border text-right">
								−89.00
							</td>
							<td className="font-mono text-page-text-subdued px-4 py-2 border border-table-border">
								2026-04-29 18:00:00
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default App;
