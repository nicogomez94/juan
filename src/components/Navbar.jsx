import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import brandLogo from '../assets/otropng.png'

export default function Navbar({ variant = 'default' }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const isActive = (path) => location.pathname === path ? 'active' : ''

  const className = `navbar${variant === 'home' ? ' navbar--home' : ''}${scrolled ? ' scrolled' : ''}`

  return (
    <nav className={className} id="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo" aria-label="Kadima Salud">
          <img className="navbar__brand-image" src={brandLogo} alt="Kadima Consultoría en Salud" />
        </Link>
        <button
          className="navbar__toggle"
          aria-label="Abrir menú"
          onClick={() => setOpen(o => !o)}
        >
          <i className={`fas ${open ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
        <ul className={`navbar__links${open ? ' open' : ''}`}>
          <li><Link to="/nosotros" className={isActive('/nosotros')}>Nosotros</Link></li>
          <li><Link to="/capacitaciones" className={isActive('/capacitaciones')}>Capacitaciones</Link></li>
          <li><Link to="/surge" className={isActive('/surge')}>SURGE</Link></li>
          <li><Link to="/equipos" className={isActive('/equipos')}>Equipos</Link></li>
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
