const BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : '' // In dev, Vite proxy handles /api → localhost:3001

function getToken() {
  return localStorage.getItem('kadima_admin_token')
}

export function setToken(t) {
  localStorage.setItem('kadima_admin_token', t)
}

export function clearToken() {
  localStorage.removeItem('kadima_admin_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
}

export async function uploadImages(files) {
  const token = getToken()
  const formData = new FormData()
  files.forEach(f => formData.append('images', f))
  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data.urls // string[]
}
