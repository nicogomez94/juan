import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import horizontalBanner from '../../horizontal.svg'
import verticalBanner from '../../vertical.svg'

export default function Navbar() {
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

  const isActive = path => location.pathname === path ? 'active' : ''
  const isServiceActive = ['/capacitaciones', '/equipos', '/surge'].includes(location.pathname) || location.pathname.startsWith('/servicios/')

  const className = `navbar navbar--home${scrolled ? ' scrolled' : ''}`

  return (
    <header className="site-header">
      <div className="home-start__banner">
        <picture>
          <source media="(min-width: 721px)" srcSet={horizontalBanner} />
          <img src={verticalBanner} alt="Kadima Consultoría en Salud" />
        </picture>
      </div>
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
          <Link to="/" className="navbar__home-link" aria-label="Ir al inicio">
            <i className="fas fa-house" aria-hidden="true" />
            <span>Inicio</span>
          </Link>
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
