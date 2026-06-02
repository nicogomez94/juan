import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { api } from '../lib/api'
import { DEBUG, debugDefaults } from '../lib/debugDefaults'
import {
  buildContactMessage,
  getContactFormValidationError,
  normalizeFullName,
  sendContactForm,
} from '../lib/contactForm'
import { useSiteImages } from '../lib/siteImages'
import popupImage from '../../image.png'

function useFadeIn() {
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
  }, [])
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
    <div className="form__success">
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
      {error && <p className="form__error" role="alert">{error}</p>}
      <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  )
}

export default function Home() {
  const ref = useFadeIn()
  const { image } = useSiteImages()
  const [contact, setContact] = useState({ email: 'contacto@kadimasalud.com.ar', whatsapp: '5491100000000', instagram: 'KadimaSalud' })
  const [showLightbox, setShowLightbox] = useState(true)

  useEffect(() => {
    api.get('/api/contact-info').then(d => { if (d.map) setContact(prev => ({ ...prev, ...d.map })) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!showLightbox) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e) {
      if (e.key === 'Escape') setShowLightbox(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showLightbox])

  return (
    <div ref={ref}>
      <Navbar />

      {showLightbox && (
        <div className="home-lightbox" role="presentation" onClick={() => setShowLightbox(false)}>
          <div className="home-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Promoción destacada" onClick={e => e.stopPropagation()}>
            <button type="button" className="home-lightbox__close" aria-label="Cerrar popup" onClick={() => setShowLightbox(false)}>
              <i className="fas fa-times" aria-hidden="true" />
            </button>
            <img src={popupImage} alt="Promoción destacada de Kadima Salud" className="home-lightbox__image" />
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="container hero__inner">
          <div className="hero__content fade-in">
            <span className="hero__badge"><i className="fas fa-star" /> Expertos en Administración de Salud</span>
            <h1 className="hero__title">Soluciones estratégicas para el <span className="hero__highlight">sector salud</span></h1>
            <p className="hero__subtitle">Acompañamos a obras sociales, prepagas, gerenciadoras e instituciones médicas con asesoramiento profesional, capacitaciones especializadas y recupero de costos ante la Superintendencia.</p>
            <div className="hero__actions">
              <Link to="/contacto" className="btn btn--primary btn--lg">Consultar ahora</Link>
              <Link to="/nosotros" className="btn btn--outline btn--lg">Conocer más</Link>
            </div>
            <div className="hero__trust">
              <div className="hero__trust-item"><i className="fas fa-check-circle" /><span>Obras sociales</span></div>
              <div className="hero__trust-item"><i className="fas fa-check-circle" /><span>Medicina prepaga</span></div>
              <div className="hero__trust-item"><i className="fas fa-check-circle" /><span>Instituciones médicas</span></div>
            </div>
          </div>
          <div className="hero__visual fade-in">
            <div className="hero__collage">
              <div className="hero__collage-item hero__collage-item--large">
                <img src={image('home.hero.main').url} alt={image('home.hero.main').alt} />
              </div>
              <div className="hero__collage-item">
                <img src={image('home.hero.secondary').url} alt={image('home.hero.secondary').alt} />
              </div>
              <div className="hero__collage-item">
                <img src={image('home.hero.training').url} alt={image('home.hero.training').alt} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-strip">
        <div className="container stats-strip__grid">
          {[{n:'+15',l:'Años de experiencia'},{n:'+200',l:'Instituciones asesoradas'},{n:'+1.000',l:'Profesionales capacitados'},{n:'100%',l:'Compromiso con resultados'}].map(s => (
            <div key={s.n} className="stats-strip__item fade-in">
              <span className="stats-strip__number">{s.n}</span>
              <span className="stats-strip__label">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="servicios">
        <div className="container">
          <div className="section-header section-header--light fade-in">
            <p className="section-header__tag">Nuestros Servicios</p>
            <h2>Soluciones integrales para el sector salud</h2>
            <p className="section-header__desc">Trabajamos con obras sociales, empresas de medicina prepaga, gerenciadoras e instituciones médicas para optimizar su gestión y resultados.</p>
          </div>
          <div className="servicios__grid">
            {[
              { to: '/capacitaciones', icon: 'fa-graduation-cap', title: 'Capacitaciones en Salud', desc: 'Formación especializada para profesionales del sector con certificación incluida, en modalidad presencial o virtual.', cta: 'Ver capacitaciones' },
              { to: '/surge', icon: 'fa-file-invoice-dollar', title: 'Presentaciones SURGE', desc: 'Recupero de costos ante la Superintendencia de Servicios de Salud. Gestión completa y seguimiento de expedientes.', cta: 'Ver servicio' },
              { to: '/equipos', icon: 'fa-stethoscope', title: 'Equipos Médicos', desc: 'Profesionales y equipos de cirugía organizados por especialidad para cubrir necesidades de cada institución.', cta: 'Ver especialidades' },
              { to: '/nosotros', icon: 'fa-chart-line', title: 'Consultoría Estratégica', desc: 'Asesoramiento integral en administración de salud para optimizar procesos, costos y calidad de prestaciones.', cta: 'Conocer más' },
              { to: '/nosotros', icon: 'fa-building-shield', title: 'Gestión de Obras Sociales', desc: 'Acompañamiento en la administración eficiente de prestaciones y relación con financiadores del sistema.', cta: 'Conocer más' },
              { to: '/contacto', icon: 'fa-handshake', title: 'Alianzas Comerciales', desc: 'Articulación entre instituciones, prepagas y financiadores para construir relaciones de valor en salud.', cta: 'Consultar' },
            ].map(s => (
              <Link key={s.title} to={s.to} className="servicios__card servicios__card--link fade-in">
                <div className="servicios__card-icon"><i className={`fas ${s.icon}`} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="servicios__card-cta">{s.cta} <i className="fas fa-arrow-right" /></span>
              </Link>
            ))}
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
