import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

export default function PortalModal({ open, onClose, eyebrow, title, children, wide = false }) {
  const titleId = useId();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="portal-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className={`portal-modal ${wide ? "portal-modal--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="portal-modal__head">
          <div>
            {eyebrow && <span className="portal-kicker">{eyebrow}</span>}
            <h2 id={titleId}>{title}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="portal-modal__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <i className="fas fa-xmark" />
          </button>
        </header>
        <div className="portal-modal__body">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
