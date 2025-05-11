import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [showAdminLogin, setShowAdminLogin] = useState(location.state?.isAdmin || false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

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
      
      // Call login function with admin flag based on admin section visibility
      await login(formData.username, formData.password, showAdminLogin);
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminLogin = (e) => {
    e.preventDefault();
    setShowAdminLogin(!showAdminLogin);
    // Clear any existing errors when switching login modes
    setError('');
  };

  return (
    <div className="container my-5">
      <div className="auth-form-container">
        <h2 className="text-center mb-4">
          {showAdminLogin ? (
            <>
              <i className="fas fa-user-shield me-2"></i>
              Administrator Login
            </>
          ) : (
            'Login to LifeLink'
          )}
        </h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className={showAdminLogin ? "fas fa-user-shield" : "fas fa-user"}></i>
              </span>
              <input 
                type="text" 
                className="form-control" 
                id="username" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={showAdminLogin ? "Admin username" : "Username"} 
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
                placeholder="Password" 
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
              className={`btn ${showAdminLogin ? 'btn-danger' : 'btn-primary'}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (showAdminLogin ? 'Admin Login' : 'Login')}
            </button>
          </div>
          
          <div className="text-center mt-3">
            {!showAdminLogin ? (
              <>
                <p>Don't have an account? <Link to="/register">Register</Link></p>
                <p>
                  <button 
                    className="btn btn-link p-0" 
                    onClick={(e) => {
                      e.preventDefault();
                      // Implement forgot password logic here
                      alert('Forgot password functionality is not implemented yet.');
                    }}
                  >
                    Forgot password?
                  </button>
                </p>
              </>
            ) : (
              <p>
                <button 
                  className="btn btn-link p-0" 
                  onClick={(e) => {
                    e.preventDefault();
                    // Implement forgot password logic here
                    alert('Admin password reset requires contacting system administrator.');
                  }}
                >
                  Forgot admin password?
                </button>
              </p>
            )}
            
            <hr className="my-3" />
            
            <p className="mb-0">
              <button 
                className="btn btn-link text-muted p-0"
                onClick={toggleAdminLogin}
              >
                {showAdminLogin ? (
                  <>
                    <i className="fas fa-user me-1"></i>
                    Switch to User Login
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-shield me-1"></i>
                    Administrator Login
                  </>
                )}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;