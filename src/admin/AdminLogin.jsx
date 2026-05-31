import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, setToken } from '../lib/api'
import { DEBUG, debugDefaults } from '../lib/debugDefaults'
import './admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const d = DEBUG ? debugDefaults.adminLogin : {}
  const [form, setForm] = useState({ username: d.username || '', password: d.password || '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.post('/api/auth/login', form)
      setToken(data.token)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__logo">
          <i className="fas fa-shield-heart" />
          <span>Kadima <strong>Salud</strong></span>
        </div>
        <p className="admin-login__subtitle">Panel de administración</p>
        <h1 className="admin-login__title">Iniciar sesión</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
          Ingresá tus credenciales para acceder al panel.
        </p>

        {error && (
          <div className="admin-alert admin-alert--error">
            <i className="fas fa-circle-exclamation" /> {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="admin-form__group">
            <label>Usuario</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div className="admin-form__group">
            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn--primary btn--full" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <><i className="fas fa-spinner fa-spin" /> Ingresando...</> : 'Ingresar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ fontSize: '0.875rem', color: 'var(--color-gray)' }}>
            <i className="fas fa-arrow-left" style={{ marginRight: '0.4rem' }} />
            Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  )
}
