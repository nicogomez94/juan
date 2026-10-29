import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import PortalModal from "./PortalModal";
import { portalRequest } from "../lib/portalApi";
import "../portal.css";

export default function PortalShell({ role, title, children }) {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("loading");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    let active = true;
    portalRequest("/status")
      .then(({ available }) => {
        if (!available) {
          if (active) setMode("sample");
          return;
        }
        portalRequest("/me")
          .then(({ user }) => {
            if (!active) return;
            if (user.role === role) {
              setSession(user);
              setMode("live");
            } else {
              setMode("login");
            }
          })
          .catch(() => active && setMode("login"));
      })
      .catch(() => active && setMode("sample"));
    return () => {
      active = false;
    };
  }, [role]);

  async function login(event) {
    event.preventDefault();
    setWorking(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const { user } = await portalRequest("/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      if (user.role !== role) {
        await portalRequest("/logout", { method: "POST" });
        throw new Error("Esta cuenta corresponde al otro portal.");
      }
      setSession(user);
      setMode("live");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }

  async function logout() {
    await portalRequest("/logout", { method: "POST" }).catch(() => {});
    setSession(null);
    setMode("login");
  }

  async function registerClient(event) {
    event.preventDefault();
    setWorking(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      const { user } = await portalRequest("/register-client", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setSession(user);
      setRegistering(false);
      setMode("live");
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }

  async function saveAccount(event) {
    event.preventDefault();
    setWorking(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "sample") {
        setSession((current) => ({
          ...(current || {}),
          name: values.name,
          phone: values.phone,
          position: values.position,
          role,
          organization: role === "CLIENT" ? {
            ...(current?.organization || {}),
            name: values.organizationName,
            phone: values.organizationPhone,
            address: values.address,
          } : null,
        }));
      } else {
        const { user } = await portalRequest("/me", {
          method: "PUT",
          body: JSON.stringify(values),
        });
        setSession(user);
      }
      setAccountOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }

  const displayUser = session ||
    (role === "STUDENT"
      ? { name: "María", role: "STUDENT" }
      : {
          name: "Equipo institucional",
          role: "CLIENT",
          organization: { name: "Obra Social del Centro" },
        });

  return (
    <>
      <Navbar />
      <main className="portal-workspace portal-workspace--standalone">
        <div className="container">
          {mode === "loading" && (
            <p className="portal-state">Cargando portal…</p>
          )}
          {mode === "login" && (
            <div className="portal-login-layout">
              <div className="portal-login-copy">
                <span className="portal-kicker">{title}</span>
                <h2>Tu espacio en Kadima</h2>
                <p>
                  Ingresá con las credenciales que te asignó el equipo de
                  Kadima. Cada cuenta accede solo a la información que le
                  corresponde.
                </p>
                <div className="portal-login-decoration">
                  <i
                    className={`fas ${role === "STUDENT" ? "fa-book-open" : "fa-file-shield"}`}
                  />
                </div>
              </div>
              <form className="portal-login-form" onSubmit={login} autoComplete={import.meta.env.DEV ? "off" : undefined}>
                <h2>Iniciar sesión</h2>
                <label>
                  Correo electrónico
                  <input
                    name="email"
                    type="email"
                    autoComplete={import.meta.env.DEV ? "off" : "username"}
                    required
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    name="password"
                    type="password"
                    autoComplete={import.meta.env.DEV ? "new-password" : "current-password"}
                    required
                  />
                </label>
                {error && (
                  <p className="portal-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="btn btn--primary" disabled={working}>
                  {working ? "Ingresando…" : "Ingresar al portal"}
                </button>
                {role === "CLIENT" && (
                  <button
                    type="button"
                    className="portal-register-link"
                    onClick={() => {
                      setError("");
                      setRegistering(true);
                    }}
                  >
                    <i className="fas fa-building-circle-check" />
                    Registrar mi obra social o prepaga
                  </button>
                )}
                <p className="portal-login-help">
                  Si necesitás acceso, contactá a Kadima para que creen tu
                  cuenta.
                </p>
              </form>
            </div>
          )}
          {(mode === "live" || mode === "sample") && (
            <>
              <div className="portal-workspace-top">
                <div>
                  <span className="portal-kicker">Panel institucional</span>
                  <h2>
                    Hola,{" "}
                    {displayUser.name}
                  </h2>
                </div>
                <div className="portal-account-actions">
                  <button
                    className="portal-account-pill"
                    onClick={() => setAccountOpen(true)}
                  >
                    <span className="portal-account-avatar">
                      {displayUser.name?.charAt(0).toUpperCase()}
                    </span>
                    <span>
                      <small>Mi cuenta</small>
                      <strong>{displayUser.organization?.name || displayUser.name}</strong>
                    </span>
                    <i className="fas fa-chevron-down" />
                  </button>
                  {mode === "live" && (
                    <button className="portal-logout-button" onClick={logout} title="Cerrar sesión">
                      <i className="fas fa-right-from-bracket" />
                    </button>
                  )}
                </div>
              </div>
              {children({
                demo: mode === "sample",
                user: displayUser,
              })}
            </>
          )}
        </div>
      </main>
      <PortalModal
        open={registering}
        onClose={() => setRegistering(false)}
        eyebrow="Nuevo acceso institucional"
        title="Registrar institución"
        wide
      >
        <form className="portal-modal-form" onSubmit={registerClient}>
          <div className="portal-form-section">
            <div className="portal-form-section__title">
              <i className="fas fa-building-shield" />
              <div><strong>Datos de la institución</strong><span>Obra social o empresa de medicina prepaga</span></div>
            </div>
            <div className="portal-form-grid">
              <label>Nombre institucional<input name="organizationName" required minLength="3" placeholder="Ej. Obra Social del Centro" /></label>
              <label>CUIT<input name="taxId" required minLength="8" placeholder="30-12345678-9" /></label>
              <label>Teléfono institucional<input name="organizationPhone" type="tel" placeholder="+54 11 4000-0000" /></label>
              <label>Domicilio<input name="address" placeholder="Calle, número, localidad" /></label>
            </div>
          </div>
          <div className="portal-form-section">
            <div className="portal-form-section__title">
              <i className="fas fa-user-tie" />
              <div><strong>Responsable de la cuenta</strong><span>Será el primer acceso de la institución</span></div>
            </div>
            <div className="portal-form-grid">
              <label>Nombre y apellido<input name="name" required minLength="3" /></label>
              <label>Cargo<input name="position" placeholder="Ej. Auditor de prestaciones" /></label>
              <label>Email<input name="email" type="email" required /></label>
              <label>Teléfono personal<input name="phone" type="tel" /></label>
              <label className="portal-form-grid__full">Contraseña<input name="password" type="password" required minLength="10" autoComplete="new-password" /></label>
            </div>
          </div>
          {error && <p className="portal-error" role="alert">{error}</p>}
          <div className="portal-form-actions">
            <button type="button" className="portal-text-button" onClick={() => setRegistering(false)}>Cancelar</button>
            <button className="btn btn--primary" disabled={working}>{working ? "Creando acceso…" : "Registrar e ingresar"}</button>
          </div>
        </form>
      </PortalModal>
      <PortalModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        eyebrow="Preferencias"
        title="Mi cuenta"
        wide={role === "CLIENT"}
      >
        <form className="portal-modal-form" onSubmit={saveAccount}>
          <div className="portal-form-section">
            <div className="portal-form-section__title">
              <i className="fas fa-circle-user" />
              <div><strong>Datos personales</strong><span>Información del referente</span></div>
            </div>
            <div className="portal-form-grid">
              <label>Nombre y apellido<input name="name" required minLength="3" defaultValue={displayUser.name} /></label>
              <label>Cargo<input name="position" defaultValue={displayUser.position || ""} /></label>
              <label>Teléfono<input name="phone" type="tel" defaultValue={displayUser.phone || ""} /></label>
              <label>Email<input value={displayUser.email || ""} disabled /></label>
            </div>
          </div>
          {role === "CLIENT" && (
            <div className="portal-form-section">
              <div className="portal-form-section__title">
                <i className="fas fa-building" />
                <div><strong>Institución</strong><span>Datos visibles para el equipo de Kadima</span></div>
              </div>
              <div className="portal-form-grid">
                <label>Nombre institucional<input name="organizationName" required defaultValue={displayUser.organization?.name || ""} /></label>
                <label>CUIT<input value={displayUser.organization?.taxId || ""} disabled /></label>
                <label>Teléfono institucional<input name="organizationPhone" type="tel" defaultValue={displayUser.organization?.phone || ""} /></label>
                <label>Domicilio<input name="address" defaultValue={displayUser.organization?.address || ""} /></label>
              </div>
            </div>
          )}
          {error && <p className="portal-error" role="alert">{error}</p>}
          <div className="portal-form-actions">
            <button type="button" className="portal-text-button" onClick={() => setAccountOpen(false)}>Cancelar</button>
            <button className="btn btn--primary" disabled={working}>{working ? "Guardando…" : "Guardar cambios"}</button>
          </div>
        </form>
      </PortalModal>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
