const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'kadima-secret-change-in-production')
const adminConfigured = process.env.NODE_ENV !== 'production' || (
  Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD && JWT_SECRET) &&
  process.env.ADMIN_PASSWORD !== 'admin' &&
  JWT_SECRET !== 'kadima-secret-change-in-production'
)

function authMiddleware(req, res, next) {
  if (!adminConfigured) {
    return res.status(503).json({ error: 'El panel de administración no está configurado en esta instancia.' })
  }
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.admin = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

module.exports = { authMiddleware, JWT_SECRET, adminConfigured }
