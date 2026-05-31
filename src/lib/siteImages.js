import { useEffect, useMemo, useState } from 'react'
import { api } from './api'

export const SITE_IMAGE_DEFAULTS = [
  {
    key: 'home.hero.main',
    label: 'Inicio - imagen principal',
    section: 'Inicio',
    defaultUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
    alt: 'Gestion en salud',
    ratio: 'vertical',
  },
  {
    key: 'home.hero.secondary',
    label: 'Inicio - profesional de salud',
    section: 'Inicio',
    defaultUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80',
    alt: 'Profesional de salud',
    ratio: 'horizontal',
  },
  {
    key: 'home.hero.training',
    label: 'Inicio - capacitacion medica',
    section: 'Inicio',
    defaultUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
    alt: 'Capacitacion medica',
    ratio: 'horizontal',
  },
  {
    key: 'nosotros.intro.team',
    label: 'Nosotros - equipo',
    section: 'Nosotros',
    defaultUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=700&q=80',
    alt: 'Equipo Kadima Salud',
    ratio: '4:3',
  },
  {
    key: 'surge.intro.documents',
    label: 'SURGE - expedientes',
    section: 'SURGE',
    defaultUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
    alt: 'Gestion de expedientes SURGE',
    ratio: '4:3',
  },
  {
    key: 'equipos.intro.medical',
    label: 'Equipos - equipo medico',
    section: 'Equipos',
    defaultUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80',
    alt: 'Equipo medico quirurgico',
    ratio: '4:3',
  },
]

const DEFAULT_IMAGE_MAP = SITE_IMAGE_DEFAULTS.reduce((acc, image) => {
  acc[image.key] = {
    ...image,
    url: image.defaultUrl,
    customUrl: null,
  }
  return acc
}, {})

export function useSiteImages() {
  const [images, setImages] = useState(DEFAULT_IMAGE_MAP)

  useEffect(() => {
    let cancelled = false
    api.get('/api/site-images')
      .then(data => {
        if (!cancelled && data.images) {
          setImages(prev => ({ ...prev, ...data.images }))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return useMemo(() => ({
    images,
    image: key => images[key] || DEFAULT_IMAGE_MAP[key],
  }), [images])
}
