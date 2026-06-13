import { Link } from 'react-router-dom'
import type { Product } from '../catalog'
import { formatArs } from '../catalog'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      <div className={`cardMedia media-${product.category.toLowerCase()}`}>
        {product.imageUrl ? (
          <img className="cardImg" src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : null}
      </div>
      <div className="cardTop">
        <div className="cardCategory">{product.category}</div>
        <div className="cardTitle">{product.name}</div>
        <div className="cardDesc">{product.shortDescription}</div>
      </div>
      <div className="cardBottom">
        <div className="cardPrice">{formatArs(product.priceArs)}</div>
        <Link to={`/productos/${product.id}`} className="button buttonPrimary">
          Ver
        </Link>
      </div>
    </article>
  )
}
