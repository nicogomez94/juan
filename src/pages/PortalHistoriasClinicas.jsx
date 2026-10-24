import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { clinicalActivity, clinicalRecords } from '../lib/demoPortals'

export default function PortalHistoriasClinicas() {
  return (
    <>
      <Navbar />
      <section className="page-hero portal-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Gestión institucional</p>
          <h1>Portal de historias clínicas</h1>
          <p>Una vista organizada para el seguimiento documental de obras sociales e instituciones de salud.</p>
        </div>
      </section>
      <main className="portal-page portal-page--clinical">
        <div className="container">
          <div className="portal-preview-note"><i className="fas fa-shield-halved" /><span>Demostración con datos ficticios. El acceso privado y la carga de documentación clínica se habilitarán en una etapa posterior.</span></div>
          <div className="portal-welcome">
            <div><p className="section-header__tag">Panel institucional</p><h2>Seguimiento de historias clínicas</h2><p>Organizá documentación, revisiones y estados de cada caso desde un mismo espacio.</p></div>
            <Link to="/contacto" className="btn btn--primary">Solicitar información <i className="fas fa-arrow-right" /></Link>
          </div>
          <div className="portal-stats">
            <div><strong>3</strong><span>Historias de muestra</span></div>
            <div><strong>1</strong><span>Pendiente de revisión</span></div>
            <div><strong>2</strong><span>Con seguimiento</span></div>
          </div>
          <div className="portal-columns portal-columns--clinical">
            <section className="portal-panel">
              <div className="portal-panel__head"><div><p className="section-header__tag">Documentación</p><h2>Historias clínicas</h2></div><span className="portal-panel__muted">Datos de demostración</span></div>
              <div className="clinical-table-wrap">
                <table className="clinical-table">
                  <thead><tr><th>Identificador</th><th>Persona</th><th>Área</th><th>Actualización</th><th>Estado</th></tr></thead>
                  <tbody>{clinicalRecords.map(record => <tr key={record.code}><td><strong>{record.code}</strong></td><td>{record.person}</td><td>{record.area}</td><td>{record.updated}</td><td><span className="clinical-status">{record.state}</span></td></tr>)}</tbody>
                </table>
              </div>
            </section>
            <section className="portal-panel">
              <div className="portal-panel__head"><div><p className="section-header__tag">Circuito de trabajo</p><h2>Etapas de gestión</h2></div></div>
              <ol className="clinical-steps">{clinicalActivity.map((step, index) => <li key={step}><span>{index + 1}</span><strong>{step}</strong></li>)}</ol>
              <div className="portal-panel__callout"><i className="fas fa-lock" /><div><strong>Acceso reservado</strong><p>La versión definitiva contemplará perfiles autorizados y resguardo de la información clínica.</p></div></div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
