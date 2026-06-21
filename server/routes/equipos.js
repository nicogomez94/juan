const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middleware/auth')
const prisma = new PrismaClient()

// GET /api/equipos — public
router.get('/', async (req, res) => {
  try {
    const items = await prisma.equipo.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
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

// POST /api/equipos — admin
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, imagen, orden, activo } = req.body
    const item = await prisma.equipo.create({
      data: { nombre, descripcion, imagen: imagen || null, orden: orden ?? 0, activo: activo ?? true },
    })
    res.status(201).json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/equipos/:id — admin
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, imagen, orden, activo } = req.body
    const item = await prisma.equipo.update({
      where: { id: Number(req.params.id) },
      data: { nombre, descripcion, imagen: imagen || null, orden, activo },
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
