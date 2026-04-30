import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

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
					className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-modal-bg border border-modal-border rounded-card overflow-auto focus:outline-none"
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
	danger = false,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	title: string;
	body: ReactNode;
	confirmLabel?: string;
	danger?: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	return (
		<ModalShell open={open} onClose={onCancel} width={420}>
			<Dialog.Title className="sr-only">{title}</Dialog.Title>
			<div className="p-5">
				<h2 className="text-page-text-dark font-semibold text-medium mb-2">
					{title}
				</h2>
				<div className="text-page-text-light text-small">{body}</div>
			</div>
			<div className="flex justify-end gap-2 px-5 py-3.5 border-t border-table-border bg-table-bg">
				<button
					type="button"
					onClick={onCancel}
					className="px-3 py-1.5 rounded-btn text-small bg-btn-normal-bg text-btn-normal-text border border-btn-normal-border hover:bg-btn-normal-bg-hover"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={onConfirm}
					className={`px-3 py-1.5 rounded-btn text-small ${
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
