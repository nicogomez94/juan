import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { api } from '../lib/api'
import { useSiteImages } from '../lib/siteImages'

function useFadeIn(deps = []) {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    const el = ref.current; if (!el) return
    el.querySelectorAll('.fade-in').forEach(t => observer.observe(t))
    return () => el.querySelectorAll('.fade-in').forEach(t => observer.unobserve(t))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

export default function Equipos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const { image } = useSiteImages()
  const ref = useFadeIn([items])
  const modalRequestRef = useRef(0)

  useEffect(() => {
    api.get('/api/equipos')
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!expanded && !modalLoading && !modalError) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleEscape = event => {
      if (event.key === 'Escape') closeExpanded()
    }
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [expanded, modalLoading, modalError])

  async function openExpanded(item) {
    const requestId = modalRequestRef.current + 1
    modalRequestRef.current = requestId
    setExpanded(null)
    setModalError('')
    setModalLoading(true)
    try {
      const detail = await api.get(`/api/equipos/${item.id}`)
      if (modalRequestRef.current === requestId) setExpanded(detail)
    } catch (error) {
      if (modalRequestRef.current === requestId) {
        setModalError(error.message || 'No se pudo cargar la información del equipo.')
      }
    } finally {
      if (modalRequestRef.current === requestId) setModalLoading(false)
    }
  }

  function closeExpanded() {
    modalRequestRef.current += 1
    setExpanded(null)
    setModalLoading(false)
    setModalError('')
  }

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
            <img src={image('equipos.intro.medical').url} alt={image('equipos.intro.medical').alt} />
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
                  {e.imagen && (
                    <div className="equipo__card-image">
                      <img src={e.imagen} alt={e.nombre} loading="lazy" />
                    </div>
                  )}
                  <div className="equipo__card-body">
                    <h3>{e.nombre}</h3>
                    <p className="equipo__card-description">{e.descripcion}</p>
                    <button
                      type="button"
                      className="equipo__link"
                      aria-label={`Expandir información de ${e.nombre}`}
                      onClick={() => openExpanded(e)}
                    >
                      Expandir <i className="fas fa-up-right-and-down-left-from-center" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {(modalLoading || modalError || expanded) && (
        <div className="equipo-modal" onMouseDown={event => { if (event.target === event.currentTarget) closeExpanded() }}>
          <div
            className="equipo-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={expanded ? 'equipo-modal-title' : undefined}
          >
            <button type="button" className="equipo-modal__close" onClick={closeExpanded} aria-label="Cerrar detalle">
              <i className="fas fa-xmark" />
            </button>

            {modalLoading && (
              <div className="equipo-modal__state" aria-live="polite">
                <i className="fas fa-circle-notch fa-spin" />
                <p>Cargando información...</p>
              </div>
            )}

            {modalError && (
              <div className="equipo-modal__state equipo-modal__state--error" role="alert">
                <i className="fas fa-circle-exclamation" />
                <p>{modalError}</p>
                <button type="button" className="btn btn--outline" onClick={closeExpanded}>Cerrar</button>
              </div>
            )}

            {expanded && (
              <>
                <header className={`equipo-modal__header ${expanded.imagen ? '' : 'equipo-modal__header--no-image'}`}>
                  <div>
                    <p className="section-header__tag">Equipo médico</p>
                    <h2 id="equipo-modal-title">{expanded.nombre}</h2>
                    <p>{expanded.descripcion}</p>
                  </div>
                  {expanded.imagen && (
                    <img src={expanded.imagen} alt={expanded.nombre} />
                  )}
                </header>
                <div className="equipo-modal__scroll">
                  <article
                    className="equipo-modal__rich"
                    dangerouslySetInnerHTML={{ __html: expanded.contenido || `<p>${expanded.descripcion}</p>` }}
                  />
                  <footer className="equipo-modal__footer">
                    <Link to="/contacto" className="btn btn--primary" onClick={closeExpanded}>
                      Consultar con Kadima
                    </Link>
                    <Link to={`/equipos/${expanded.id}`} className="equipo-modal__page-link">
                      Abrir página completa <i className="fas fa-arrow-up-right-from-square" />
                    </Link>
                  </footer>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
