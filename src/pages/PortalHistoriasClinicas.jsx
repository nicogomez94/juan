import { useEffect, useState } from "react";
import PortalShell from "../components/PortalShell";
import {
  downloadExample,
  downloadLocalFile,
  downloadPrivate,
  portalRequest,
} from "../lib/portalApi";

const statusLabels = {
  REQUESTED: "Pedido recibido",
  QUOTING: "En cotización",
  QUOTES_READY: "Cotizaciones disponibles",
  AUTHORIZED: "Autorización recibida",
  CLOSED: "Caso cerrado",
};
const typeLabels = { MEDICATION: "Medicamento", PROSTHESIS: "Prótesis" };
const documentLabels = {
  MEDICAL_ORDER: "Pedido médico",
  QUOTE: "Cotización",
  AUTHORIZATION: "Autorización firmada",
};
const demoCases = [
  {
    id: 1024,
    type: "MEDICATION",
    status: "QUOTES_READY",
    subject: "Solicitud de cobertura farmacéutica",
    patientLabel: "Afiliado · 0042",
    updatedAt: "2026-10-24T15:00:00",
    documents: [
      {
        id: 1,
        kind: "MEDICAL_ORDER",
        filename: "pedido-medico.pdf",
        uploadedBy: "Equipo institucional",
      },
      {
        id: 2,
        kind: "QUOTE",
        filename: "cotizacion-a.pdf",
        vendor: "Proveedor A",
        amount: 245000,
        uploadedBy: "Kadima",
      },
      {
        id: 3,
        kind: "QUOTE",
        filename: "cotizacion-b.pdf",
        vendor: "Proveedor B",
        amount: 262000,
        uploadedBy: "Kadima",
      },
      {
        id: 4,
        kind: "QUOTE",
        filename: "cotizacion-c.pdf",
        vendor: "Proveedor C",
        amount: 278000,
        uploadedBy: "Kadima",
      },
    ],
    comments: [
      {
        id: 1,
        authorName: "Equipo institucional",
        authorRole: "CLIENT",
        body: "Adjuntamos el pedido médico para solicitar cotizaciones.",
        createdAt: "2026-10-21T10:00:00",
      },
      {
        id: 2,
        authorName: "Equipo Kadima",
        authorRole: "KADIMA",
        body: "Ya están disponibles las tres alternativas para revisar.",
        createdAt: "2026-10-24T15:00:00",
      },
    ],
  },
  {
    id: 1023,
    type: "PROSTHESIS",
    status: "QUOTING",
    subject: "Solicitud de prótesis",
    patientLabel: "Afiliado · 0037",
    updatedAt: "2026-10-23T12:00:00",
    documents: [
      {
        id: 5,
        kind: "MEDICAL_ORDER",
        filename: "orden-medica.pdf",
        uploadedBy: "Equipo institucional",
      },
    ],
    comments: [],
  },
];

