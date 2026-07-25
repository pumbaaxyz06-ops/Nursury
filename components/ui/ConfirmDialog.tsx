"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !mounted) return null;

  const targetContainer = typeof document !== "undefined" ? (document.getElementById("app-frame") || document.body) : null;
  if (!targetContainer) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-[360px] p-6 shadow-premium-float border border-neutral-100 my-auto">
        <h3 className="text-lg font-extrabold mb-2 text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-premium-secondary flex-1 !h-11 text-sm cursor-pointer">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={
              danger
                ? "btn-premium-danger flex-1 !h-11 text-sm cursor-pointer"
                : "btn-premium-primary flex-1 !h-11 text-sm cursor-pointer"
            }
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, targetContainer);
}
