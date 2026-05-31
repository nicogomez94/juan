require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173', process.env.FRONTEND_URL].filter(Boolean) }))
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/capacitaciones', require('./routes/capacitaciones'))
app.use('/api/equipos', require('./routes/equipos'))
app.use('/api/contact-info', require('./routes/contactInfo'))
app.use('/api/blog', require('./routes/blog'))

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }))

app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`)
})
