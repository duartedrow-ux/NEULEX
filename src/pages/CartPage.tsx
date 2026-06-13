import { Link } from 'react-router-dom'
import { formatArs } from '../catalog'
import { useCart } from '../cart'
import { useProducts } from '../products'

const WHATSAPP_PHONE_E164 = '5490000000000'

function whatsappUrl(text: string) {
  const encoded = encodeURIComponent(text)
  return `https://wa.me/${WHATSAPP_PHONE_E164}?text=${encoded}`
}

export function CartPage() {
  const cart = useCart()
  const { byId } = useProducts()

  const subtotalArs = cart.lines.reduce((acc, line) => {
    const p = byId[line.productId]
    if (!p) return acc
    return acc + p.priceArs * line.quantity
  }, 0)

  const linesText = cart.lines
    .map((line) => {
      const p = byId[line.productId]
      if (!p) return `• ${line.quantity} x (producto no disponible)`
      return `• ${line.quantity} x ${p.name} (${p.priceArs} ARS)`
    })
    .join('\n')

  const whatsappText = [
    'Hola Neulex, quiero hacer un pedido:',
    '',
    linesText || '— (sin productos)',
    '',
    `Subtotal: ${subtotalArs} ARS`,
    '',
    'Nombre:',
    'Dirección / Envío:',
    'Método de pago:',
  ].join('\n')

  return (
    <div className="page">
      <div className="pageHeader">
        <h1 className="h1Small">Carrito</h1>
        <p className="muted">Tu pedido se envía por WhatsApp como un mensaje.</p>
      </div>

      {cart.lines.length === 0 ? (
        <div className="emptyState">
          <div>Tu carrito está vacío.</div>
          <Link className="button buttonPrimary" to="/productos">
            Ir a productos
          </Link>
        </div>
      ) : (
        <div className="cart">
          <div className="cartLines">
            {cart.lines.map((line) => {
              const p = byId[line.productId]
              return (
                <div key={line.productId} className="cartLine">
                  <div className="cartLineMain">
                    <div className="cartLineTitle">{p ? p.name : 'Producto no disponible'}</div>
                    <div className="muted">{p ? formatArs(p.priceArs) : '—'}</div>
                  </div>
                  <div className="cartLineActions">
                    <div className="qty">
                      <button
                        type="button"
                        className="button buttonSmall"
                        onClick={() => cart.setQuantity(line.productId, Math.max(1, line.quantity - 1))}
                      >
                        -
                      </button>
                      <input
                        className="input qtyInput"
                        inputMode="numeric"
                        value={line.quantity}
                        onChange={(e) => cart.setQuantity(line.productId, Number(e.target.value) || 1)}
                        aria-label={`Cantidad de ${p ? p.name : 'producto'}`}
                      />
                      <button
                        type="button"
                        className="button buttonSmall"
                        onClick={() => cart.setQuantity(line.productId, Math.min(99, line.quantity + 1))}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="button buttonGhost buttonSmall"
                      onClick={() => cart.removeFromCart(line.productId)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="cartSummary">
            <div className="panel">
              <div className="panelRow">
                <div className="muted">Subtotal</div>
                <div className="panelValue">{formatArs(subtotalArs)}</div>
              </div>
              <div className="panelRow">
                <div className="muted">Productos</div>
                <div className="panelValue">{cart.totalItems}</div>
              </div>

              <a
                className="button buttonPrimary buttonFull"
                href={whatsappUrl(whatsappText)}
                target="_blank"
                rel="noreferrer"
              >
                Enviar pedido por WhatsApp
              </a>

              <button
                type="button"
                className="button buttonGhost buttonFull"
                onClick={() => cart.clearCart()}
              >
                Vaciar carrito
              </button>

              <div className="note">
                Si el número de WhatsApp no es el correcto, cambialo en el código de la app.
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
