const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middleware/auth')
const prisma = new PrismaClient()

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

// GET /api/blog — public (published only)
router.get('/', async (req, res) => {
  try {
    const { categoria, limit } = req.query
    const where = { publicado: true }
    if (categoria) where.categoria = categoria
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { fechaPublicacion: 'desc' },
      take: limit ? Number(limit) : undefined,
      select: { id: true, titulo: true, slug: true, resumen: true, imagen: true, categoria: true, fechaPublicacion: true, createdAt: true },
    })
    res.json(posts)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/blog/all — admin (all posts)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(posts)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/blog/:slug — public
router.get('/:slug', async (req, res) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, publicado: true },
    })
    if (!post) return res.status(404).json({ error: 'Post no encontrado' })
    res.json(post)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/blog/id/:id — admin
router.get('/id/:id', authMiddleware, async (req, res) => {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: Number(req.params.id) } })
    if (!post) return res.status(404).json({ error: 'Post no encontrado' })
    res.json(post)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/blog — admin
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, contenido, resumen, imagen, categoria, publicado } = req.body
    const slug = slugify(titulo) + '-' + Date.now().toString(36)
    const post = await prisma.blogPost.create({
      data: {
        titulo,
        slug,
        contenido,
        resumen,
        imagen: imagen || null,
        categoria: categoria || 'General',
        publicado: publicado ?? false,
        fechaPublicacion: publicado ? new Date() : null,
      },
    })
    res.status(201).json(post)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/blog/:id — admin
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { titulo, contenido, resumen, imagen, categoria, publicado } = req.body
    const existing = await prisma.blogPost.findUnique({ where: { id: Number(req.params.id) } })
    if (!existing) return res.status(404).json({ error: 'Post no encontrado' })

    const wasDraft = !existing.publicado
    const isNowPublished = publicado === true

    const post = await prisma.blogPost.update({
      where: { id: Number(req.params.id) },
      data: {
        titulo,
        contenido,
        resumen,
        imagen: imagen || null,
        categoria: categoria || 'General',
        publicado: publicado ?? existing.publicado,
        fechaPublicacion: wasDraft && isNowPublished ? new Date() : existing.fechaPublicacion,
      },
    })
    res.json(post)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/blog/:id — admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.blogPost.delete({ where: { id: Number(req.params.id) } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
