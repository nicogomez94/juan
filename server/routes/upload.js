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

const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(ext)) cb(null, true)
    else cb(new Error('Solo se permiten imagenes JPG, PNG o WebP'))
  },
})

function handleUpload(req, res, next) {
  upload.array('images', 10)(req, res, err => {
    if (!err) return next()
    const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Cada imagen debe pesar menos de 5 MB' : err.message
    return res.status(400).json({ error: msg })
  })
}

// POST /api/upload  — sube hasta 10 imágenes, devuelve sus URLs
router.post('/', authMiddleware, handleUpload, (req, res) => {
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
