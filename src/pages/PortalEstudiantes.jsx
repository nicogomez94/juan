import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PortalShell from "../components/PortalShell";
import { downloadPrivate, portalRequest } from "../lib/portalApi";

const demoEnrollments = [
  {
    id: "demo-1",
    progress: 36,
    course: {
      id: "demo-course",
      title: "Gestión farmacéutica para obras sociales",
      description:
        "Herramientas para la evaluación y gestión de prestaciones farmacéuticas.",
      duration: "8 semanas",
      modules: [
        {
          id: "demo-module-1",
          title: "Introducción a la gestión farmacéutica",
          description: "Marco operativo, criterios y documentación.",
          startsAt: "2026-11-03T17:00:00",
          meetingUrl: "https://meet.google.com/",
          resources: [
            {
              id: "demo-resource-1",
              title: "Guía de la unidad",
              filename: "guia-unidad.pdf",
            },
          ],
        },
        {
          id: "demo-module-2",
          title: "Auditoría y evaluación de casos",
          description: "Lectura de casos y criterios de seguimiento.",
          startsAt: "2026-11-10T17:00:00",
          meetingUrl: "https://zoom.us/",
          resources: [
            {
              id: "demo-resource-2",
              title: "Bibliografía complementaria",
              filename: "bibliografia.pdf",
            },
          ],
        },
      ],
    },
  },
];

function dateLabel(value) {
  if (!value) return "Fecha a confirmar";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StudentDashboard({ demo }) {
  const [enrollments, setEnrollments] = useState(demo ? demoEnrollments : []);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!demo)
      portalRequest("/student/dashboard")
        .then((data) => setEnrollments(data.enrollments))
        .catch((err) => setError(err.message));
  }, [demo]);
  const agenda = useMemo(
    () =>
      enrollments
        .flatMap(({ course }) =>
          course.modules.map((module) => ({ ...module, course: course.title })),
        )
        .filter((item) => item.startsAt)
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
    [enrollments],
  );
  async function download(id) {
    try {
      await downloadPrivate(`/student/resources/${id}`);
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <>
      {error && (
        <p className="portal-error" role="alert">
          {error}
        </p>
      )}
      <div className="portal-metrics">
        <div>
          <i className="fas fa-book-open" />
          <strong>{enrollments.length}</strong>
          <span>Cursos asignados</span>
        </div>
        <div>
          <i className="fas fa-layer-group" />
          <strong>
            {enrollments.reduce(
              (count, item) => count + item.course.modules.length,
              0,
            )}
          </strong>
          <span>Módulos disponibles</span>
        </div>
        <div>
          <i className="fas fa-calendar-days" />
          <strong>{agenda.length}</strong>
          <span>Clases programadas</span>
        </div>
      </div>
      <div className="portal-workspace-grid">
        <section className="portal-section-card">
          <div className="portal-section-heading">
            <div>
              <span className="portal-kicker">Formación</span>
              <h3>Mis cursos y materiales</h3>
            </div>
            <Link to="/cursos">
              Ver catálogo <i className="fas fa-arrow-right" />
            </Link>
          </div>
          {enrollments.length === 0 && (
            <p className="portal-empty">
              Aún no tenés cursos asignados. Cuando Kadima te inscriba,
              aparecerán aquí.
            </p>
          )}
          {enrollments.map(({ id, progress, course }) => (
            <article className="portal-course" key={id}>
              <div className="portal-course-heading">
                <div>
                  <span className="portal-pill">Curso activo</span>
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                </div>
                <span className="portal-course-duration">
                  {course.duration}
                </span>
              </div>
              <div className="portal-progress">
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>{progress}% de avance</small>
              <div className="portal-module-list">
                {course.modules.map((module) => (
                  <div className="portal-module" key={module.id}>
                    <div className="portal-module-icon">
                      <i className="fas fa-file-lines" />
                    </div>
                    <div>
                      <h5>{module.title}</h5>
                      <p>{module.description}</p>
                      <small>{dateLabel(module.startsAt)}</small>
                      {module.resources.map((resource) => (
                        <button
                          key={resource.id}
                          className="portal-inline-action"
                          disabled={demo}
                          title={
                            demo
                              ? "Disponible con acceso privado"
                              : "Descargar material"
                          }
                          onClick={() => download(resource.id)}
                        >
                          <i className="fas fa-download" /> {resource.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
        <aside className="portal-section-card portal-agenda">
          <div className="portal-section-heading">
            <div>
              <span className="portal-kicker">Agenda</span>
              <h3>Próximas clases</h3>
            </div>
          </div>
          {agenda.length === 0 && (
            <p className="portal-empty">
              Las próximas fechas se publicarán aquí.
            </p>
          )}
          {agenda.map((module) => (
            <div className="portal-agenda-item" key={module.id}>
              <span className="portal-agenda-dot" />
              <div>
                <strong>{module.title}</strong>
                <small>{module.course}</small>
                <time>{dateLabel(module.startsAt)}</time>
                {module.meetingUrl &&
                  (demo ? (
                    <span className="portal-demo-link">
                      Enlace de clase de ejemplo
                    </span>
                  ) : (
                    <a
                      href={module.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ingresar a la clase{" "}
                      <i className="fas fa-arrow-up-right-from-square" />
                    </a>
                  ))}
              </div>
            </div>
          ))}
          <div className="portal-help-box">
            <i className="fas fa-circle-question" />
            <p>
              Tu docente puede actualizar fechas, enlaces y bibliografía desde
              el panel de Kadima.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export default function PortalEstudiantes() {
  return (
    <PortalShell
      role="STUDENT"
      eyebrow="Campus Kadima"
      title="Portal de estudiantes"
      intro="Cursos, bibliografía y encuentros en un solo lugar."
    >
      {(props) => <StudentDashboard {...props} />}
    </PortalShell>
  );
}
