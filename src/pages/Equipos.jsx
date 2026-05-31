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

export default function Equipos() {
  const ref = useFadeIn()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/equipos')
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div ref={ref}>
      <Navbar />
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Profesionales especializados</p>
          <h1>Equipos Médicos</h1>
          <p>Profesionales y equipos de cirugía organizados por especialidad para instituciones del sector salud</p>
        </div>
      </section>

      <section className="equipos-intro">
        <div className="container equipos-intro__inner">
          <div className="equipos-intro__content fade-in">
            <p className="section-header__tag">Nuestro enfoque</p>
            <h2>Profesionales seleccionados para cada necesidad</h2>
            <p>En Kadima Salud contamos con una red de equipos médicos y profesionales especializados, organizados por área, disponibles para cubrir requerimientos específicos de instituciones médicas, obras sociales y prepagas.</p>
            <p>Gestionamos la articulación entre las instituciones y los equipos, facilitando el proceso administrativo y asegurando el cumplimiento de los requisitos de habilitación y cobertura.</p>
            <div className="equipos-intro__tags">
              {['Equipos completos','Habilitados y certificados','Disponibilidad flexible','Cobertura a nivel nacional'].map(t => (
                <span key={t}><i className="fas fa-check" /> {t}</span>
              ))}
            </div>
          </div>
          <div className="equipos-intro__image fade-in">
            <img src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80" alt="Equipo médico quirúrgico" />
          </div>
        </div>
      </section>

      <section className="equipos">
        <div className="container">
          <div className="section-header fade-in">
            <p className="section-header__tag">Especialidades</p>
            <h2>Áreas cubiertas</h2>
            <p className="section-header__desc">Contamos con equipos disponibles en las principales especialidades médico-quirúrgicas.</p>
          </div>

          {loading ? (
            <div className="loading-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton loading-card" style={{ height: 200 }} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="page-error"><i className="fas fa-stethoscope" /><p>No hay equipos disponibles por el momento.</p></div>
          ) : (
            <div className="equipos__grid">
              {items.map(e => (
                <div key={e.id} className="equipo__card fade-in">
                  <div className="equipo__card-icon"><i className={`fas ${e.icono}`} /></div>
                  <h3>{e.nombre}</h3>
                  <p>{e.descripcion}</p>
                  <Link to="/contacto" className="equipo__link">Consultar disponibilidad <i className="fas fa-arrow-right" /></Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-section__inner fade-in">
          <div><h2>¿Necesitás un equipo médico para tu institución?</h2><p>Consultanos por disponibilidad y condiciones de trabajo.</p></div>
          <Link to="/contacto" className="btn btn--white btn--lg">Consultar disponibilidad</Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