function formatDate(value) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CaseWorkspace({ demo, user }) {
  const [cases, setCases] = useState(demo ? demoCases : []);
  const [selectedId, setSelectedId] = useState(demo ? demoCases[0].id : null);
  const [detail, setDetail] = useState(demo ? demoCases[0] : null);
  const [creating, setCreating] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadCases(preferredId) {
    const data = await portalRequest("/client/cases");
    setCases(data);
    setSelectedId(preferredId || data[0]?.id || null);
  }
  useEffect(() => {
    if (!demo) loadCases().catch((err) => setError(err.message));
  }, [demo]);
  useEffect(() => {
    if (demo) {
      setDetail(cases.find((item) => item.id === selectedId) || null);
      return;
    }
    if (!selectedId) {
      setDetail(null);
      return;
    }
    portalRequest(`/client/cases/${selectedId}`)
      .then(setDetail)
      .catch((err) => setError(err.message));
  }, [selectedId, demo, cases]);

  function updateDemo(record) {
    setCases((current) =>
      current.map((item) => (item.id === record.id ? record : item)),
    );
    setDetail(record);
  }

  async function refresh() {
    if (demo || !selectedId) return;
    await Promise.all([
      loadCases(selectedId),
      portalRequest(`/client/cases/${selectedId}`).then(setDetail),
    ]);
  }
  async function createCase(event) {
    event.preventDefault();
    setWorking(true);
    setError("");
    setNotice("");
    try {
      if (demo) {
        const values = new FormData(event.currentTarget);
        const now = new Date().toISOString();
        const id = Math.floor(Date.now() / 1000);
        const record = {
          id,
          type: values.get("type"),
          status: "REQUESTED",
          subject: String(values.get("subject")),
          patientLabel: String(values.get("patientLabel")),
          updatedAt: now,
          documents: [
            {
              id: `demo-${id}`,
              kind: "MEDICAL_ORDER",
              filename: values.get("file")?.name || "pedido-medico.pdf",
              file: values.get("file"),
              uploadedBy: user?.name || "Equipo institucional",
            },
          ],
          comments: values.get("comment")
            ? [
                {
                  id: `message-${id}`,
                  authorName: user?.name || "Equipo institucional",
                  authorRole: "CLIENT",
                  body: String(values.get("comment")),
                  createdAt: now,
                },
              ]
            : [],
        };
        setCases((current) => [record, ...current]);
        setSelectedId(id);
        setCreating(false);
        setNotice(
          "El caso quedó solo en esta sesión. El servicio privado aún no está conectado.",
        );
        return;
      }
      const data = await portalRequest("/client/cases", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      setCreating(false);
      await loadCases(data.id);
      setNotice("El caso se creó y se envió a Kadima.");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }
  async function submitComment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new FormData(form).get("body");
    setWorking(true);
    setError("");
    try {
      if (demo) {
        updateDemo({
          ...detail,
          comments: [
            ...detail.comments,
            {
              id: `message-${Date.now()}`,
              authorName: user?.name || "Equipo institucional",
              authorRole: "CLIENT",
              body: String(body),
              createdAt: new Date().toISOString(),
            },
          ],
        });
        form.reset();
        setNotice(
          "El mensaje quedó solo en esta sesión. El servicio privado aún no está conectado.",
        );
        return;
      }
      await portalRequest(`/client/cases/${selectedId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      form.reset();
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }
  async function uploadAuthorization(event) {
    event.preventDefault();
    setWorking(true);
    setError("");
    try {
      if (demo) {
        const file = new FormData(event.currentTarget).get("file");
        updateDemo({
          ...detail,
          status: "AUTHORIZED",
          updatedAt: new Date().toISOString(),
          documents: [
            ...detail.documents,
            {
              id: `authorization-${Date.now()}`,
              kind: "AUTHORIZATION",
              filename: file.name,
              file,
              uploadedBy: user?.name || "Equipo institucional",
            },
          ],
        });
        setNotice(
          "La autorización quedó solo en esta sesión. El servicio privado aún no está conectado.",
        );
        return;
      }
      await portalRequest(`/client/cases/${selectedId}/authorization`, {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      await refresh();
      setNotice("La autorización firmada se envió a Kadima.");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }
  async function download(document) {
    try {
      if (demo && document.file) downloadLocalFile(document.file);
      else if (demo) await downloadExample(document.filename);
      else await downloadPrivate(`/client/documents/${document.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <div className="portal-client-intro">
        <p>
          Consultá tus solicitudes de medicamentos y prótesis, intercambiá
          mensajes con Kadima y completá cada caso con su documentación.
        </p>
        <button
          className="btn btn--primary"
          onClick={() => {
            setCreating(!creating);
            setError("");
          }}
        >
          <i className="fas fa-plus" /> Nuevo caso
        </button>
      </div>
      {error && (
        <p className="portal-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className={demo ? "portal-info" : "portal-success"} role="status">
          {notice}
        </p>
      )}
      {creating && (
        <form
          className="portal-section-card portal-create-form"
          onSubmit={createCase}
        >
          <div className="portal-section-heading">
            <div>
              <span className="portal-kicker">Solicitud nueva</span>
              <h3>Crear un caso</h3>
            </div>
          </div>
          <div className="portal-form-grid">
            <label>
              Tipo de solicitud
              <select name="type" required>
                <option value="MEDICATION">Medicamento</option>
                <option value="PROSTHESIS">Prótesis</option>
              </select>
            </label>
            <label>
              Referencia del paciente
              <input
                name="patientLabel"
                required
                minLength="2"
                maxLength="100"
                placeholder="Nombre o código interno"
              />
            </label>
          </div>
          <label>
            Asunto
            <input
              name="subject"
              required
              minLength="4"
              maxLength="160"
              placeholder="Ej. Solicitud de cobertura"
            />
          </label>
          <label>
            Pedido médico (PDF, JPG o PNG · hasta 10 MB)
            <input
              name="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </label>
          <label>
            Mensaje inicial (opcional)
            <textarea
              name="comment"
              rows="3"
              maxLength="2000"
              placeholder="Indicaciones para Kadima"
            />
          </label>
          <div className="portal-form-actions">
            <button
              type="button"
              className="portal-text-button"
              onClick={() => setCreating(false)}
            >
              Cancelar
            </button>
            <button className="btn btn--primary" disabled={working}>
              {working ? "Enviando…" : "Crear caso"}
            </button>
          </div>
        </form>
      )}
      <div className="portal-case-layout">
        <aside className="portal-section-card portal-case-list">
          <div className="portal-section-heading">
            <div>
              <span className="portal-kicker">
                {user?.organization?.name || "Mi institución"}
              </span>
              <h3>Casos</h3>
            </div>
            <span className="portal-count">{cases.length}</span>
          </div>
          {cases.length === 0 && (
            <p className="portal-empty">
              No hay casos todavía. Creá el primero con el pedido médico.
            </p>
          )}
          {cases.map((item) => (
            <button
              key={item.id}
              className={`portal-case-item ${selectedId === item.id ? "is-active" : ""}`}
              onClick={() => setSelectedId(item.id)}
            >
              <span className="portal-case-item-top">
                <small>
                  #{item.id} · {typeLabels[item.type]}
                </small>
                <i className="fas fa-arrow-right" />
              </span>
              <strong>{item.subject}</strong>
              <span>{item.patientLabel}</span>
              <em
                className={`portal-status portal-status--${item.status.toLowerCase()}`}
              >
                {statusLabels[item.status]}
              </em>
            </button>
          ))}
        </aside>
        <section className="portal-section-card portal-case-detail">
          {!detail && (
            <p className="portal-empty">
              Elegí un caso para ver su documentación y mensajes.
            </p>
          )}
          {detail && (
            <>
              <div className="portal-case-detail-head">
                <div>
                  <span className="portal-kicker">
                    Caso #{detail.id} · {typeLabels[detail.type]}
                  </span>
                  <h3>{detail.subject}</h3>
                  <p>
                    {detail.patientLabel} · Actualizado{" "}
                    {formatDate(detail.updatedAt)}
                  </p>
                </div>
                <em
                  className={`portal-status portal-status--${detail.status.toLowerCase()}`}
                >
                  {statusLabels[detail.status]}
                </em>
              </div>
              <div className="portal-process">
                <span className="is-done">Pedido médico</span>
                <span
                  className={
                    ["QUOTES_READY", "AUTHORIZED", "CLOSED"].includes(
                      detail.status,
                    )
                      ? "is-done"
                      : ""
                  }
                >
                  3 cotizaciones
                </span>
                <span
                  className={
                    ["AUTHORIZED", "CLOSED"].includes(detail.status)
                      ? "is-done"
                      : ""
                  }
                >
                  Autorización
                </span>
              </div>
              <div className="portal-detail-block">
                <h4>Documentos del caso</h4>
                {detail.documents.map((doc) => (
                  <div className="portal-document" key={doc.id}>
                    <span className="portal-document-icon">
                      <i
                        className={`fas ${doc.kind === "MEDICAL_ORDER" ? "fa-file-medical" : doc.kind === "QUOTE" ? "fa-file-invoice-dollar" : "fa-file-signature"}`}
                      />
                    </span>
                    <div>
                      <strong>
                        {documentLabels[doc.kind]}
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
                      onClick={() => download(doc)}
                    >
                      <i className="fas fa-download" />
                    </button>
                  </div>
                ))}
              </div>
              {detail.status === "QUOTES_READY" && (
                <div className="portal-authorization">
                  <i className="fas fa-file-circle-check" />
                  <div>
                    <h4>Autorizar la opción elegida</h4>
                    <p>
                      Descargá las cotizaciones, firmá la autorización y cargala
                      aquí para continuar.
                    </p>
                    <form onSubmit={uploadAuthorization}>
                      <input
                        name="file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                      <button className="btn btn--primary" disabled={working}>
                        {working ? "Enviando…" : "Enviar autorización"}
                      </button>
                    </form>
                  </div>
                </div>
              )}
              <div className="portal-detail-block">
                <h4>Mensajes del caso</h4>
                <div className="portal-thread">
                  {detail.comments.length === 0 && (
                    <p className="portal-empty">Todavía no hay mensajes.</p>
                  )}
                  {detail.comments.map((comment) => (
                    <div
                      className={`portal-message ${comment.authorRole === "KADIMA" ? "portal-message--kadima" : ""}`}
                      key={comment.id}
                    >
                      <div>
                        <strong>{comment.authorName}</strong>
                        <time>{formatDate(comment.createdAt)}</time>
                      </div>
                      <p>{comment.body}</p>
                    </div>
                  ))}
                </div>
                <form className="portal-comment-form" onSubmit={submitComment}>
                  <label className="sr-only" htmlFor="portal-comment">
                    Escribir mensaje
                  </label>
                  <textarea
                    id="portal-comment"
                    name="body"
                    placeholder="Escribí un mensaje para este caso…"
                    required
                    minLength="2"
                    maxLength="2000"
                    rows="3"
                  />
                  <button className="btn btn--primary" disabled={working}>
                    Enviar mensaje
                  </button>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default function PortalHistoriasClinicas() {
  return (
    <PortalShell
      role="CLIENT"
      eyebrow="Gestión institucional"
      title="Portal de clientes"
      intro="Un circuito claro para solicitudes, cotizaciones y autorizaciones."
    >
      {(props) => <CaseWorkspace {...props} />}
    </PortalShell>
  );
}
