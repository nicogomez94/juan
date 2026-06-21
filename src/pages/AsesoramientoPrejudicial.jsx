import ServiceDetailPage, { ServiceList, ServiceSection, ServiceTextBlocks } from '../components/ServiceDetailPage'

export default function AsesoramientoPrejudicial() {
  return (
    <ServiceDetailPage
      eyebrow="Prevención de amparos"
      title="Asesoramiento Pre-Judicial"
      subtitle="Procesos más ágiles, decisiones mejor fundamentadas y conflictos resueltos antes de llegar a un juzgado."
      introTitle="La demora administrativa también puede convertirse en conflicto"
      intro={[
        'El principal motor de los amparos de salud no es siempre la negativa, sino la demora —mora administrativa—. Trabajamos sobre los procesos, la calidad de las decisiones y los canales de resolución para prevenir el conflicto judicial.',
      ]}
      imageKey="services.asesoramiento-prejudicial.main"
      ctaTitle="Prevenir el conflicto también es cuidar"
      ctaText="Analicemos los circuitos de autorización, auditoría y resolución de su organización para reducir riesgos y mejorar la experiencia del afiliado."
    >
      <ServiceSection number="01" title="Rediseño y Optimización de Procesos —eliminación de la mora—" tone="muted">
        <ServiceTextBlocks
          items={[
            { title: 'Mapeo de Cuellos de Botella', text: 'Analizamos el flujo de autorizaciones para identificar dónde se traban los trámites, por ejemplo, por falta de integración entre sistemas o burocracia excesiva.' },
            { title: 'Implementación de Vías Rápidas', text: 'Diseñamos protocolos de “Fast-Track” para patologías críticas —oncológicas, pediátricas y urgencias—, asegurando respuestas en 24/48 horas.' },
            { title: 'Automatización Inteligente', text: 'Asesoramos en la integración de sistemas para que las prestaciones de baja complejidad y alto volumen —estudios de rutina y medicamentos crónicos— se autoricen automáticamente.' },
          ]}
        />
      </ServiceSection>

      <ServiceSection number="02" title="Auditoría Médica Preventiva y de Calidad" intro="Transformamos la auditoría de un “filtro restrictivo” a una “herramienta de resolución”.">
        <ServiceTextBlocks
          items={[
            { title: 'Revisión de Negativas —Sello de Calidad—', text: 'Ninguna negativa de prestación compleja sale de la organización sin pasar por nuestra revisión. Nos aseguramos de que el rechazo esté fundado en evidencia científica —Guías de Práctica Clínica— y no solo en criterios administrativos o contractuales restrictivos.' },
            { title: 'Búsqueda de Alternativas', text: 'Si no podemos cubrir el tratamiento exacto solicitado por el médico tratante, nuestra auditoría médica inmediatamente propone y gestiona una alternativa terapéutica equivalente y eficaz, evitando que el paciente sienta que está en un “limbo”.' },
          ]}
        />
      </ServiceSection>

      <ServiceSection number="03" title="Implementación de Métodos Alternativos de Resolución de Conflictos" intro="Creamos “colchones” institucionales para absorber el conflicto antes de que llegue a un juzgado." tone="muted">
        <ServiceList
          items={[
            { title: 'Defensoría del Afiliado / Usuario Interno', text: 'Implementamos y operamos esta figura independiente dentro de la organización. El afiliado siente que es escuchado por un tercero imparcial, lo que reduce drásticamente la frustración que deriva en demandas.' },
            { title: 'Mediación Sanitaria Prejudicial', text: 'Ofrecemos un espacio de mediación técnica donde el médico auditor de la consultora se reúne —virtual o presencialmente— con el médico tratante del paciente. Los conflictos se destraban cuando los médicos hablan directamente entre sí, sin intermediarios administrativos.' },
          ]}
        />
      </ServiceSection>

      <ServiceSection number="04" title="Comités de Ética y Tecnología Sanitaria" intro="Para los casos grises, de alto costo o experimentales.">
        <ServiceTextBlocks
          items={[
            { title: 'Evaluación Multidisciplinaria', text: 'Conformamos comités rápidos —médicos, abogados, bioeticistas y economistas de la salud— para evaluar prestaciones de altísimo costo o fuera de protocolo, como tratamientos off-label y medicamentos huérfanos.' },
            { title: 'Fundamentación Sólida', text: 'Emitimos dictámenes técnicos robustos. Si la decisión es favorable, se otorga con tranquilidad. Si es desfavorable, el documento es sólido técnica y legalmente, reduciendo el riesgo procesal.' },
          ]}
        />
      </ServiceSection>

      <ServiceSection number="05" title="Actualización Normativa y “Blindaje” Contractual" intro="El derecho sanitario es dinámico y los jueces fallan constantemente sobre nuevos criterios." tone="muted">
        <ServiceTextBlocks
          items={[
            { title: 'Traducción de Jurisprudencia a Operativa', text: 'Monitoreamos diariamente los fallos de Cámaras y Cortes. Si surge un fallo que obliga a cubrir una nueva prestación, actualizamos los sistemas y protocolos de la empresa antes de que lleguen las primeras demandas.' },
          ]}
        />
      </ServiceSection>
    </ServiceDetailPage>
  )
}
