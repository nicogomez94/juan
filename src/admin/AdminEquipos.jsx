import { useEffect, useRef, useState } from 'react'
import { api, uploadImages } from '../lib/api'
import ImageUploader from './ImageUploader'
import { useToast } from './ToastContext'

const EMPTY = { nombre: '', descripcion: '', imagen: '', orden: 0, activo: true }

export default function AdminEquipos() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)
  const [pendingImage, setPendingImage] = useState([])
  const editorRef = useRef(null)

  function load() {
    setLoading(true)
    api.get('/api/equipos/all').then(d => { setItems(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  function openCreate() {
    setForm(EMPTY)
    setPendingImage([])
    setModal('create')
  }

  function openEdit(item) {
    setForm({ ...item, imagen: item.imagen || '' })
    setPendingImage([])
    setModal(item)
  }

  function closeModal() {
    setModal(null)
    setPendingImage([])
  }

  function handle(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function execCmd(cmd, val = null) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const isCreate = modal === 'create'
    try {
      let imagen = form.imagen
      if (pendingImage.length > 0) {
        const urls = await uploadImages(pendingImage)
        imagen = urls[0] || imagen
      }
      const body = {
        ...form,
        descripcion: editorRef.current ? editorRef.current.innerHTML : form.descripcion,
        imagen,
        orden: Number(form.orden),
      }
      if (isCreate) await api.post('/api/equipos', body)
      else await api.put(`/api/equipos/${modal.id}`, body)
      setAlert(null)
      toast.success(isCreate ? 'Equipo creado.' : 'Equipo actualizado.')
      closeModal(); load()
    } catch (err) {
      const msg = err.message || 'Error al guardar'
      setAlert({ type: 'error', msg })
      toast.error(msg)
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este equipo?')) return
    try {
      await api.delete(`/api/equipos/${id}`)
      setAlert(null)
      toast.success('Equipo eliminado.')
      load()
    } catch (err) {
      const msg = err.message || 'No se pudo eliminar el equipo'
      setAlert({ type: 'error', msg })
      toast.error(msg)
    }
  }

  async function toggleActivo(item) {
    try {
      await api.put(`/api/equipos/${item.id}`, { ...item, activo: !item.activo })
      setAlert(null)
      toast.success(!item.activo ? 'Equipo activado.' : 'Equipo desactivado.')
      load()
    }
    catch (err) {
      const msg = err.message || 'No se pudo actualizar el equipo'
      setAlert({ type: 'error', msg })
      toast.error(msg)
    }
  }

  return (
    <div>
      <div className="admin-section-header">
        <h2>Equipos Médicos</h2>
        <button className="btn btn--primary" onClick={openCreate}><i className="fas fa-plus" /> Nuevo equipo</button>
      </div>

      {alert && (
        <div className={`admin-alert admin-alert--${alert.type}`} style={{ marginBottom: '1rem' }}>
          <i className={`fas fa-${alert.type === 'success' ? 'circle-check' : 'circle-exclamation'}`} />
          {alert.msg}
          <button onClick={() => setAlert(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>×</button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Orden</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray)' }}>Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray)' }}>No hay equipos</td></tr>
            ) : items.map(item => (
              <tr key={item.id}>
                <td>
                  {item.imagen
                    ? <img src={item.imagen} alt="" className="admin-table__thumb" />
                    : <span className="admin-table__empty-image">Sin imagen</span>}
                </td>
                <td><strong style={{ color: 'var(--color-primary)' }}>{item.nombre}</strong></td>
                <td
                  className="admin-table__rich-preview"
                  dangerouslySetInnerHTML={{ __html: item.descripcion }}
                />
                <td>{item.orden}</td>
                <td>
                  <span className={`admin-table__badge ${item.activo ? 'admin-table__badge--green' : 'admin-table__badge--gray'}`}>
                    {item.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-btn-icon admin-btn-icon--toggle" title={item.activo ? 'Desactivar' : 'Activar'} onClick={() => toggleActivo(item)}>
                      <i className={`fas ${item.activo ? 'fa-eye-slash' : 'fa-eye'}`} />
                    </button>
                    <button className="admin-btn-icon admin-btn-icon--edit" title="Editar" onClick={() => openEdit(item)}>
                      <i className="fas fa-pen" />
                    </button>
                    <button className="admin-btn-icon admin-btn-icon--delete" title="Eliminar" onClick={() => remove(item.id)}>
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="admin-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="admin-modal admin-modal--equipo">
            <div className="admin-modal__header">
              <h3>{modal === 'create' ? 'Nuevo equipo' : 'Editar equipo'}</h3>
              <button className="admin-modal__close" onClick={closeModal}><i className="fas fa-xmark" /></button>
            </div>
            <form onSubmit={save}>
              <div className="admin-modal__body">
                <div className="admin-form__group"><label>Nombre *</label><input name="nombre" value={form.nombre} onChange={handle} required /></div>
                <div className="admin-form__group">
                  <label>Descripción</label>
                  <div className="admin-editor">
                    <div className="admin-editor__toolbar">
                      <button type="button" className="admin-editor__btn" title="Negrita" onClick={() => execCmd('bold')}><i className="fas fa-bold" /></button>
                      <button type="button" className="admin-editor__btn" title="Cursiva" onClick={() => execCmd('italic')}><i className="fas fa-italic" /></button>
                      <button type="button" className="admin-editor__btn" title="Subrayado" onClick={() => execCmd('underline')}><i className="fas fa-underline" /></button>
                      <div className="admin-editor__sep" />
                      <button type="button" className="admin-editor__btn" title="Título H2" onClick={() => execCmd('formatBlock', 'H2')}><b>H2</b></button>
                      <button type="button" className="admin-editor__btn" title="Párrafo" onClick={() => execCmd('formatBlock', 'P')}>¶</button>
                      <div className="admin-editor__sep" />
                      <button type="button" className="admin-editor__btn" title="Lista con viñetas" onClick={() => execCmd('insertUnorderedList')}><i className="fas fa-list-ul" /></button>
                      <button type="button" className="admin-editor__btn" title="Lista numerada" onClick={() => execCmd('insertOrderedList')}><i className="fas fa-list-ol" /></button>
                      <div className="admin-editor__sep" />
                      <button type="button" className="admin-editor__btn" title="Alinear izquierda" onClick={() => execCmd('justifyLeft')}><i className="fas fa-align-left" /></button>
                      <button type="button" className="admin-editor__btn" title="Centrar" onClick={() => execCmd('justifyCenter')}><i className="fas fa-align-center" /></button>
                      <button type="button" className="admin-editor__btn" title="Quitar formato" onClick={() => execCmd('removeFormat')}><i className="fas fa-eraser" /></button>
                    </div>
                    <div
                      key={modal === 'create' ? 'create' : modal.id}
                      ref={editorRef}
                      className="admin-editor__content admin-editor__content--compact"
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: form.descripcion }}
                    />
                  </div>
                </div>
                <div className="admin-form__group">
                  <label>Imagen</label>
                  <ImageUploader
                    existingUrl={form.imagen}
                    onExistingRemove={() => setForm(f => ({ ...f, imagen: '' }))}
                    onFilesChange={setPendingImage}
                    maxFiles={1}
                    helperText="JPG, PNG o WebP · máximo 5 MB"
                  />
                </div>
                <div className="admin-form__group admin-form__group--order"><label>Orden</label><input type="number" name="orden" value={form.orden} onChange={handle} min={0} /></div>
                <label className="admin-toggle">
                  <input type="checkbox" name="activo" checked={form.activo} onChange={handle} />
                  <span className="admin-toggle__track" />
                  Visible en el sitio
                </label>
              </div>
              <div className="admin-modal__footer">
                <button type="button" className="btn btn--outline" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
