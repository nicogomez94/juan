import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: 'fa-circle-check',
  error: 'fa-circle-exclamation',
  info: 'fa-circle-info',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id)
    if (timer) clearTimeout(timer)
    timersRef.current.delete(id)
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const show = useCallback((message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(current => [...current, { id, message, type }])

    const timer = setTimeout(() => dismiss(id), 4200)
    timersRef.current.set(id, timer)
    return id
  }, [dismiss])

  useEffect(() => () => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current.clear()
  }, [])

  const value = useMemo(() => ({
    show,
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
    info: (message) => show(message, 'info'),
    dismiss,
  }), [dismiss, show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-stack" role="status" aria-live="polite" aria-atomic="true">
        {toasts.map(toast => (
          <div key={toast.id} className={`admin-toast admin-toast--${toast.type}`}>
            <i className={`fas ${ICONS[toast.type] || ICONS.info}`} />
            <span>{toast.message}</span>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Cerrar notificación">
              <i className="fas fa-xmark" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider')
  return context
}
