import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Nosotros from './pages/Nosotros'
import Capacitaciones from './pages/Capacitaciones'
import Cursos from './pages/Cursos'
import PortalEstudiantes from './pages/PortalEstudiantes'
import PortalHistoriasClinicas from './pages/PortalHistoriasClinicas'
import Surge from './pages/Surge'
import Equipos from './pages/Equipos'
import Contacto from './pages/Contacto'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import AuditoriaLiquidacion from './pages/AuditoriaLiquidacion'
import InternacionDomiciliaria from './pages/InternacionDomiciliaria'
import ControlDiabetes from './pages/ControlDiabetes'
import AsesoramientoPrejudicial from './pages/AsesoramientoPrejudicial'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminCapacitaciones from './admin/AdminCapacitaciones'
import AdminEquipos from './admin/AdminEquipos'
import AdminContacto from './admin/AdminContacto'
import AdminBlog from './admin/AdminBlog'
import AdminSiteImages from './admin/AdminSiteImages'
import AdminPortales from './admin/AdminPortales'
import ProtectedRoute from './admin/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/capacitaciones" element={<Capacitaciones />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/portal-estudiantes" element={<PortalEstudiantes />} />
        <Route path="/portal-clientes" element={<PortalHistoriasClinicas />} />
        <Route path="/portal-historias-clinicas" element={<Navigate to="/portal-clientes" replace />} />
        <Route path="/surge" element={<Surge />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/servicios/auditoria-de-liquidacion" element={<AuditoriaLiquidacion />} />
        <Route path="/servicios/internacion-domiciliaria" element={<InternacionDomiciliaria />} />
        <Route path="/servicios/control-de-pacientes-diabeticos" element={<ControlDiabetes />} />
        <Route path="/servicios/asesoramiento-pre-judiciales" element={<AsesoramientoPrejudicial />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="capacitaciones" element={<AdminCapacitaciones />} />
          <Route path="portal-estudiantes" element={<AdminPortales type="students" />} />
          <Route path="historias-clinicas" element={<AdminPortales type="clinical" />} />
          <Route path="equipos" element={<AdminEquipos />} />
          <Route path="contacto" element={<AdminContacto />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="imagenes" element={<AdminSiteImages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
