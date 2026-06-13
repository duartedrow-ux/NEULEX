import { useMemo, useState } from 'react'
import type { Product, ProductCategory } from '../catalog'
import { formatArs } from '../catalog'
import { useProducts } from '../products'
import { useAuth } from '../auth'

type DraftProduct = {
  id: string
  name: string
  category: ProductCategory
  imageUrl: string
  shortDescription: string
  description: string
  priceArs: string
  tags: string
}

const DEFAULT_CATEGORIES: ProductCategory[] = ['Skincare', 'Jabones', 'Sets']

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueId(base: string, used: Set<string>, keepId?: string) {
  if (!base) base = 'producto'
  if (!used.has(base) || (keepId && base === keepId)) return base
  let i = 2
  while (used.has(`${base}-${i}`) && `${base}-${i}` !== keepId) i++
  return `${base}-${i}`
}

function toDraft(p?: Product): DraftProduct {
  return {
    id: p?.id ?? '',
    name: p?.name ?? '',
    category: p?.category ?? 'Skincare',
    imageUrl: p?.imageUrl ?? '',
    shortDescription: p?.shortDescription ?? '',
    description: p?.description ?? '',
    priceArs: p ? String(p.priceArs) : '',
    tags: p?.tags?.join(', ') ?? '',
  }
}

function toProduct(d: DraftProduct): { ok: true; product: Product } | { ok: false; error: string } {
  const name = d.name.trim()
  const category = d.category.trim()
  const imageUrl = d.imageUrl.trim()
  const shortDescription = d.shortDescription.trim()
  const description = d.description.trim()
  const price = Number(d.priceArs)

  if (!name) return { ok: false, error: 'Falta el nombre.' }
  if (!category) return { ok: false, error: 'Falta la categoría.' }
  if (!shortDescription) return { ok: false, error: 'Falta la descripción corta.' }
  if (!description) return { ok: false, error: 'Falta la descripción larga.' }
  if (!Number.isFinite(price) || price < 0) return { ok: false, error: 'El precio debe ser un número.' }

  const tags = d.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  return {
    ok: true,
    product: {
      id: d.id.trim(),
      name,
      category,
      imageUrl: imageUrl || undefined,
      shortDescription,
      description,
      priceArs: Math.round(price),
      tags: tags.length ? tags : undefined,
    },
  }
}

