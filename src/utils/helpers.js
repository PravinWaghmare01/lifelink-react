/**
 * Utility functions for the LifeLink application
 */

/**
 * Format a date to a readable string
 * @param {string|Date} dateString - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString(undefined, defaultOptions);
};

/**
 * Format a status to a more readable form
 * @param {string} status - The status string to format
 * @returns {string} Formatted status
 */
export const formatStatus = (status) => {
  if (!status) return '';
  
  // Convert SNAKE_CASE to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get a status badge CSS class based on status
 * @param {string} status - The status value
 * @returns {string} CSS class name for the badge
 */
export const getStatusBadgeClass = (status) => {
  if (!status) return 'bg-secondary';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('pending')) return 'bg-warning';
  if (statusLower.includes('approved')) return 'bg-success';
  if (statusLower.includes('rejected')) return 'bg-danger';
  if (statusLower.includes('matched')) return 'bg-info';
  if (statusLower.includes('transplanted') || statusLower.includes('completed')) return 'bg-primary';
  if (statusLower.includes('cancelled') || statusLower.includes('expired')) return 'bg-secondary';
  
  return 'bg-secondary';
};

/**
 * Get an urgency badge CSS class
 * @param {string} urgency - The urgency level
 * @returns {string} CSS class name for the badge
 */
export const getUrgencyBadgeClass = (urgency) => {
  if (!urgency) return 'bg-secondary';
  
  const urgencyLower = urgency.toLowerCase();
  
  if (urgencyLower.includes('critical')) return 'bg-danger';
  if (urgencyLower.includes('high')) return 'bg-warning';
  if (urgencyLower.includes('medium')) return 'bg-info';
  if (urgencyLower.includes('low')) return 'bg-success';
  
  return 'bg-secondary';
};

/**
 * Format error messages from the API
 * @param {Error} error - The error object from axios
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (error.response) {
    // Server responded with error
    const { data, status } = error.response;
    
    if (data && data.message) {
      return data.message;
    }
    
    if (status === 401) {
      return 'Authentication failed. Please login again.';
    }
    
    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (status === 500) {
      return 'Server error. Please try again later.';
    }
    
    return `Error: ${status} - ${data.error || 'Unknown error'}`;
  }
  
  if (error.request) {
    // Request made but no response received
    return 'Could not connect to the server. Please check your internet connection.';
  }
  
  // Something else happened
  return error.message || 'An unexpected error occurred';
};

/**
 * Validate an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Get organ options for select elements
 * @returns {Array} Array of organ options
 */
export const getOrganOptions = () => {
  return [
    { value: 'KIDNEY', label: 'Kidney' },
    { value: 'LIVER', label: 'Liver' },
    { value: 'HEART', label: 'Heart' },
    { value: 'LUNGS', label: 'Lungs' },
    { value: 'PANCREAS', label: 'Pancreas' },
    { value: 'CORNEA', label: 'Cornea' },
    { value: 'BONE_MARROW', label: 'Bone Marrow' },
    { value: 'SKIN', label: 'Skin' },
    { value: 'SMALL_INTESTINE', label: 'Small Intestine' }
  ];
};

/**
 * Get urgency level options for select elements
 * @returns {Array} Array of urgency options
 */
export const getUrgencyOptions = () => {
  return [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'CRITICAL', label: 'Critical' }
  ];
};