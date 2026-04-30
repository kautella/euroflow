import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { useState } from "react";

export function ModalShell({
	open,
	onClose,
	width = 520,
	children,
}: {
	open: boolean;
	onClose: () => void;
	width?: number;
	children: ReactNode;
}) {
	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay
					className="fixed inset-0 z-50 bg-overlay-bg"
					style={{ backdropFilter: "blur(2px)" }}
				/>
				<Dialog.Content
					className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-modal-bg border border-modal-border rounded-[3px] overflow-auto focus:outline-none"
					style={{
						width,
						maxHeight: "90vh",
						boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
					}}
					aria-describedby={undefined}
				>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

export function ConfirmModal({
	open,
	title,
	body,
	confirmLabel = "OK",
	confirmWord,
	danger = false,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	title: string;
	body: ReactNode;
	confirmLabel?: string;
	confirmWord?: string;
	danger?: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	const [typed, setTyped] = useState("");
	const ready = !confirmWord || typed === confirmWord;

	return (
		<ModalShell open={open} onClose={onCancel} width={420}>
			<Dialog.Title className="sr-only">{title}</Dialog.Title>
			<div className="p-5">
				<h2 className="text-page-text-dark font-semibold text-medium mb-2">
					{title}
				</h2>
				<div className="text-page-text-light text-small">{body}</div>
				{confirmWord && (
					<div className="mt-4">
						<div
							className="font-mono text-page-text-subdued mb-1.5"
							style={{ fontSize: 11, letterSpacing: "0.06em" }}
						>
							Type <span className="text-page-text-dark">{confirmWord}</span> to
							confirm
						</div>
						<input
							className="w-full px-2.5 py-1.5 rounded-[3px] text-small bg-form-input-bg text-form-input-text border border-form-input-border focus:outline-none focus:border-form-input-border-selected font-mono"
							value={typed}
							onChange={(e) => setTyped(e.target.value)}
							placeholder={confirmWord}
						/>
					</div>
				)}
			</div>
			<div className="flex justify-end gap-2 px-5 py-3.5 border-t border-table-border bg-table-bg">
				<button
					type="button"
					onClick={() => {
						setTyped("");
						onCancel();
					}}
					className="px-3 py-1.5 rounded-[3px] text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={() => {
						setTyped("");
						onConfirm();
					}}
					disabled={!ready}
					className={`px-3 py-1.5 rounded-[3px] text-small disabled:opacity-40 ${
						danger
							? "bg-error-bg text-error-text border border-error-border hover:opacity-80"
							: "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-bg-hover"
					}`}
				>
					{confirmLabel}
				</button>
			</div>
		</ModalShell>
	);
}
