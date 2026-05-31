import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { api } from '../lib/api'

function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    const el = ref.current; if (!el) return
    el.querySelectorAll('.fade-in').forEach(t => observer.observe(t))
    return () => el.querySelectorAll('.fade-in').forEach(t => observer.unobserve(t))
  }, [])
  return ref
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Blog() {
  const ref = useFadeIn()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoria, setCategoria] = useState('')
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const url = categoria ? `/api/blog?categoria=${encodeURIComponent(categoria)}` : '/api/blog'
    api.get(url)
      .then(data => {
        setPosts(data)
        if (!categorias.length) {
          const cats = [...new Set(data.map(p => p.categoria).filter(Boolean))]
          setCategorias(cats)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [categoria])

  return (
    <div ref={ref}>
      <Navbar />
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Noticias y recursos</p>
          <h1>Blog</h1>
          <p>Artículos, novedades y recursos sobre administración y gestión en el sector salud</p>
        </div>
      </section>

      <section className="blog">
        <div className="container">
          {categorias.length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button
                className={`cap__badge${!categoria ? ' cap__badge--teal' : ''}`}
                style={{ cursor: 'pointer', padding: '0.4rem 1rem', fontSize: '0.8125rem' }}
                onClick={() => setCategoria('')}
              >Todos</button>
              {categorias.map(c => (
                <button
                  key={c}
                  className={`cap__badge${categoria === c ? ' cap__badge--teal' : ''}`}
                  style={{ cursor: 'pointer', padding: '0.4rem 1rem', fontSize: '0.8125rem' }}
                  onClick={() => setCategoria(c)}
                >{c}</button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="loading-grid">
              {[1,2,3].map(i => <div key={i} className="skeleton loading-card" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="page-error">
              <i className="fas fa-newspaper" />
              <p>No hay publicaciones todavía. ¡Volvé pronto!</p>
            </div>
          ) : (
            <div className="blog__grid">
              {posts.map(p => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="blog__card fade-in">
                  {p.imagen
                    ? <img src={p.imagen} alt={p.titulo} className="blog__card-img" />
                    : <div className="blog__card-img-placeholder"><i className="fas fa-newspaper" /></div>
                  }
                  <div className="blog__card-body">
                    <span className="blog__card-cat">{p.categoria}</span>
                    <h2 className="blog__card-title">{p.titulo}</h2>
                    <p className="blog__card-resumen">{p.resumen}</p>
                    <div className="blog__card-meta">
                      <i className="fas fa-calendar" />
                      <span>{formatDate(p.fechaPublicacion || p.createdAt)}</span>
                    </div>
                    <span className="blog__card-link">Leer más <i className="fas fa-arrow-right" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
