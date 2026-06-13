import { Link } from 'react-router-dom'
import { BannerCarousel } from '../components/BannerCarousel'
import { ProductCard } from '../components/ProductCard'
import { useProducts } from '../products'

export function HomePage() {
  const { products } = useProducts()
  const featured = products.slice(0, 4)

  return (
    <div className="page">
      <BannerCarousel />

      <section className="categoryBanners" aria-label="Categorías">
        <Link className="categoryBanner skincare" to="/productos">
          <div className="categoryBannerTitle">Skincare</div>
          <div className="categoryBannerText">Tratamientos para tu rutina diaria.</div>
          <div className="categoryBannerCta">Ver productos</div>
        </Link>
        <Link className="categoryBanner jabones" to="/productos">
          <div className="categoryBannerTitle">Jabones</div>
          <div className="categoryBannerText">Aromas, espuma y cuidado.</div>
          <div className="categoryBannerCta">Ver productos</div>
        </Link>
        <Link className="categoryBanner sets" to="/productos">
          <div className="categoryBannerTitle">Sets</div>
          <div className="categoryBannerText">Combos listos para regalar.</div>
          <div className="categoryBannerCta">Ver productos</div>
        </Link>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <h2 className="h2">Destacados</h2>
          <Link to="/productos" className="link">
            Ver todo
          </Link>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="sectionHeader">
          <h2 className="h2">Comprá fácil</h2>
          <Link to="/carrito" className="link">
            Ver carrito
          </Link>
        </div>
        <div className="steps">
          <div className="step">
            <div className="stepTitle">1. Elegí</div>
            <div className="stepText">Explorá productos por categoría.</div>
          </div>
          <div className="step">
            <div className="stepTitle">2. Armá tu carrito</div>
            <div className="stepText">Sumá cantidades y revisá el subtotal.</div>
          </div>
          <div className="step">
            <div className="stepTitle">3. Enviá por WhatsApp</div>
            <div className="stepText">Se genera un mensaje listo para confirmar.</div>
          </div>
        </div>
      </section>
    </div>
  )
}
