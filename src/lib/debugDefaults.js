// Local development only. The switch defaults to on and never appears in builds.
export const DEBUG_STORAGE_KEY = 'kadima-debug-autofill'
export const DEBUG = import.meta.env.DEV && localStorage.getItem(DEBUG_STORAGE_KEY) !== 'off'

export const debugDefaults = {
  contactForm: {
    nombre: 'María',
    apellido: 'González',
    email: 'maria.gonzalez@example.com',
    celular: '+54 9 11 2345-6789',
    consulta: 'Hola, me interesa conocer más sobre sus capacitaciones en administración de obras sociales.',
  },
  adminLogin: {
    username: import.meta.env.DEV ? import.meta.env.VITE_DEBUG_ADMIN_USER || '' : '',
    password: import.meta.env.DEV ? import.meta.env.VITE_DEBUG_ADMIN_PASSWORD || '' : '',
  },
  portalLogin: {
    studentEmail: 'estudiante-demo@kadima.invalid',
    clientEmail: 'cliente-demo@kadima.invalid',
    password: import.meta.env.DEV ? import.meta.env.VITE_DEBUG_PORTAL_PASSWORD || '' : '',
  },
  capacitacion: {
    titulo: 'Nueva Capacitación',
    duracion: '8 horas',
    badge: 'Gestión',
    badgeColor: 'navy',
    descripcion: 'Descripción de la capacitación con contenidos prácticos y actualizados para el sector salud.',
    temas: 'Tema 1\nTema 2\nTema 3',
    icono: 'fa-graduation-cap',
    publico: 'Directivos y gestores',
    modalidad: 'Presencial / Virtual',
  },
  equipo: {
    nombre: 'Nueva Especialidad',
    descripcion: '<p>Descripción del equipo médico y sus capacidades para instituciones del sector salud.</p>',
    imagen: '',
  },
  blogPost: {
    titulo: 'Artículo de ejemplo sobre gestión en salud',
    resumen: 'Resumen breve del artículo que aparece en el listado del blog y en las previsualizaciones.',
    contenido: '<p>Contenido del artículo...</p>',
    imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    categoria: 'Gestión',
  },
}
