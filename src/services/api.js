import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8080/lifelink/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear stored authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API service
export const AuthApi = {
  // Login with username and password
  login: (username, password) => {
    return api.post('/auth/signin', {
      username,
      password
    });
  },
  
  // Register a new user
  register: (userData) => {
    return api.post('/auth/signup', userData);
  }
};

// Donor API service
export const DonorApi = {
  // Register an organ donation - Updated to match backend endpoint
  donate: (donationData) => {
    return api.post('/donor/donate', donationData);
  },
  
  // Get all donations for current donor
  getDonations: () => {
    return api.get('/donor/donations').then(response => response.data);
  },
  
  // Cancel a donation
  cancelDonation: (donationId) => {
    return api.put(`/donor/donations/${donationId}/cancel`);
  }
};

// Receiver API service with improved error handling
export const ReceiverApi = {
  // Request an organ
  requestOrgan: async (requestData) => {
    try {
      console.log('Submitting organ request:', requestData);
      // Using PUT instead of POST since POST is not supported
      const response = await api.post('/receiver/request', requestData);
      return response.data;
    } catch (error) {
      console.error('Error in organ request submission:', error);
      
      // Format a user-friendly error message based on the error
      let errorMessage = 'Failed to submit your request. Please try again.';
      
      if (error.response) {
        // Server responded with an error status
        const { status, data } = error.response;
        
        if (data && data.message) {
          errorMessage = data.message;
        } else if (status === 400) {
          errorMessage = 'Invalid request data. Please check your input.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (status === 404) {
          errorMessage = 'Request endpoint not found.';
        } else if (status === 500) {
          errorMessage = 'Server error occurred. Please try again later.';
        }
      } else if (error.request) {
        // Request was made but no response received (network error)
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      // Create a new error with the user-friendly message
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  },
  
  // Get all requests for current receiver
  getRequests: async () => {
    try {
      const response = await api.get('/receiver/requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Return empty array to prevent UI from breaking
      return [];
    }
  },
  
  // Cancel a request
  cancelRequest: async (requestId) => {
    try {
      const response = await api.put(`/receiver/requests/${requestId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling request:', error);
      
      let errorMessage = 'Failed to cancel your request. Please try again.';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }
};

// Admin API service
export const AdminApi = {
  // Get all donations
  getAllDonations: () => {
    return api.get('/admin/donations').then(response => response.data);
  },
  
  // Get all requests
  getAllRequests: () => {
    return api.get('/admin/requests').then(response => response.data);
  },
  
  // Approve a donation
  approveDonation: (donationId) => {
    return api.put(`/admin/donations/${donationId}/approve`);
  },
  
  // Reject a donation
  rejectDonation: (donationId) => {
    return api.put(`/admin/donations/${donationId}/reject`);
  },
  
  // Approve a request
  approveRequest: (requestId) => {
    return api.put(`/admin/requests/${requestId}/approve`);
  },
  
  // Reject a request
  rejectRequest: (requestId) => {
    return api.put(`/admin/requests/${requestId}/reject`);
  },
  
  // Get potential matches
  getPotentialMatches: () => {
    return api.get('/admin/matches').then(response => response.data);
  }
};