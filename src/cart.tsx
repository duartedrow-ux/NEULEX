import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

export type CartLine = {
  productId: string
  quantity: number
}

type CartState = {
  lines: CartLine[]
}

type CartAction =
  | { type: 'add'; productId: string; quantity?: number }
  | { type: 'setQty'; productId: string; quantity: number }
  | { type: 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'hydrate'; state: CartState }

const CART_STORAGE_KEY = 'neulex_cart_v1'

function clampQty(qty: number) {
  if (!Number.isFinite(qty)) return 1
  return Math.max(1, Math.min(99, Math.round(qty)))
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'hydrate':
      return action.state
    case 'add': {
      const addQty = clampQty(action.quantity ?? 1)
      const existing = state.lines.find((l) => l.productId === action.productId)
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.productId === action.productId
              ? { ...l, quantity: clampQty(l.quantity + addQty) }
              : l,
          ),
        }
      }
      return { lines: [...state.lines, { productId: action.productId, quantity: addQty }] }
    }
    case 'setQty': {
      const qty = clampQty(action.quantity)
      return {
        lines: state.lines.map((l) =>
          l.productId === action.productId ? { ...l, quantity: qty } : l,
        ),
      }
    }
    case 'remove':
      return { lines: state.lines.filter((l) => l.productId !== action.productId) }
    case 'clear':
      return { lines: [] }
  }
}

type CartApi = {
  lines: CartLine[]
  totalItems: number
  addToCart: (productId: string, quantity?: number) => void
  setQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartApi | null>(null)

function safeParseCart(raw: string | null): CartState | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const lines = (parsed as { lines?: unknown }).lines
    if (!Array.isArray(lines)) return null
    const sanitized: CartLine[] = []
    for (const line of lines) {
      if (!line || typeof line !== 'object') continue
      const productId = (line as { productId?: unknown }).productId
      const quantity = (line as { quantity?: unknown }).quantity
      if (typeof productId !== 'string') continue
      if (typeof quantity !== 'number') continue
      sanitized.push({ productId, quantity: clampQty(quantity) })
    }
    return { lines: sanitized }
  } catch {
    return null
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { lines: [] })

  useEffect(() => {
    const hydrated = safeParseCart(localStorage.getItem(CART_STORAGE_KEY))
    if (hydrated) dispatch({ type: 'hydrate', state: hydrated })
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const derived = useMemo(() => {
    const totalItems = state.lines.reduce((acc, l) => acc + l.quantity, 0)
    return { totalItems }
  }, [state.lines])

  const api = useMemo<CartApi>(
    () => ({
      lines: state.lines,
      totalItems: derived.totalItems,
      addToCart: (productId, quantity) => dispatch({ type: 'add', productId, quantity }),
      setQuantity: (productId, quantity) => dispatch({ type: 'setQty', productId, quantity }),
      removeFromCart: (productId) => dispatch({ type: 'remove', productId }),
      clearCart: () => dispatch({ type: 'clear' }),
    }),
    [derived.totalItems, state.lines],
  )

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
