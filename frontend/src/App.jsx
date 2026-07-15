import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintPage from './pages/ComplaintPage';
import StatusPage from './pages/StatusPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

// Role-based Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is authorized for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Citizen Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/complaint" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <ComplaintPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/status" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <StatusPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />

          {/* Common Protected Routes (Accessible by both Citizens and Admins) */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/help" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                <HelpPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Root Redirection logic depending on role */}
          <Route 
            path="/" 
            element={
              <NavigateWrapper />
            } 
          />
          <Route path="*" element={<NavigateWrapper />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Wrapper helper to dynamically route authenticated root requests
const NavigateWrapper = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
};

export default App;
