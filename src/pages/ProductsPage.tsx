import { useMemo, useState } from 'react'
import type { ProductCategory } from '../catalog'
import { ProductCard } from '../components/ProductCard'
import { useProducts } from '../products'

const DEFAULT_CATEGORIES: ProductCategory[] = ['Skincare', 'Jabones', 'Sets']

export function ProductsPage() {
  const { products } = useProducts()
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  
  // Get all unique categories from products
  const categories = useMemo(() => {
    const existingCategories = new Set<string>(DEFAULT_CATEGORIES)
    products.forEach((p) => existingCategories.add(p.category))
    return Array.from(existingCategories).sort()
  }, [products])
  
  // Build category options
  const categoryOptions: Array<{ label: string; value: ProductCategory | 'all' }> = [
    { label: 'Todos', value: 'all' },
    ...categories.map((c) => ({ label: c, value: c }))
  ]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (!q) return true
      const haystack = `${p.name} ${p.shortDescription} ${p.description} ${(p.tags ?? []).join(
        ' ',
      )}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [category, products, query])

  return (
    <div className="page">
      <div className="pageHeader">
        <h1 className="h1Small">Productos</h1>
        <p className="muted">Elegí tus favoritos y armá tu carrito.</p>
      </div>

      <div className="filters">
        <div className="segmented" role="tablist" aria-label="Categorías">
          {categoryOptions.map((c) => (
            <button
              key={c.value}
              type="button"
              className={category === c.value ? 'segmentedItem active' : 'segmentedItem'}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar (ej. jabón, vitamina C, hidratante)"
          aria-label="Buscar productos"
        />
      </div>

      <div className="grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="emptyState">No se encontraron productos con ese filtro.</div>
      ) : null}
    </div>
  )
}
