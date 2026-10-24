import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { api } from '../lib/api'
import { demoCourses } from '../lib/demoCourses'
import { DEBUG, debugDefaults } from '../lib/debugDefaults'
import {
  buildContactMessage,
  getContactFormValidationError,
  normalizeFullName,
  sendContactForm,
} from '../lib/contactForm'

function useFadeIn(dependencies = []) {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    const el = ref.current
    if (!el) return
    el.querySelectorAll('.fade-in').forEach(t => observer.observe(t))
    return () => el.querySelectorAll('.fade-in').forEach(t => observer.unobserve(t))
  }, dependencies)
  return ref
}

function ContactForm() {
  const d = DEBUG ? debugDefaults.contactForm : {}
  const [form, setForm] = useState({ nombre: d.nombre||'', apellido: d.apellido||'', email: d.email||'', celular: d.celular||'', consulta: d.consulta||'' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  async function submit(e) {
    e.preventDefault()
    const validationError = getContactFormValidationError(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      await sendContactForm({
        name: normalizeFullName(form.nombre, form.apellido),
        email: form.email.trim(),
        message: buildContactMessage({ celular: form.celular, consulta: form.consulta }),
      })
      setForm({ nombre: '', apellido: '', email: '', celular: '', consulta: '' })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la consulta.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="form__success" role="status" aria-live="polite">
      <i className="fas fa-check-circle" />
      <p>¡Gracias! Tu consulta fue enviada. Te contactamos pronto.</p>
    </div>
  )

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="form__row form__row--two">
        <div className="form__group"><label>Nombre</label><input name="nombre" value={form.nombre} onChange={handle} placeholder="Tu nombre" required /></div>
        <div className="form__group"><label>Apellido</label><input name="apellido" value={form.apellido} onChange={handle} placeholder="Tu apellido" required /></div>
      </div>
      <div className="form__row form__row--two">
        <div className="form__group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handle} placeholder="tu@email.com" required /></div>
        <div className="form__group"><label>Celular</label><input type="tel" name="celular" value={form.celular} onChange={handle} placeholder="+54 9 11 0000-0000" required inputMode="tel" autoComplete="tel" /></div>
      </div>
      <div className="form__group"><label>Consulta</label><textarea name="consulta" value={form.consulta} onChange={handle} rows="4" placeholder="Contanos en qué podemos ayudarte..." required /></div>
      {error && <p className="form__error" role="alert" aria-live="assertive">{error}</p>}
      <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  )
}

export default function Home() {
  const [contact, setContact] = useState({ email: 'contacto@kadimasalud.com.ar', whatsapp: '5491100000000', instagram: 'KadimaSalud' })
  const [featuredCourses, setFeaturedCourses] = useState(demoCourses.slice(0, 3))
  const [usingDemoCourses, setUsingDemoCourses] = useState(true)
  const ref = useFadeIn([featuredCourses])

  useEffect(() => {
    api.get('/api/contact-info').then(d => { if (d.map) setContact(prev => ({ ...prev, ...d.map })) }).catch(() => {})
    api.get('/api/capacitaciones').then(courses => {
      if (Array.isArray(courses) && courses.length) {
        setFeaturedCourses(courses.slice(0, 3))
        setUsingDemoCourses(false)
      }
    }).catch(() => {})
  }, [])

  return (
    <div ref={ref}>
      <Navbar />

      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="container home-hero__inner">
          <div className="home-hero__copy">
            <p className="home-hero__eyebrow">
              <span /> Kadima Salud · Consultoría integral
            </p>
            <h1 id="home-hero-title">
              Soluciones <span>en salud.</span>
            </h1>
            <p className="home-hero__lead">Acompañamos a obras sociales, prepagas e instituciones médicas con gestión, asesoramiento y formación especializados.</p>
            <div className="home-hero__actions">
              <a href="#servicios-destacados" className="btn btn--primary">
                Explorar servicios <i className="fas fa-arrow-right" aria-hidden="true" />
              </a>
              <Link to="/cursos" className="btn btn--outline">Ver cursos</Link>
            </div>
            <p className="home-hero__caption">Gestión · Formación · Acompañamiento</p>
          </div>
          <div className="home-hero__portrait" aria-hidden="true">
            <div className="home-hero__portrait-halo" />
            <img src="/kadima-hero-person.png" alt="" loading="eager" />
          </div>
        </div>
      </section>

      <section className="home-featured-services" id="servicios-destacados">
        <div className="container">
          <div className="home-section-heading fade-in">
            <div>
              <p className="section-header__tag">Lo que hacemos</p>
              <h2>Servicios destacados</h2>
            </div>
            <p>Soluciones concretas para la gestión de organizaciones de salud, con mirada técnica y atención cercana.</p>
          </div>
          <div className="home-featured-services__grid">
            {[
              { to: '/servicios/auditoria-de-liquidacion', icon: 'fa-file-medical', title: 'Auditoría de liquidación', desc: 'Revisión de prestaciones y procesos de facturación para dar claridad a cada etapa de la gestión.' },
              { to: '/surge', icon: 'fa-file-invoice-dollar', title: 'Presentaciones SURGE', desc: 'Gestión y seguimiento de expedientes de recupero de costos ante la Superintendencia de Servicios de Salud.' },
              { to: '/servicios/internacion-domiciliaria', icon: 'fa-house-medical', title: 'Internación domiciliaria', desc: 'Coordinación de atención en domicilio con seguimiento profesional y foco en la continuidad del cuidado.' },
            ].map(s => (
              <Link key={s.title} to={s.to} className="home-service-card fade-in">
                <div className="home-service-card__top">
                  <span className="home-service-card__icon">
                    <i className={`fas ${s.icon}`} aria-hidden="true" />
                  </span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="home-service-card__link">
                  Conocer servicio <i className="fas fa-arrow-right" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="home-featured-courses" id="cursos-destacados">
        <div className="container">
          <div className="home-section-heading fade-in">
            <div>
              <p className="section-header__tag">Formación para el sector</p>
              <h2>Cursos destacados</h2>
            </div>
            <p>Propuestas prácticas para profesionales y equipos que buscan ampliar herramientas de gestión en salud.</p>
          </div>
          <div className="home-featured-courses__grid">
            {featuredCourses.map(course => (
              <Link to={`/cursos?curso=${encodeURIComponent(course.id)}`} key={course.id} className="home-course-card fade-in">
                <div className="home-course-card__top">
                  <span className="home-course-card__icon">
                    <i className={`fas ${course.icono || 'fa-book-open'}`} aria-hidden="true" />
                  </span>
                  <span className="home-course-card__badge">{course.badge || 'Formación'}</span>
                </div>
                <h3>{course.titulo}</h3>
                <p>{course.descripcion}</p>
                <div className="home-course-card__bottom">
                  <span><i className="far fa-clock" aria-hidden="true" /> {course.duracion || 'Duración a confirmar'}</span>
                  <strong>Ver curso <i className="fas fa-arrow-right" aria-hidden="true" /></strong>
                </div>
              </Link>
            ))}
          </div>
          {usingDemoCourses && <p className="home-featured-courses__note">Oferta de muestra para esta vista previa.</p>}
          <div className="home-featured-courses__more fade-in">
            <Link to="/cursos" className="btn btn--outline">
              Explorar todos los cursos <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-section__inner fade-in">
            <div>
              <h2>¿Listo para optimizar tu gestión en salud?</h2>
              <p>Contanos tu caso y un especialista de Kadima Salud te responde en menos de 24 hs.</p>
            </div>
            <Link to="/contacto" className="btn btn--white btn--lg">Escribinos ahora</Link>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="contacto" id="contacto-home">
        <div className="container">
          <div className="contacto__inner">
            <div className="contacto__info fade-in">
              <span className="section-header__tag">Contacto</span>
              <h2>Hablemos de tu proyecto</h2>
              <p>Completá el formulario o escribinos por cualquiera de estos canales. Te respondemos a la brevedad.</p>
              <div className="contacto__channels">
                <a href={`mailto:${contact.email}`} className="contacto__channel"><i className="fas fa-envelope" /><div><strong>Email</strong><span>{contact.email}</span></div></a>
                <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="contacto__channel"><i className="fab fa-whatsapp" /><div><strong>WhatsApp</strong><span>Escribinos directamente</span></div></a>
                <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" className="contacto__channel"><i className="fab fa-instagram" /><div><strong>Instagram</strong><span>@{contact.instagram}</span></div></a>
              </div>
            </div>
            <div className="contacto__form-wrap fade-in"><ContactForm /></div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
