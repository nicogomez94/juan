export const studentCourses = [
  { title: 'Administración de Obras Sociales', progress: 68, next: 'Módulo 4 · Auditoría de prestaciones', status: 'En curso' },
  { title: 'SURGE y Recupero de Costos', progress: 100, next: 'Certificado disponible', status: 'Finalizado' },
  { title: 'Planificación en Salud', progress: 24, next: 'Módulo 2 · Indicadores sanitarios', status: 'En curso' },
]

export const studentActivities = [
  { date: '22 oct', title: 'Clase virtual · Auditoría de prestaciones', course: 'Administración de Obras Sociales' },
  { date: '28 oct', title: 'Entrega de actividad práctica', course: 'Planificación en Salud' },
  { date: '04 nov', title: 'Encuentro de consultas', course: 'Administración de Obras Sociales' },
]

export const clinicalRecords = [
  { code: 'HC-DEMO-001', person: 'Paciente de muestra A', updated: '22 oct 2026', state: 'En seguimiento', area: 'Auditoría médica' },
  { code: 'HC-DEMO-002', person: 'Paciente de muestra B', updated: '20 oct 2026', state: 'Pendiente de revisión', area: 'Internación domiciliaria' },
  { code: 'HC-DEMO-003', person: 'Paciente de muestra C', updated: '18 oct 2026', state: 'Revisada', area: 'Gestión de prestaciones' },
]

export const clinicalActivity = [
  'Recepción de documentación clínica',
  'Revisión por auditoría médica',
  'Actualización de seguimiento',
]
