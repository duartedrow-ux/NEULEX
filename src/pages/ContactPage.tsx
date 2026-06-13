export function ContactPage() {
  return (
    <div className="page">
      <div className="pageHeader">
        <h1 className="h1Small">Contacto</h1>
        <p className="muted">Consultas, pedidos y coordinación de envíos.</p>
      </div>

      <div className="panel">
        <div className="panelRow">
          <div className="muted">WhatsApp</div>
          <div className="panelValue">Disponible desde el carrito</div>
        </div>
        <div className="panelRow">
          <div className="muted">Horarios</div>
          <div className="panelValue">Lun a Sáb</div>
        </div>
        <div className="panelRow">
          <div className="muted">Envíos</div>
          <div className="panelValue">A coordinar</div>
        </div>
        <div className="note">
          Esta versión es un MVP listo para publicar y vender. Si querés pagos online (Mercado Pago /
          tarjetas) y gestión de stock, se puede sumar después.
        </div>
      </div>
    </div>
  )
}
