import { useEffect, useRef, useState } from 'react'
import { api, uploadImages } from '../lib/api'
import { DEBUG, debugDefaults } from '../lib/debugDefaults'
import ImageUploader from './ImageUploader'
import { useToast } from './ToastContext'

const EMPTY_POST = { titulo: '', resumen: '', imagen: '', categoria: 'General', contenido: '', publicado: false }

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminBlog() {
  const toast = useToast()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'editor'
  const [editing, setEditing] = useState(null) // null = new post
  const [form, setForm] = useState(EMPTY_POST)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [pendingModal, setPendingModal] = useState([])     // File[] para el modal
  const [pendingEditor, setPendingEditor] = useState([])   // File[] para el editor de edición
  const editorRef = useRef(null)
  const modalEditorRef = useRef(null)

  function load() {
    setLoading(true)
    api.get('/api/blog/all').then(d => { setPosts(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  function openNew() {
    const d = DEBUG ? debugDefaults.blogPost : {}
    setForm({ ...EMPTY_POST, ...d })
    setEditing(null)
    setPendingModal([])
    setConfirmClose(false)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setConfirmClose(false)
    setPendingModal([])
    setAlert(null)
  }

  function requestClose() {
    setConfirmClose(true)
  }

  function openEdit(post) {
    setForm({ titulo: post.titulo, resumen: post.resumen || '', imagen: post.imagen || '', categoria: post.categoria, contenido: post.contenido, publicado: post.publicado })
    setEditing(post)
    setPendingEditor([])
    setView('editor')
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = post.contenido }, 50)
  }

  function backToList() { setView('list'); setAlert(null) }

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
    const activeRef = modalOpen ? modalEditorRef : editorRef
    const contenido = activeRef.current?.innerHTML || form.contenido
    const pendingFiles = modalOpen ? pendingModal : pendingEditor
    setSaving(true)
    try {
      let imagen = form.imagen
      if (pendingFiles.length > 0) {
        const urls = await uploadImages(pendingFiles)
        imagen = urls[0] || imagen
      }
      const body = { ...form, imagen, contenido }
      const isCreate = !editing
      if (isCreate) await api.post('/api/blog', body)
      else await api.put(`/api/blog/${editing.id}`, body)
      setAlert(null)
      toast.success(isCreate ? 'Post creado.' : 'Post actualizado.')
      load()
      if (modalOpen) closeModal()
      else backToList()
    } catch (err) {
      const msg = err.message || 'Error al guardar'
      setAlert({ type: 'error', msg })
      toast.error(msg)
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este post?')) return
    try {
      await api.delete(`/api/blog/${id}`)
      setAlert(null)
      toast.success('Post eliminado.')
      load()
    } catch (err) {
      const msg = err.message || 'No se pudo eliminar el post'
      setAlert({ type: 'error', msg })
      toast.error(msg)
    }
  }

  async function togglePublicado(post) {
    try {
      await api.put(`/api/blog/${post.id}`, { ...post, publicado: !post.publicado })
      setAlert(null)
      toast.success(!post.publicado ? 'Post publicado.' : 'Post despublicado.')
      load()
    }
    catch (err) {
      const msg = err.message || 'No se pudo actualizar el post'
      setAlert({ type: 'error', msg })
      toast.error(msg)
    }
  }

  if (view === 'editor') {
    return (
      <div>
        <div className="admin-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="admin-btn-icon admin-btn-icon--toggle" onClick={backToList}><i className="fas fa-arrow-left" /></button>
            <h2>{editing ? 'Editar post' : 'Nuevo post'}</h2>
          </div>
          <button className="btn btn--primary" form="blog-form" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : <><i className="fas fa-floppy-disk" /> Guardar</>}
          </button>
        </div>

        {alert && (
          <div className={`admin-alert admin-alert--${alert.type}`} style={{ marginBottom: '1rem' }}>
            <i className={`fas fa-${alert.type === 'success' ? 'circle-check' : 'circle-exclamation'}`} /> {alert.msg}
          </div>
        )}

        <form id="blog-form" onSubmit={save} style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
              <div className="admin-form__group">
                <label>Título *</label>
                <input name="titulo" value={form.titulo} onChange={handle} required style={{ fontSize: '1.125rem' }} />
              </div>
              <div className="admin-form__group">
                <label>Resumen</label>
                <textarea name="resumen" value={form.resumen} onChange={handle} rows={2} placeholder="Breve descripción del artículo..." />
              </div>
              <div className="admin-form__group">
                <label>Contenido</label>
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
                    ref={editorRef}
                    className="admin-editor__content"
                    contentEditable
                    suppressContentEditableWarning
                    dangerouslySetInnerHTML={{ __html: form.contenido }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>Publicación</p>
              <label className="admin-toggle" style={{ marginBottom: '1rem' }}>
                <input type="checkbox" name="publicado" checked={form.publicado} onChange={handle} />
                <span className="admin-toggle__track" />
                {form.publicado ? 'Publicado' : 'Borrador'}
              </label>
            </div>
            <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>Detalles</p>
              <div className="admin-form__group">
                <label>Categoría</label>
                <input name="categoria" value={form.categoria} onChange={handle} placeholder="General" />
              </div>
              <div className="admin-form__group">
                <label>Imagen de portada</label>
                <ImageUploader
                  existingUrl={form.imagen}
                  onExistingRemove={() => setForm(f => ({ ...f, imagen: '' }))}
                  onFilesChange={files => setPendingEditor(files)}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
    <>
    <div>
      <div className="admin-section-header">
        <h2>Blog</h2>
        <button className="btn btn--primary" onClick={openNew}><i className="fas fa-plus" /> Nuevo post</button>
      </div>

      {alert && (
        <div className={`admin-alert admin-alert--${alert.type}`} style={{ marginBottom: '1rem' }}>
          <i className={`fas fa-${alert.type === 'success' ? 'circle-check' : 'circle-exclamation'}`} /> {alert.msg}
          <button onClick={() => setAlert(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>×</button>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray)' }}>Cargando...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-gray)' }}>No hay posts. ¡Creá el primero!</td></tr>
            ) : posts.map(p => (
              <tr key={p.id}>
                <td>
                  <strong style={{ color: 'var(--color-primary)' }}>{p.titulo}</strong>
                  {p.resumen && <p style={{ fontSize: '0.8125rem', color: 'var(--color-gray)', marginTop: '0.15rem', marginBottom: 0 }}>{p.resumen.slice(0, 80)}{p.resumen.length > 80 ? '…' : ''}</p>}
                </td>
                <td><span className="admin-table__badge admin-table__badge--teal">{p.categoria}</span></td>
                <td><span className={`admin-table__badge ${p.publicado ? 'admin-table__badge--green' : 'admin-table__badge--orange'}`}>{p.publicado ? 'Publicado' : 'Borrador'}</span></td>
                <td style={{ fontSize: '0.875rem', color: 'var(--color-gray)' }}>{formatDate(p.fechaPublicacion || p.createdAt)}</td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-btn-icon admin-btn-icon--toggle" title={p.publicado ? 'Despublicar' : 'Publicar'} onClick={() => togglePublicado(p)}>
                      <i className={`fas ${p.publicado ? 'fa-eye-slash' : 'fa-globe'}`} />
                    </button>
                    <button className="admin-btn-icon admin-btn-icon--edit" title="Editar" onClick={() => openEdit(p)}>
                      <i className="fas fa-pen" />
                    </button>
                    <button className="admin-btn-icon admin-btn-icon--delete" title="Eliminar" onClick={() => remove(p.id)}>
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modal: Nuevo post */}
    {modalOpen && (
      <div className="admin-modal-overlay">
        <div className="admin-modal" style={{ maxWidth: '820px', position: 'relative' }}>

          {/* Confirmación de cierre */}
          {confirmClose && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', borderRadius: 'inherit', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '2rem 2.25rem', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
                <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>¿Cerrar sin guardar?</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-gray)', marginBottom: '1.5rem' }}>Vas a perder toda la data cargada.</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button type="button" className="btn btn--secondary" onClick={() => setConfirmClose(false)}>No, seguir editando</button>
                  <button type="button" className="btn btn--primary" style={{ background: '#dc3545', borderColor: '#dc3545' }} onClick={closeModal}>Sí, cerrar</button>
                </div>
              </div>
            </div>
          )}
          <div className="admin-modal__header">
            <h3><i className="fas fa-plus" style={{ marginRight: '0.5rem' }} />Nuevo post</h3>
            <button className="admin-modal__close" onClick={requestClose}><i className="fas fa-xmark" /></button>
          </div>

          <form id="blog-modal-form" onSubmit={save}>
            <div className="admin-modal__body" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.25rem', alignItems: 'start' }}>
              {/* Main */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="admin-form__group">
                  <label>Título *</label>
                  <input name="titulo" value={form.titulo} onChange={handle} required style={{ fontSize: '1.0625rem' }} />
                </div>
                <div className="admin-form__group">
                  <label>Resumen</label>
                  <textarea name="resumen" value={form.resumen} onChange={handle} rows={2} placeholder="Breve descripción del artículo..." />
                </div>
                <div className="admin-form__group">
                  <label>Contenido</label>
                  <div className="admin-editor">
                    <div className="admin-editor__toolbar">
                      <button type="button" className="admin-editor__btn" title="Negrita" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('bold', false, null) }}><i className="fas fa-bold" /></button>
                      <button type="button" className="admin-editor__btn" title="Cursiva" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('italic', false, null) }}><i className="fas fa-italic" /></button>
                      <button type="button" className="admin-editor__btn" title="Subrayado" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('underline', false, null) }}><i className="fas fa-underline" /></button>
                      <div className="admin-editor__sep" />
                      <button type="button" className="admin-editor__btn" title="Título H2" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('formatBlock', false, 'H2') }}><b>H2</b></button>
                      <button type="button" className="admin-editor__btn" title="Párrafo" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('formatBlock', false, 'P') }}>¶</button>
                      <div className="admin-editor__sep" />
                      <button type="button" className="admin-editor__btn" title="Lista con viñetas" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('insertUnorderedList', false, null) }}><i className="fas fa-list-ul" /></button>
                      <button type="button" className="admin-editor__btn" title="Lista numerada" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('insertOrderedList', false, null) }}><i className="fas fa-list-ol" /></button>
                      <div className="admin-editor__sep" />
                      <button type="button" className="admin-editor__btn" title="Alinear izquierda" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('justifyLeft', false, null) }}><i className="fas fa-align-left" /></button>
                      <button type="button" className="admin-editor__btn" title="Centrar" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('justifyCenter', false, null) }}><i className="fas fa-align-center" /></button>
                      <button type="button" className="admin-editor__btn" title="Quitar formato" onClick={() => { modalEditorRef.current?.focus(); document.execCommand('removeFormat', false, null) }}><i className="fas fa-eraser" /></button>
                    </div>
                    <div
                      ref={modalEditorRef}
                      className="admin-editor__content"
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: form.contenido }}
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--color-gray-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Publicación</p>
                  <label className="admin-toggle">
                    <input type="checkbox" name="publicado" checked={form.publicado} onChange={handle} />
                    <span className="admin-toggle__track" />
                    {form.publicado ? 'Publicado' : 'Borrador'}
                  </label>
                </div>
                <div style={{ background: 'var(--color-gray-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>Detalles</p>
                  <div className="admin-form__group">
                    <label>Categoría</label>
                    <input name="categoria" value={form.categoria} onChange={handle} placeholder="General" />
                  </div>
                  <div className="admin-form__group" style={{ marginBottom: 0 }}>
                    <label>Imagen de portada</label>
                    <ImageUploader
                      existingUrl={form.imagen}
                      onExistingRemove={() => setForm(f => ({ ...f, imagen: '' }))}
                      onFilesChange={files => setPendingModal(files)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {alert && (
              <div className={`admin-alert admin-alert--${alert.type}`} style={{ margin: '0 1.75rem' }}>
                <i className={`fas fa-${alert.type === 'success' ? 'circle-check' : 'circle-exclamation'}`} /> {alert.msg}
              </div>
            )}

            <div className="admin-modal__footer">
              <button type="button" className="btn btn--secondary" onClick={requestClose} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Guardando...' : <><i className="fas fa-floppy-disk" /> Crear post</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  )
}
