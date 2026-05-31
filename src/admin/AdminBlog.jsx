import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { DEBUG, debugDefaults } from '../lib/debugDefaults'

const EMPTY_POST = { titulo: '', resumen: '', imagen: '', categoria: 'General', contenido: '', publicado: false }

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list' | 'editor'
  const [editing, setEditing] = useState(null) // null = new post
  const [form, setForm] = useState(EMPTY_POST)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)
  const editorRef = useRef(null)

  function load() {
    setLoading(true)
    api.get('/api/blog/all').then(d => { setPosts(d); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  function openNew() {
    const d = DEBUG ? debugDefaults.blogPost : {}
    setForm({ ...EMPTY_POST, ...d })
    setEditing(null)
    setView('editor')
  }

  function openEdit(post) {
    setForm({ titulo: post.titulo, resumen: post.resumen || '', imagen: post.imagen || '', categoria: post.categoria, contenido: post.contenido, publicado: post.publicado })
    setEditing(post)
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
    const contenido = editorRef.current?.innerHTML || form.contenido
    const body = { ...form, contenido }
    setSaving(true)
    try {
      if (!editing) await api.post('/api/blog', body)
      else await api.put(`/api/blog/${editing.id}`, body)
      setAlert({ type: 'success', msg: !editing ? 'Post creado.' : 'Post actualizado.' })
      load()
      backToList()
    } catch (err) {
      setAlert({ type: 'error', msg: err.message || 'Error al guardar' })
    } finally { setSaving(false) }
  }

  async function remove(id) {
    if (!confirm('¿Eliminar este post?')) return
    try { await api.delete(`/api/blog/${id}`); load() } catch (err) { setAlert({ type: 'error', msg: err.message }) }
  }

  async function togglePublicado(post) {
    try { await api.put(`/api/blog/${post.id}`, { ...post, publicado: !post.publicado }); load() }
    catch (err) { setAlert({ type: 'error', msg: err.message }) }
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
                <label>URL de imagen</label>
                <input name="imagen" value={form.imagen} onChange={handle} placeholder="https://..." />
                {form.imagen && <img src={form.imagen} alt="" style={{ marginTop: '0.5rem', width: '100%', borderRadius: 6, objectFit: 'cover', height: 120 }} />}
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }

  return (
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
  )
}
