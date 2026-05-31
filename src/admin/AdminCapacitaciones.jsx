import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const EMPTY = { titulo: '', duracion: '', badge: '', badgeColor: 'navy', descripcion: '', temas: '', icono: 'fa-book', publico: '', modalidad: 'Virtual', activo: true }

export default function AdminCapacitaciones() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | {item}
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  function load() {
    setLoading(true)
    api.get('/api/capacitaciones/all').then(d => { setItems(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  function openCreate() { setForm(EMPTY); setModal('create') }
  function openEdit(item) {
    setForm({ ...item, temas: Array.isArray(item.temas) ? item.temas.join('\n') : '' })
    setModal(item)
  }
  function closeModal() { setModal(null) }

  function handle(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const body = { ...form, temas: form.temas.split('\n').map(t => t.trim()).filter(Boolean) }
    try {
      if (modal === 'create') await api.post('/api/capacitaciones', body)
      else await api.put(`/api/capacitaciones/${modal.id}`, body)
      setAlert({ type: 'success', msg: modal === 'create' ? 'Capacitación creada.' : 'Capacitación actualizada.' })
      closeModal(); load()
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Error al guardar' })
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar esta capacitación?')) return
    try { await api.delete(`/api/capacitaciones/${id}`); load() } catch (err) { setAlert({ type: 'error', msg: err.message }) }
  }

  async function toggleActivo(item) {
    try { await api.put(`/api/capacitaciones/${item.id}`, { ...item, temas: item.temas || [], activo: !item.activo }); load() }
    catch (err) { setAlert({ type: 'error', msg: err.message }) }
  }

  return (
    <div>
      <div className="admin-section-header">
        <h2>Capacitaciones</h2>
        <button className="btn btn--primary" onClick={openCreate}><i className="fas fa-plus" /> Nueva capacitación</button>
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
              <th>Título</th>
              <th>Badge</th>
              <th>Duración</th>
              <th>Modalidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray)' }}>Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray)' }}>No hay capacitaciones</td></tr>
            ) : items.map(item => (
              <tr key={item.id}>
                <td><strong style={{ color: 'var(--color-primary)' }}>{item.titulo}</strong></td>
                <td><span className={`admin-table__badge admin-table__badge--${item.badgeColor}`}>{item.badge}</span></td>
                <td>{item.duracion}</td>
                <td>{item.modalidad}</td>
                <td>
                  <span className={`admin-table__badge ${item.activo ? 'admin-table__badge--green' : 'admin-table__badge--gray'}`}>
                    {item.activo ? 'Activa' : 'Inactiva'}
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
              <h3>{modal === 'create' ? 'Nueva capacitación' : 'Editar capacitación'}</h3>
              <button className="admin-modal__close" onClick={closeModal}><i className="fas fa-xmark" /></button>
            </div>
            <form onSubmit={save}>
              <div className="admin-modal__body">
                <div className="admin-form__group"><label>Título *</label><input name="titulo" value={form.titulo} onChange={handle} required /></div>
                <div className="admin-form__row">
                  <div className="admin-form__group"><label>Duración</label><input name="duracion" value={form.duracion} onChange={handle} placeholder="8 horas" /></div>
                  <div className="admin-form__group"><label>Modalidad</label>
                    <select name="modalidad" value={form.modalidad} onChange={handle}>
                      <option>Virtual</option><option>Presencial</option><option>Híbrida</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__group"><label>Badge</label><input name="badge" value={form.badge} onChange={handle} placeholder="Nuevo" /></div>
                  <div className="admin-form__group"><label>Color badge</label>
                    <select name="badgeColor" value={form.badgeColor} onChange={handle}>
                      <option value="navy">Navy</option><option value="teal">Teal</option>
                    </select>
                  </div>
                </div>
                <div className="admin-form__row">
                  <div className="admin-form__group"><label>Ícono (Font Awesome)</label><input name="icono" value={form.icono} onChange={handle} placeholder="fa-book" /></div>
                  <div className="admin-form__group"><label>Público</label><input name="publico" value={form.publico} onChange={handle} placeholder="Profesionales de salud" /></div>
                </div>
                <div className="admin-form__group"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handle} rows={3} /></div>
                <div className="admin-form__group">
                  <label>Temas (uno por línea)</label>
                  <textarea name="temas" value={form.temas} onChange={handle} rows={4} placeholder="Introducción al sistema&#10;Módulo 2..." />
                  <span className="admin-form__hint">Cada línea se convierte en un ítem de la lista</span>
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
