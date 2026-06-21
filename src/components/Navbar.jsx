import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import brandLogo from '../assets/otropng.png'

export default function Navbar({ variant = 'default' }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const servicesRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setServicesOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const closeServices = event => {
      if (event.key === 'Escape') {
        setServicesOpen(false)
        servicesRef.current?.querySelector('button')?.focus()
        return
      }

      if (!servicesRef.current?.contains(event.target)) setServicesOpen(false)
    }

    document.addEventListener('click', closeServices)
    document.addEventListener('keydown', closeServices)
    return () => {
      document.removeEventListener('click', closeServices)
      document.removeEventListener('keydown', closeServices)
    }
  }, [])

  const hasServiceQuery = location.pathname === '/contacto' && new URLSearchParams(location.search).has('servicio')
  const isActive = path => location.pathname === path && !(path === '/contacto' && hasServiceQuery) ? 'active' : ''
  const isServiceActive = ['/capacitaciones', '/equipos', '/surge'].includes(location.pathname) || hasServiceQuery

  const className = `navbar${variant === 'home' ? ' navbar--home' : ''}${scrolled ? ' scrolled' : ''}`

  return (
    <nav className={className} id="navbar">
      <div className="container navbar__inner">
        <button
          className="navbar__toggle"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(o => !o)}
        >
          <i className={`fas ${open ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
        {variant !== 'home' && (
          <Link to="/" className="navbar__logo" aria-label="Kadima Salud">
            <img className="navbar__brand-image" src={brandLogo} alt="Kadima Consultoría en Salud" />
          </Link>
        )}
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
              <li><Link to="/contacto?servicio=auditoria-de-liquidacion">Auditoría de Liquidación</Link></li>
              <li><Link to="/contacto?servicio=internacion-domiciliaria">Internación Domiciliaria</Link></li>
              <li><Link to="/contacto?servicio=control-de-pacientes-diabeticos">Control de Pacientes Diabéticos</Link></li>
              <li><Link to="/contacto?servicio=asesoramiento-pre-judiciales">Asesoramiento Pre-Judiciales</Link></li>
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
  )
}
