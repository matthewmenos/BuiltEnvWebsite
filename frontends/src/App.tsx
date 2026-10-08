import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/ThemeContext';

// Layout components
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Pages
import Home from './pages/Home';
import Programmes from './pages/Programmes';
import ProgrammeDetail from './pages/ProgrammeDetail';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Staff from './pages/Staff';
import StaffDetail from './pages/StaffDetail';
import Gallery from './pages/Gallery';
import GalleryDetail from './pages/GalleryDetail';
import Research from './pages/Research';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProgrammes from './pages/AdminProgrammes';
import AdminNews from './pages/AdminNews';
import AdminEvents from './pages/AdminEvents';
import AdminStaff from './pages/AdminStaff';
import AdminStaffForm from './pages/AdminStaffForm';
import AdminGallery from './pages/AdminGallery';
import AdminNotices from './pages/AdminNotices';
import AdminContacts from './pages/AdminContacts';
import AdminResourceForm from './pages/AdminResourceForm';

// Placeholder pages
import Placeholder from './pages/Placeholder';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Routes>
          {/* Public pages */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="programmes" element={<Programmes />} />
            <Route path="programmes/:id" element={<ProgrammeDetail />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="staff" element={<Staff />} />
            <Route path="staff/:id" element={<StaffDetail />} />
            <Route path="research" element={<Research />} />
            <Route path="resources" element={<Resources />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="gallery/:id" element={<GalleryDetail />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Admin section */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="login" element={<AdminLogin />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="programmes"
              element={
                <ProtectedRoute>
                  <AdminProgrammes />
                </ProtectedRoute>
              }
            />
            <Route
              path="programmes/new"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="programmes" />
                </ProtectedRoute>
              }
            />
            <Route
              path="programmes/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="programmes" />
                </ProtectedRoute>
              }
            />
            <Route
              path="news"
              element={
                <ProtectedRoute>
                  <AdminNews />
                </ProtectedRoute>
              }
            />
            <Route
              path="news/new"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="news" />
                </ProtectedRoute>
              }
            />
            <Route
              path="news/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="news" />
                </ProtectedRoute>
              }
            />
            <Route
              path="events"
              element={
                <ProtectedRoute>
                  <AdminEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="events/new"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="events" />
                </ProtectedRoute>
              }
            />
            <Route
              path="events/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="events" />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute>
                  <AdminStaff />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff/new"
              element={
                <ProtectedRoute>
                  <AdminStaffForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminStaffForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="gallery"
              element={
                <ProtectedRoute>
                  <AdminGallery />
                </ProtectedRoute>
              }
            />
            <Route
              path="gallery/new"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="gallery" />
                </ProtectedRoute>
              }
            />
            <Route
              path="gallery/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="gallery" />
                </ProtectedRoute>
              }
            />
            <Route
              path="notices"
              element={
                <ProtectedRoute>
                  <AdminNotices />
                </ProtectedRoute>
              }
            />
            <Route
              path="notices/new"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="notices" />
                </ProtectedRoute>
              }
            />
            <Route
              path="notices/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminResourceForm resource="notices" />
                </ProtectedRoute>
              }
            />
            <Route
              path="contacts"
              element={
                <ProtectedRoute>
                  <AdminContacts />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Placeholder />} />
    </Routes>
  );
}

export default App;
