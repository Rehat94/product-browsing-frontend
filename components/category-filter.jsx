"use client"

// Category pills sourced from GET /categories.
export function CategoryFilter({ categories, active, onChange, disabled }) {
  const pills = [{ label: "All", value: "" }, ...categories.map((c) => ({ label: c, value: c }))]

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      {pills.map((p) => {
        const isActive = active === p.value
        return (
          <button
            key={p.value || "all"}
            type="button"
            disabled={disabled}
            onClick={() => onChange(p.value)}
            aria-pressed={isActive}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50 ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-ring hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
