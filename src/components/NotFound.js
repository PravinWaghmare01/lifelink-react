import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container my-5 text-center">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="display-1 text-danger">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-4">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/" className="btn btn-primary btn-lg">
            <i className="fas fa-home me-2"></i>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;