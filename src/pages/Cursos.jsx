import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { api } from '../lib/api'
import { demoCourses, demoPriceFor } from '../lib/demoCourses'

function formatPrice(title) {
  const price = demoPriceFor(title)
  return price == null ? 'Valor a confirmar' : `$ ${price.toLocaleString('es-AR')}`
}

function getTopics(value) {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function Cursos() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingDemo, setUsingDemo] = useState(false)
  const [selected, setSelected] = useState(null)
  const [step, setStep] = useState('detail')
  const closeButtonRef = useRef(null)

  useEffect(() => {
    api.get('/api/capacitaciones')
      .then(data => setCourses(data))
      .catch(() => { setCourses(demoCourses); setUsingDemo(true) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) return undefined
    const closeOnEscape = event => { if (event.key === 'Escape') setSelected(null) }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [selected])

  function openCourse(course, nextStep = 'detail') {
    setSelected(course)
    setStep(nextStep)
  }

  return (
    <>
      <Navbar />
      <section className="page-hero course-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Campus Kadima</p>
          <h1>Cursos para profesionales de la salud</h1>
          <p>Formación práctica para mejorar la gestión de instituciones, obras sociales y equipos de salud.</p>
        </div>
      </section>

      <main>
        <section className="course-section">
          <div className="container">
            <div className="course-section__intro">
              <div>
                <p className="section-header__tag">Oferta académica</p>
                <h2>Elegí tu próximo curso</h2>
                <p>Explorá el programa, la modalidad y el valor de referencia de cada propuesta.</p>
              </div>
              <div className="course-section__notice"><i className="fas fa-circle-info" /> Vista previa: {usingDemo ? 'el catálogo y los valores son de muestra' : 'los valores son de muestra'} y el pago en línea está en preparación.</div>
            </div>

            {loading ? (
              <div className="loading-grid">{[1, 2, 3, 4].map(number => <div className="skeleton loading-card" key={number} />)}</div>
            ) : courses.length === 0 ? (
              <div className="page-error"><i className="fas fa-book-open" /><p>Estamos preparando la oferta de cursos.</p><Link to="/contacto" className="btn btn--outline">Consultanos</Link></div>
            ) : (
              <div className="course-grid">
                {courses.map(course => (
                  <article className="course-card" key={course.id}>
                    <div className="course-card__top">
                      <span className="course-card__icon"><i className={`fas ${course.icono || 'fa-book-open'}`} /></span>
                      <span className="cap__badge">{course.badge || 'Formación'}</span>
                    </div>
                    <h3>{course.titulo}</h3>
                    <p>{course.descripcion}</p>
                    <div className="course-card__meta"><span><i className="far fa-clock" /> {course.duracion}</span><span><i className="fas fa-display" /> {course.modalidad}</span></div>
                    <div className="course-card__footer">
                      <div><small>Valor de muestra</small><strong>{formatPrice(course.titulo)}</strong></div>
                      <button type="button" className="btn btn--primary" onClick={() => openCourse(course)}>Ver curso <i className="fas fa-arrow-right" /></button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="course-support">
          <div className="container course-support__inner">
            <div><p className="section-header__tag">Acompañamiento</p><h2>Una experiencia de formación clara y accesible</h2><p>El futuro portal reunirá tus cursos, avance y certificados en un solo lugar.</p></div>
            <Link to="/portal-estudiantes" className="btn btn--outline">Conocer el portal de estudiantes <i className="fas fa-arrow-right" /></Link>
          </div>
        </section>
      </main>

      {selected && (
        <div className="course-dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}>
          <section className="course-dialog" role="dialog" aria-modal="true" aria-label={step === 'detail' ? `Curso ${selected.titulo}` : `Inscripción a ${selected.titulo}`}>
            <button type="button" ref={closeButtonRef} className="course-dialog__close" aria-label="Cerrar" onClick={() => setSelected(null)}><i className="fas fa-xmark" /></button>
            {step === 'detail' ? (
              <>
                <p className="section-header__tag">Detalle del curso</p>
                <h2>{selected.titulo}</h2>
                <p>{selected.descripcion}</p>
                <div className="course-dialog__facts"><span><i className="far fa-clock" /> {selected.duracion}</span><span><i className="fas fa-display" /> {selected.modalidad}</span><span><i className="fas fa-users" /> {selected.publico}</span></div>
                <h3>Programa</h3>
                <ul className="course-dialog__topics">{getTopics(selected.temas).map(topic => <li key={topic}><i className="fas fa-check" /> {topic}</li>)}</ul>
                <div className="course-dialog__bottom"><div><small>Valor de muestra</small><strong>{formatPrice(selected.titulo)}</strong></div><button className="btn btn--primary" type="button" onClick={() => setStep('checkout')}>Inscribirme <i className="fas fa-arrow-right" /></button></div>
              </>
            ) : (
              <>
                <button type="button" className="course-dialog__back" onClick={() => setStep('detail')}><i className="fas fa-arrow-left" /> Volver al curso</button>
                <p className="section-header__tag">Inscripción</p>
                <h2>Resumen de compra</h2>
                <div className="checkout-summary"><span>{selected.titulo}</span><strong>{formatPrice(selected.titulo)}</strong></div>
                <div className="checkout-placeholder"><i className="fas fa-lock" /><h3>Pago en línea en preparación</h3><p>Esta es la vista previa del proceso de compra. Todavía no se solicitan datos de tarjeta ni se realizan cobros.</p></div>
                <Link to="/contacto" className="btn btn--primary btn--full" onClick={() => setSelected(null)}>Consultar por este curso</Link>
              </>
            )}
          </section>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </>
  )
}
