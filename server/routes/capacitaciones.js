const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middleware/auth')
const prisma = new PrismaClient()

// GET /api/capacitaciones — public
router.get('/', async (req, res) => {
  try {
    const items = await prisma.capacitacion.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    })
    res.json(items)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/capacitaciones/all — admin (includes inactive)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.capacitacion.findMany({ orderBy: { orden: 'asc' } })
    res.json(items)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/capacitaciones/:id — admin
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await prisma.capacitacion.findUnique({ where: { id: Number(req.params.id) } })
    if (!item) return res.status(404).json({ error: 'No encontrado' })
    res.json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/capacitaciones — admin
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, duracion, badge, badgeColor, descripcion, temas, icono, publico, modalidad, orden, activo } = req.body
    const item = await prisma.capacitacion.create({
      data: { titulo, duracion, badge, badgeColor: badgeColor || 'navy', descripcion, temas: temas || [], icono, publico, modalidad, orden: orden ?? 0, activo: activo ?? true },
    })
    res.status(201).json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/capacitaciones/:id — admin
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { titulo, duracion, badge, badgeColor, descripcion, temas, icono, publico, modalidad, orden, activo } = req.body
    const item = await prisma.capacitacion.update({
      where: { id: Number(req.params.id) },
      data: { titulo, duracion, badge, badgeColor, descripcion, temas, icono, publico, modalidad, orden, activo },
    })
    res.json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/capacitaciones/:id — admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.capacitacion.delete({ where: { id: Number(req.params.id) } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
