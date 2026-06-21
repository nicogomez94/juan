import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

const SERVICE_NAMES = {
  'auditoria-de-liquidacion': 'Auditoría de Liquidación',
  'internacion-domiciliaria': 'Internación Domiciliaria',
  'control-de-pacientes-diabeticos': 'Control de Pacientes Diabéticos',
  'asesoramiento-pre-judiciales': 'Asesoramiento Pre-Judiciales',
}

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

export default function Contacto() {
  const ref = useFadeIn()
  const [searchParams] = useSearchParams()
  const [contact, setContact] = useState({
    email: 'contacto@kadimasalud.com.ar',
    whatsapp: '5491100000000',
    instagram: 'KadimaSalud',
    facebook: 'KadimaSalud',
    direccion: 'Buenos Aires, Argentina',
    horario: 'Lunes a Viernes, 9:00 a 18:00',
  })

  const selectedService = SERVICE_NAMES[searchParams.get('servicio')]
  const d = DEBUG ? debugDefaults.contactForm : {}
  const [form, setForm] = useState({ nombre: d.nombre||'', apellido: d.apellido||'', email: d.email||'', celular: d.celular||'', consulta: d.consulta || (selectedService ? `Quisiera recibir información sobre ${selectedService}.` : '') })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/contact-info').then(r => { if (r.map) setContact(prev => ({ ...prev, ...r.map })) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedService) return

    setForm(current => {
      const isAutomaticMessage = current.consulta.startsWith('Quisiera recibir información sobre ')
      if (current.consulta && !isAutomaticMessage) return current
      return { ...current, consulta: `Quisiera recibir información sobre ${selectedService}.` }
    })
  }, [selectedService])

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

  return (
    <div ref={ref}>
      <Navbar />
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Estamos para ayudarte</p>
          <h1>Contacto</h1>
          <p>Completá el formulario o escribinos por cualquiera de nuestros canales</p>
        </div>
      </section>

      <section className="contacto">
        <div className="container">
          <div className="contacto__inner">
            <div className="contacto__info fade-in">
              <p className="section-header__tag">Hablemos</p>
              <h2>¿Cómo podemos ayudarte?</h2>
              <p>Completá el formulario con tu consulta y un integrante de nuestro equipo se comunicará a la brevedad.</p>
              <div className="contacto__channels">
                <a href={`mailto:${contact.email}`} className="contacto__channel">
                  <i className="fas fa-envelope" />
                  <div><strong>Email</strong><span>{contact.email}</span></div>
                </a>
                <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="contacto__channel">
                  <i className="fab fa-whatsapp" />
                  <div><strong>WhatsApp</strong><span>Respuesta rápida</span></div>
                </a>
                <a href={`https://instagram.com/${contact.instagram}`} target="_blank" rel="noopener noreferrer" className="contacto__channel">
                  <i className="fab fa-instagram" />
                  <div><strong>Instagram</strong><span>@{contact.instagram}</span></div>
                </a>
                <a href={`https://facebook.com/${contact.facebook}`} target="_blank" rel="noopener noreferrer" className="contacto__channel">
                  <i className="fab fa-facebook" />
                  <div><strong>Facebook</strong><span>{contact.facebook}</span></div>
                </a>
                {contact.direccion && (
                  <div className="contacto__channel">
                    <i className="fas fa-location-dot" />
                    <div><strong>Dirección</strong><span>{contact.direccion}</span></div>
                  </div>
                )}
                {contact.horario && (
                  <div className="contacto__channel">
                    <i className="fas fa-clock" />
                    <div><strong>Horario</strong><span>{contact.horario}</span></div>
                  </div>
                )}
              </div>
            </div>

            <div className="contacto__form-wrap fade-in">
              {sent ? (
                <div className="form__success" role="status" aria-live="polite">
                  <i className="fas fa-circle-check" />
                  <p>¡Gracias! Tu consulta fue enviada correctamente. Te contactaremos a la brevedad.</p>
                </div>
              ) : (
                <form className="contacto__form" onSubmit={submit} noValidate>
                  <div className="form__row form__row--two">
                    <div className="form__group"><label>Nombre</label><input name="nombre" value={form.nombre} onChange={handle} placeholder="Tu nombre" required /></div>
                    <div className="form__group"><label>Apellido</label><input name="apellido" value={form.apellido} onChange={handle} placeholder="Tu apellido" required /></div>
                  </div>
                  <div className="form__row form__row--two">
                    <div className="form__group"><label>Celular</label><input type="tel" name="celular" value={form.celular} onChange={handle} placeholder="+54 9 11 ..." required inputMode="tel" autoComplete="tel" /></div>
                    <div className="form__group"><label>Email</label><input type="email" name="email" value={form.email} onChange={handle} placeholder="tu@email.com" required /></div>
                  </div>
                  <div className="form__group"><label>Consulta</label><textarea name="consulta" value={form.consulta} onChange={handle} rows="5" placeholder="Contanos en qué podemos ayudarte..." required /></div>
                  {error && <p className="form__error" role="alert" aria-live="assertive">{error}</p>}
                  <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                    <i className="fas fa-paper-plane" /> {loading ? 'Enviando...' : 'Enviar consulta'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
