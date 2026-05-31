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

export default function Surge() {
  const ref = useFadeIn()
  const { image } = useSiteImages()
  return (
    <div ref={ref}>
      <Navbar />
      <section className="page-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Recupero de costos</p>
          <h1>Presentaciones SURGE</h1>
          <p>Gestión integral de expedientes ante la Superintendencia de Servicios de Salud de la Nación</p>
        </div>
      </section>

      <section className="surge-intro">
        <div className="container surge-intro__inner">
          <div className="surge-intro__content fade-in">
            <p className="section-header__tag">¿Qué es SURGE?</p>
            <h2>Recuperá costos por prestaciones de alto costo</h2>
            <p>El SURGE (Sistema Único de Reintegro) es el mecanismo de la Superintendencia de Servicios de Salud de la Nación que permite a las obras sociales y prepagas recuperar los costos de prestaciones de alto costo y baja incidencia.</p>
            <p>En Kadima Salud nos especializamos en gestionar estas presentaciones de forma integral: identificamos los casos elegibles, armamos los expedientes, los presentamos ante la SSS y hacemos el seguimiento hasta la resolución.</p>
            <Link to="/contacto" className="btn btn--primary btn--lg">Evaluar mi organización</Link>
          </div>
          <div className="surge-intro__visual fade-in">
            <img src={image('surge.intro.documents').url} alt={image('surge.intro.documents').alt} />
          </div>
        </div>
      </section>

      <section className="surge-proceso">
        <div className="container">
          <div className="section-header fade-in">
            <p className="section-header__tag">Nuestro proceso</p>
            <h2>Cómo gestionamos tu presentación</h2>
            <p className="section-header__desc">Un proceso ordenado y transparente, desde la identificación de casos hasta el cobro del reintegro.</p>
          </div>
          <div className="proceso__steps">
            {[
              { n: '01', title: 'Diagnóstico inicial', desc: 'Analizamos el historial de prestaciones de tu organización para identificar los casos elegibles para presentación ante la SSS.' },
              { n: '02', title: 'Armado del expediente', desc: 'Recopilamos y organizamos toda la documentación clínica y administrativa requerida por la normativa vigente de la Superintendencia.' },
              { n: '03', title: 'Presentación ante la SSS', desc: 'Realizamos la presentación formal del expediente ante la Superintendencia de Servicios de Salud, cumpliendo todos los requisitos del sistema.' },
              { n: '04', title: 'Seguimiento y resolución', desc: 'Monitoreamos el estado de cada expediente presentado e informamos los avances hasta obtener la resolución y el reintegro.' },
            ].map(s => (
              <div key={s.n} className="proceso__step fade-in">
                <div className="proceso__step-num">{s.n}</div>
                <div className="proceso__step-content"><h3>{s.title}</h3><p>{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surge">
        <div className="container surge__inner">
          <div className="surge__content fade-in">
            <p className="section-header__tag section-header__tag--light">¿Por qué elegirnos?</p>
            <h2>Gestión profesional de <span className="surge__brand">SURGE</span></h2>
            <p className="surge__subtitle">Experiencia comprobada en presentaciones ante la Superintendencia</p>
            <p>Nuestro equipo cuenta con conocimiento profundo de los requisitos de la SSS y experiencia práctica en la gestión de expedientes SURGE. Maximizamos las chances de aprobación y agilizamos cada etapa del proceso.</p>
            <div className="surge__features">
              {[
                { icon: 'fa-folder-open', title: 'Armado completo del expediente', desc: 'Preparación y organización de toda la documentación requerida por la SSS.' },
                { icon: 'fa-magnifying-glass-chart', title: 'Seguimiento profesional', desc: 'Control y seguimiento de cada expediente hasta la resolución final.' },
                { icon: 'fa-scale-balanced', title: 'Cumplimiento normativo', desc: 'Gestión alineada a los requisitos de la SSS y normativa vigente.' },
              ].map(f => (
                <div key={f.title} className="surge__feature">
                  <div className="surge__feature-icon"><i className={`fas ${f.icon}`} /></div>
                  <div><strong>{f.title}</strong><p>{f.desc}</p></div>
                </div>
              ))}
            </div>
            <Link to="/contacto" className="btn btn--white btn--lg">Consultar por SURGE</Link>
          </div>
          <div className="surge__visual fade-in">
            <div className="surge__stats-card">
              {[
                { icon: 'fa-file-circle-check', title: 'Expedientes gestionados', desc: 'Trayectoria comprobada en presentaciones exitosas ante la SSS' },
                { icon: 'fa-clock-rotate-left', title: 'Seguimiento continuo', desc: 'Monitoreo permanente del estado de cada expediente' },
                { icon: 'fa-shield-check', title: 'Equipo especializado', desc: 'Profesionales con experiencia en regulación del sistema de salud' },
              ].map(s => (
                <div key={s.title} className="surge__stat">
                  <i className={`fas ${s.icon}`} />
                  <div><strong>{s.title}</strong><span>{s.desc}</span></div>
                </div>
              ))}
              <div className="surge__cta-box">
                <p>¿Tu organización tiene costos recuperables ante la SSS?</p>
                <Link to="/contacto" className="btn btn--primary">Evaluar mi caso</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
