const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middleware/auth')
const { SITE_IMAGES, SITE_IMAGE_KEYS } = require('../lib/siteImages')

const prisma = new PrismaClient()

function isAllowedUrl(url) {
  if (!url) return true
  return typeof url === 'string' && url.startsWith('/uploads/')
}

async function ensureDefaults() {
  await Promise.all(SITE_IMAGES.map(image => prisma.siteImage.upsert({
    where: { key: image.key },
    update: {
      label: image.label,
      section: image.section,
      defaultUrl: image.defaultUrl,
      ratio: image.ratio,
    },
    create: image,
  })))
}

function sortImages(images) {
  const order = SITE_IMAGES.reduce((acc, image, index) => {
    acc[image.key] = index
    return acc
  }, {})
  return images.sort((a, b) => (order[a.key] ?? 999) - (order[b.key] ?? 999))
}

function toPublicImage(image) {
  return {
    key: image.key,
    label: image.label,
    section: image.section,
    url: image.url || image.defaultUrl,
    customUrl: image.url,
    defaultUrl: image.defaultUrl,
    alt: image.alt,
    ratio: image.ratio,
    updatedAt: image.updatedAt,
  }
}

// GET /api/site-images - public map for page rendering
router.get('/', async (req, res) => {
  try {
    await ensureDefaults()
    const images = await prisma.siteImage.findMany()
    const map = sortImages(images).reduce((acc, image) => {
      acc[image.key] = toPublicImage(image)
      return acc
    }, {})
    res.json({ images: map })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/site-images/all - admin list
router.get('/all', authMiddleware, async (req, res) => {
  try {
    await ensureDefaults()
    const images = await prisma.siteImage.findMany()
    res.json(sortImages(images).map(toPublicImage))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/site-images/:key - admin update/reset
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const key = req.params.key
    const { url, alt } = req.body

    if (!SITE_IMAGE_KEYS.has(key)) {
      return res.status(404).json({ error: 'Imagen no encontrada' })
    }
    if (!isAllowedUrl(url)) {
      return res.status(400).json({ error: 'Solo se permiten imagenes subidas desde el panel' })
    }

    await ensureDefaults()
    const image = await prisma.siteImage.update({
      where: { key },
      data: {
        url: url || null,
        alt: typeof alt === 'string' && alt.trim() ? alt.trim().slice(0, 120) : undefined,
      },
    })
    res.json(toPublicImage(image))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
