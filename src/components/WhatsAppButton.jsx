import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function WhatsAppButton() {
  const [wa, setWa] = useState('5491100000000')

  useEffect(() => {
    api.get('/api/contact-info')
      .then(d => { if (d.map?.whatsapp) setWa(d.map.whatsapp) })
      .catch(() => {})
  }, [])

  return (
    <a
      href={`https://wa.me/${wa}`}
      className="whatsapp-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <i className="fab fa-whatsapp" />
    </a>
  )
}
