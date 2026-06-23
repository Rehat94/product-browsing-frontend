"use client"

import { Activity, AlertOctagon, CheckCircle2, Loader2, Zap } from "lucide-react"

export function IntegrityDemo({
  seenCount,
  pageCount,
  duplicate,
  cursor,
  hasMore,
  activityFeed,
  onSimulate,
  simulating,
}) {
  return (
    <section
      aria-labelledby="integrity-heading"
      className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-card p-5 shadow-sm ring-1 ring-primary/5"
    >
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Activity className="size-4" />
          </span>
          <h2 id="integrity-heading" className="text-base font-semibold">
            Pagination Integrity Demo
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Proves, live, that keyset pagination never duplicates or drops rows — even while products are being created
          and updated concurrently mid-browse.
        </p>
      </header>

      {/* Duplicate banner OR success badge */}
      {duplicate ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive"
        >
          <AlertOctagon className="mt-0.5 size-5 shrink-0" />
          <div className="text-sm font-medium leading-relaxed">
            Duplicate detected: product #{duplicate.ids.join(", #")} appeared twice. Pagination broke — the same row was
            returned across two different pages.
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-success">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div className="text-sm font-medium leading-relaxed">
            {seenCount > 0
              ? `${seenCount} unique products loaded across ${pageCount} ${
                  pageCount === 1 ? "page" : "pages"
                }, zero duplicates, zero gaps.`
              : "No pages loaded yet."}
          </div>
        </div>
      )}

      {/* Cursor readout */}
      <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Cursor state</div>
        {cursor ? (
          <code className="block break-all font-mono text-xs leading-relaxed text-foreground">
            Next page starts after: id={cursor.id}, created_at={cursor.createdAt}
          </code>
        ) : (
          <code className="block font-mono text-xs text-muted-foreground">
            {hasMore === false ? "End of feed — no further cursor." : "No cursor yet (start of feed)."}
          </code>
        )}
      </div>

      {/* Simulate button */}
      <button
        type="button"
        onClick={onSimulate}
        disabled={simulating}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {simulating ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
        {simulating ? "Running concurrent writes…" : "Simulate concurrent activity"}
      </button>
      <p className="-mt-2 text-xs leading-relaxed text-muted-foreground">
        Fires several <span className="font-mono">POST</span> creates and <span className="font-mono">PUT</span> updates
        in parallel. The list below will not refresh or re-sort — created rows only ever appear at the top of a fresh
        load, and updates are patched in place.
      </p>

      {/* Activity feed */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live activity feed</div>
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-secondary/30">
          {activityFeed.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              No activity yet. Click “Simulate concurrent activity”.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {activityFeed.map((entry) => (
                <li key={entry.key} className="flex items-center gap-2 px-3 py-2 font-mono text-xs">
                  <span
                    className={`inline-block size-1.5 shrink-0 rounded-full ${
                      entry.kind === "create" ? "bg-success" : entry.kind === "error" ? "bg-destructive" : "bg-warning"
                    }`}
                    aria-hidden="true"
                  />
                  <span className={entry.kind === "error" ? "text-destructive" : "text-foreground"}>{entry.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
