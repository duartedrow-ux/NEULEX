import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="emptyState">
        <div>Página no encontrada.</div>
        <Link className="button buttonPrimary" to="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
