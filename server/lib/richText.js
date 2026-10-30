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
  return sanitizeHtml(String(value || ''), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

module.exports = { sanitizeRichText, plainText }