export function AdminPage() {
  const auth = useAuth()
  const productsApi = useProducts()
  const usedIds = useMemo(() => new Set(productsApi.products.map((p) => p.id)), [productsApi.products])
  
  // Get all unique categories from products + default categories
  const categories = useMemo(() => {
    const existingCategories = new Set<string>(DEFAULT_CATEGORIES)
    productsApi.products.forEach((p) => existingCategories.add(p.category))
    return Array.from(existingCategories).sort()
  }, [productsApi.products])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftProduct>(() => toDraft())
  const [status, setStatus] = useState<string | null>(null)
  
  // Login state
  const [passwordInput, setPasswordInput] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  
  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [newPasswordInput, setNewPasswordInput] = useState('')
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  
  function handleLogin() {
    setLoginError(null)
    const success = auth.login(passwordInput)
    if (!success) {
      setLoginError('Contraseña incorrecta.')
    }
  }
  
  function handleLogout() {
    auth.logout()
  }
  
  function handleChangePassword() {
    setChangePasswordError(null)
    if (!newPasswordInput.trim()) {
      setChangePasswordError('La nueva contraseña no puede estar vacía.')
      return
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError('Las contraseñas no coinciden.')
      return
    }
    auth.setNewPassword(newPasswordInput)
    setShowChangePassword(false)
    setNewPasswordInput('')
    setConfirmPasswordInput('')
    setStatus('Contraseña actualizada.')
  }

  const editingProduct = editingId ? productsApi.byId[editingId] : undefined

  async function onPickImage(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus('El archivo no es una imagen.')
      return
    }
    if (file.size > 2_500_000) {
      setStatus('La imagen es muy pesada. Usá una de menos de 2.5MB.')
      return
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(file)
    })

    setDraft((d) => ({ ...d, imageUrl: dataUrl }))
    setStatus('Imagen cargada.')
  }

  function startNew() {
    setEditingId(null)
    setDraft(toDraft())
    setStatus(null)
  }

  function startEdit(id: string) {
    const p = productsApi.byId[id]
    if (!p) return
    setEditingId(id)
    setDraft(toDraft(p))
    setStatus(null)
  }

  async function onSave() {
    const baseId = slugify(draft.id.trim() || draft.name.trim())
    const finalId = uniqueId(baseId, usedIds, editingId ?? undefined)
    const normalized: DraftProduct = { ...draft, id: finalId }
    const parsed = toProduct(normalized)
    if (!parsed.ok) {
      setStatus(parsed.error)
      return
    }

    await productsApi.upsert(parsed.product)
    setEditingId(parsed.product.id)
    setDraft(toDraft(parsed.product))
    setStatus('Guardado.')
  }

  async function onDelete(id: string) {
    await productsApi.remove(id)
    if (editingId === id) startNew()
    setStatus('Eliminado.')
  }

  async function onImportFile(file: File | null) {
    if (!file) return
    const text = await file.text()
    const result = productsApi.importJson(text)
    if (result.ok) setStatus('Importación OK.')
    else setStatus(result.error)
    startNew()
  }

  function onExport() {
    const json = productsApi.exportJson()
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'neulex-productos.json'
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Exportado.')
  }

  async function onReset() {
    await productsApi.resetToDefault()
    startNew()
    setStatus('Catálogo restaurado.')
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="page">
        <div className="pageHeader">
          <h1 className="h1Small">Admin</h1>
          <p className="muted">
            {auth.hasPasswordSet 
              ? 'Ingresá tu contraseña para acceder.' 
              : 'Establecé una contraseña para empezar.'}
          </p>
        </div>
        <div className="panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="adminField">
            <div className="adminLabel">Contraseña</div>
            <div className="passwordInputGroup">
              <input
                className="input adminInput"
                type={showLoginPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder={auth.hasPasswordSet ? 'Ingresá tu contraseña' : 'Elegí una contraseña'}
              />
              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                aria-label={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showLoginPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {loginError ? <div className="adminStatus" style={{ color: 'var(--color-error)' }}>{loginError}</div> : null}
          <div className="adminFormActions">
            <button type="button" className="button buttonPrimary buttonFull" onClick={handleLogin}>
              {auth.hasPasswordSet ? 'Ingresar' : 'Establecer contraseña y acceder'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="pageHeader">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="h1Small">Admin</h1>
            <p className="muted">Cargá y editá productos. Se guardan en este dispositivo.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="button buttonGhost buttonSmall" onClick={() => setShowChangePassword(!showChangePassword)}>
              {showChangePassword ? 'Cancelar' : 'Cambiar contraseña'}
            </button>
            <button type="button" className="button buttonGhost buttonSmall" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {showChangePassword ? (
        <div className="panel" style={{ marginBottom: '1rem' }}>
          <div className="adminField">
            <div className="adminLabel">Nueva contraseña</div>
            <div className="passwordInputGroup">
              <input
                className="input adminInput"
                type={showNewPassword ? 'text' : 'password'}
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Nueva contraseña"
              />
              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showNewPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="adminField">
            <div className="adminLabel">Confirmar nueva contraseña</div>
            <div className="passwordInputGroup">
              <input
                className="input adminInput"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Confirmar nueva contraseña"
                onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
              />
              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {changePasswordError ? <div className="adminStatus" style={{ color: 'var(--color-error)' }}>{changePasswordError}</div> : null}
          <div className="adminFormActions">
            <button type="button" className="button buttonPrimary" onClick={handleChangePassword}>
              Guardar nueva contraseña
            </button>
          </div>
        </div>
      ) : null}

      <div className="adminActions">
        <button type="button" className="button buttonPrimary" onClick={startNew}>
          Nuevo producto
        </button>
        <button type="button" className="button buttonGhost" onClick={onExport}>
          Exportar JSON
        </button>
        <label className="button buttonGhost adminFileLabel">
          Importar JSON
          <input
            className="adminFile"
            type="file"
            accept="application/json"
            onChange={(e) => void onImportFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <button type="button" className="button buttonGhost" onClick={onReset}>
          Restaurar catálogo
        </button>
        <div className="adminMeta muted">{productsApi.products.length} productos</div>
      </div>

      {status ? <div className="adminStatus">{status}</div> : null}

      <div className="adminGrid">
        <section className="panel adminList">
          <div className="adminListHeader">
            <div className="adminListTitle">Productos</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="muted">Click para editar</div>
              <button type="button" className="button buttonPrimary buttonSmall" onClick={startNew}>
                + Nuevo
              </button>
            </div>
          </div>

          <div className="adminItems">
            {productsApi.products.map((p) => (
              <button
                key={p.id}
                type="button"
                className={editingId === p.id ? 'adminItem active' : 'adminItem'}
                onClick={() => startEdit(p.id)}
              >
                <div className={`adminItemMedia media-${p.category.toLowerCase()}`}>
                  {p.imageUrl ? <img className="adminItemImg" src={p.imageUrl} alt={p.name} /> : null}
                </div>
                <div className="adminItemMain">
                  <div className="adminItemTop">
                    <div className="adminItemName">{p.name}</div>
                    <div className="adminItemPrice">{formatArs(p.priceArs)}</div>
                  </div>
                  <div className="adminItemSub">
                    <span className="adminItemCat">{p.category}</span>
                    <span className="adminItemId">{p.id}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="panel adminForm">
          <div className="adminFormHeader">
            <div className="adminFormTitle">{editingProduct ? 'Editar producto' : 'Nuevo producto'}</div>
            {editingProduct ? (
              <button
                type="button"
                className="button buttonGhost buttonSmall"
                onClick={() => onDelete(editingProduct.id)}
              >
                Eliminar
              </button>
            ) : null}
          </div>

          <div className="adminField">
            <div className="adminLabel">Nombre</div>
            <input
              className="input adminInput"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Ej: Jabón de Lavanda"
            />
          </div>

          <div className="adminField">
            <div className="adminLabel">Imagen</div>
            <div className={`adminImagePreview media-${draft.category.toLowerCase()}`}>
              {draft.imageUrl ? (
                <img className="adminImagePreviewImg" src={draft.imageUrl} alt={draft.name || 'Imagen'} />
              ) : null}
            </div>
            <div className="adminImageRow">
              <input
                className="input adminInput"
                value={draft.imageUrl}
                onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                placeholder="Pegá una URL (https://...) o dejalo vacío"
              />
              <label className="button buttonGhost adminFileLabel">
                Subir imagen
                <input
                  className="adminFile"
                  type="file"
                  accept="image/*"
                  onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <div className="note">
              Podés pegar una URL o subir una imagen (queda guardada en este dispositivo).
            </div>
          </div>

          <div className="adminRow2">
            <div className="adminField">
              <div className="adminLabel">Categoría</div>
              <input
                className="input adminInput"
                list="categoryList"
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                placeholder="Ej: Skincare, Jabones"
              />
              <datalist id="categoryList">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="adminField">
              <div className="adminLabel">Precio (ARS)</div>
              <input
                className="input adminInput"
                value={draft.priceArs}
                onChange={(e) => setDraft((d) => ({ ...d, priceArs: e.target.value }))}
                inputMode="numeric"
                placeholder="Ej: 12900"
              />
            </div>
          </div>

          <div className="adminField">
            <div className="adminLabel">Descripción corta</div>
            <input
              className="input adminInput"
              value={draft.shortDescription}
              onChange={(e) => setDraft((d) => ({ ...d, shortDescription: e.target.value }))}
              placeholder="Ej: Suave y nutritivo."
            />
          </div>

          <div className="adminField">
            <div className="adminLabel">Descripción larga</div>
            <textarea
              className="input adminTextarea"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Detalles, modo de uso, recomendaciones..."
            />
          </div>

          <div className="adminField">
            <div className="adminLabel">Tags (separados por coma)</div>
            <input
              className="input adminInput"
              value={draft.tags}
              onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
              placeholder="Ej: hidratación, brillo, regalo"
            />
          </div>

          <div className="adminField">
            <div className="adminLabel">ID (auto)</div>
            <input
              className="input adminInput"
              value={draft.id}
              onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value }))}
              placeholder="Se genera automáticamente"
            />
            <div className="note">Si lo dejás vacío, se genera desde el nombre.</div>
          </div>

          <div className="adminFormActions">
            <button type="button" className="button buttonPrimary buttonFull" onClick={onSave}>
              Guardar
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
