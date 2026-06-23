// Small formatting helpers. ids/prices arrive as strings from the API.

export function formatPrice(price) {
  const n = Number(price)
  if (Number.isNaN(n)) return String(price)
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatTimestamp(iso) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

const ADJECTIVES = [
  "Premium",
  "Ultra",
  "Modern",
  "Compact",
  "Pro",
  "Nova",
  "Quantum",
  "Apex",
  "Vivid",
  "Hyper",
  "Lumen",
  "Core",
]
const NOUNS = [
  "Speaker",
  "Monitor",
  "Desk",
  "Chair",
  "Lamp",
  "Blender",
  "Notebook",
  "Jacket",
  "Sensor",
  "Router",
  "Bottle",
  "Kit",
]
const SUFFIXES = ["X", "Series", "Edition", "Mk II", "Plus", "Max", "Mini", "2026"]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Build a random product payload for the concurrency simulation.
export function randomProduct(categories) {
  const category = categories.length ? pick(categories) : "Electronics"
  const name = `${pick(ADJECTIVES)} ${pick(NOUNS)} ${pick(SUFFIXES)}`
  const price = Math.round((Math.random() * 980 + 5) * 100) / 100
  return { name, category, price }
}

export function randomPrice() {
  return Math.round((Math.random() * 980 + 5) * 100) / 100
}
