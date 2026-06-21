import ServiceDetailPage, { ServiceList, ServiceSection, ServiceTextBlocks } from '../components/ServiceDetailPage'

export default function InternacionDomiciliaria() {
  return (
    <ServiceDetailPage
      eyebrow="Continuidad asistencial"
      title="Internación Domiciliaria"
      subtitle="Atención médica profesional, continua y personalizada en el domicilio del paciente."
      introTitle="Cuidado hospitalario con la cercanía del hogar"
      intro={[
        'Brindamos atención médica profesional, continua y personalizada en el domicilio del paciente, orientada a garantizar la continuidad asistencial con estándares clínicos equivalentes a los de una institución hospitalaria. Nuestro modelo integra atención médica, enfermería, terapias y suministro de insumos y equipamiento médico necesarios para una atención segura y eficaz.',
      ]}
      imageKey="services.internacion-domiciliaria.main"
      imageCaption="Imagen administrable desde el panel"
      ctaTitle="Evaluemos las necesidades de su población"
      ctaText="Solicite una presentación técnica y comercial adaptada a su red de prestadores o financiador. Ofrecemos evaluación piloto y estimación de ahorro proyectado para su población objetivo."
    >
      <ServiceSection title="Un modelo clínico coordinado" tone="muted">
        <ServiceTextBlocks
          items={[
            {
              title: 'Coordinación clínica',
              text: 'Un coordinador médico asignado articula y supervisa todos los servicios según el diagnóstico y las necesidades específicas del paciente. Gestiona órdenes clínicas, seguimiento diario, comunicación con familiares y continuidad con los equipos de atención primaria y especialistas.',
            },
            {
              title: 'Auditorías “en pie de cama”',
              text: 'Realizamos auditorías clínicas presenciales en pacientes internados en sanatorios, clínicas o UTI cuando proceda, verificando indicaciones, complejidad asistencial y continuidad de cuidados para asegurar la pertinencia del traslado o la continuidad domiciliaria. Estas auditorías aportan evidencia objetiva para decisiones clínicas y administrativas.',
            },
          ]}
        />
      </ServiceSection>

      <ServiceSection title="Beneficios clave">
        <ServiceList
          items={[
            { title: 'Ahorro comprobable', text: 'El costo de internación domiciliaria —equipos, insumos y personal— suele representar una fracción del costo de una cama en clínica o UTI, optimizando el presupuesto del financiador sin comprometer la calidad.' },
            { title: 'Calidad y seguridad', text: 'Protocolos clínicos estandarizados, monitoreo continuo y trazabilidad de intervenciones.' },
            { title: 'Mejor experiencia', text: 'Atención centrada, reducción del riesgo de eventos nosocomiales y mayor confort para el paciente y su familia.' },
            { title: 'Menor estancia hospitalaria', text: 'Reducción de estancias hospitalarias y descongestión de camas críticas.' },
            { title: 'Informes y control', text: 'Reportes clínicos periódicos y documentación de auditorías para soporte administrativo y de reembolso.' },
          ]}
        />
        <p className="service-detail__closing">Ofrecemos un equipo multidisciplinario con experiencia en cuidados domiciliarios y gestión clínica, coordinador médico dedicado y procesos de auditoría clínica que garantizan transparencia, eficiencia y resultados medibles.</p>
      </ServiceSection>
    </ServiceDetailPage>
  )
}
