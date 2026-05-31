import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { clearToken } from '../lib/api'
import './admin.css'

const navItems = [
  { to: '/admin/dashboard', icon: 'fa-table-columns', label: 'Dashboard' },
  { to: '/admin/capacitaciones', icon: 'fa-graduation-cap', label: 'Capacitaciones' },
  { to: '/admin/equipos', icon: 'fa-stethoscope', label: 'Equipos' },
  { to: '/admin/contacto', icon: 'fa-address-book', label: 'Datos de contacto' },
  { to: '/admin/blog', icon: 'fa-newspaper', label: 'Blog' },
  { to: '/admin/imagenes', icon: 'fa-images', label: 'Imágenes del sitio' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function logout() {
    clearToken()
    navigate('/admin/login')
  }

  return (
    <div className="admin-root">
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <Link to="/" className="admin-sidebar__logo">
          <i className="fas fa-shield-heart" />
          <span>Kadima <strong>Salud</strong></span>
        </Link>

        <nav className="admin-nav">
          <span className="admin-nav__group-label">Principal</span>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`fas ${item.icon}`} /> {item.label}
            </NavLink>
          ))}
          <span className="admin-nav__group-label" style={{ marginTop: '0.5rem' }}>Sitio</span>
          <Link to="/" target="_blank" rel="noopener noreferrer" onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-arrow-up-right-from-square" /> Ver sitio
          </Link>
        </nav>

        <div className="admin-sidebar__footer">
          <button onClick={logout}>
            <i className="fas fa-right-from-bracket" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(s => !s)}>
              <i className="fas fa-bars" />
            </button>
            <span className="admin-topbar__title">Panel de administración</span>
          </div>
          <span className="admin-topbar__badge">Admin</span>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
