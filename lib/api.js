// Thin client for the product-browsing REST API.
// Every function throws an Error whose `message` is the server-provided
// `error` field when the response is not ok, so callers can render it directly.

export const API_BASE = "https://keyset-pagination-demo.onrender.com/api"

async function parseError(res) {
  let message = `Request failed (${res.status})`
  try {
    const body = await res.json()
    if (body && typeof body.error === "string") message = body.error
  } catch {
    // non-JSON error body; keep the generic message
  }
  return new Error(message)
}

// GET /products with optional category + cursor pair.
export async function listProducts({ category, limit = 20, cursor } = {}) {
  const params = new URLSearchParams()
  if (category) params.set("category", category)
  if (limit) params.set("limit", String(limit))
  // cursorId and cursorCreatedAt must be sent together or not at all.
  if (cursor && cursor.id != null && cursor.createdAt != null) {
    params.set("cursorId", String(cursor.id))
    params.set("cursorCreatedAt", String(cursor.createdAt))
  }
  const res = await fetch(`${API_BASE}/products?${params.toString()}`)
  if (!res.ok) throw await parseError(res)
  return res.json() // { data, nextCursor, hasMore }
}

// GET /products/:id
export async function getProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`)
  if (!res.ok) throw await parseError(res)
  return res.json()
}

// POST /products
export async function createProduct({ name, category, price }) {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category, price: Number(price) }),
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

// PUT /products/:id — only send changed fields.
export async function updateProduct(id, changes) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes),
  })
  if (!res.ok) throw await parseError(res)
  return res.json()
}

// DELETE /products/:id — resolves on 204, throws on error.
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" })
  if (res.status === 204) return true
  throw await parseError(res)
}

// GET /categories
export async function listCategories() {
  const res = await fetch(`${API_BASE}/categories`)
  if (!res.ok) throw await parseError(res)
  const body = await res.json()
  return body.data || []
}
