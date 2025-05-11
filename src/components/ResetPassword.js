import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = 'http://localhost:8080/lifelink/api';
  
  useEffect(() => {
    // Extract token from URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setValidatingToken(false);
      setError('Token is missing. Please use the link from your email.');
      return;
    }
    
    setToken(tokenParam);
    
    // Validate token
    const validateToken = async () => {
      try {
        await axios.get(`${API_BASE_URL}/auth/reset-password?token=${tokenParam}`);
        setTokenValid(true);
        setValidatingToken(false);
      } catch (err) {
        console.error('Token validation error:', err);
        setError('Invalid or expired token. Please request a new password reset link.');
        setValidatingToken(false);
      }
    };
    
    validateToken();
  }, [location.search, API_BASE_URL]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword: password
      });
      
      setMessage(response.data.message);
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container my-5">
      <div className="auth-form-container">
        <h2 className="text-center mb-4">Reset Password</h2>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {message && (
          <div className="alert alert-success" role="alert">
            {message}
          </div>
        )}
        
        {validatingToken ? (
          <div className="text-center my-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Validating your reset link...</p>
          </div>
        ) : tokenValid && !resetSuccess ? (
          <>
            <p className="text-center mb-4">
              Please enter your new password.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">New Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control" 
                    id="password" 
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password" 
                    required 
                    minLength="8"
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
                <div className="form-text">Password must be at least 8 characters long.</div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" 
                    required 
                  />
                </div>
              </div>
              
              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Resetting Password...
                    </>
                  ) : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        ) : resetSuccess ? (
          <div className="text-center">
            <div className="text-success mb-3">
              <i className="fas fa-check-circle fa-4x"></i>
            </div>
            <p>Your password has been successfully reset!</p>
            <p>You will be redirected to the login page in a few seconds...</p>
          </div>
        ) : (
          <div className="text-center">
            <p>The password reset link is invalid or has expired.</p>
            <p>Please request a new password reset link.</p>
            <Link to="/forgot-password" className="btn btn-primary mt-3">
              Request New Link
            </Link>
          </div>
        )}
        
        <div className="text-center mt-3">
          <p>
            <Link to="/login">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;