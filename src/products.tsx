import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Product, ProductCategory } from './catalog'
import { PRODUCTS as DEFAULT_PRODUCTS } from './catalog'
import { supabase } from './lib/supabase'

type ProductsState = {
  products: Product[]
  isLoading: boolean
  isInitialized: boolean
}

type ProductsApi = {
  products: Product[]
  byId: Record<string, Product>
  isLoading: boolean
  setAll: (products: Product[]) => void | Promise<void>
  upsert: (product: Product) => void | Promise<void>
  remove: (id: string) => void | Promise<void>
  resetToDefault: () => void | Promise<void>
  exportJson: () => string
  importJson: (jsonText: string) => { ok: true } | { ok: false; error: string }
}

const isCategory = (value: string): value is ProductCategory => true

const sanitizeProducts = (input: unknown): Product[] | null => {
  if (!Array.isArray(input)) return null
  const out: Product[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    const raw = item as Partial<Record<keyof Product, unknown>>
    if (typeof raw.id !== 'string' || !raw.id.trim()) continue
    if (typeof raw.name !== 'string' || !raw.name.trim()) continue
    if (typeof raw.category !== 'string' || !isCategory(raw.category)) continue
    const imageUrl = typeof raw.imageUrl === 'string' ? raw.imageUrl.trim() : undefined
    if (typeof raw.shortDescription !== 'string') continue
    if (typeof raw.description !== 'string') continue
    if (typeof raw.priceArs !== 'number' || !Number.isFinite(raw.priceArs)) continue
    const tags =
      Array.isArray(raw.tags) && raw.tags.every((t) => typeof t === 'string')
        ? (raw.tags as string[])
        : undefined

    out.push({
      id: raw.id.trim(),
      name: raw.name.trim(),
      category: raw.category,
      imageUrl: imageUrl || undefined,
      shortDescription: raw.shortDescription.trim(),
      description: raw.description.trim(),
      priceArs: Math.max(0, Math.round(raw.priceArs)),
      tags: tags?.map((t) => t.trim()).filter(Boolean),
    })
  }

  const byId = new Set<string>()
  const deduped: Product[] = []
  for (const p of out) {
    if (byId.has(p.id)) continue
    byId.add(p.id)
    deduped.push(p)
  }
  return deduped
}

const PRODUCTS_STORAGE_KEY = 'neulex_products_v1'
const INITIALIZED_KEY = 'neulex_initialized' // New key to track if we've initialized before

const loadStoredProducts = (): Product[] | null => {
  const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    return sanitizeProducts(parsed)
  } catch {
    return null
  }
}

const saveStoredProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
  localStorage.setItem(INITIALIZED_KEY, 'true')
}

const removeStoredProducts = () => {
  localStorage.removeItem(PRODUCTS_STORAGE_KEY)
}

