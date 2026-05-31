const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

const uploadDir = path.join(__dirname, '../public/uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten archivos de imagen'))
  },
})

// POST /api/upload  — sube hasta 10 imágenes, devuelve sus URLs
router.post('/', authMiddleware, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No se recibieron archivos' })
  }
  const urls = req.files.map(f => `/uploads/${f.filename}`)
  res.json({ urls })
})

// DELETE /api/upload — borra un archivo por filename
router.delete('/', authMiddleware, (req, res) => {
  const { filename } = req.body
  if (!filename || filename.includes('/') || filename.includes('..')) {
    return res.status(400).json({ error: 'Nombre de archivo inválido' })
  }
  const filePath = path.join(uploadDir, filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  res.json({ ok: true })
})

module.exports = router
