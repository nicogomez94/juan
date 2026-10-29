import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminPortalRequest, downloadPrivate } from "../lib/portalApi";
import PortalModal from "../components/PortalModal";
import "../portal.css";

const request = (path, method = "GET", data) =>
  adminPortalRequest(path, {
    method,
    ...(data === undefined
      ? {}
      : { body: data instanceof FormData ? data : JSON.stringify(data) }),
  });
const statuses = {
  REQUESTED: "Pedido recibido",
  QUOTING: "En cotización",
  QUOTES_READY: "Cotizaciones publicadas",
  AUTHORIZED: "Autorización recibida",
  CLOSED: "Cerrado",
};
const types = { MEDICATION: "Medicamento", PROSTHESIS: "Prótesis" };
const fileLabels = {
  MEDICAL_ORDER: "Pedido médico",
  QUOTE: "Cotización",
  AUTHORIZATION: "Autorización",
};
const localDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("sv-SE").replace(" ", "T").slice(0, 16)
    : "";

function AccountEditor({ user, save }) {
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    save(user.id, { ...data, active: user.active });
    form.reset();
  }
  return (
    <details className="admin-inline-editor">
      <summary>Editar acceso</summary>
      <form className="admin-portal-form" onSubmit={submit}>
        <input
          name="name"
          defaultValue={user.name}
          required
          minLength="3"
          aria-label="Nombre"
        />
        <input
          name="email"
          type="email"
          defaultValue={user.email}
          required
          aria-label="Email"
        />
        <input
          name="password"
          type="password"
          minLength="10"
          placeholder="Nueva contraseña (opcional)"
          aria-label="Nueva contraseña"
        />
        <button className="portal-text-button">Guardar cambios</button>
      </form>
    </details>
  );
}

function ModuleEditor({ module, save }) {
  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    save(module.id, {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : "",
      order: Number(data.order || 0),
    });
  }
  return (
    <details className="admin-inline-editor">
      <summary>Editar módulo, fecha y enlace</summary>
      <form className="admin-portal-form" onSubmit={submit}>
        <input
          name="title"
          defaultValue={module.title}
          required
          minLength="3"
          aria-label="Título del módulo"
        />
        <input
          name="description"
          defaultValue={module.description}
          aria-label="Descripción"
        />
        <label>
          Fecha y hora
          <input
            name="startsAt"
            type="datetime-local"
            defaultValue={localDateTime(module.startsAt)}
          />
        </label>
        <input
          name="meetingUrl"
          type="url"
          defaultValue={module.meetingUrl || ""}
          placeholder="Enlace HTTPS de Zoom o Meet"
          aria-label="Enlace de clase"
        />
        <input
          name="order"
          type="number"
          defaultValue={module.order}
          aria-label="Orden"
        />
        <button className="portal-text-button">Guardar módulo</button>
      </form>
    </details>
  );
}

