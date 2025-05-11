import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
  const { isLoggedIn, currentUser } = useAuth();
  const location = useLocation();
  
  // Not logged in - redirect to login with return path
  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If role is required but user doesn't have the required role
  if (requiredRole && currentUser && currentUser.roles) {
    if (!currentUser.roles.includes(requiredRole)) {
      // Redirect based on user's actual role
      if (currentUser.roles.includes('ROLE_ADMIN')) {
        return <Navigate to="/admin" replace />;
      } else if (currentUser.roles.includes('ROLE_DONOR')) {
        return <Navigate to="/donor-dashboard" replace />;
      } else if (currentUser.roles.includes('ROLE_RECEIVER')) {
        return <Navigate to="/receiver-dashboard" replace />;
      }
      
      // If no recognized role, go to home
      return <Navigate to="/" replace />;
    }
  }
  
  // If all checks pass, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;