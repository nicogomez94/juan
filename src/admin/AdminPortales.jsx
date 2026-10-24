import { Link } from 'react-router-dom'
import { clinicalRecords, studentCourses } from '../lib/demoPortals'

export default function AdminPortales({ type }) {
  const isStudent = type === 'students'
  const title = isStudent ? 'Portal de estudiantes' : 'Portal de historias clínicas'
  const path = isStudent ? '/portal-estudiantes' : '/portal-historias-clinicas'

  return (
    <div>
      <div className="admin-section-header">
        <div><h2>{title}</h2><p className="admin-preview-subtitle">Vista previa de la sección para la aprobación del cliente</p></div>
        <Link className="btn btn--primary" to={path} target="_blank" rel="noopener noreferrer"><i className="fas fa-arrow-up-right-from-square" /> Ver portal</Link>
      </div>

      <div className="admin-preview-banner"><i className="fas fa-circle-info" /><div><strong>Contenido de demostración</strong><p>Los registros de esta pantalla son ficticios. El alta de usuarios, los permisos y la gestión de historias clínicas se incorporarán después de aprobar el diseño.</p></div></div>

      <div className="admin-preview-grid">
        {(isStudent ? [
          { value: '3', label: 'Cursos en la vista previa', icon: 'fa-book-open' },
          { value: '2', label: 'En progreso', icon: 'fa-chart-line' },
          { value: '1', label: 'Certificado de muestra', icon: 'fa-award' },
        ] : [
          { value: '3', label: 'Historias de muestra', icon: 'fa-file-medical' },
          { value: '1', label: 'Pendiente de revisión', icon: 'fa-clock' },
          { value: '2', label: 'Con seguimiento', icon: 'fa-shield-heart' },
        ]).map(stat => <div className="admin-preview-stat" key={stat.label}><i className={`fas ${stat.icon}`} /><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>{isStudent ? <tr><th>Curso de muestra</th><th>Próxima actividad</th><th>Avance</th><th>Estado</th></tr> : <tr><th>Identificador</th><th>Persona</th><th>Área</th><th>Actualización</th><th>Estado</th></tr>}</thead>
          <tbody>{isStudent ? studentCourses.map(course => <tr key={course.title}><td><strong>{course.title}</strong></td><td>{course.next}</td><td>{course.progress}%</td><td><span className="admin-table__badge admin-table__badge--teal">{course.status}</span></td></tr>) : clinicalRecords.map(record => <tr key={record.code}><td><strong>{record.code}</strong></td><td>{record.person}</td><td>{record.area}</td><td>{record.updated}</td><td><span className="admin-table__badge admin-table__badge--teal">{record.state}</span></td></tr>)}</tbody>
        </table>
      </div>
      {isStudent && <p className="admin-preview-help">Los cursos reales se editan en <Link to="/admin/capacitaciones">Capacitaciones</Link> y se publican en <Link to="/cursos" target="_blank" rel="noopener noreferrer">Cursos</Link>.</p>}
    </div>
  )
}
