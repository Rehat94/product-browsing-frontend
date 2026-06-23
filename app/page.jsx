"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Plus, Loader2, RefreshCw, Database, AlertTriangle } from "lucide-react"
import {
  listProducts,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api"
import { randomProduct, randomPrice } from "@/lib/format"
import { CategoryFilter } from "@/components/category-filter"
import { ProductTable } from "@/components/product-table"
import { IntegrityDemo } from "@/components/integrity-demo"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Toaster } from "@/components/toaster"

const PAGE_LIMIT = 12

export default function Page() {
  // ----- catalog state -----
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState("")
  const [products, setProducts] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listError, setListError] = useState(null)

  // ----- integrity tracking -----
  const seenIdsRef = useRef(new Set())
  const [seenCount, setSeenCount] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [duplicate, setDuplicate] = useState(null)
  const [activityFeed, setActivityFeed] = useState([])
  const [highlightedIds, setHighlightedIds] = useState(new Set())
  const [simulating, setSimulating] = useState(false)
  const activityKey = useRef(0)

  // ----- dialogs / toasts -----
  const [form, setForm] = useState({ open: false, mode: "create", product: null })
  const [confirmProduct, setConfirmProduct] = useState(null)
  const [toasts, setToasts] = useState([])

  // ---------- helpers ----------
  const pushToast = useCallback((message, kind = "success") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, kind }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addActivity = useCallback((text, kind) => {
    activityKey.current += 1
    const key = activityKey.current
    setActivityFeed((prev) => [{ key, text, kind }, ...prev].slice(0, 100))
  }, [])

  const highlightRow = useCallback((id) => {
    setHighlightedIds((prev) => new Set(prev).add(id))
    setTimeout(() => {
      setHighlightedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 2000)
  }, [])

  // Check an incoming page against the running Set, surface duplicates,
  // then register every id. Returns true if the page was clean.
  const registerPage = useCallback((incoming) => {
    const dupIds = []
    for (const p of incoming) {
      if (seenIdsRef.current.has(p.id)) dupIds.push(p.id)
    }
    for (const p of incoming) seenIdsRef.current.add(p.id)
    setSeenCount(seenIdsRef.current.size)
    if (dupIds.length > 0) {
      setDuplicate({ ids: dupIds })
      return false
    }
    return true
  }, [])

  // ---------- data loading ----------
  const loadFirstPage = useCallback(
    async (category) => {
      setLoading(true)
      setListError(null)
      setDuplicate(null)
      seenIdsRef.current = new Set()
      setSeenCount(0)
      setPageCount(0)
      setProducts([])
      setCursor(null)
      setHasMore(false)
      try {
        const res = await listProducts({ category, limit: PAGE_LIMIT })
        registerPage(res.data)
        setProducts(res.data)
        setCursor(res.nextCursor)
        setHasMore(Boolean(res.hasMore))
        setPageCount(1)
      } catch (err) {
        setListError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [registerPage],
  )

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    setListError(null)
    try {
      const res = await listProducts({ category: activeCategory, limit: PAGE_LIMIT, cursor })
      // Defensive: stop if an empty page comes back even though hasMore was true.
      if (!res.data || res.data.length === 0) {
        setHasMore(false)
        return
      }
      registerPage(res.data)
      setProducts((prev) => [...prev, ...res.data])
      setCursor(res.nextCursor)
      setHasMore(Boolean(res.hasMore))
      setPageCount((n) => n + 1)
    } catch (err) {
      setListError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }, [cursor, loadingMore, activeCategory, registerPage])

  // initial load: categories + first page
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cats = await listCategories()
        if (!cancelled) setCategories(cats)
      } catch (err) {
        if (!cancelled) pushToast(`Failed to load categories: ${err.message}`, "error")
      }
    })()
    loadFirstPage("")
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- handlers ----------
  function handleCategoryChange(cat) {
    if (cat === activeCategory) return
    setActiveCategory(cat)
    loadFirstPage(cat)
  }

  async function handleCreate(payload) {
    const created = await createProduct(payload)
    pushToast(`Created “${created.name}” (#${created.id})`)
    // Prepend only if it matches the active filter (newest-first => top).
    if (activeCategory === "" || created.category === activeCategory) {
      seenIdsRef.current.add(created.id)
      setSeenCount(seenIdsRef.current.size)
      setProducts((prev) => [created, ...prev])
    }
  }

  async function handleEdit(changes) {
    const id = form.product.id
    const updated = await updateProduct(id, changes)
    // Patch the row in place — no refetch, no re-sort.
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    pushToast(`Updated product #${id}`)
  }

  async function handleDeleteConfirmed() {
    const id = confirmProduct.id
    await deleteProduct(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setConfirmProduct(null)
    pushToast(`Deleted product #${id}`)
  }

  // ---------- the concurrency simulation ----------
  async function handleSimulate() {
    if (simulating) return
    setSimulating(true)

    const createCount = 5 + Math.floor(Math.random() * 6) // 5-10
    const tasks = []

    // Concurrent CREATES — these are brand-new, so they must NOT be spliced
    // into the already-rendered list. They'd only show at the top of a fresh load.
    for (let i = 0; i < createCount; i++) {
      tasks.push(
        createProduct(randomProduct(categories))
          .then((p) => addActivity(`Created product #${p.id} — ${p.category} — $${Number(p.price).toFixed(2)}`, "create"))
          .catch((err) => addActivity(`Create failed: ${err.message}`, "error")),
      )
    }

    // Concurrent UPDATES on rows that are ALREADY visible.
    const pool = [...products]
    const updateCount = Math.min(pool.length, 3 + Math.floor(Math.random() * 3)) // 3-5
    // shuffle and take the first `updateCount`
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const targets = pool.slice(0, updateCount)

    for (const target of targets) {
      const changePrice = Math.random() < 0.6
      if (changePrice) {
        const newPrice = randomPrice()
        const oldPrice = Number(target.price).toFixed(2)
        tasks.push(
          updateProduct(target.id, { price: newPrice })
            .then((updated) => {
              setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
              highlightRow(updated.id)
              addActivity(`Updated product #${updated.id} price ${oldPrice} -> ${Number(updated.price).toFixed(2)}`, "update")
            })
            .catch((err) => addActivity(`Update #${target.id} failed: ${err.message}`, "error")),
        )
      } else {
        const others = categories.filter((c) => c !== target.category)
        const newCat = others.length ? others[Math.floor(Math.random() * others.length)] : target.category
        const oldCat = target.category
        tasks.push(
          updateProduct(target.id, { category: newCat })
            .then((updated) => {
              setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
              highlightRow(updated.id)
              addActivity(`Updated product #${updated.id} category ${oldCat} -> ${updated.category}`, "update")
            })
            .catch((err) => addActivity(`Update #${target.id} failed: ${err.message}`, "error")),
        )
      }
    }

    await Promise.allSettled(tasks)
    setSimulating(false)
  }

  // ---------- render ----------
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-8">
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Database className="size-4" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Keyset Pagination Explorer</h1>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A data tool for browsing a ~200k product catalog newest-first via cursor pagination. Use the integrity panel
          to prove that browsing stays correct under concurrent writes.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Product browser */}
        <div className="order-2 flex flex-col gap-4 lg:order-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CategoryFilter
              categories={categories}
              active={activeCategory}
              onChange={handleCategoryChange}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setForm({ open: true, mode: "create", product: null })}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="size-4" />
              Add product
            </button>
          </div>

          {listError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <AlertTriangle className="size-4 shrink-0" />
              <span>{listError}</span>
              <button
                type="button"
                onClick={() => loadFirstPage(activeCategory)}
                className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium underline-offset-2 hover:underline"
              >
                <RefreshCw className="size-3" /> Retry
              </button>
            </div>
          )}

          <ProductTable
            products={products}
            highlightedIds={highlightedIds}
            onEdit={(p) => setForm({ open: true, mode: "edit", product: p })}
            onDelete={(p) => setConfirmProduct(p)}
            loading={loading}
          />

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-mono">
              {products.length} row{products.length === 1 ? "" : "s"} shown
              {activeCategory ? ` · filtered: ${activeCategory}` : ""}
            </span>
            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
              >
                {loadingMore && <Loader2 className="size-4 animate-spin" />}
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            ) : (
              !loading && products.length > 0 && <span className="font-mono">End of feed</span>
            )}
          </div>
        </div>

        {/* Integrity demo (centerpiece) */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <IntegrityDemo
              seenCount={seenCount}
              pageCount={pageCount}
              duplicate={duplicate}
              cursor={cursor}
              hasMore={hasMore}
              activityFeed={activityFeed}
              onSimulate={handleSimulate}
              simulating={simulating}
            />
          </div>
        </div>
      </div>

      <ProductFormDialog
        open={form.open}
        mode={form.mode}
        product={form.product}
        categories={categories}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
        onSubmit={form.mode === "edit" ? handleEdit : handleCreate}
      />

      <ConfirmDialog
        open={Boolean(confirmProduct)}
        title="Delete product?"
        description={
          confirmProduct
            ? `This permanently deletes “${confirmProduct.name}” (#${confirmProduct.id}). This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onCancel={() => setConfirmProduct(null)}
        onConfirm={handleDeleteConfirmed}
      />

      <Toaster toasts={toasts} onDismiss={removeToast} />
    </main>
  )
}
