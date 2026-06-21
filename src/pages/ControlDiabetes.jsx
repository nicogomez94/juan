import ServiceDetailPage, { ServiceList, ServiceSection } from '../components/ServiceDetailPage'

export default function ControlDiabetes() {
  return (
    <ServiceDetailPage
      eyebrow="Servicio integral de diabetes"
      title="Control de Pacientes Diabéticos"
      subtitle="Acompañamiento continuo, personalizado y multidisciplinario para un control metabólico efectivo."
      introTitle="Atención integral para prevenir complicaciones"
      intro={[
        'El Servicio Integral de Diabetes está diseñado para ofrecer un acompañamiento continuo, personalizado y multidisciplinario a pacientes con diabetes tipo 1, tipo 2 y diabetes gestacional, enfocándose en el control metabólico efectivo y la prevención de complicaciones a largo plazo.',
        'A través de un enfoque centralizado, el servicio combina la atención médica de alta complejidad con herramientas de educación digital y automanejo.',
      ]}
      imageKey="services.control-diabetes.main"
      imageCaption="Imagen administrable desde el panel"
      ctaTitle="Construyamos un programa integral de diabetes"
      ctaText="Conozca cómo adaptar el servicio a las necesidades clínicas y administrativas de su organización."
    >
      <ServiceSection
        number="01"
        title="Equipo Multidisciplinario Centralizado"
        intro="El paciente no solo accede a la consulta diabetológica, sino a un ecosistema de profesionales coordinados que abordan la patología desde todos sus frentes."
        tone="muted"
      >
        <ServiceList
          columns
          items={[
            { title: 'Diabetólogos y Endocrinólogos', text: 'Directores del plan terapéutico y ajuste de medicación.' },
            { title: 'Nutricionistas Especializados', text: 'Diseño de planes alimentarios personalizados, conteo de hidratos de carbono y educación nutricional adaptada al estilo de vida.' },
            { title: 'Educadores en Diabetes', text: 'Profesionales que capacitan en el automonitoreo glucémico, la técnica de aplicación de insulina y el manejo de hipo/hiperglucemias.' },
            { title: 'Prevención de Complicaciones', text: 'Coordinación con especialistas en cardiología, nefrología, oftalmología y cuidado del pie diabético.' },
          ]}
        />
      </ServiceSection>

      <ServiceSection
        number="02"
        title="Incorporación de Tecnología Aplicada a la Salud"
        intro="El servicio se destaca por la integración y el seguimiento de tecnologías modernas para el control de la enfermedad."
      >
        <ServiceList
          items={[
            'Monitoreo continuo de glucosa mediante sistemas de lectura flash.',
            'Optimización y seguimiento de pacientes usuarios de bombas de infusión de insulina.',
            'Plataformas digitales y telemedicina para el reporte de métricas y ajuste rápido de dosis sin necesidad de traslados innecesarios.',
          ]}
        />
      </ServiceSection>

      <ServiceSection
        number="03"
        title="Programas de Educación Terapéutica"
        intro="Entendiendo que el día a día de la diabetes lo maneja el paciente, se ofrecen talleres y talleres virtuales sobre:"
        tone="muted"
      >
        <ServiceList
          items={[
            'Uso correcto de la medicación e insulinas.',
            'Estrategias de resolución ante situaciones especiales —días de enfermedad, ejercicio y viajes—.',
            'Talleres de cocina y lectura de etiquetas nutricionales.',
          ]}
        />
      </ServiceSection>

      <ServiceSection number="04" title="Gestión Eficiente de Insumos y Continuidad del Tratamiento">
        <p className="service-detail__body-copy">El programa facilita los circuitos administrativos y médicos para que el acceso a las tiras reactivas, lancetas, medicación oral o insulinas sea ágil, garantizando la adherencia al tratamiento exigida por los marcos regulatorios y de cobertura médica vigentes.</p>
      </ServiceSection>

      <ServiceSection number="05" title="Armado de legajos para la presentación del paciente diabético en SURGE" tone="muted">
        <p className="service-detail__body-copy">El programa garantiza la documentación necesaria para percibir el subsidio que ofrece la Superintendencia de Servicios de Salud por beneficiario diabético.</p>
      </ServiceSection>
    </ServiceDetailPage>
  )
}
