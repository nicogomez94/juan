const sanitizeHtml = require('sanitize-html')

const allowedTags = [
  'p',
  'br',
  'h2',
  'h3',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'blockquote',
]

function sanitizeRichText(value) {
  const normalized = String(value || '')
    .replace(/<div\b[^>]*>/gi, '<p>')
    .replace(/<\/div>/gi, '</p>')
    .replace(/<span\b[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')

  return sanitizeHtml(normalized, {
    allowedTags,
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  }).trim()
}

function plainText(value, maxLength = 240) {
  const spaced = String(value || '').replace(
    /<\/?(?:p|div|h[1-6]|li|ul|ol|blockquote|br)\b[^>]*>/gi,
    ' ',
  )
  const text = sanitizeHtml(spaced, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  const clipped = text.slice(0, maxLength + 1)
  const lastSpace = clipped.lastIndexOf(' ')
  const safeEnd = lastSpace >= Math.floor(maxLength * 0.75) ? lastSpace : maxLength
  return `${clipped.slice(0, safeEnd).replace(/[\s,.;:!?-]+$/g, '')}…`
}

module.exports = { sanitizeRichText, plainText }
