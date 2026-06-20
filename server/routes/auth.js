const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../middleware/auth')

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body
  const ADMIN_USER = process.env.ADMIN_USER || 'admin'
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }

  const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' })
  res.json({ token, username })
})

// GET /api/auth/verify
router.get('/verify', (req, res) => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false })
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), JWT_SECRET)
    res.json({ valid: true, username: payload.username })
  } catch {
    res.status(401).json({ valid: false })
  }
})

module.exports = router
