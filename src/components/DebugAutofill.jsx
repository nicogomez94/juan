import { useEffect } from 'react'
import { DEBUG, DEBUG_STORAGE_KEY, debugDefaults } from '../lib/debugDefaults'

const samplePassword = import.meta.env.VITE_DEBUG_PORTAL_PASSWORD || 'KadimaLocal-Prueba2026'
let emailCounter = 0
const classDate = (() => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  date.setHours(17, 0, 0, 0)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T17:00`
})()

function valueFor(field, form) {
  const name = field.name || ''
  const placeholder = (field.getAttribute('placeholder') || '').toLowerCase()
  const inPortalLogin = form.classList.contains('portal-login-form')
  const inAdminLogin = Boolean(form.closest('.admin-login'))

  if (inPortalLogin) {
    if (name === 'email') return location.pathname.includes('estudiantes')
      ? debugDefaults.portalLogin.studentEmail
      : debugDefaults.portalLogin.clientEmail
    if (name === 'password') return debugDefaults.portalLogin.password
  }
  if (inAdminLogin) return null // This controlled form uses debugDefaults directly.

  if (field.type === 'email' || name === 'email') {
    if (!form.dataset.debugEmail) form.dataset.debugEmail = `prueba-${Date.now()}-${++emailCounter}@example.invalid`
    return form.dataset.debugEmail
  }
  if (field.type === 'datetime-local' || name === 'startsAt') return classDate
  if (field.type === 'url' || name === 'meetingUrl') return 'https://meet.google.com/'
  if (field.type === 'number') return name === 'amount' ? '245000' : '1'
  if (name === 'password') return field.required ? samplePassword : null
  if (name === 'organizationName') return 'Obra Social Horizonte'
  if (name === 'taxId') return '30-71234567-8'
  if (name === 'organizationPhone') return '+54 11 4000-1200'
  if (name === 'address') return 'Av. Corrientes 1240, CABA'
  if (name === 'position') return 'Responsable de prestaciones'
  if (name === 'phone') return '+54 9 11 5555-0190'
  if (name === 'patientLabel') return 'Afiliado de prueba · 0042'
  if (name === 'subject') return 'Solicitud de cobertura de prueba'
  if (name === 'vendor') return 'Proveedor de prueba'
  if (name === 'body' || name === 'comment') return 'Mensaje de prueba para revisar el seguimiento del caso.'
  if (name === 'celular') return debugDefaults.contactForm.celular
  if (name === 'apellido') return debugDefaults.contactForm.apellido
  if (name === 'nombre') return debugDefaults.contactForm.nombre
  if (name === 'consulta') return debugDefaults.contactForm.consulta
  if (name === 'titulo') return debugDefaults.capacitacion.titulo
  if (name === 'duracion') return debugDefaults.capacitacion.duracion
  if (name === 'badge') return debugDefaults.capacitacion.badge
  if (name === 'icono') return debugDefaults.capacitacion.icono
  if (name === 'publico') return debugDefaults.capacitacion.publico
  if (name === 'temas') return debugDefaults.capacitacion.temas
  if (name === 'resumen') return debugDefaults.blogPost.resumen
  if (name === 'categoria') return debugDefaults.blogPost.categoria
  if (name === 'name') return placeholder.includes('obra social') ? 'Obra Social de Prueba' : 'Persona de Prueba'
  if (name === 'title') return placeholder.includes('bibliografía') ? 'Guía de la unidad' : 'Módulo de prueba'
  if (name === 'description' || name === 'descripcion') return 'Contenido de prueba para revisar esta sección.'
  if (name === 'horario') return 'Lunes a viernes, 9 a 18 h'
  if (field.tagName === 'TEXTAREA') return 'Contenido de prueba para revisar este formulario.'
  if (field.type === 'tel') return debugDefaults.contactForm.celular
  if (placeholder.includes('nombre')) return 'Persona de Prueba'
  return null
}

function setFieldValue(field, value) {
  const prototype = field instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : field instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, value)
  field.dispatchEvent(new Event(field instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
}

function sampleFile() {
  const stream = 'BT /F1 18 Tf 72 760 Td (Documento de prueba Kadima Salud) Tj ET'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const startXref = pdf.length
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`
  offsets.slice(1).forEach(offset => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`
  return new File([pdf], 'documento-de-prueba.pdf', { type: 'application/pdf' })
}

function fillForm(form) {
  if (form.dataset.debugAutofill === 'off') return
  for (const field of form.querySelectorAll('input, select, textarea')) {
    if (field.disabled || field.readOnly || field.type === 'hidden' || field.type === 'checkbox' || field.type === 'radio') continue
    if (field.type === 'file') {
      if (field.files?.length || !field.accept?.includes('.pdf')) continue
      try {
        const transfer = new DataTransfer()
        transfer.items.add(sampleFile())
        field.files = transfer.files
        field.dispatchEvent(new Event('change', { bubbles: true }))
      } catch (error) {
        console.warn('No se pudo autocompletar el archivo de prueba.', error)
      }
      continue
    }
    if (field.value?.trim()) continue
    if (field instanceof HTMLSelectElement) {
      const option = [...field.options].find(item => item.value && !item.disabled)
      if (option) setFieldValue(field, option.value)
      continue
    }
    const value = valueFor(field, form)
    if (value) setFieldValue(field, value)
  }
}

export default function DebugAutofill() {
  useEffect(() => {
    if (!DEBUG) return undefined
    let frame = 0
    const fill = () => document.querySelectorAll('form').forEach(fillForm)
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fill)
    }
    schedule()
    const observer = new MutationObserver(mutations => {
      if (mutations.some(mutation => [...mutation.addedNodes].some(node => node.nodeType === 1))) schedule()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <button
      type="button"
      className={`debug-autofill ${DEBUG ? 'is-on' : ''}`}
      aria-pressed={DEBUG}
      title="Autocompletar formularios de prueba en desarrollo"
      onClick={() => {
        localStorage.setItem(DEBUG_STORAGE_KEY, DEBUG ? 'off' : 'on')
        location.reload()
      }}
    >
      <span className="debug-autofill__dot" />
      Modo debug: {DEBUG ? 'activado' : 'desactivado'}
    </button>
  )
}
