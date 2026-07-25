"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-[340px] p-6 shadow-premium-float">
        <h3 className="text-lg font-extrabold mb-2 text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-premium-secondary flex-1 !h-11 text-sm">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={
              danger
                ? "btn-premium-danger flex-1 !h-11 text-sm"
                : "btn-premium-primary flex-1 !h-11 text-sm"
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
