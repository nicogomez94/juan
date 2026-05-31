import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const LABELS = {
  email: 'Email de contacto',
  whatsapp: 'WhatsApp (número completo, ej: 5491155667788)',
  instagram: 'Instagram (usuario, sin @)',
  facebook: 'Facebook (usuario o slug)',
  direccion: 'Dirección',
  horario: 'Horario de atención',
}

export default function AdminContacto() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    api.get('/api/contact-info').then(r => {
      setItems(r.items || [])
      const map = {}
      ;(r.items || []).forEach(i => { map[i.key] = i.value })
      setForm(map)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function handle(key, value) { setForm(f => ({ ...f, [key]: value })) }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const body = Object.entries(form).map(([key, value]) => {
      const item = items.find(i => i.key === key)
      return { key, value, label: item?.label || LABELS[key] || key }
    })
    try {
      await api.put('/api/contact-info', body)
      setAlert({ type: 'success', msg: 'Datos de contacto actualizados.' })
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Error al guardar' })
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="admin-section-header">
        <h2>Datos de contacto</h2>
      </div>

      {alert && (
        <div className={`admin-alert admin-alert--${alert.type}`} style={{ marginBottom: '1.25rem' }}>
          <i className={`fas fa-${alert.type === 'success' ? 'circle-check' : 'circle-exclamation'}`} />
          {alert.msg}
          <button onClick={() => setAlert(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>×</button>
        </div>
      )}

      {loading ? (
        <div>{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 8, marginBottom: 12 }} />)}</div>
      ) : (
        <form onSubmit={save}>
          <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.75rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
              Estos datos se usan en el footer, el botón de WhatsApp, la página de contacto y otros lugares del sitio.
            </p>
            {Object.entries(LABELS).map(([key, label]) => (
              <div key={key} className="admin-form__group">
                <label>{label}</label>
                <input
                  value={form[key] || ''}
                  onChange={e => handle(key, e.target.value)}
                  placeholder={label}
                />
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando...' : <><i className="fas fa-floppy-disk" /> Guardar cambios</>}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
