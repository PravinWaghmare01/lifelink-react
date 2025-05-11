import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Function to determine role-specific dashboard route
  const getDashboardRoute = () => {
    if (!currentUser || !currentUser.roles) return '/';
    
    if (currentUser.roles.includes('ROLE_ADMIN')) {
      return '/admin';
    } else if (currentUser.roles.includes('ROLE_DONOR')) {
      return '/donor';
    } else if (currentUser.roles.includes('ROLE_RECEIVER')) {
      return '/receiver';
    }
    return '/';
  };

  // Function to handle scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on home page, navigate to home and then scroll
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  // Function to navigate to home
  const goToHome = () => {
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        {/* Conditional rendering for brand/logo */}
        {isLoggedIn() ? (
          <div className="navbar-brand d-flex align-items-center">
            <i className="fas fa-heartbeat me-2"></i>
            <span>LifeLink</span>
          </div>
        ) : (
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <i className="fas fa-heartbeat me-2"></i>
            <span>LifeLink</span>
          </Link>
        )}
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {/* Show Home button only if NOT logged in */}
            {!isLoggedIn() && (
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link text-white" 
                  onClick={goToHome}
                >
                  Home
                </button>
              </li>
            )}
            
            {/* Show Dashboard only if logged in */}
            {isLoggedIn() && (
              <li className="nav-item">
                <Link className="nav-link text-white" to={getDashboardRoute()}>Dashboard</Link>
              </li>
            )}
            
            {/* Show these options only if NOT logged in */}
            {!isLoggedIn() && (
              <>
                <li className="nav-item">
                  <button 
                    className="nav-link btn btn-link text-white" 
                    onClick={() => scrollToSection('about')}
                  >
                    About
                  </button>
                </li>
                
                <li className="nav-item">
                  <button 
                    className="nav-link btn btn-link text-white" 
                    onClick={() => scrollToSection('faq')}
                  >
                    FAQ
                  </button>
                </li>
                
                <li className="nav-item">
                  <button 
                    className="nav-link btn btn-link text-white" 
                    onClick={() => scrollToSection('contact')}
                  >
                    Contact
                  </button>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav ms-auto">
            {isLoggedIn() ? (
              <>
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link dropdown-toggle btn btn-link text-white" 
                    id="navbarDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle me-1"></i>
                    {currentUser ? currentUser.fullName || currentUser.username : 'Account'}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to={getDashboardRoute()}>
                        <i className="fas fa-tachometer-alt me-2"></i>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="fas fa-user-cog me-2"></i>
                        Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="register-btn nav-link text-white" to="/register">
                    <i className="fas fa-user-plus me-1"></i>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;