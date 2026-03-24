import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import InternDashboard from './pages/intern/InternDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';
import HRDashboard from './pages/hr/HRDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import FaceAttendance from './pages/intern/FaceAttendance';
import GoogleSuccess from './pages/auth/GoogleSuccess';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '14px',
      background: 'var(--bg)',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
        Loading...
      </p>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Intern Routes */}
          <Route path="/intern/dashboard" element={
            <ProtectedRoute allowedRoles={['intern']}>
              <InternDashboard />
            </ProtectedRoute>
          } />
          <Route path="/intern/attendance" element={
            <ProtectedRoute allowedRoles={['intern']}>
              <FaceAttendance />
            </ProtectedRoute>
          } />

          {/* Mentor Routes */}
          <Route path="/mentor/dashboard" element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorDashboard />
            </ProtectedRoute>
          } />

          {/* HR Routes */}
          <Route path="/hr/dashboard" element={
            <ProtectedRoute allowedRoles={['hr']}>
              <HRDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all — redirect to login */}
          <Route path="*" element={<Navigate to="/login" />} />
          
          <Route path="/auth/google/success" element={<GoogleSuccess />} />


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
