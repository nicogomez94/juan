// ================================================
// KADIMA SALUD — main.js
// ================================================

// --- Navbar: efecto al hacer scroll ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// --- Menú mobile ---
const menuToggle = document.getElementById('menuToggle');
const navLinks   = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  const icon   = menuToggle.querySelector('i');
  icon.classList.toggle('fa-bars',  !isOpen);
  icon.classList.toggle('fa-xmark',  isOpen);
  menuToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const icon = menuToggle.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-xmark');
    menuToggle.setAttribute('aria-expanded', false);
  });
});

// --- Enlace activo según página actual ---
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar__links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// --- Animaciones fade-in con IntersectionObserver ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// --- Formulario de contacto ---
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const formSuccess = document.getElementById('formSuccess');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    // Simulación — reemplazar por fetch() o integración real
    setTimeout(() => {
      contactForm.reset();
      formSuccess.hidden = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar consulta';
      btn.disabled  = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1400);
  });
}
