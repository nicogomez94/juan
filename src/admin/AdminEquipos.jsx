import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useToast } from './ToastContext'

const EMPTY = { nombre: '', descripcion: '', icono: 'fa-stethoscope', orden: 0, activo: true }

export default function AdminEquipos() {
  const toast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  function load() {
    setLoading(true)
    api.get('/api/equipos/all').then(d => { setItems(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(item) { setForm({ ...item }); setModal(item) }
  function closeModal() { setModal(null) }

  function handle(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const body = { ...form, orden: Number(form.orden) }
    const isCreate = modal === 'create'
    try {
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
              <th>Ícono</th>
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
                <td><i className={`fas ${item.icono} admin-table__icon`} /></td>
                <td><strong style={{ color: 'var(--color-primary)' }}>{item.nombre}</strong></td>
                <td style={{ maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.descripcion}</td>
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
          <div className="admin-modal">
            <div className="admin-modal__header">
              <h3>{modal === 'create' ? 'Nuevo equipo' : 'Editar equipo'}</h3>
              <button className="admin-modal__close" onClick={closeModal}><i className="fas fa-xmark" /></button>
            </div>
            <form onSubmit={save}>
              <div className="admin-modal__body">
                <div className="admin-form__group"><label>Nombre *</label><input name="nombre" value={form.nombre} onChange={handle} required /></div>
                <div className="admin-form__group"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handle} rows={3} /></div>
                <div className="admin-form__row">
                  <div className="admin-form__group">
                    <label>Ícono (Font Awesome)</label>
                    <input name="icono" value={form.icono} onChange={handle} placeholder="fa-stethoscope" />
                    <span className="admin-form__hint">Ej: fa-stethoscope, fa-heart-pulse</span>
                  </div>
                  <div className="admin-form__group"><label>Orden</label><input type="number" name="orden" value={form.orden} onChange={handle} min={0} /></div>
                </div>
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
