import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../cart'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? 'navLink navLinkActive' : 'navLink')}
    >
      {label}
    </NavLink>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const cart = useCart()

  return (
    <div className="appShell">
      <header className="header">
        <div className="headerInner">
          <Link to="/" className="brand">
            <span className="brandMark" aria-hidden="true">
              N
            </span>
            <span className="brandName">Neulex</span>
          </Link>

          <nav className="nav">
            <NavItem to="/" label="Inicio" />
            <NavItem to="/productos" label="Productos" />
            <NavItem to="/contacto" label="Contacto" />
          </nav>

          <Link to="/carrito" className="cartButton" aria-label="Abrir carrito">
            <span className="cartButtonLabel">Carrito</span>
            <span className="cartBadge" aria-label={`Productos en carrito: ${cart.totalItems}`}>
              {cart.totalItems}
            </span>
          </Link>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <div className="footerInner">
          <div className="footerLeft">
            <div className="footerBrand">Neulex</div>
            <div className="footerText">Skincare, jabones y cosmética para tu rutina.</div>
          </div>
          <Link to="/admin" className="footerAdmin">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  )
}
