const express = require('express')

const router = express.Router()

const CONTACT_SERVICE_URL = 'https://contact-form-service-e8aa.onrender.com/api/contact'
const DEFAULT_CONTACT_TO = 'contacto@kadimasalud.com.ar'
const DEFAULT_CONTACT_SITE = 'Kadima Salud'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanString(value = '') {
  return String(value).trim()
}

function getContactTo() {
  return cleanString(process.env.CONTACT_TO || process.env.VITE_CONTACT_TO || DEFAULT_CONTACT_TO)
}

function getContactSite() {
  return cleanString(process.env.CONTACT_SITE || process.env.VITE_CONTACT_SITE || DEFAULT_CONTACT_SITE)
}

function clientError(message) {
  return { success: false, error: message }
}

router.post('/', async (req, res) => {
  const name = cleanString(req.body?.name)
  const email = cleanString(req.body?.email)
  const message = cleanString(req.body?.message)
  const company = cleanString(req.body?.company)
  const to = getContactTo()
  const site = getContactSite()

  if (company) {
    return res.json({ success: true })
  }

  if (!name || !email || !message) {
    return res.status(400).json(clientError('Completá nombre, email y consulta.'))
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json(clientError('Ingresá un email válido.'))
  }

  if (!to || !site) {
    return res.status(500).json(clientError('Falta configurar el destino del formulario.'))
  }

  try {
    const response = await fetch(CONTACT_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        to,
        message,
        site,
        company: '',
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return res.status(response.status).json(clientError(data?.error || 'No se pudo enviar la consulta.'))
    }

    if (!data || data.success !== true) {
      return res.status(502).json(clientError(data?.error || 'El servicio de contacto no confirmó el envío.'))
    }

    return res.json({ success: true })
  } catch (error) {
    return res.status(502).json(clientError('No pudimos conectar con el servicio de contacto.'))
  }
})

module.exports = router
