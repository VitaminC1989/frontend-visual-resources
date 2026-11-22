"use client";

import { AnimatePresence, motion } from "motion/react";

export interface ToastItem {
  id: number;
  kind: "copy" | "save" | "pick" | "blueprint" | "hint";
  text: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

interface Props {
  toast: ToastItem | null;
  onDismiss: () => void;
}

function ToastIcon({ kind }: { kind: ToastItem["kind"] }) {
  if (kind === "copy") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  if (kind === "save") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (kind === "blueprint") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3z" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 1.9 4.8L19 9.5l-4 3.4 1.2 5.1L12 15.2 7.8 18 9 12.9l-4-3.4 5.1-1.7z" />
    </svg>
  );
}

/** 底部悬浮反馈胶囊（灵感来自 Beautiful UI / Transitions.dev） */
export function StatusToast({ toast, onDismiss }: Props) {
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            data-kind={toast.kind}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 460, damping: 32 }}
          >
            <span className="toast-ico" aria-hidden="true">
              <ToastIcon kind={toast.kind} />
            </span>
            <span className="toast-text">{toast.text}</span>
            {toast.actionLabel && toast.actionHref && (
              <a className="toast-act" href={toast.actionHref} target="_blank" rel="noopener">
                {toast.actionLabel}
              </a>
            )}
            {toast.actionLabel && toast.onAction && (
              <button className="toast-act" type="button" onClick={toast.onAction}>
                {toast.actionLabel}
              </button>
            )}
            <button className="toast-close" type="button" onClick={onDismiss} aria-label="关闭提示">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