const ProductsContext = createContext<ProductsApi | null>(null)

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    isLoading: true,
    isInitialized: false
  })

  const fetchProducts = async () => {
    const hasInitialized = localStorage.getItem(INITIALIZED_KEY) === 'true'
    if (supabase) {
      try {
        setState(s => ({ ...s, isLoading: true }))
        const { data, error } = await supabase.from('products').select('*')
        if (error) {
          console.error('Error fetching products from Supabase:', error)
          const stored = loadStoredProducts()
          if (stored) {
            setState(s => ({ ...s, products: stored, isLoading: false, isInitialized: true }))
          } else if (!hasInitialized) {
            saveStoredProducts(DEFAULT_PRODUCTS)
            setState(s => ({ ...s, products: DEFAULT_PRODUCTS, isLoading: false, isInitialized: true }))
          } else {
            setState(s => ({ ...s, products: [], isLoading: false, isInitialized: true }))
          }
          return
        }
        
        if (!data || data.length === 0) {
          if (!hasInitialized) {
            await supabase.from('products').insert(
              DEFAULT_PRODUCTS.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                image_url: p.imageUrl,
                short_description: p.shortDescription,
                description: p.description,
                price_ars: p.priceArs,
                tags: p.tags,
              }))
            )
            setState(s => ({ ...s, products: DEFAULT_PRODUCTS, isLoading: false, isInitialized: true }))
          } else {
            setState(s => ({ ...s, products: [], isLoading: false, isInitialized: true }))
          }
          return
        }

        const mappedProducts: Product[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          imageUrl: item.image_url,
          shortDescription: item.short_description,
          description: item.description,
          priceArs: item.price_ars,
          tags: item.tags,
        }))
        setState(s => ({ ...s, products: mappedProducts, isLoading: false, isInitialized: true }))
      } catch (error) {
        console.error('Error in fetchProducts with Supabase:', error)
        const stored = loadStoredProducts()
        if (stored) {
          setState(s => ({ ...s, products: stored, isLoading: false, isInitialized: true }))
        } else if (!hasInitialized) {
          saveStoredProducts(DEFAULT_PRODUCTS)
          setState(s => ({ ...s, products: DEFAULT_PRODUCTS, isLoading: false, isInitialized: true }))
        } else {
          setState(s => ({ ...s, products: [], isLoading: false, isInitialized: true }))
        }
      }
    } else {
      const stored = loadStoredProducts()
      if (stored) {
        setState(s => ({ ...s, products: stored, isLoading: false, isInitialized: true }))
      } else if (!hasInitialized) {
        saveStoredProducts(DEFAULT_PRODUCTS)
        setState(s => ({ ...s, products: DEFAULT_PRODUCTS, isLoading: false, isInitialized: true }))
      } else {
        setState(s => ({ ...s, products: [], isLoading: false, isInitialized: true }))
      }
    }
  }

  // Add real-time subscription
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
        fetchProducts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [])

  const api = useMemo<ProductsApi>(() => {
    const byId = Object.fromEntries(state.products.map((p) => [p.id, p] as const))

    const setAll = async (products: Product[]) => {
      if (supabase) {
        await supabase.from('products').delete().neq('id', '')
        await supabase.from('products').insert(
          products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            image_url: p.imageUrl,
            short_description: p.shortDescription,
            description: p.description,
            price_ars: p.priceArs,
            tags: p.tags,
          }))
        )
      } else {
        saveStoredProducts(products)
      }
      setState(s => ({ ...s, products }))
    }

    const upsert = async (product: Product) => {
      if (supabase) {
        const { error } = await supabase.from('products').upsert({
          id: product.id,
          name: product.name,
          category: product.category,
          image_url: product.imageUrl,
          short_description: product.shortDescription,
          description: product.description,
          price_ars: product.priceArs,
          tags: product.tags,
        })
        if (error) {
          console.error('Error upserting product:', error)
          return
        }
      } else {
        const nextProducts = [...state.products]
        const exists = nextProducts.some(p => p.id === product.id)
        const updatedProducts = exists
          ? nextProducts.map(p => p.id === product.id ? product : p)
          : [product, ...nextProducts]
        saveStoredProducts(updatedProducts)
      }
      setState(s => {
        const exists = s.products.some(p => p.id === product.id)
        const next = exists
          ? s.products.map(p => p.id === product.id ? product : p)
          : [product, ...s.products]
        return { ...s, products: next }
      })
    }

    const remove = async (id: string) => {
      console.log("Removing product with id:", id)
      if (supabase) {
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) {
          console.error('Error deleting product:', error)
          return
        }
      } else {
        const nextProducts = state.products.filter(p => p.id !== id)
        console.log("Saving next products to localStorage:", nextProducts)
        saveStoredProducts(nextProducts)
        console.log("Saved! Now checking localStorage:", loadStoredProducts())
      }
      setState(s => ({
        ...s,
        products: s.products.filter(p => p.id !== id)
      }))
    }

    const resetToDefault = async () => {
      if (supabase) {
        await supabase.from('products').delete().neq('id', '')
        await supabase.from('products').insert(
          DEFAULT_PRODUCTS.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            image_url: p.imageUrl,
            short_description: p.shortDescription,
            description: p.description,
            price_ars: p.priceArs,
            tags: p.tags,
          }))
        )
      } else {
        saveStoredProducts(DEFAULT_PRODUCTS)
      }
      setState(s => ({ ...s, products: DEFAULT_PRODUCTS }))
    }

    const exportJson = () => JSON.stringify(state.products, null, 2)

    const importJson = (jsonText: string): { ok: true } | { ok: false; error: string } => {
      let parsed: unknown
      try {
        parsed = JSON.parse(jsonText)
      } catch {
        return { ok: false, error: 'JSON inválido.' }
      }
      const sanitized = sanitizeProducts(parsed)
      if (!sanitized) return { ok: false, error: 'El JSON debe ser una lista de productos.' }
      if (sanitized.length === 0) return { ok: false, error: 'No se encontraron productos válidos.' }
      
      setAll(sanitized)
      return { ok: true }
    }

    return {
      products: state.products,
      byId,
      isLoading: state.isLoading,
      setAll,
      upsert,
      remove,
      resetToDefault,
      exportJson,
      importJson,
    }
  }, [state.products, state.isLoading])

  return <ProductsContext.Provider value={api}>{children}</ProductsContext.Provider>
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider')
  return ctx
}
