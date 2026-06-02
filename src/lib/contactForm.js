const CONTACT_ENDPOINT = '/api/contact'

export const CONTACT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export function getContactFormValidationError({ nombre = '', apellido = '', email = '', celular = '', consulta = '' }) {
  const trimmedFirstName = nombre.trim()
  const trimmedLastName = apellido.trim()
  const trimmedEmail = email.trim()
  const trimmedPhone = celular.trim()
  const trimmedMessage = consulta.trim()

  if (!trimmedFirstName) return 'Completá tu nombre.'
  if (!trimmedLastName) return 'Completá tu apellido.'
  if (!trimmedPhone) return 'Dejanos un celular para poder contactarte.'
  if (!trimmedEmail) return 'Completá tu email.'
  if (!trimmedMessage) return 'Escribí tu consulta para que podamos ayudarte.'

  if (!CONTACT_EMAIL_REGEX.test(trimmedEmail)) {
    return 'Ingresá un email válido, por ejemplo nombre@email.com.'
  }

  if (trimmedPhone.replace(/\D/g, '').length < 6) {
    return 'Ingresá un celular válido con al menos 6 números.'
  }

  return ''
}

function getSubmitErrorMessage(error) {
  const message = error instanceof Error ? error.message : ''

  if (!message || message === 'Failed to fetch' || message === 'Load failed') {
    return 'No pudimos conectar con el formulario. Revisá tu conexión e intentá de nuevo.'
  }

  if (/cors|origin/i.test(message)) {
    return 'El envío está bloqueado por la configuración del servidor. Probá nuevamente en unos minutos.'
  }

  return message
}

export async function sendContactForm({ name, email, message }) {
  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        company: '',
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.error || 'No pudimos enviar la consulta. Intentá nuevamente en unos minutos.')
    }

    if (!data || data.success !== true) {
      throw new Error(data?.error || 'El servicio no confirmó el envío. Intentá nuevamente en unos minutos.')
    }

    return data
  } catch (error) {
    throw new Error(getSubmitErrorMessage(error))
  }
}
