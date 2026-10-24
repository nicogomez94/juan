import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WhatsAppButton from '../components/WhatsAppButton'
import { studentActivities, studentCourses } from '../lib/demoPortals'

export default function PortalEstudiantes() {
  return (
    <>
      <Navbar />
      <section className="page-hero portal-hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">Campus Kadima</p>
          <h1>Portal de estudiantes</h1>
          <p>Un espacio para seguir tus cursos, consultar materiales y acceder a tus certificados.</p>
        </div>
      </section>
      <main className="portal-page">
        <div className="container">
          <div className="portal-preview-note"><i className="fas fa-circle-info" /><span>Vista previa con información ficticia. El registro y el inicio de sesión se incorporarán en la próxima etapa.</span></div>
          <div className="portal-welcome">
            <div><p className="section-header__tag">Mi espacio de aprendizaje</p><h2>Hola, estudiante de muestra</h2><p>Retomá tu formación y encontrá todo lo que necesitás para avanzar.</p></div>
            <Link to="/cursos" className="btn btn--primary">Explorar cursos <i className="fas fa-arrow-right" /></Link>
          </div>
          <div className="portal-stats">
            <div><strong>3</strong><span>Cursos en mi espacio</span></div>
            <div><strong>2</strong><span>En progreso</span></div>
            <div><strong>1</strong><span>Certificado disponible</span></div>
          </div>
          <div className="portal-columns">
            <section className="portal-panel">
              <div className="portal-panel__head"><div><p className="section-header__tag">Formación</p><h2>Mis cursos</h2></div><Link to="/cursos">Ver catálogo <i className="fas fa-arrow-right" /></Link></div>
              <div className="student-course-list">
                {studentCourses.map(course => (
                  <article className="student-course" key={course.title}>
                    <div className="student-course__head"><h3>{course.title}</h3><span>{course.status}</span></div>
                    <p>{course.next}</p>
                    <div className="student-course__progress"><span style={{ width: `${course.progress}%` }} /></div>
                    <small>{course.progress}% completado</small>
                  </article>
                ))}
              </div>
            </section>
            <section className="portal-panel">
              <div className="portal-panel__head"><div><p className="section-header__tag">Agenda</p><h2>Próximas actividades</h2></div></div>
              <div className="portal-activity-list">
                {studentActivities.map(activity => <div className="portal-activity" key={activity.title}><span>{activity.date}</span><div><strong>{activity.title}</strong><small>{activity.course}</small></div></div>)}
              </div>
              <div className="portal-panel__callout"><i className="fas fa-award" /><div><strong>Certificados en un solo lugar</strong><p>Al completar cada curso podrás consultar y descargar tus constancias desde este portal.</p></div></div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
