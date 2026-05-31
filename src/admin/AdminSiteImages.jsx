import { useEffect, useMemo, useState } from 'react'
import { api, uploadImages } from '../lib/api'
import { SITE_IMAGE_DEFAULTS } from '../lib/siteImages'
import ImageUploader from './ImageUploader'
import { useToast } from './ToastContext'

const fallbackItems = SITE_IMAGE_DEFAULTS.map(image => ({
  ...image,
  url: image.defaultUrl,
  customUrl: null,
}))

export default function AdminSiteImages() {
  const toast = useToast()
  const [items, setItems] = useState(fallbackItems)
  const [pending, setPending] = useState({})
  const [savingKey, setSavingKey] = useState('')
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  function load() {
    setLoading(true)
    api.get('/api/site-images/all')
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(load, [])

  const grouped = useMemo(() => items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {}), [items])

  function updateItem(key, changes) {
    setItems(prev => prev.map(item => item.key === key ? { ...item, ...changes } : item))
  }

  async function save(item) {
    setSavingKey(item.key)
    setAlert(null)
    try {
      let url = item.customUrl || ''
      const files = pending[item.key] || []
      if (files.length > 0) {
        const urls = await uploadImages(files)
        url = urls[0] || url
      }

      const saved = await api.put(`/api/site-images/${encodeURIComponent(item.key)}`, {
        url,
        alt: item.alt,
      })

      setItems(prev => prev.map(current => current.key === item.key ? saved : current))
      setPending(prev => ({ ...prev, [item.key]: [] }))
      setAlert(null)
      toast.success('Imagen actualizada.')
    } catch (err) {
      const msg = err.message || 'No se pudo guardar la imagen'
      setAlert({ type: 'error', msg })
      toast.error(msg)
    } finally {
      setSavingKey('')
    }
  }

  async function reset(item) {
    if (!confirm('¿Restaurar la imagen original de esta sección?')) return
    setSavingKey(item.key)
    setAlert(null)
    try {
      const saved = await api.put(`/api/site-images/${encodeURIComponent(item.key)}`, {
        url: '',
        alt: item.alt,
      })
      setItems(prev => prev.map(current => current.key === item.key ? saved : current))
      setPending(prev => ({ ...prev, [item.key]: [] }))
      setAlert(null)
      toast.success('Imagen restaurada.')
    } catch (err) {
      const msg = err.message || 'No se pudo restaurar la imagen'
      setAlert({ type: 'error', msg })
      toast.error(msg)
    } finally {
      setSavingKey('')
    }
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2>Imágenes del sitio</h2>
          <p className="admin-section-header__desc">Reemplazá las imágenes principales de cada sección sin alterar el formato visual del sitio.</p>
        </div>
      </div>

      {alert && (
        <div className={`admin-alert admin-alert--${alert.type}`}>
          <i className={`fas fa-${alert.type === 'success' ? 'circle-check' : 'circle-exclamation'}`} /> {alert.msg}
          <button onClick={() => setAlert(null)} className="admin-alert__close" type="button">×</button>
        </div>
      )}

      {loading ? (
        <div className="admin-image-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton admin-image-card-skeleton" />)}
        </div>
      ) : (
        Object.entries(grouped).map(([section, sectionItems]) => (
          <section key={section} className="admin-image-section">
            <h3>{section}</h3>
            <div className="admin-image-grid">
              {sectionItems.map(item => {
                const hasPending = Boolean(pending[item.key]?.length)
                const isSaving = savingKey === item.key
                return (
                  <article key={item.key} className="admin-image-card">
                    <div className="admin-image-card__header">
                      <div>
                        <h4>{item.label}</h4>
                        <span>{item.customUrl ? 'Personalizada' : 'Original'}</span>
                      </div>
                      <span className="admin-table__badge admin-table__badge--teal">{item.ratio}</span>
                    </div>

                    <div className={`admin-image-card__preview admin-image-card__preview--${item.ratio.replace(':', '-')}`}>
                      <img src={item.url} alt={item.alt} />
                    </div>

                    <div className="admin-form__group">
                      <label>Texto alternativo</label>
                      <input
                        value={item.alt}
                        maxLength={120}
                        onChange={e => updateItem(item.key, { alt: e.target.value })}
                      />
                    </div>

                    <ImageUploader
                      existingUrl={item.url}
                      canRemoveExisting={Boolean(item.customUrl)}
                      onExistingRemove={() => updateItem(item.key, { url: item.defaultUrl, customUrl: null })}
                      onFilesChange={files => setPending(prev => ({ ...prev, [item.key]: files }))}
                      maxFiles={1}
                      maxSizeMb={5}
                      helperText="JPG, PNG o WebP · max. 5 MB · se recorta automaticamente"
                    />

                    <div className="admin-image-card__actions">
                      <button className="btn btn--primary" type="button" onClick={() => save(item)} disabled={isSaving || (!hasPending && !item.alt.trim())}>
                        {isSaving ? 'Guardando...' : <><i className="fas fa-floppy-disk" /> Guardar</>}
                      </button>
                      <button className="btn btn--secondary" type="button" onClick={() => reset(item)} disabled={isSaving || !item.customUrl}>
                        <i className="fas fa-rotate-left" /> Restaurar
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
