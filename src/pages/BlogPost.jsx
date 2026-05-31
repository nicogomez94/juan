import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { api } from '../lib/api'

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get(`/api/blog/${slug}`)
      .then(data => { setPost(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [slug])

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: 'var(--navbar-h)' }}>
        {loading && (
          <div className="blog-post">
            <div className="container blog-post__inner">
              <div className="skeleton" style={{ height: '2rem', width: '40%', marginBottom: '1rem' }} />
              <div className="skeleton" style={{ height: '3rem', width: '80%', marginBottom: '1.5rem' }} />
              <div className="skeleton" style={{ height: '380px', borderRadius: '1.25rem', marginBottom: '2rem' }} />
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: '1.2rem', marginBottom: '0.75rem', width: i % 2 === 0 ? '90%' : '100%' }} />)}
            </div>
          </div>
        )}
        {error && (
          <div className="blog-post">
            <div className="container blog-post__inner page-error">
              <i className="fas fa-circle-exclamation" />
              <p>No se encontró el artículo solicitado.</p>
              <Link to="/blog" className="btn btn--primary" style={{ marginTop: '1.5rem' }}>Volver al blog</Link>
            </div>
          </div>
        )}
        {post && (
          <section className="blog-post">
            <div className="container blog-post__inner">
              <Link to="/blog" className="blog-post__back">
                <i className="fas fa-arrow-left" /> Volver al blog
              </Link>
              <span className="blog-post__cat">{post.categoria}</span>
              <h1 className="blog-post__title">{post.titulo}</h1>
              <p className="blog-post__meta">
                <i className="fas fa-calendar" style={{ marginRight: '0.4rem' }} />
                {formatDate(post.fechaPublicacion || post.createdAt)}
              </p>
              {post.imagen && (
                <img src={post.imagen} alt={post.titulo} className="blog-post__hero-img" />
              )}
              <div
                className="blog-post__content"
                dangerouslySetInnerHTML={{ __html: post.contenido }}
              />
            </div>
          </section>
        )}
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
