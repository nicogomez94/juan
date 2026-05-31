const { PrismaClient } = require('@prisma/client')
const { SITE_IMAGES } = require('../lib/siteImages')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Capacitaciones ──────────────────────────────────────────────
  await prisma.capacitacion.deleteMany()
  await prisma.capacitacion.createMany({
    data: [
      {
        titulo: 'Administración de Obras Sociales',
        duracion: '16 horas',
        badge: 'Gestión',
        badgeColor: 'navy',
        descripcion: 'Marco normativo, operatoria cotidiana y mejores prácticas para la gestión eficiente de obras sociales. Incluye relación con prestadores, auditoría y control de prestaciones.',
        temas: JSON.stringify(['Marco normativo vigente', 'Operatoria cotidiana', 'Relación con prestadores', 'Auditoría de prestaciones', 'Control de costos']),
        icono: 'fa-building-columns',
        publico: 'Directivos y gestores',
        modalidad: 'Presencial / Virtual',
        orden: 1,
      },
      {
        titulo: 'SURGE y Recupero de Costos',
        duracion: '8 horas',
        badge: 'Regulatorio',
        badgeColor: 'teal',
        descripcion: 'Procedimientos de presentación ante la Superintendencia de Servicios de Salud, documentación requerida y seguimiento de expedientes de recupero de costos.',
        temas: JSON.stringify(['Procedimientos SURGE', 'Documentación requerida', 'Seguimiento de expedientes', 'Recupero de costos']),
        icono: 'fa-file-contract',
        publico: 'Personal administrativo',
        modalidad: 'Presencial / Virtual',
        orden: 2,
      },
      {
        titulo: 'Gestión de Prestaciones Médicas',
        duracion: '12 horas',
        badge: 'Clínica',
        badgeColor: 'navy',
        descripcion: 'Auditoría médica, control de calidad de prestaciones, nomencladores y gestión de la relación prestador-financiador en el sistema de salud argentino.',
        temas: JSON.stringify(['Auditoría médica', 'Nomencladores', 'Control de calidad', 'Relación prestador-financiador']),
        icono: 'fa-heart-pulse',
        publico: 'Auditores médicos',
        modalidad: 'Presencial',
        orden: 3,
      },
      {
        titulo: 'Planificación en Salud',
        duracion: '20 horas',
        badge: 'Estrategia',
        badgeColor: 'teal',
        descripcion: 'Herramientas de planificación estratégica aplicadas al sector salud: indicadores sanitarios, presupuesto, tablero de control y toma de decisiones basada en datos.',
        temas: JSON.stringify(['Indicadores sanitarios', 'Planificación estratégica', 'Presupuesto en salud', 'Tablero de control', 'Toma de decisiones']),
        icono: 'fa-chart-pie',
        publico: 'Directivos y mandos medios',
        modalidad: 'Virtual',
        orden: 4,
      },
    ],
  })
  console.log('✓ Capacitaciones seeded')

  // ── Equipos ─────────────────────────────────────────────────────
  await prisma.equipo.deleteMany()
  await prisma.equipo.createMany({
    data: [
      { nombre: 'Cirugía General', descripcion: 'Equipos quirúrgicos completos para procedimientos de cirugía general: abierta, laparoscópica y de urgencia en instituciones asociadas.', icono: 'fa-scissors', orden: 1 },
      { nombre: 'Cardiología', descripcion: 'Especialistas en salud cardiovascular para estudios diagnósticos, seguimientos clínicos e intervenciones en el sector salud.', icono: 'fa-heart', orden: 2 },
      { nombre: 'Traumatología', descripcion: 'Profesionales en ortopedia y traumatología para diagnóstico y tratamiento de patologías del aparato locomotor y cirugía ortopédica.', icono: 'fa-bone', orden: 3 },
      { nombre: 'Neurología', descripcion: 'Especialistas en neurología clínica y neurocirugía para diagnóstico y tratamiento de patologías del sistema nervioso de alta complejidad.', icono: 'fa-brain', orden: 4 },
      { nombre: 'Oftalmología', descripcion: 'Equipos de cirugía ocular y profesionales especializados para diagnóstico, seguimiento y tratamiento oftalmológico integral.', icono: 'fa-eye', orden: 5 },
      { nombre: 'Neonatología', descripcion: 'Profesionales especializados en cuidados neonatales intensivos y no intensivos para instituciones materno-infantiles.', icono: 'fa-baby', orden: 6 },
      { nombre: 'Neumonología', descripcion: 'Especialistas en patologías respiratorias para diagnóstico y tratamiento de enfermedades pulmonares crónicas y agudas.', icono: 'fa-lungs', orden: 7 },
      { nombre: 'Oncología', descripcion: 'Profesionales en oncología clínica para acompañamiento integral en diagnóstico, tratamiento y seguimiento oncológico.', icono: 'fa-person-rays', orden: 8 },
      { nombre: 'Otras especialidades', descripcion: '¿Necesitás una especialidad no listada? Contactanos y evaluamos la posibilidad de incorporar el perfil requerido.', icono: 'fa-syringe', orden: 9 },
    ],
  })
  console.log('✓ Equipos seeded')

  // ── Contact Info ─────────────────────────────────────────────────
  await prisma.contactInfo.deleteMany()
  await prisma.contactInfo.createMany({
    data: [
      { key: 'email', label: 'Email', value: 'contacto@kadimasalud.com.ar' },
      { key: 'whatsapp', label: 'WhatsApp (número)', value: '5491100000000' },
      { key: 'instagram', label: 'Instagram (usuario)', value: 'KadimaSalud' },
      { key: 'facebook', label: 'Facebook (usuario)', value: 'KadimaSalud' },
      { key: 'direccion', label: 'Dirección', value: 'Buenos Aires, Argentina' },
      { key: 'horario', label: 'Horario de atención', value: 'Lunes a Viernes, 9:00 a 18:00' },
    ],
  })
  console.log('✓ ContactInfo seeded')

  // ── Site Images ─────────────────────────────────────────────────
  await prisma.siteImage.deleteMany()
  await prisma.siteImage.createMany({ data: SITE_IMAGES })
  console.log('✓ SiteImage seeded')

  // ── Blog demo post ─────────────────────────────────────────────
  await prisma.blogPost.deleteMany()
  await prisma.blogPost.create({
    data: {
      titulo: 'Claves para la gestión eficiente de obras sociales en 2026',
      slug: 'claves-gestion-obras-sociales-2026',
      resumen: 'El sistema de salud argentino enfrenta nuevos desafíos normativos y financieros. En este artículo analizamos las principales estrategias para optimizar la gestión de obras sociales.',
      contenido: '<h2>Contexto actual del sistema de salud</h2><p>El sistema de salud argentino atraviesa un período de transformación, con nuevas regulaciones y exigencias de transparencia que requieren adaptación constante por parte de las obras sociales.</p><h2>Principales desafíos</h2><p>Entre los desafíos más relevantes destacamos la actualización de nomencladores, el control de costos de prestaciones y la mejora en la gestión de expedientes SURGE.</p><h2>Estrategias recomendadas</h2><p>Desde Kadima Salud recomendamos implementar tableros de control con indicadores clave, capacitar al personal en normativa actualizada y optimizar los procesos de recupero de costos.</p>',
      imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      categoria: 'Gestión',
      publicado: true,
      fechaPublicacion: new Date('2026-05-15'),
    },
  })
  console.log('✓ BlogPost seeded')

  console.log('\n✅ Database seeded successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
