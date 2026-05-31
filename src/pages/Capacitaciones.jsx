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

export default function Capacitaciones() {
  const ref = useFadeIn()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/capacitaciones')
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div ref={ref}>
      <Navbar />
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Formación profesional</p>
          <h1>Capacitaciones en Salud</h1>
          <p>Formación especializada para profesionales, gestores y equipos del sistema de salud argentino</p>
        </div>
      </section>

      <section className="nosotros" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="section-header fade-in">
            <p className="section-header__tag">¿Por qué con nosotros?</p>
            <h2>Capacitación diseñada para el sector salud</h2>
            <p className="section-header__desc">Nuestras capacitaciones combinan marcos normativos actualizados, casos prácticos reales y docentes con experiencia directa en el sistema de salud.</p>
          </div>
          <div className="cap-beneficios__grid">
            {[
              { icon: 'fa-certificate', title: 'Certificación incluida', desc: 'Todos los participantes reciben certificado de asistencia y aprobación al finalizar la capacitación.' },
              { icon: 'fa-chalkboard-user', title: 'Docentes especializados', desc: 'Profesionales con trayectoria real en administración de salud, no solo formación académica.' },
              { icon: 'fa-laptop', title: 'Modalidad flexible', desc: 'Dictamos en modalidad presencial o virtual, adaptándonos a la disponibilidad y ubicación del equipo.' },
              { icon: 'fa-people-group', title: 'Grupos reducidos', desc: 'Trabajamos con grupos pequeños para garantizar atención personalizada y participación activa.' },
            ].map(b => (
              <div key={b.title} className="cap-beneficio fade-in">
                <div className="cap-beneficio__icon"><i className={`fas ${b.icon}`} /></div>
                <div><h3>{b.title}</h3><p>{b.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="capacitaciones">
        <div className="container">
          <div className="section-header fade-in">
            <p className="section-header__tag">Oferta Académica</p>
            <h2>Nuestras capacitaciones</h2>
            <p className="section-header__desc">Cada capacitación está pensada para un perfil específico, con contenidos prácticos y actualizados.</p>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1,2,3,4].map(i => <div key={i} className="skeleton loading-card" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="page-error"><i className="fas fa-graduation-cap" /><p>No hay capacitaciones disponibles por el momento.</p></div>
          ) : (
            <div className="capacitaciones__grid">
              {items.map(c => (
                <div key={c.id} className="cap__card fade-in">
                  <div className="cap__card-top">
                    <i className={`fas ${c.icono}`} />
                    <span className={`cap__badge${c.badgeColor === 'teal' ? ' cap__badge--teal' : ''}`}>{c.badge}</span>
                  </div>
                  <h3>{c.titulo}</h3>
                  <p>{c.descripcion}</p>
                  <ul className="cap__features">
                    <li><i className="fas fa-users" /> {c.publico}</li>
                    <li><i className="fas fa-clock" /> {c.duracion}</li>
                    <li><i className="fas fa-certificate" /> Con certificación</li>
                    <li><i className="fas fa-laptop" /> {c.modalidad}</li>
                  </ul>
                  <Link to="/contacto" className="btn btn--outline">Consultar cupo</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-section__inner fade-in">
          <div><h2>¿Necesitás una capacitación a medida para tu equipo?</h2><p>Diseñamos contenidos específicos según las necesidades de tu organización.</p></div>
          <Link to="/contacto" className="btn btn--white btn--lg">Solicitar propuesta</Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
