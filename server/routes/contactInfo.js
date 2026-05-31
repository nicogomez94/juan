const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middleware/auth')
const prisma = new PrismaClient()

// GET /api/contact-info — public
router.get('/', async (req, res) => {
  try {
    const items = await prisma.contactInfo.findMany({ orderBy: { id: 'asc' } })
    // Return as object map for easy consumption
    const map = {}
    items.forEach(i => { map[i.key] = i.value })
    res.json({ map, items })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/contact-info/:key — admin
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { value, label } = req.body
    const item = await prisma.contactInfo.upsert({
      where: { key: req.params.key },
      update: { value, ...(label && { label }) },
      create: { key: req.params.key, label: label || req.params.key, value },
    })
    res.json(item)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/contact-info — admin bulk update
router.put('/', authMiddleware, async (req, res) => {
  try {
    const updates = req.body // array of { key, value, label }
    const results = await Promise.all(
      updates.map(({ key, value, label }) =>
        prisma.contactInfo.upsert({
          where: { key },
          update: { value, ...(label && { label }) },
          create: { key, label: label || key, value },
        })
      )
    )
    res.json(results)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
