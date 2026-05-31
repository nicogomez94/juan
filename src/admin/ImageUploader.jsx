import { useEffect, useRef, useState } from 'react'

/**
 * ImageUploader
 * Props:
 *  - existingUrl  : string   — URL de imagen ya guardada (puede ser '' o null)
 *  - onExistingRemove : () => void — callback cuando se borra la imagen existente
 *  - onFilesChange    : (files: File[]) => void — callback cuando cambia la lista de archivos pendientes
 */
export default function ImageUploader({ existingUrl, onExistingRemove, onFilesChange, maxFiles = 10, maxSizeMb = 5, helperText = null, canRemoveExisting = true }) {
  const [items, setItems] = useState([]) // { id, file, preview }[]
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const itemsRef = useRef([])

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    return () => itemsRef.current.forEach(item => URL.revokeObjectURL(item.preview))
  }, [])

  function addFiles(fileList) {
    setError('')
    const accepted = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .filter(f => {
        if (f.size <= maxSizeMb * 1024 * 1024) return true
        setError(`La imagen no puede superar ${maxSizeMb} MB.`)
        return false
      })
      .slice(0, maxFiles)

    const newItems = accepted
      .map(file => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
      }))
    if (!newItems.length) return

    const base = maxFiles === 1 ? [] : items
    if (maxFiles === 1) items.forEach(item => URL.revokeObjectURL(item.preview))
    const nextItems = [...base, ...newItems]
    const updated = nextItems.slice(-maxFiles)
    nextItems
      .filter(item => !updated.some(kept => kept.id === item.id))
      .forEach(item => URL.revokeObjectURL(item.preview))
    setItems(updated)
    onFilesChange(updated.map(i => i.file))
    // reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeItem(id) {
    const item = items.find(i => i.id === id)
    if (item) URL.revokeObjectURL(item.preview)
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    onFilesChange(updated.map(i => i.file))
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const hasContent = existingUrl || items.length > 0

  return (
    <div className="img-uploader">
      {/* Drop zone */}
      <div
        className={`img-uploader__zone${dragging ? ' img-uploader__zone--drag' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
      >
        <i className="fas fa-cloud-arrow-up img-uploader__icon" />
        <span className="img-uploader__hint">Click o arrastrá imágenes aquí</span>
        <span className="img-uploader__sub">{helperText || `JPG, PNG, WebP · max. ${maxSizeMb} MB${maxFiles === 1 ? '' : ' · multiples a la vez'}`}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        hidden
        onChange={e => addFiles(e.target.files)}
      />

      {error && <div className="admin-alert admin-alert--error img-uploader__error"><i className="fas fa-circle-exclamation" /> {error}</div>}

      {/* Preview grid */}
      {hasContent && (
        <div className="img-uploader__grid">
          {/* Imagen ya guardada */}
          {existingUrl && (
            <div className="img-uploader__card">
              <img src={existingUrl} alt="Imagen actual" className="img-uploader__thumb" />
              <span className="img-uploader__badge img-uploader__badge--saved">
                <i className="fas fa-check" /> Guardada
              </span>
              {canRemoveExisting && (
                <button
                  type="button"
                  className="img-uploader__del"
                  title="Quitar imagen"
                  onClick={onExistingRemove}
                >
                  <i className="fas fa-xmark" />
                </button>
              )}
            </div>
          )}

          {/* Archivos nuevos (pendientes) */}
          {items.map(item => (
            <div key={item.id} className="img-uploader__card img-uploader__card--new">
              <img src={item.preview} alt={item.file.name} className="img-uploader__thumb" />
              <span className="img-uploader__badge img-uploader__badge--new">
                <i className="fas fa-clock" /> Pendiente
              </span>
              <span className="img-uploader__name">{item.file.name.length > 20 ? item.file.name.slice(0, 18) + '…' : item.file.name}</span>
              <button
                type="button"
                className="img-uploader__del"
                title="Quitar"
                onClick={() => removeItem(item.id)}
              >
                <i className="fas fa-xmark" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
