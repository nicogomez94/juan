require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const path = require('path')
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', process.env.FRONTEND_URL].filter(Boolean) }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// Routes
app.use('/api/upload', require('./routes/upload'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/capacitaciones', require('./routes/capacitaciones'))
app.use('/api/equipos', require('./routes/equipos'))
app.use('/api/contact-info', require('./routes/contactInfo'))
app.use('/api/blog', require('./routes/blog'))
app.use('/api/site-images', require('./routes/siteImages'))

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }))

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.listen(PORT, HOST, () => {
  console.log(`✅ API running on http://${HOST}:${PORT}`)
})
