"use client"

import { CheckCircle2, XCircle, X } from "lucide-react"

// Presentational toast stack. State is owned by the page.
export function Toaster({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const isError = t.kind === "error"
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg backdrop-blur ${
              isError
                ? "border-destructive/40 bg-card text-card-foreground"
                : "border-success/40 bg-card text-card-foreground"
            }`}
          >
            {isError ? (
              <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
            )}
            <div className="flex-1 text-sm leading-relaxed">{t.message}</div>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
