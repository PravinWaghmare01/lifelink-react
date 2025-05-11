import React, { useState, useEffect } from 'react';
import { ReceiverApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ReceiverDashboard = () => {
  const { currentUser } = useAuth(); // Get user info from context instead of API
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  
  // Request form state
  const [requestForm, setRequestForm] = useState({
    organType: '',
    urgencyLevel: 'MEDIUM',
    medicalNotes: '',
    doctorApproval: false
  });

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch receiver's requests - Direct API call without profile validation
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await ReceiverApi.getRequests();
      setRequests(data);
      setError('');
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load your organ requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle request form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRequestForm({
      ...requestForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle request form submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!requestForm.organType) {
      setAlert({
        show: true,
        message: 'Please select an organ type.',
        type: 'danger'
      });
      return;
    }

    if (!requestForm.urgencyLevel) {
      setAlert({
        show: true,
        message: 'Please select an urgency level.',
        type: 'danger'
      });
      return;
    }

    if (!requestForm.doctorApproval) {
      setAlert({
        show: true,
        message: 'You must confirm doctor approval to submit a request.',
        type: 'danger'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to submit request
      await ReceiverApi.requestOrgan(requestForm);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Your organ request has been submitted successfully!',
        type: 'success'
      });
      
      // Reset form and hide it
      setRequestForm({
        organType: '',
        urgencyLevel: 'MEDIUM',
        medicalNotes: '',
        doctorApproval: false
      });
      setShowRequestForm(false);
      
      // Reload requests
      fetchRequests();
    } catch (err) {
      console.error('Error submitting request:', err);
      
      // Show error alert with message from API if available
      setAlert({
        show: true,
        message: err.message || 'Failed to submit your request. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle request cancellation
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }
    
    try {
      setLoading(true);
      await ReceiverApi.cancelRequest(requestId);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Your request has been cancelled successfully.',
        type: 'success'
      });
      
      // Reload requests
      fetchRequests();
    } catch (err) {
      console.error('Error cancelling request:', err);
      setAlert({
        show: true,
        message: err.message || 'Failed to cancel your request. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'APPROVED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      case 'MATCHED':
        return 'bg-info';
      case 'COMPLETED':
        return 'bg-primary';
      case 'CANCELLED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };
  
  // Get urgency badge color
  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-danger';
      case 'HIGH':
        return 'bg-warning';
      case 'MEDIUM':
        return 'bg-info';
      case 'LOW':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Receiver Dashboard</h2>
          <p className="lead">Manage your organ requests and track their status</p>
        </div>
        <div className="col-md-4 text-md-end">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowRequestForm(!showRequestForm)}
          >
            <i className="fas fa-plus-circle me-2"></i>
            {showRequestForm ? 'Cancel' : 'Submit New Request'}
          </button>
        </div>
      </div>
      
      {/* Alert message */}
      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlert({ ...alert, show: false })}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {/* Request Form */}
      {showRequestForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">Submit Organ Request</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleRequestSubmit}>
              <div className="mb-3">
                <label htmlFor="organType" className="form-label">Organ Type</label>
                <select 
                  className="form-select" 
                  id="organType" 
                  name="organType"
                  value={requestForm.organType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select organ type</option>
                  <option value="KIDNEY">Kidney</option>
                  <option value="LIVER">Liver</option>
                  <option value="HEART">Heart</option>
                  <option value="LUNGS">Lungs</option>
                  <option value="PANCREAS">Pancreas</option>
                  <option value="CORNEA">Cornea</option>
                  <option value="BONE_MARROW">Bone Marrow</option>
                  <option value="SKIN">Skin</option>
                  <option value="SMALL_INTESTINE">Small Intestine</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="urgencyLevel" className="form-label">Urgency Level</label>
                <select 
                  className="form-select" 
                  id="urgencyLevel" 
                  name="urgencyLevel"
                  value={requestForm.urgencyLevel}
                  onChange={handleInputChange}
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="medicalNotes" className="form-label">Medical Notes</label>
                <textarea 
                  className="form-control" 
                  id="medicalNotes" 
                  name="medicalNotes"
                  value={requestForm.medicalNotes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter any relevant medical information"
                ></textarea>
              </div>
              
              <div className="mb-3 form-check">
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id="doctorApproval" 
                  name="doctorApproval"
                  checked={requestForm.doctorApproval}
                  onChange={handleInputChange}
                  required
                />
                <label className="form-check-label" htmlFor="doctorApproval">
                  I confirm that a doctor has approved this organ request
                </label>
              </div>
              
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-secondary me-2"
                  onClick={() => setShowRequestForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Requests List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Your Organ Requests</h5>
        </div>
        <div className="card-body">
          {loading && !showRequestForm ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your requests...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center my-5">
              <i className="fas fa-procedures fa-4x text-muted mb-3"></i>
              <h5>No requests yet</h5>
              <p className="text-muted">You haven't submitted any organ requests yet.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowRequestForm(true)}
              >
                Submit Your First Request
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Organ Type</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Date Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td>{request.organType.replace('_', ' ')}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeColor(request.requestStatus || request.status)}`}>
                          {request.requestStatus || request.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getUrgencyBadgeColor(request.urgencyLevel)}`}>
                          {request.urgencyLevel}
                        </span>
                      </td>
                      <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info me-2"
                          onClick={() => setSelectedRequest(request)}
                          data-bs-toggle="modal" 
                          data-bs-target="#requestDetailsModal"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        
                        {(request.requestStatus === 'PENDING' || request.status === 'PENDING') && (
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Request Details Modal */}
      <div className="modal fade" id="requestDetailsModal" tabIndex="-1" aria-labelledby="requestDetailsModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="requestDetailsModalLabel">Request Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedRequest && (
                <div>
                  <div className="mb-3">
                    <strong>Organ Type:</strong> {selectedRequest.organType.replace('_', ' ')}
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong> 
                    <span className={`badge ms-2 ${getStatusBadgeColor(selectedRequest.requestStatus || selectedRequest.status)}`}>
                      {selectedRequest.requestStatus || selectedRequest.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Urgency Level:</strong> 
                    <span className={`badge ms-2 ${getUrgencyBadgeColor(selectedRequest.urgencyLevel)}`}>
                      {selectedRequest.urgencyLevel}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Date Submitted:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mb-3">
                    <strong>Last Updated:</strong> {new Date(selectedRequest.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="mb-3">
                    <strong>Medical Notes:</strong>
                    <p className="text-muted mt-1">{selectedRequest.medicalNotes || 'No medical notes provided.'}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Doctor Approval:</strong> {selectedRequest.doctorApproval ? 'Yes' : 'No'}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboard;