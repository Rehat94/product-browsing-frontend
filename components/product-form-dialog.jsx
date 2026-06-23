"use client"

import { useEffect, useState } from "react"
import { X, Loader2 } from "lucide-react"

// Shared modal for both Create and Edit.
// mode: "create" | "edit". On edit, only changed fields are submitted.
export function ProductFormDialog({ open, mode, product, categories, onClose, onSubmit }) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSubmitting(false)
    if (mode === "edit" && product) {
      setName(product.name)
      setCategory(product.category)
      setPrice(String(product.price))
    } else {
      setName("")
      setCategory(categories[0] || "")
      setPrice("")
    }
  }, [open, mode, product, categories])

  if (!open) return null

  // Client-side validation mirrors the server rules.
  function validate() {
    if (!name.trim()) return "Name is required"
    if (!category) return "Category is required"
    const n = Number(price)
    if (price === "" || Number.isNaN(n)) return "Price must be a number"
    if (n < 0) return "Price must be a non-negative number"
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      if (mode === "edit") {
        // Send only the fields that actually changed.
        const changes = {}
        if (name.trim() !== product.name) changes.name = name.trim()
        if (category !== product.category) changes.category = category
        if (Number(price) !== Number(product.price)) changes.price = Number(price)
        if (Object.keys(changes).length === 0) {
          onClose()
          return
        }
        await onSubmit(changes)
      } else {
        await onSubmit({ name: name.trim(), category, price: Number(price) })
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">{mode === "edit" ? `Edit product #${product?.id}` : "Add product"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ultra Monitor Nova"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              autoFocus
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Price</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="299.99"
              className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </label>

          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {mode === "edit" ? "Save changes" : "Create product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
