const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middleware/auth')
const { plainText, sanitizeRichText } = require('../lib/richText')
const prisma = new PrismaClient()

// GET /api/equipos — public
router.get('/', async (req, res) => {
  try {
    const items = await prisma.equipo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        imagen: true,
        orden: true,
      },
    })
    res.json(items)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/equipos/all — admin
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.equipo.findMany({ orderBy: { orden: 'asc' } })
    res.json(items)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/equipos/:id — public detail
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Equipo inválido' })
    const item = await prisma.equipo.findFirst({ where: { id, activo: true } })
    if (!item) return res.status(404).json({ error: 'Equipo no encontrado' })
    res.json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/equipos — admin
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, contenido, imagen, orden, activo } = req.body
    const summary = plainText(descripcion)
    const body = sanitizeRichText(contenido)
    if (!nombre?.trim() || nombre.trim().length > 90 || !summary || !body) {
      return res.status(400).json({ error: 'Completá un nombre de hasta 90 caracteres, la descripción breve y el contenido.' })
    }
    const item = await prisma.equipo.create({
      data: {
        nombre: nombre.trim(),
        descripcion: summary,
        contenido: body,
        imagen: imagen || null,
        orden: orden ?? 0,
        activo: activo ?? true,
      },
    })
    res.status(201).json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/equipos/:id — admin
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, contenido, imagen, orden, activo } = req.body
    const summary = plainText(descripcion)
    const body = sanitizeRichText(contenido)
    if (!nombre?.trim() || nombre.trim().length > 90 || !summary || !body) {
      return res.status(400).json({ error: 'Completá un nombre de hasta 90 caracteres, la descripción breve y el contenido.' })
    }
    const item = await prisma.equipo.update({
      where: { id: Number(req.params.id) },
      data: {
        nombre: nombre.trim(),
        descripcion: summary,
        contenido: body,
        imagen: imagen || null,
        orden,
        activo,
      },
    })
    res.json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/equipos/:id — admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.equipo.delete({ where: { id: Number(req.params.id) } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
