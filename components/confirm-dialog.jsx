"use client"

import { useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  async function handleConfirm() {
    setBusy(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel()
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card text-card-foreground shadow-xl">
        <div className="flex gap-3 px-5 pt-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        {error && (
          <p className="mx-5 mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 px-5 py-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
