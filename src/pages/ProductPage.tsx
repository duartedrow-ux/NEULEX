import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatArs } from '../catalog'
import { useCart } from '../cart'
import { useProducts } from '../products'

export function ProductPage() {
  const { id } = useParams()
  const cart = useCart()
  const { byId } = useProducts()
  const product = useMemo(() => (id ? byId[id] : undefined), [byId, id])
  const [qty, setQty] = useState(1)

  if (!product) {
    return (
      <div className="page">
        <div className="emptyState">
          <div>Producto no encontrado.</div>
          <Link className="link" to="/productos">
            Volver a productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="breadcrumbs">
        <Link className="link" to="/productos">
          Productos
        </Link>
        <span className="crumbSep">/</span>
        <span>{product.name}</span>
      </div>

      <div className="product">
        <div className="productMain">
          <div className={`productMedia media-${product.category.toLowerCase()}`}>
            {product.imageUrl ? (
              <img className="productImg" src={product.imageUrl} alt={product.name} />
            ) : null}
          </div>
          <div className="productCategory">{product.category}</div>
          <h1 className="h1Small">{product.name}</h1>
          <div className="productPrice">{formatArs(product.priceArs)}</div>
          <p className="productDesc">{product.description}</p>
        </div>

        <aside className="productAside">
          <div className="panel">
            <div className="panelRow">
              <div className="muted">Cantidad</div>
              <div className="qty">
                <button
                  type="button"
                  className="button buttonSmall"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <input
                  className="input qtyInput"
                  inputMode="numeric"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value) || 1)}
                  aria-label="Cantidad"
                />
                <button
                  type="button"
                  className="button buttonSmall"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              className="button buttonPrimary buttonFull"
              onClick={() => cart.addToCart(product.id, qty)}
            >
              Agregar al carrito
            </button>

            <Link to="/carrito" className="button buttonGhost buttonFull">
              Ir al carrito
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
