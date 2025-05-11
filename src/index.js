import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/Navbar.css';
// Add this import at the top of index.js
import 'bootstrap/dist/css/bootstrap.min.css';
// Import button link styles - make sure this file exists in your src directory
import './button-link-styles.css';

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Note: If you want to use Font Awesome, install it first:
// npm install @fortawesome/fontawesome-free
// Then uncomment the line below:
// import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);