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
  return sanitizeHtml(String(value || ''), {
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
