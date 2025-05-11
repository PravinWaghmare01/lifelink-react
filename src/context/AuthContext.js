import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthApi } from '../services/api';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Initialize auth state from local storage
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);
  
  // Login function with redirection based on user type and admin flag
  const login = async (username, password, isAdmin = false) => {
    try {
      const response = await AuthApi.login(username, password);
      const userData = response.data;
      
      console.log("Login response:", userData); // Debug log
      
      // If trying to login as admin, verify admin role
      if (isAdmin && (!userData.roles || !userData.roles.includes('ROLE_ADMIN'))) {
        throw new Error('You do not have administrator privileges');
      }
      
      // Store user data and token in local storage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
      
      // Update current user state
      setCurrentUser(userData);
      
      // Handle redirection based on user roles and login mode
      if (isAdmin) {
        if (userData.roles && userData.roles.includes('ROLE_ADMIN')) {
          console.log("Admin login successful, redirecting to admin dashboard");
          // Use window.location for a full page reload
          window.location.href = '/admin';
          return userData; // Return early after navigation
        } else {
          throw new Error('Admin access denied');
        }
      } else {
        // Regular login flow
        if (userData.roles) {
          if (userData.roles.includes('ROLE_ADMIN')) {
            navigate('/admin');
          } else if (userData.roles.includes('ROLE_DONOR')) {
            navigate('/donor-dashboard');
          } else if (userData.roles.includes('ROLE_RECEIVER')) {
            navigate('/receiver-dashboard');
          } else {
            // Default dashboard if no specific role is found
            navigate('/');
          }
        } else {
          // Default fallback if no roles are defined
          navigate('/');
        }
      }
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const response = await AuthApi.register(userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    // Clear user data and token from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Reset current user state
    setCurrentUser(null);
    
    // Redirect to home page
    navigate('/');
  };
  
  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem('token');
  };
  
  // Get user type based on roles
  const getUserType = () => {
    if (!currentUser || !currentUser.roles) return null;
    
    if (currentUser.roles.includes('ROLE_ADMIN')) return 'admin';
    if (currentUser.roles.includes('ROLE_DONOR')) return 'donor';
    if (currentUser.roles.includes('ROLE_RECEIVER')) return 'receiver';
    
    return null;
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return currentUser && 
           currentUser.roles && 
           currentUser.roles.includes('ROLE_ADMIN');
  };
  
  // Value to be provided by context
  const value = {
    currentUser,
    login,
    register,
    logout,
    isLoggedIn,
    getUserType,
    isAdmin,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;