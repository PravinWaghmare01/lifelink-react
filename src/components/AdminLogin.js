/*import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  // This effect will handle navigation once login succeeds and currentUser is set
  useEffect(() => {
    if (loginSuccess && currentUser) {
      console.log('Login successful, user data available, navigating...');
      
      // Determine where to navigate based on user roles
      if (currentUser.roles && currentUser.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else {
        // Fallback for non-admin users
        navigate('/');
      }
    }
  }, [loginSuccess, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username || !formData.password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Call login function from auth context
      const userData = await login(formData.username, formData.password);
      console.log('Login successful, received user data:', userData);
      
      // Mark login as successful to trigger the useEffect for navigation
      setLoginSuccess(true);
      
    } catch (error) {
      console.error('Login error in component:', error);
      setError(error.response?.data?.message || 'Failed to login. Please check your credentials.');
      setLoginSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="auth-form-container">
        <h2 className="text-center mb-4">Admin Login</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {loginSuccess && (
          <div className="alert alert-success" role="alert">
            Login successful! Redirecting...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Admin Username</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-user-shield"></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                id="username" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter admin username" 
                required 
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-lock"></i>
              </span>
              <input 
                type="password" 
                className="form-control" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password" 
                required 
              />
            </div>
          </div>
          
          <div className="mb-3 form-check">
            <input 
              type="checkbox" 
              className="form-check-input" 
              id="rememberMe" 
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
          </div>
          
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || loginSuccess}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : loginSuccess ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Redirecting...
                </>
              ) : 'Admin Login'}
            </button>
          </div>
          
          <div className="text-center mt-3">
            <p><Link to="/login">Back to Regular Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; */