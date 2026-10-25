import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import { portalRequest } from "../lib/portalApi";
import "../portal.css";

export default function PortalShell({ role, title, eyebrow, intro, children }) {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("loading");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let active = true;
    portalRequest("/status")
      .then(({ available }) => {
        if (!available) {
          if (active) setMode("preview");
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
      .catch(() => active && setMode("preview"));
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

  return (
    <>
      <Navbar />
      <section className="page-hero portal-hero portal-hero--private">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">
            {eyebrow}
          </p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </section>
      <main className="portal-workspace">
        <div className="container">
          {mode === "loading" && (
            <p className="portal-state">Cargando portal…</p>
          )}
          {mode === "login" && (
            <div className="portal-login-layout">
              <div className="portal-login-copy">
                <span className="portal-kicker">Acceso personalizado</span>
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
              <form className="portal-login-form" onSubmit={login}>
                <h2>Iniciar sesión</h2>
                <label>
                  Correo electrónico
                  <input
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                  />
                </label>
                <label>
                  Contraseña
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
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
                <p className="portal-login-help">
                  Si necesitás acceso, contactá a Kadima para que creen tu
                  cuenta.
                </p>
              </form>
            </div>
          )}
          {(mode === "live" || mode === "preview") && (
            <>
              {mode === "preview" && (
                <div className="portal-demo-notice" role="status">
                  <i className="fas fa-circle-info" />
                  <span>
                    Recorrido de demostración con información ficticia. Ningún
                    archivo se envía ni se guarda; las descargas reales
                    requieren acceso privado.
                  </span>
                </div>
              )}
              <div className="portal-workspace-top">
                <div>
                  <span className="portal-kicker">
                    {mode === "preview" ? "Vista para aprobación" : "Mi cuenta"}
                  </span>
                  <h2>
                    {mode === "preview"
                      ? "Así se verá tu espacio"
                      : `Hola, ${session.name}`}
                  </h2>
                </div>
                {mode === "live" && (
                  <button className="portal-text-button" onClick={logout}>
                    Cerrar sesión <i className="fas fa-right-from-bracket" />
                  </button>
                )}
              </div>
              {children({ demo: mode === "preview", user: session })}
            </>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
