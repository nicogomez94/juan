import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/capacitaciones/all').then(d => d.length).catch(() => 0),
      api.get('/api/equipos/all').then(d => d.length).catch(() => 0),
      api.get('/api/blog/all').then(d => ({ total: d.length, pub: d.filter(p => p.publicado).length, draft: d.filter(p => !p.publicado).length })).catch(() => ({ total: 0, pub: 0, draft: 0 })),
      api.get('/api/site-images/all').then(d => d.filter(image => image.customUrl).length).catch(() => 0),
    ]).then(([caps, equips, blog, customImages]) => {
      setStats({ caps, equips, blogTotal: blog.total, blogPub: blog.pub, blogDraft: blog.draft, customImages })
      setLoading(false)
    })
  }, [])

  const cards = loading ? [] : [
    { label: 'Capacitaciones', value: stats.caps, icon: 'fa-graduation-cap', color: 'teal', to: '/admin/capacitaciones' },
    { label: 'Equipos médicos', value: stats.equips, icon: 'fa-stethoscope', color: 'navy', to: '/admin/equipos' },
    { label: 'Posts publicados', value: stats.blogPub, icon: 'fa-circle-check', color: 'accent', to: '/admin/blog' },
    { label: 'Borradores', value: stats.blogDraft, icon: 'fa-file-pen', color: 'orange', to: '/admin/blog' },
    { label: 'Imágenes editadas', value: stats.customImages, icon: 'fa-images', color: 'teal', to: '/admin/imagenes' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
          ¡Bienvenido al panel!
        </h1>
        <p style={{ color: 'var(--color-text-light)', marginTop: '0.25rem' }}>Resumen del contenido del sitio</p>
      </div>

      {loading ? (
        <div className="admin-stat-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : (
        <div className="admin-stat-grid">
          {cards.map(c => (
            <Link key={c.label} to={c.to} style={{ textDecoration: 'none' }}>
              <div className="admin-stat-card">
                <div className={`admin-stat-card__icon admin-stat-card__icon--${c.color}`}>
                  <i className={`fas ${c.icon}`} />
                </div>
                <div>
                  <div className="admin-stat-card__num">{c.value}</div>
                  <div className="admin-stat-card__label">{c.label}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--color-white)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginTop: '0.5rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.875rem' }}>Accesos rápidos</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {[
            { to: '/admin/capacitaciones', icon: 'fa-graduation-cap', label: 'Capacitaciones' },
            { to: '/admin/equipos', icon: 'fa-stethoscope', label: 'Equipos' },
            { to: '/admin/contacto', icon: 'fa-address-book', label: 'Datos de contacto' },
            { to: '/admin/blog', icon: 'fa-newspaper', label: 'Blog' },
            { to: '/admin/imagenes', icon: 'fa-images', label: 'Imágenes del sitio' },
          ].map(l => (
            <Link key={l.to} to={l.to} className="btn btn--outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1.125rem' }}>
              <i className={`fas ${l.icon}`} /> {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
