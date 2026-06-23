"use client"

import { Pencil, Trash2, Loader2 } from "lucide-react"
import { formatPrice, formatTimestamp } from "@/lib/format"

export function ProductTable({ products, highlightedIds, onEdit, onDelete, loading }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left">
            <th className="px-3 py-2.5 font-semibold text-muted-foreground">ID</th>
            <th className="px-3 py-2.5 font-semibold text-muted-foreground">Name</th>
            <th className="px-3 py-2.5 font-semibold text-muted-foreground">Category</th>
            <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Price</th>
            <th className="px-3 py-2.5 font-semibold text-muted-foreground">Created</th>
            <th className="px-3 py-2.5 text-right font-semibold text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const highlighted = highlightedIds.has(p.id)
            return (
              <tr
                key={p.id}
                className={`border-b border-border last:border-0 transition-colors hover:bg-secondary/40 ${
                  highlighted ? "row-pulse" : ""
                }`}
              >
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">#{p.id}</td>
                <td className="px-3 py-2.5 font-medium">{p.name}</td>
                <td className="px-3 py-2.5">
                  <span className="rounded-full border border-border bg-accent/40 px-2 py-0.5 text-xs text-accent-foreground">
                    {p.category}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">{formatPrice(p.price)}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{formatTimestamp(p.created_at)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}

          {products.length === 0 && !loading && (
            <tr>
              <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted-foreground">
                No products to show.
              </td>
            </tr>
          )}

          {loading && products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Loading products…
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
