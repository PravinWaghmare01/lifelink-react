import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Handler for anchor links
  const handleClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-3">
            <h5>LifeLink</h5>
            <p className="text-muted">Connecting Donors, Saving Lives.</p>
            <p className="small">Our mission is to facilitate organ donation and transplantation, providing hope and a second chance at life.</p>
          </div>
          
          <div className="col-lg-2 mb-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/">Home</Link></li>
              <li>
                <button 
                  className="btn btn-link p-0 text-white" 
                  onClick={(e) => handleClick(e, 'about')}
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  className="btn btn-link p-0 text-white" 
                  onClick={(e) => handleClick(e, 'faq')}
                >
                  FAQ
                </button>
              </li>
              <li>
                <button 
                  className="btn btn-link p-0 text-white" 
                  onClick={(e) => handleClick(e, 'contact')}
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 mb-3">
            <h5>Resources</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/donation-process" className="text-white">
                  Donation Process
                </Link>
              </li>
              <li>
                <Link to="/medical-guidelines" className="text-white">
                  Medical Guidelines
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-white">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/research" className="text-white">
                  Research & News
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 mb-3">
            <h5>Connect With Us</h5>
            <div className="d-flex gap-3 mb-3">
              <button className="btn btn-link text-white p-0">
                <i className="fab fa-facebook-f fa-lg"></i>
                <span className="visually-hidden">Facebook</span>
              </button>
              <button className="btn btn-link text-white p-0">
                <i className="fab fa-twitter fa-lg"></i>
                <span className="visually-hidden">Twitter</span>
              </button>
              <button className="btn btn-link text-white p-0">
                <i className="fab fa-instagram fa-lg"></i>
                <span className="visually-hidden">Instagram</span>
              </button>
              <button className="btn btn-link text-white p-0">
                <i className="fab fa-linkedin-in fa-lg"></i>
                <span className="visually-hidden">LinkedIn</span>
              </button>
              <button className="btn btn-link text-white p-0">
                <i className="fab fa-youtube fa-lg"></i>
                <span className="visually-hidden">YouTube</span>
              </button>
            </div>
            <p className="small">Subscribe to our newsletter for updates</p>
            <div className="input-group mb-3">
              <input type="email" className="form-control" placeholder="Email address" aria-label="Email address" />
              <button className="btn btn-primary" type="button">Subscribe</button>
            </div>
          </div>
        </div>
        
        <hr className="my-3" />
        
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <p className="small mb-0">&copy; {currentYear} LifeLink. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/privacy-policy" className="text-white">Privacy Policy</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/terms" className="text-white">Terms of Service</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/cookie-policy" className="text-white">Cookie Policy</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;