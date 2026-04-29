# euroflow

[![CI](https://github.com/kautella/euroflow/actions/workflows/ci.yml/badge.svg)](https://github.com/kautella/euroflow/actions/workflows/ci.yml)

euroflow lets you synchronize your bank transactions automatically. Connects to 2500+ EU banks via Enable Banking (PSD2), stores everything locally, and optionally pushes to [Actual Budget](https://actualbudget.org). Fully open source, MIT license, no third-party server your data has to pass through.

## Your data never leaves your machine

euroflow is designed so that your financial data stays on your hardware:

- **Bank connections** use [Enable Banking](https://enablebanking.com) (PSD2 regulated), a read-only OAuth flow. No credentials are stored.
- **Transaction data** is written to a local SQLite database and a dated CSV file after every sync. Nothing is sent to any external server.
- **Actual Budget push is optional** — euroflow works standalone as a CSV exporter with no Actual instance required.

## What it does

- Connects to 2500+ EU banks across 29 countries via Enable Banking (PSD2)
- Writes a dated local CSV after every sync — the primary output, always produced
- Optionally pushes transactions to a self-hosted Actual Budget instance
- Supports multiple bank accounts
- Runs locally with a web UI for setup and management

## Getting started

> Documentation coming soon. See [AGENTS.md](AGENTS.md) for the tech stack and contribution workflow.

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).
