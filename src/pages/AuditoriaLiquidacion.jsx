import ServiceDetailPage, { ServiceList, ServiceSection } from '../components/ServiceDetailPage'

export default function AuditoriaLiquidacion() {
  return (
    <ServiceDetailPage
      eyebrow="Auditoría corporativa"
      title="Auditoría de Liquidación"
      subtitle="Garantía de cumplimiento, control financiero y optimización de pagos."
      introTitle="Auditoría Corporativa de Liquidaciones de Prestaciones Médicas"
      intro={[
        'Brindamos servicios profesionales de auditoría de liquidaciones de prestaciones médicas orientados a asegurar la integridad, exactitud y conformidad de los procesos de pago. Nuestro enfoque combina metodologías técnicas, experiencia normativa y análisis cuantitativo para identificar inconsistencias, riesgos de sobrepago y brechas de cumplimiento contractual. Entregamos reportes ejecutivos y operativos con evidencia verificable y recomendaciones estructuradas para la recuperación de montos y la mitigación de riesgos futuros.',
      ]}
      imageKey="services.auditoria-liquidacion.main"
      ctaTitle="Protegé la integridad de cada liquidación"
      ctaText="Solicite una propuesta técnica y comercial adaptada a su organización. Contacte a nuestro equipo para agendar una reunión de diagnóstico y recibir una muestra de análisis sin compromiso."
    >
      <ServiceSection title="Resultados concretos para su organización" tone="muted">
        <ServiceList
          columns
          items={[
            { icon: 'fa-scale-balanced', text: 'Aseguramiento del cumplimiento normativo y contractual.' },
            { icon: 'fa-magnifying-glass-dollar', text: 'Identificación y cuantificación de sobrepagos y errores de facturación.' },
            { icon: 'fa-chart-line', text: 'Reducción medible del gasto operativo y financiero asociado a prestaciones.' },
            { icon: 'fa-file-circle-check', text: 'Informes ejecutivos para la toma de decisiones y auditorías internas.' },
            { icon: 'fa-list-check', text: 'Planes de corrección e implementación para garantizar mejoras sostenibles.' },
          ]}
        />
      </ServiceSection>
    </ServiceDetailPage>
  )
}
