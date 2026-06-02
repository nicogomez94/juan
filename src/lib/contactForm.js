const CONTACT_SERVICE_URL = 'https://contact-form-service-e8aa.onrender.com/api/contact'

export const CONTACT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const CONTACT_TO = import.meta.env.VITE_CONTACT_TO ?? ''
export const CONTACT_SITE = import.meta.env.VITE_CONTACT_SITE ?? ''

export function normalizeFullName(nombre = '', apellido = '') {
  return [nombre, apellido]
    .map(value => value.trim())
    .filter(Boolean)
    .join(' ')
}

export function buildContactMessage({ celular = '', consulta = '' }) {
  const parts = []
  const phone = celular.trim()
  const message = consulta.trim()

  if (phone) parts.push(`Celular: ${phone}`)
  if (message) parts.push(`Consulta:\n${message}`)

  return parts.join('\n\n')
}

export function getContactFormValidationError({ nombre = '', apellido = '', email = '', consulta = '' }) {
  const trimmedName = normalizeFullName(nombre, apellido)
  const trimmedEmail = email.trim()
  const trimmedMessage = consulta.trim()

  if (!trimmedName || !trimmedEmail || !trimmedMessage) {
    return 'Completá nombre, apellido, email y consulta.'
  }

  if (!CONTACT_EMAIL_REGEX.test(trimmedEmail)) {
    return 'Ingresá un email válido.'
  }

  if (!CONTACT_TO || !CONTACT_SITE) {
    return 'Falta configurar el destino del formulario.'
  }

  return ''
}

export async function sendContactForm({ name, email, message }) {
  const response = await fetch(CONTACT_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      to: CONTACT_TO,
      message,
      site: CONTACT_SITE,
      company: '',
    }),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`)
  }

  if (!data || data.success !== true) {
    throw new Error(data?.error || 'No se pudo enviar el formulario.')
  }

  return data
}
