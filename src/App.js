import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import existing components
import Login from './components/Login';
import Register from './components/Register';
import DonorDashboard from './components/DonorDashboard';
import ReceiverDashboard from './components/ReceiverDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Profile from './components/Profile';

// Import CSS
import './App.css';

// Simple NotFound component
const NotFound = () => (
  <div className="container my-5 text-center">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <button 
      onClick={() => window.location.href = '/'}
      className="btn btn-primary"
    >
      Go to Home
    </button>
  </div>
);

// AdminRoute component to handle admin authentication
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');
  
  return isAdmin ? children : <Navigate to="/login" state={{ isAdmin: true }} />;
};

// ProtectedRoute component for other authenticated routes
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin route with specific protection */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              {/* Other protected routes */}
              <Route path="/donor-dashboard" element={
                <ProtectedRoute>
                  <DonorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/receiver-dashboard" element={
                <ProtectedRoute>
                  <ReceiverDashboard />
                </ProtectedRoute>
              } />
              <Route path="/donor" element={
                <ProtectedRoute>
                  <Navigate to="/donor-dashboard" />
                </ProtectedRoute>
              } />
              <Route path="/receiver" element={
                <ProtectedRoute>
                  <Navigate to="/receiver-dashboard" />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;