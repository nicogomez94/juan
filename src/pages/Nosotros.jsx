import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { useSiteImages } from '../lib/siteImages'

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

export default function Nosotros() {
  const ref = useFadeIn()
  const { image } = useSiteImages()
  return (
    <div ref={ref}>
      <Navbar />
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Kadima Salud</p>
          <h1>Quiénes Somos</h1>
          <p>Consultora especializada en administración de salud con amplia trayectoria en el sector</p>
        </div>
      </section>

      <section className="nosotros">
        <div className="container nosotros__inner">
          <div className="nosotros__image fade-in">
            <img src={image('nosotros.intro.team').url} alt={image('nosotros.intro.team').alt} />
            <div className="nosotros__badge-float">
              <i className="fas fa-shield-heart" />
              <div><strong>Trayectoria</strong><span>en el sector salud</span></div>
            </div>
          </div>
          <div className="nosotros__content fade-in">
            <p className="section-header__tag">Nuestra Historia</p>
            <h2>Consultora especializada en administración de salud</h2>
            <p>Kadima Salud es una consultora con amplia trayectoria en el sector. Trabajamos junto a obras sociales, empresas de medicina prepaga, gerenciadoras y profesionales médicos para brindar soluciones concretas que mejoran la gestión y los resultados.</p>
            <p>Nuestra propuesta combina experiencia técnica, conocimiento regulatorio y vocación de servicio para acompañar a cada cliente en sus desafíos particulares.</p>
            <ul className="nosotros__features">
              {[
                { title: 'Experiencia comprobada en el sector salud', desc: 'Conocemos en profundidad la operatoria del sistema de salud argentino.' },
                { title: 'Equipo profesional especializado', desc: 'Profesionales con formación y experiencia específica en administración sanitaria.' },
                { title: 'Resultados medibles y concretos', desc: 'Cada intervención apunta a generar impacto real en la organización cliente.' },
              ].map(f => (
                <li key={f.title}>
                  <div className="nosotros__feature-icon"><i className="fas fa-check" /></div>
                  <div><strong>{f.title}</strong><span>{f.desc}</span></div>
                </li>
              ))}
            </ul>
            <Link to="/contacto" className="btn btn--primary">Hablar con un asesor</Link>
          </div>
        </div>
      </section>

      <section className="valores">
        <div className="container">
          <div className="section-header fade-in">
            <p className="section-header__tag">Nuestros Valores</p>
            <h2>Lo que nos define como equipo</h2>
            <p className="section-header__desc">Trabajamos con principios claros que guían cada decisión y cada relación con nuestros clientes.</p>
          </div>
          <div className="valores__grid">
            {[
              { icon: 'fa-handshake-angle', title: 'Compromiso', desc: 'Nos involucramos de forma genuina con los objetivos de cada cliente, asumiendo sus desafíos como propios.' },
              { icon: 'fa-magnifying-glass', title: 'Rigor técnico', desc: 'Aplicamos conocimiento especializado y criterio profesional en cada análisis y recomendación.' },
              { icon: 'fa-shield-halved', title: 'Integridad', desc: 'Actuamos con transparencia, honestidad y ética profesional en todas nuestras intervenciones.' },
              { icon: 'fa-lightbulb', title: 'Innovación', desc: 'Buscamos constantemente nuevas soluciones para responder a un sector salud en permanente evolución.' },
            ].map(v => (
              <div key={v.title} className="valores__card fade-in">
                <div className="valores__card-icon"><i className={`fas ${v.icon}`} /></div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="clientes">
        <div className="container">
          <div className="section-header section-header--light fade-in">
            <p className="section-header__tag">Nuestros Clientes</p>
            <h2>¿A quiénes acompañamos?</h2>
            <p className="section-header__desc">Trabajamos con diferentes actores del sistema de salud argentino.</p>
          </div>
          <div className="clientes__grid">
            {[
              { icon: 'fa-building-shield', title: 'Obras Sociales', desc: 'Sindicales, de personal de dirección y obras sociales provinciales que buscan optimizar su gestión.' },
              { icon: 'fa-hospital', title: 'Medicina Prepaga', desc: 'Empresas de medicina prepaga que requieren asesoramiento regulatorio y estratégico.' },
              { icon: 'fa-network-wired', title: 'Gerenciadoras', desc: 'Gerenciadoras de salud que necesitan apoyo en procesos administrativos y de presentación.' },
              { icon: 'fa-stethoscope', title: 'Instituciones Médicas', desc: 'Clínicas, sanatorios y centros de salud que buscan mejorar su relación con financiadores.' },
            ].map(c => (
              <div key={c.title} className="clientes__item fade-in">
                <i className={`fas ${c.icon}`} />
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-section__inner fade-in">
          <div><h2>¿Querés saber cómo podemos ayudarte?</h2><p>Contactanos y evaluamos juntos las necesidades de tu organización.</p></div>
          <Link to="/contacto" className="btn btn--white btn--lg">Hablar con el equipo</Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
