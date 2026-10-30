import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { api } from '../lib/api'

export default function EquipoDetalle() {
  const { id } = useParams()
  const [equipo, setEquipo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    api.get(`/api/equipos/${id}`)
      .then(data => {
        setEquipo(data)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [id])

  return (
    <div>
      <Navbar />
      <main className="equipo-detail">
        {loading && (
          <div className="container equipo-detail__loading">
            <div className="skeleton" style={{ height: 28, width: 180 }} />
            <div className="skeleton" style={{ height: 58, width: '70%' }} />
            <div className="skeleton" style={{ height: 320 }} />
          </div>
        )}

        {error && (
          <div className="container page-error equipo-detail__error">
            <i className="fas fa-stethoscope" />
            <p>No encontramos el equipo solicitado.</p>
            <Link to="/equipos" className="btn btn--primary">Volver a equipos médicos</Link>
          </div>
        )}

        {equipo && (
          <>
            <section className="equipo-detail__hero">
              <div className="container equipo-detail__hero-inner">
                <div className="equipo-detail__heading">
                  <Link to="/equipos" className="equipo-detail__back">
                    <i className="fas fa-arrow-left" /> Equipos médicos
                  </Link>
                  <p className="section-header__tag section-header__tag--light">Red de profesionales</p>
                  <h1>{equipo.nombre}</h1>
                  <p>{equipo.descripcion}</p>
                </div>
                {equipo.imagen && (
                  <div className="equipo-detail__image">
                    <img src={equipo.imagen} alt={equipo.nombre} />
                  </div>
                )}
              </div>
            </section>

            <section className="equipo-detail__body-section">
              <div className="container equipo-detail__layout">
                <article
                  className="equipo-detail__content"
                  dangerouslySetInnerHTML={{ __html: equipo.contenido || `<p>${equipo.descripcion}</p>` }}
                />
                <aside className="equipo-detail__aside">
                  <div className="equipo-detail__aside-icon"><i className="fas fa-hospital-user" /></div>
                  <h2>Consultá disponibilidad</h2>
                  <p>Contanos qué necesita tu institución para coordinar el equipo adecuado.</p>
                  <Link to="/contacto" className="btn btn--primary">Hablar con Kadima</Link>
                </aside>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
