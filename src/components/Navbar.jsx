import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [portalsOpen, setPortalsOpen] = useState(false)
  const servicesRef = useRef(null)
  const portalsRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setServicesOpen(false)
    setPortalsOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const closeServices = event => {
      if (event.key === 'Escape') {
        setServicesOpen(false)
        setPortalsOpen(false)
        return
      }

      if (!servicesRef.current?.contains(event.target)) setServicesOpen(false)
      if (!portalsRef.current?.contains(event.target)) setPortalsOpen(false)
    }

    document.addEventListener('click', closeServices)
    document.addEventListener('keydown', closeServices)
    return () => {
      document.removeEventListener('click', closeServices)
      document.removeEventListener('keydown', closeServices)
    }
  }, [])

  const isActive = path => location.pathname === path ? 'active' : ''
  const isServiceActive = ['/capacitaciones', '/equipos', '/surge'].includes(location.pathname) || location.pathname.startsWith('/servicios/')
  const isPortalActive = ['/portal-estudiantes', '/portal-clientes', '/portal-historias-clinicas'].includes(location.pathname)

  const className = `navbar navbar--home${scrolled ? ' scrolled' : ''}`

  return (
    <header className="site-header">
      <nav className={className} id="navbar">
        <div className="container navbar__inner">
          <Link to="/" className="navbar__logo" aria-label="Kadima Salud, ir al inicio">
            <i className="fas fa-shield-heart" aria-hidden="true" />
            <span>Kadima <strong>Salud</strong></span>
          </Link>
          <button
            className="navbar__toggle"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen(o => !o)}
          >
            <i className={`fas ${open ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
          <ul id="main-navigation" className={`navbar__links${open ? ' open' : ''}`}>
            <li><Link to="/nosotros" className={isActive('/nosotros')}>Nosotros</Link></li>
            <li ref={servicesRef} className={`navbar__services${servicesOpen ? ' open' : ''}`}>
              <button
                type="button"
                className={`navbar__services-toggle${isServiceActive ? ' active' : ''}`}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                aria-controls="services-navigation"
                onClick={event => {
                  event.stopPropagation()
                  setServicesOpen(value => !value)
                }}
              >
                Servicios
                <i className="fas fa-chevron-down" aria-hidden="true" />
              </button>
              <ul id="services-navigation" className="navbar__dropdown">
                <li><Link to="/capacitaciones">Capacitaciones</Link></li>
                <li><Link to="/equipos">Equipos Médicos</Link></li>
                <li><Link to="/surge">Presentaciones SURGE</Link></li>
                <li><Link to="/servicios/auditoria-de-liquidacion">Auditoría de Liquidación</Link></li>
                <li><Link to="/servicios/internacion-domiciliaria">Internación Domiciliaria</Link></li>
                <li><Link to="/servicios/control-de-pacientes-diabeticos">Control de Pacientes Diabéticos</Link></li>
                <li><Link to="/servicios/asesoramiento-pre-judiciales">Asesoramiento Pre-Judiciales</Link></li>
              </ul>
            </li>
            <li><Link to="/cursos" className={isActive('/cursos')}>Cursos</Link></li>
            <li ref={portalsRef} className={`navbar__services${portalsOpen ? ' open' : ''}`}>
              <button
                type="button"
                className={`navbar__services-toggle${isPortalActive ? ' active' : ''}`}
                aria-expanded={portalsOpen}
                aria-controls="portals-navigation"
                onClick={event => {
                  event.stopPropagation()
                  setPortalsOpen(value => !value)
                }}
              >
                Portales <i className="fas fa-chevron-down" aria-hidden="true" />
              </button>
              <ul id="portals-navigation" className="navbar__dropdown">
                <li><Link to="/portal-estudiantes">Estudiantes</Link></li>
                <li><Link to="/portal-clientes">Clientes</Link></li>
              </ul>
            </li>
            <li><Link to="/blog" className={isActive('/blog')}>Blog</Link></li>
            <li><Link to="/contacto" className={isActive('/contacto')}>Contacto</Link></li>
            <li className="navbar__cta-mobile-item">
              <Link to="/contacto" className="btn btn--primary">Consultar</Link>
            </li>
          </ul>
          <Link to="/contacto" className="btn btn--primary navbar__cta">Consultar</Link>
        </div>
      </nav>
    </header>
  )
}