function AdminPortalStudents({ error, setError, setNotice }) {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [modules, setModules] = useState([]);
  const [busy, setBusy] = useState(false);
  async function load() {
    const [accounts, catalog] = await Promise.all([
      request("/users?role=STUDENT"),
      request("/courses"),
    ]);
    setUsers(accounts);
    setCourses(catalog);
    if (!selectedCourse && catalog[0]) setSelectedCourse(String(catalog[0].id));
  }
  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    if (selectedCourse)
      request(`/courses/${selectedCourse}/modules`)
        .then(setModules)
        .catch((err) => setError(err.message));
  }, [selectedCourse]);
  async function act(fn, success) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
      if (selectedCourse)
        setModules(await request(`/courses/${selectedCourse}/modules`));
      setNotice(success);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function addUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    await act(
      () => request("/users", "POST", { ...data, role: "STUDENT" }),
      "Estudiante creado.",
    );
    form.reset();
  }
  async function addModule(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    await act(
      () =>
        request(`/courses/${selectedCourse}/modules`, "POST", {
          ...data,
          startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : "",
          order: Number(data.order || 0),
        }),
      "Módulo publicado.",
    );
    form.reset();
  }
  async function addResource(event, moduleId) {
    event.preventDefault();
    const form = event.currentTarget;
    await act(
      () =>
        request(`/modules/${moduleId}/resources`, "POST", new FormData(form)),
      "Bibliografía cargada.",
    );
    form.reset();
  }
  return (
    <>
      <div className="admin-section-header">
        <div>
          <h2>Portal de estudiantes</h2>
          <p>
            Accesos individuales, cursos asignados, módulos, encuentros y
            bibliografía.
          </p>
        </div>
        <Link
          className="btn btn--primary"
          to="/portal-estudiantes"
          target="_blank"
        >
          Ver portal
        </Link>
      </div>
      <div className="admin-portal-grid">
        <section className="admin-portal-card">
          <h3>Crear estudiante</h3>
          <form onSubmit={addUser} className="admin-portal-form">
            <input
              name="name"
              placeholder="Nombre y apellido"
              required
              minLength="3"
            />
            <input name="email" type="email" placeholder="Email" required />
            <input
              name="password"
              type="password"
              placeholder="Contraseña inicial · mínimo 10 caracteres"
              required
              minLength="10"
            />
            <button className="btn btn--primary" disabled={busy}>
              Crear acceso
            </button>
          </form>
        </section>
        <section className="admin-portal-card">
          <h3>Asignar curso</h3>
          <form
            className="admin-portal-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const data = Object.fromEntries(new FormData(form));
              act(
                () =>
                  request("/enrollments", "POST", {
                    userId: Number(data.userId),
                    courseId: Number(data.courseId),
                  }),
                "Curso asignado.",
              );
            }}
          >
            <select name="userId" required>
              <option value="">Elegí estudiante</option>
              {users
                .filter((user) => user.active)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </select>
            <select name="courseId" required>
              <option value="">Elegí curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.titulo}
                </option>
              ))}
            </select>
            <button className="btn btn--primary" disabled={busy}>
              Asignar curso
            </button>
          </form>
          <p>
            El catálogo principal se edita en{" "}
            <Link to="/admin/capacitaciones">Cursos y capacitaciones</Link>.
          </p>
        </section>
      </div>
      <section className="admin-portal-card">
        <h3>Estudiantes y progreso</h3>
        {users.length === 0 ? (
          <p>No hay estudiantes todavía.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Email</th>
                  <th>Cursos</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.enrollments.map((item) => (
                        <div className="admin-enrollment" key={item.id}>
                          <span>{item.course.titulo}</span>
                          <input
                            aria-label={`Avance de ${user.name} en ${item.course.titulo}`}
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={item.progress}
                            onBlur={(event) => {
                              const progress = Number(event.target.value);
                              if (progress !== item.progress)
                                act(
                                  () =>
                                    request(`/enrollments/${item.id}`, "PUT", {
                                      progress,
                                    }),
                                  "Avance actualizado.",
                                );
                            }}
                          />
                          %
                          <button
                            className="portal-icon-button"
                            title="Quitar curso"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "¿Quitar este curso del estudiante?",
                                )
                              )
                                act(
                                  () =>
                                    request(
                                      `/enrollments/${item.id}`,
                                      "DELETE",
                                    ),
                                  "Curso quitado.",
                                );
                            }}
                          >
                            <i className="fas fa-xmark" />
                          </button>
                        </div>
                      ))}
                    </td>
                    <td>
                      <button
                        className="portal-text-button"
                        onClick={() =>
                          act(
                            () =>
                              request(`/users/${user.id}`, "PUT", {
                                active: !user.active,
                              }),
                            "Estado actualizado.",
                          )
                        }
                      >
                        {user.active ? "Activo" : "Desactivado"}
                      </button>
                      <AccountEditor
                        user={user}
                        save={(id, data) =>
                          act(
                            () => request(`/users/${id}`, "PUT", data),
                            "Acceso actualizado.",
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="admin-portal-card">
        <div className="portal-section-heading">
          <div>
            <span className="portal-kicker">Contenidos</span>
            <h3>Módulos y encuentros</h3>
          </div>
          <select
            aria-label="Curso"
            value={selectedCourse}
            onChange={(event) => setSelectedCourse(event.target.value)}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.titulo}
              </option>
            ))}
          </select>
        </div>
        {selectedCourse && (
          <form
            className="admin-portal-form admin-portal-form--inline"
            onSubmit={addModule}
          >
            <input
              name="title"
              placeholder="Título del módulo"
              required
              minLength="3"
            />
            <input name="description" placeholder="Descripción" />
            <label>
              Fecha de clase
              <input name="startsAt" type="datetime-local" />
            </label>
            <input
              name="meetingUrl"
              type="url"
              placeholder="Enlace HTTPS de Zoom o Meet"
            />
            <input
              name="order"
              type="number"
              placeholder="Orden"
              defaultValue="0"
            />
            <button className="btn btn--primary" disabled={busy}>
              Agregar módulo
            </button>
          </form>
        )}
        {modules.length === 0 && <p>No hay módulos para este curso.</p>}
        <div className="admin-module-grid">
          {modules.map((module) => (
            <article className="admin-module-card" key={module.id}>
              <div className="portal-section-heading">
                <div>
                  <h4>{module.title}</h4>
                  <p>{module.description}</p>
                  <small>
                    {module.startsAt
                      ? new Date(module.startsAt).toLocaleString("es-AR")
                      : "Fecha a confirmar"}
                  </small>
                  {module.meetingUrl && (
                    <a
                      href={module.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {" "}
                      Enlace de clase
                    </a>
                  )}
                </div>
                <button
                  className="portal-icon-button"
                  title="Eliminar módulo"
                  onClick={() => {
                    if (
                      window.confirm("¿Eliminar este módulo y sus materiales?")
                    )
                      act(
                        () => request(`/modules/${module.id}`, "DELETE"),
                        "Módulo eliminado.",
                      );
                  }}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
              <ModuleEditor
                module={module}
                save={(id, data) =>
                  act(
                    () => request(`/modules/${id}`, "PUT", data),
                    "Módulo actualizado.",
                  )
                }
              />
              <div className="admin-resource-list">
                {module.resources.map((resource) => (
                  <div key={resource.id}>
                    <button
                      className="portal-inline-action"
                      onClick={() =>
                        downloadPrivate(`/resources/${resource.id}`, true)
                      }
                    >
                      <i className="fas fa-download" /> {resource.title}
                    </button>
                    <button
                      className="portal-icon-button"
                      title="Eliminar material"
                      onClick={() =>
                        act(
                          () => request(`/resources/${resource.id}`, "DELETE"),
                          "Material eliminado.",
                        )
                      }
                    >
                      <i className="fas fa-xmark" />
                    </button>
                  </div>
                ))}
              </div>
              <form
                className="admin-portal-form"
                onSubmit={(event) => addResource(event, module.id)}
              >
                <input
                  name="title"
                  placeholder="Título de bibliografía"
                  required
                  minLength="3"
                />
                <input
                  name="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
                <button className="portal-text-button" disabled={busy}>
                  Subir material
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function AdminPortalClients({ error, setError, setNotice }) {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  async function load() {
    const [orgs, accounts, records] = await Promise.all([
      request("/organizations"),
      request("/users?role=CLIENT"),
      request("/cases"),
    ]);
    setOrganizations(orgs);
    setUsers(accounts);
    setCases(records);
    if (!selectedId && records[0]) setSelectedId(records[0].id);
  }
  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    if (selectedId)
      request(`/cases/${selectedId}`)
        .then(setDetail)
        .catch((err) => setError(err.message));
  }, [selectedId]);
  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const records = await request("/cases");
        setCases(records);
        if (selectedId) setDetail(await request(`/cases/${selectedId}`));
      } catch {
        // La próxima sincronización vuelve a intentarlo sin bloquear el panel.
      }
    }, 15000);
    return () => window.clearInterval(interval);
  }, [selectedId]);
  async function act(fn, success) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
      if (selectedId) setDetail(await request(`/cases/${selectedId}`));
      setNotice(success);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function createOrganization(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const created = await act(
      () =>
        request("/organizations", "POST", {
          name: new FormData(form).get("name"),
        }),
      "Institución creada.",
    );
    if (created) {
      form.reset();
      setCreateOrgOpen(false);
    }
  }
  async function createUser(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const created = await act(
      () =>
        request("/users", "POST", {
          ...data,
          role: "CLIENT",
          organizationId: Number(data.organizationId),
        }),
      "Acceso de cliente creado.",
    );
    if (created) {
      form.reset();
      setCreateUserOpen(false);
    }
  }
  async function quote(event) {
    event.preventDefault();
    const form = event.currentTarget;
    await act(
      () => request(`/cases/${selectedId}/quotes`, "POST", new FormData(form)),
      "Cotización cargada.",
    );
    form.reset();
  }
  async function comment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    await act(
      () =>
        request(`/cases/${selectedId}/comments`, "POST", {
          body: new FormData(form).get("body"),
        }),
      "Mensaje enviado.",
    );
    form.reset();
  }
  async function openConversation(caseId = selectedId) {
    if (!caseId) return;
    setSelectedId(caseId);
    setConversationOpen(true);
    try {
      const record = await request(`/cases/${caseId}?markRead=1`);
      setDetail(record);
      setCases((current) =>
        current.map((item) =>
          item.id === caseId ? { ...item, unreadMessages: 0 } : item,
        ),
      );
      window.dispatchEvent(new Event("kadima:portal-notifications"));
    } catch (err) {
      setError(err.message);
    }
  }
  const unreadMessages = cases.reduce(
    (total, item) => total + Number(item.unreadMessages || 0),
    0,
  );
  const firstUnreadCase = cases.find((item) => item.unreadMessages > 0);
  return (
    <>
      <div className="admin-section-header">
        <div>
          <h2>Portal de clientes</h2>
          <p>Instituciones, accesos y casos de medicamentos y prótesis.</p>
        </div>
        <div className="admin-section-actions">
          <button className="btn btn--outline" onClick={() => setCreateOrgOpen(true)}>
            <i className="fas fa-building-circle-check" /> Nueva institución
          </button>
          <button className="btn btn--primary" onClick={() => setCreateUserOpen(true)}>
            <i className="fas fa-user-plus" /> Nuevo acceso
          </button>
          <Link className="portal-text-button" to="/portal-clientes" target="_blank">Ver portal</Link>
        </div>
      </div>
      <section className="admin-message-inbox">
        <span className="admin-message-inbox__icon">
          <i className="fas fa-inbox" />
        </span>
        <div>
          <span className="portal-kicker">Bandeja de entrada</span>
          <h3>
            {unreadMessages
              ? `${unreadMessages} ${unreadMessages === 1 ? "mensaje nuevo" : "mensajes nuevos"}`
              : "Mensajes al día"}
          </h3>
          <p>Las respuestas de cada obra social quedan guardadas dentro de su caso.</p>
        </div>
        {firstUnreadCase && (
          <button
            className="btn btn--primary"
            onClick={() => openConversation(firstUnreadCase.id)}
          >
            Abrir conversación <i className="fas fa-arrow-right" />
          </button>
        )}
      </section>
      <div className="admin-portal-grid admin-portal-grid--clients">
        <section className="admin-portal-card">
          <h3>Instituciones</h3>
          <div className="admin-simple-list">
            {organizations.map((org) => (
              <div key={org.id}>
                <strong>{org.name}</strong>
                <small>
                  {org._count.cases} casos · {org._count.users} usuarios
                </small>
                <button
                  className="portal-text-button"
                  onClick={() =>
                    act(
                      () =>
                        request(`/organizations/${org.id}`, "PUT", {
                          name: org.name,
                          active: !org.active,
                        }),
                      "Institución actualizada.",
                    )
                  }
                >
                  {org.active ? "Activa" : "Inactiva"}
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="admin-portal-card">
          <h3>Usuarios de clientes</h3>
        <div className="admin-simple-list">
          {users.length === 0 && <p>No hay accesos cargados.</p>}
          {users.map((user) => (
            <div key={user.id}>
              <strong>{user.name}</strong>
              <small>
                {user.email} · {user.organization?.name}
              </small>
              <button
                className="portal-text-button"
                onClick={() =>
                  act(
                    () =>
                      request(`/users/${user.id}`, "PUT", {
                        active: !user.active,
                      }),
                    "Usuario actualizado.",
                  )
                }
              >
                {user.active ? "Activo" : "Desactivado"}
              </button>
              <AccountEditor
                user={user}
                save={(id, data) =>
                  act(
                    () => request(`/users/${id}`, "PUT", data),
                    "Acceso actualizado.",
                  )
                }
              />
            </div>
          ))}
        </div>
        </section>
      </div>
      <div className="admin-case-layout">
        <section className="admin-portal-card">
          <div className="portal-section-heading">
            <div>
              <span className="portal-kicker">Gestión documental</span>
              <h3>Casos</h3>
            </div>
            <span className="portal-count">{cases.length}</span>
          </div>
          {cases.length === 0 && <p>Aún no hay casos creados por clientes.</p>}
          {cases.map((item) => (
            <button
              className={`portal-case-item ${selectedId === item.id ? "is-active" : ""}`}
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setConversationOpen(false);
              }}
            >
              <span className="portal-case-item-top">
                <small>
                  #{item.id} · {item.organization.name}
                </small>
                <i className="fas fa-arrow-right" />
              </span>
              <strong>{item.subject}</strong>
              <span>{types[item.type]}</span>
              {item.unreadMessages > 0 && (
                <span className="portal-unread-badge">
                  <i className="fas fa-envelope" /> {item.unreadMessages}{" "}
                  {item.unreadMessages === 1 ? "mensaje nuevo" : "mensajes nuevos"}
                </span>
              )}
              <em
                className={`portal-status portal-status--${item.status.toLowerCase()}`}
              >
                {statuses[item.status]}
              </em>
            </button>
          ))}
        </section>
        <section className="admin-portal-card admin-case-detail">
          {!detail ? (
            <p>Elegí un caso para gestionarlo.</p>
          ) : (
            <>
              <div className="portal-case-detail-head">
                <div>
                  <span className="portal-kicker">
                    Caso #{detail.id} · {detail.organization.name}
                  </span>
                  <h3>{detail.subject}</h3>
                  <p>
                    {detail.patientLabel} · {types[detail.type]}
                  </p>
                </div>
                <button
                  type="button"
                  className="portal-conversation-trigger"
                  onClick={() => openConversation()}
                >
                  <i className="fas fa-comments" /> Mensajes
                  {detail.unreadMessages > 0 && <span>{detail.unreadMessages}</span>}
                </button>
                <em
                  className={`portal-status portal-status--${detail.status.toLowerCase()}`}
                >
                  {statuses[detail.status]}
                </em>
              </div>
              <h4>Documentos</h4>
              {detail.documents.map((doc) => (
                <div className="portal-document" key={doc.id}>
                  <span className="portal-document-icon">
                    <i className="fas fa-file-lines" />
                  </span>
                  <div>
                    <strong>
                      {fileLabels[doc.kind]}
                      {doc.vendor ? ` · ${doc.vendor}` : ""}
                    </strong>
                    <small>
                      {doc.filename}
                      {doc.amount
                        ? ` · $${Number(doc.amount).toLocaleString("es-AR")}`
                        : ""}
                    </small>
                  </div>
                  <button
                    className="portal-icon-button"
                    title="Descargar"
                    onClick={() =>
                      downloadPrivate(`/documents/${doc.id}`, true)
                    }
                  >
                    <i className="fas fa-download" />
                  </button>
                  {doc.kind === "QUOTE" &&
                    ["REQUESTED", "QUOTING"].includes(detail.status) && (
                      <button
                        className="portal-icon-button"
                        title="Quitar cotización"
                        onClick={() =>
                          act(
                            () => request(`/quotes/${doc.id}`, "DELETE"),
                            "Cotización quitada.",
                          )
                        }
                      >
                        <i className="fas fa-trash" />
                      </button>
                    )}
                </div>
              ))}
              {["REQUESTED", "QUOTING"].includes(detail.status) && (
                <div className="admin-quote-box">
                  <h4>Cargar tres cotizaciones</h4>
                  <p>
                    Las cotizaciones se muestran al cliente juntas cuando las
                    publicás.
                  </p>
                  <form
                    className="admin-portal-form admin-portal-form--inline"
                    onSubmit={quote}
                  >
                    <input
                      name="vendor"
                      placeholder="Proveedor"
                      minLength="2"
                      required
                    />
                    <input
                      name="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Importe ARS"
                      required
                    />
                    <input
                      name="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    <button
                      className="btn btn--primary"
                      disabled={
                        busy ||
                        detail.documents.filter((doc) => doc.kind === "QUOTE")
                          .length >= 3
                      }
                    >
                      Subir cotización
                    </button>
                  </form>
                  <button
                    className="portal-text-button"
                    disabled={
                      busy ||
                      detail.documents.filter((doc) => doc.kind === "QUOTE")
                        .length !== 3
                    }
                    onClick={() =>
                      act(
                        () => request(`/cases/${selectedId}/publish`, "POST"),
                        "Tres cotizaciones publicadas.",
                      )
                    }
                  >
                    Publicar las tres cotizaciones{" "}
                    <i className="fas fa-arrow-right" />
                  </button>
                </div>
              )}
              {detail.status === "AUTHORIZED" && (
                <button
                  className="btn btn--primary"
                  onClick={() =>
                    act(
                      () => request(`/cases/${selectedId}/close`, "PUT"),
                      "Caso cerrado.",
                    )
                  }
                >
                  Cerrar caso
                </button>
              )}
            </>
          )}
        </section>
      </div>
      <PortalModal
        open={conversationOpen && Boolean(detail)}
        onClose={() => setConversationOpen(false)}
        eyebrow={`Caso #${detail?.id || ""}`}
        title={`Conversación con ${detail?.organization?.name || "el cliente"}`}
        wide
      >
        {detail && (
          <div className="portal-conversation-modal">
            <div className="portal-conversation-heading">
              <div>
                <strong>{detail.subject}</strong>
                <span>{detail.patientLabel}</span>
              </div>
              <span>
                <i className="fas fa-arrows-rotate" /> Sincronización automática
              </span>
            </div>
            <div className="portal-thread">
              {detail.comments.length === 0 && (
                <p className="portal-empty">Todavía no hay mensajes en este caso.</p>
              )}
              {detail.comments.map((item) => (
                <div
                  className={`portal-message ${item.authorRole === "KADIMA" ? "portal-message--kadima" : ""}`}
                  key={item.id}
                >
                  <div>
                    <strong>{item.authorName}</strong>
                    <time>{new Date(item.createdAt).toLocaleString("es-AR")}</time>
                  </div>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
            <form className="portal-comment-form" onSubmit={comment}>
              <textarea
                name="body"
                placeholder="Responder al cliente…"
                minLength="2"
                maxLength="2000"
                required
                rows="3"
              />
              <button className="btn btn--primary" disabled={busy}>
                <i className="fas fa-paper-plane" /> Enviar al cliente
              </button>
            </form>
          </div>
        )}
      </PortalModal>
      <PortalModal open={createOrgOpen} onClose={() => setCreateOrgOpen(false)} eyebrow="Clientes" title="Nueva institución">
        <form className="portal-modal-form" onSubmit={createOrganization}>
          <label>Obra social o prepaga<input name="name" placeholder="Nombre institucional" minLength="3" required /></label>
          <div className="portal-form-actions">
            <button type="button" className="portal-text-button" onClick={() => setCreateOrgOpen(false)}>Cancelar</button>
            <button className="btn btn--primary" disabled={busy}>{busy ? "Guardando…" : "Agregar institución"}</button>
          </div>
        </form>
      </PortalModal>
      <PortalModal open={createUserOpen} onClose={() => setCreateUserOpen(false)} eyebrow="Acceso institucional" title="Nuevo usuario">
        <form className="portal-modal-form" onSubmit={createUser}>
          <label>Nombre y apellido<input name="name" minLength="3" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Contraseña inicial<input name="password" type="password" minLength="10" required /></label>
          <label>Institución<select name="organizationId" required><option value="">Elegí institución</option>{organizations.filter((org) => org.active).map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select></label>
          <div className="portal-form-actions">
            <button type="button" className="portal-text-button" onClick={() => setCreateUserOpen(false)}>Cancelar</button>
            <button className="btn btn--primary" disabled={busy}>{busy ? "Creando…" : "Crear acceso"}</button>
          </div>
        </form>
      </PortalModal>
    </>
  );
}

export default function AdminPortales({ type }) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [available, setAvailable] = useState(null);
  useEffect(() => {
    fetch("/api/portal/status")
      .then((res) => res.json())
      .then((data) => setAvailable(data.available))
      .catch(() => setAvailable(false));
  }, []);
  if (available === false)
    return (
      <div className="admin-portal-card">
        <h2>Portales privados</h2>
        <p>
          Para gestionar cuentas y documentos en esta instancia hay que
          configurar PostgreSQL, JWT y la clave de cifrado del portal.
        </p>
        <Link
          to={type === "students" ? "/portal-estudiantes" : "/portal-clientes"}
          target="_blank"
          className="btn btn--primary"
        >
          Ver portal
        </Link>
      </div>
    );
  if (available === null) return <p>Cargando portales…</p>;
  return (
    <div className="admin-portals-page">
      {error && (
        <p className="portal-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="portal-success" role="status">
          {notice}
        </p>
      )}
      {type === "students" ? (
        <AdminPortalStudents
          error={error}
          setError={setError}
          setNotice={setNotice}
        />
      ) : (
        <AdminPortalClients
          error={error}
          setError={setError}
          setNotice={setNotice}
        />
      )}
    </div>
  );
}
