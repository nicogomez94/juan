import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PortalShell from "../components/PortalShell";
import { api } from "../lib/api";
import {
  downloadExample,
  downloadPrivate,
  portalRequest,
} from "../lib/portalApi";

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
              mimeType: "application/pdf",
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
              mimeType: "application/pdf",
            },
          ],
        },
      ],
    },
  },
];

const demoNews = [
  {
    id: "demo-news-1",
    slug: "gestion-sanitaria",
    categoria: "Gestión",
    titulo: "Claves para una gestión sanitaria eficiente",
    resumen: "Indicadores y criterios para ordenar decisiones operativas.",
  },
  {
    id: "demo-news-2",
    slug: "auditoria-medica",
    categoria: "Auditoría",
    titulo: "Documentación y trazabilidad en auditoría médica",
    resumen: "Buenas prácticas para trabajar con información completa.",
  },
];

function dateLabel(value) {
  if (!value) return "Fecha a confirmar";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function fileType(resource) {
  if (resource.mimeType?.includes("pdf")) return "PDF";
  if (resource.mimeType?.includes("image")) return "Imagen";
  return "Archivo";
}

function StudentDashboard({ demo }) {
  const [enrollments, setEnrollments] = useState(demo ? demoEnrollments : []);
  const [news, setNews] = useState(demo ? demoNews : []);
  const [selectedCourseId, setSelectedCourseId] = useState(
    demo ? String(demoEnrollments[0].course.id) : "",
  );
  const [selectedModuleId, setSelectedModuleId] = useState(
    demo ? String(demoEnrollments[0].course.modules[0].id) : "",
  );
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState("");

  useEffect(() => {
    if (demo) return undefined;
    let active = true;
    Promise.all([
      portalRequest("/student/dashboard"),
      api.get("/api/blog?limit=3").catch(() => []),
    ])
      .then(([dashboard, posts]) => {
        if (!active) return;
        setEnrollments(dashboard.enrollments);
        setNews(posts);
        const firstCourse = dashboard.enrollments[0]?.course;
        if (firstCourse) {
          setSelectedCourseId(String(firstCourse.id));
          setSelectedModuleId(String(firstCourse.modules[0]?.id || ""));
        }
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [demo]);

  const activeEnrollment = useMemo(
    () =>
      enrollments.find(
        ({ course }) => String(course.id) === selectedCourseId,
      ) || enrollments[0],
    [enrollments, selectedCourseId],
  );
  const activeCourse = activeEnrollment?.course;
  const activeModule = useMemo(
    () =>
      activeCourse?.modules.find(
        (module) => String(module.id) === selectedModuleId,
      ) || activeCourse?.modules[0],
    [activeCourse, selectedModuleId],
  );
  const agenda = useMemo(
    () =>
      enrollments
        .flatMap(({ course }) =>
          course.modules.map((module) => ({
            ...module,
            course: course.title,
          })),
        )
        .filter(
          (item) =>
            item.startsAt && new Date(item.startsAt).getTime() >= Date.now(),
        )
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
    [enrollments],
  );
  const resourceCount = useMemo(
    () =>
      enrollments.reduce(
        (total, { course }) =>
          total +
          course.modules.reduce(
            (moduleTotal, module) =>
              moduleTotal + module.resources.length,
            0,
          ),
        0,
      ),
    [enrollments],
  );

  function selectCourse(course) {
    setSelectedCourseId(String(course.id));
    setSelectedModuleId(String(course.modules[0]?.id || ""));
  }

  async function download(resource) {
    try {
      if (demo) await downloadExample(resource.filename);
      else await downloadPrivate(`/student/resources/${resource.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="student-loading" role="status">
        <span />
        <p>Preparando tu campus…</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="portal-error" role="alert">
          {error}
        </p>
      )}

      <div className="portal-metrics student-metrics">
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
          <span>Módulos publicados</span>
        </div>
        <div>
          <i className="fas fa-folder-open" />
          <strong>{resourceCount}</strong>
          <span>Materiales disponibles</span>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <section className="portal-section-card student-empty-state">
          <i className="fas fa-graduation-cap" />
          <h3>Todavía no tenés cursos asignados</h3>
          <p>
            Cuando el equipo de Kadima confirme tu inscripción, el curso, las
            fechas y la bibliografía aparecerán en este espacio.
          </p>
          <Link to="/contacto" className="btn btn--primary">
            Consultar inscripción
          </Link>
        </section>
      ) : (
        <>
          <section className="student-campus-head">
            <div>
              <span className="portal-kicker">Campus académico</span>
              <h3>{activeCourse.title}</h3>
              <p>{activeCourse.description}</p>
            </div>
            <div className="student-campus-progress">
              <div>
                <span>Avance general</span>
                <strong>{activeEnrollment.progress}%</strong>
              </div>
              <div
                className="portal-progress"
                role="progressbar"
                aria-label={`Avance de ${activeCourse.title}`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={activeEnrollment.progress}
              >
                <span style={{ width: `${activeEnrollment.progress}%` }} />
              </div>
              <small>
                <i className="fas fa-clock" /> {activeCourse.duration}
              </small>
            </div>
          </section>

          {enrollments.length > 1 && (
            <nav className="student-course-switcher" aria-label="Mis cursos">
              {enrollments.map(({ course }) => (
                <button
                  type="button"
                  key={course.id}
                  className={
                    String(course.id) === String(activeCourse.id)
                      ? "is-active"
                      : ""
                  }
                  onClick={() => selectCourse(course)}
                >
                  <i className="fas fa-book" />
                  {course.title}
                </button>
              ))}
            </nav>
          )}

          <div className="student-campus-grid">
            <aside className="student-module-nav">
              <div className="student-panel-title">
                <div>
                  <span className="portal-kicker">Programa</span>
                  <h3>Módulos</h3>
                </div>
                <span>{activeCourse.modules.length}</span>
              </div>
              {activeCourse.modules.length === 0 ? (
                <p className="portal-empty">
                  El programa se publicará cuando Kadima confirme los módulos.
                </p>
              ) : (
                activeCourse.modules.map((module, index) => (
                  <button
                    type="button"
                    key={module.id}
                    className={`student-module-nav__item ${
                      String(module.id) === String(activeModule?.id)
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() => setSelectedModuleId(String(module.id))}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <strong>{module.title}</strong>
                      <small>{dateLabel(module.startsAt)}</small>
                    </div>
                    <i className="fas fa-chevron-right" />
                  </button>
                ))
              )}
            </aside>

            <section className="student-module-detail">
              {activeModule ? (
                <>
                  <header>
                    <div>
                      <span className="portal-pill">Módulo seleccionado</span>
                      <h3>{activeModule.title}</h3>
                      <p>
                        {activeModule.description ||
                          "El equipo docente publicará aquí la información del módulo."}
                      </p>
                    </div>
                    <div className="student-class-date">
                      <i className="fas fa-calendar-check" />
                      <span>Próximo encuentro</span>
                      <strong>{dateLabel(activeModule.startsAt)}</strong>
                    </div>
                  </header>

                  <div className="student-module-actions">
                    {activeModule.meetingUrl ? (
                      demo ? (
                        <span className="student-meeting-button is-disabled">
                          <i className="fas fa-video" /> Enlace disponible al
                          confirmar
                        </span>
                      ) : (
                        <a
                          className="student-meeting-button"
                          href={activeModule.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="fas fa-video" /> Ingresar a la clase
                          <i className="fas fa-arrow-up-right-from-square" />
                        </a>
                      )
                    ) : (
                      <span className="student-meeting-button is-disabled">
                        <i className="fas fa-video-slash" /> Enlace a confirmar
                      </span>
                    )}
                  </div>

                  <div className="student-library">
                    <div className="student-panel-title">
                      <div>
                        <span className="portal-kicker">Biblioteca</span>
                        <h4>Material del módulo</h4>
                      </div>
                      <span>{activeModule.resources.length}</span>
                    </div>
                    {activeModule.resources.length === 0 ? (
                      <p className="portal-empty">
                        Todavía no hay bibliografía publicada para este módulo.
                      </p>
                    ) : (
                      <div className="student-resource-grid">
                        {activeModule.resources.map((resource) => (
                          <button
                            type="button"
                            key={resource.id}
                            className="student-resource"
                            onClick={() => download(resource)}
                          >
                            <span>
                              <i className="fas fa-file-pdf" />
                            </span>
                            <div>
                              <strong>{resource.title}</strong>
                              <small>
                                {fileType(resource)} · {resource.filename}
                              </small>
                            </div>
                            <i className="fas fa-download" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="student-module-placeholder">
                  <i className="fas fa-list-check" />
                  <h3>Programa en preparación</h3>
                  <p>
                    Kadima está organizando las fechas y materiales de este
                    curso.
                  </p>
                </div>
              )}
            </section>

            <aside className="student-agenda-panel">
              <div className="student-panel-title">
                <div>
                  <span className="portal-kicker">Agenda</span>
                  <h3>Próximas clases</h3>
                </div>
                <i className="fas fa-calendar-days" />
              </div>
              {agenda.length === 0 ? (
                <p className="portal-empty">
                  Las próximas fechas se publicarán aquí.
                </p>
              ) : (
                agenda.slice(0, 4).map((module, index) => (
                  <div className="student-agenda-row" key={module.id}>
                    <time>
                      <strong>
                        {new Intl.DateTimeFormat("es-AR", {
                          day: "2-digit",
                        }).format(new Date(module.startsAt))}
                      </strong>
                      <span>
                        {new Intl.DateTimeFormat("es-AR", {
                          month: "short",
                        }).format(new Date(module.startsAt))}
                      </span>
                    </time>
                    <div>
                      {index === 0 && <em>Próxima</em>}
                      <strong>{module.title}</strong>
                      <small>{module.course}</small>
                      <span>{dateLabel(module.startsAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </aside>
          </div>
        </>
      )}

      <section className="student-news">
        <div className="portal-section-heading">
          <div>
            <span className="portal-kicker">Actualización profesional</span>
            <h3>Lecturas recomendadas</h3>
          </div>
          <Link to="/blog">
            Ver todos los contenidos <i className="fas fa-arrow-right" />
          </Link>
        </div>
        {news.length === 0 ? (
          <p className="portal-empty">No hay contenidos publicados todavía.</p>
        ) : (
          <div className="student-news-grid">
            {news.map((post) => (
              <Link to={`/blog/${post.slug}`} key={post.id}>
                <span>{post.categoria || "Actualidad"}</span>
                <h4>{post.titulo}</h4>
                <p>{post.resumen}</p>
                <strong>
                  Leer artículo <i className="fas fa-arrow-right" />
                </strong>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function PortalEstudiantes() {
  return (
    <PortalShell role="STUDENT" title="Portal de estudiantes">
      {(props) => <StudentDashboard {...props} />}
    </PortalShell>
  );
}
