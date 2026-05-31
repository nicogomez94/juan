import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Nosotros from './pages/Nosotros'
import Capacitaciones from './pages/Capacitaciones'
import Surge from './pages/Surge'
import Equipos from './pages/Equipos'
import Contacto from './pages/Contacto'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminCapacitaciones from './admin/AdminCapacitaciones'
import AdminEquipos from './admin/AdminEquipos'
import AdminContacto from './admin/AdminContacto'
import AdminBlog from './admin/AdminBlog'
import AdminSiteImages from './admin/AdminSiteImages'
import ProtectedRoute from './admin/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/capacitaciones" element={<Capacitaciones />} />
        <Route path="/surge" element={<Surge />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="capacitaciones" element={<AdminCapacitaciones />} />
          <Route path="equipos" element={<AdminEquipos />} />
          <Route path="contacto" element={<AdminContacto />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="imagenes" element={<AdminSiteImages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
