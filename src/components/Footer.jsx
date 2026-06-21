import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function Footer() {
  const [contact, setContact] = useState({
    email: 'contacto@kadimasalud.com.ar',
    whatsapp: '5491100000000',
    instagram: 'KadimaSalud',
    facebook: 'KadimaSalud',
  })

  useEffect(() => {
    api.get('/api/contact-info')
      .then(d => { if (d.map) setContact(prev => ({ ...prev, ...d.map })) })
      .catch(() => {})
  }, [])

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Link to="/" className="navbar__logo">
            <i className="fas fa-shield-heart" />
            <span>Kadima <strong>Salud</strong></span>
          </Link>
          <p>Consultora especializada en administración de salud. Soluciones estratégicas para el sector.</p>
          <div className="footer__social">
            <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram" /></a>
            <a href={`https://facebook.com/${contact.facebook}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook" /></a>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp" /></a>
            <a href={`mailto:${contact.email}`} aria-label="Email"><i className="fas fa-envelope" /></a>
          </div>
        </div>
        <div className="footer__links">
          <div className="footer__col">
            <h4>Servicios</h4>
            <ul>
              <li><Link to="/capacitaciones">Capacitaciones</Link></li>
              <li><Link to="/surge">Presentaciones SURGE</Link></li>
              <li><Link to="/equipos">Equipos Médicos</Link></li>
              <li><Link to="/servicios/auditoria-de-liquidacion">Auditoría de Liquidación</Link></li>
              <li><Link to="/servicios/internacion-domiciliaria">Internación Domiciliaria</Link></li>
              <li><Link to="/servicios/control-de-pacientes-diabeticos">Control de Pacientes Diabéticos</Link></li>
              <li><Link to="/servicios/asesoramiento-pre-judiciales">Asesoramiento Pre-Judicial</Link></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4>Contacto</h4>
            <ul>
              <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
              <li><a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer">@{contact.instagram}</a></li>
              <li><Link to="/contacto">Formulario de contacto</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>&copy; {new Date().getFullYear()} Kadima Salud. Todos los derechos reservados.</p>
          <p>Hecho por <a href="https://zigodev.com.ar" target="_blank" rel="noopener noreferrer">zigodev</a></p>
        </div>
      </div>
    </footer>
  )
}
