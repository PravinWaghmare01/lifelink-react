import React, { useState, useEffect } from 'react';
import { AdminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState({
    donations: true,
    requests: true,
    matches: true
  });
  const [error, setError] = useState({
    donations: '',
    requests: '',
    matches: ''
  });
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [activeTab, setActiveTab] = useState('donations');

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all admin data
  const fetchAllData = async () => {
    fetchDonations();
    fetchRequests();
    fetchPotentialMatches();
  };

  // Fetch all donations
  const fetchDonations = async () => {
    try {
      setLoading(prev => ({ ...prev, donations: true }));
      const data = await AdminApi.getAllDonations();
      setDonations(data);
      setError(prev => ({ ...prev, donations: '' }));
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError(prev => ({ ...prev, donations: 'Failed to load donations. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, donations: false }));
    }
  };

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, requests: true }));
      const data = await AdminApi.getAllRequests();
      setRequests(data);
      setError(prev => ({ ...prev, requests: '' }));
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(prev => ({ ...prev, requests: 'Failed to load requests. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  };

  // Fetch potential matches
  const fetchPotentialMatches = async () => {
    try {
      setLoading(prev => ({ ...prev, matches: true }));
      const data = await AdminApi.getPotentialMatches();
      setPotentialMatches(data);
      setError(prev => ({ ...prev, matches: '' }));
    } catch (err) {
      console.error('Error fetching potential matches:', err);
      setError(prev => ({ ...prev, matches: 'Failed to load potential matches. Please try again later.' }));
    } finally {
      setLoading(prev => ({ ...prev, matches: false }));
    }
  };

  // Handle donation approval
  const handleApproveDonation = async (donationId) => {
    try {
      setLoading(prev => ({ ...prev, donations: true }));
      await AdminApi.approveDonation(donationId);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Donation has been approved successfully.',
        type: 'success'
      });
      
      // Reload donations
      fetchDonations();
      fetchPotentialMatches();
    } catch (err) {
      console.error('Error approving donation:', err);
      setAlert({
        show: true,
        message: 'Failed to approve donation. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(prev => ({ ...prev, donations: false }));
    }
  };

  // Handle donation rejection
  const handleRejectDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to reject this donation?')) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, donations: true }));
      await AdminApi.rejectDonation(donationId);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Donation has been rejected successfully.',
        type: 'success'
      });
      
      // Reload donations
      fetchDonations();
    } catch (err) {
      console.error('Error rejecting donation:', err);
      setAlert({
        show: true,
        message: 'Failed to reject donation. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(prev => ({ ...prev, donations: false }));
    }
  };

  // Handle request approval
  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(prev => ({ ...prev, requests: true }));
      await AdminApi.approveRequest(requestId);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Request has been approved successfully.',
        type: 'success'
      });
      
      // Reload requests
      fetchRequests();
      fetchPotentialMatches();
    } catch (err) {
      console.error('Error approving request:', err);
      setAlert({
        show: true,
        message: 'Failed to approve request. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  };

  // Handle request rejection
  const handleRejectRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, requests: true }));
      await AdminApi.rejectRequest(requestId);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Request has been rejected successfully.',
        type: 'success'
      });
      
      // Reload requests
      fetchRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setAlert({
        show: true,
        message: 'Failed to reject request. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
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
      case 'TRANSPLANTED':
        return 'bg-primary';
      case 'CANCELLED':
      case 'EXPIRED':
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

  // Get compatibility score badge color
  const getCompatibilityBadgeColor = (score) => {
    if (score >= 90) return 'bg-success';
    if (score >= 70) return 'bg-info';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Admin Dashboard</h2>
          <p className="lead">Manage and approve organ donations and requests</p>
        </div>
        <div className="col-md-4 text-md-end">
          <button 
            className="btn btn-primary" 
            onClick={fetchAllData}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Refresh Data
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
      
      {/* Admin Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'donations' ? 'active' : ''}`} 
            onClick={() => setActiveTab('donations')}
          >
            <i className="fas fa-hand-holding-heart me-2"></i>
            Donations
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`} 
            onClick={() => setActiveTab('requests')}
          >
            <i className="fas fa-procedures me-2"></i>
            Requests
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'matches' ? 'active' : ''}`} 
            onClick={() => setActiveTab('matches')}
          >
            <i className="fas fa-exchange-alt me-2"></i>
            Potential Matches
          </button>
        </li>
      </ul>
      
      {/* Donations Tab */}
      {activeTab === 'donations' && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">All Donations</h5>
          </div>
          <div className="card-body">
            {loading.donations ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading donations...</p>
              </div>
            ) : error.donations ? (
              <div className="alert alert-danger" role="alert">
                {error.donations}
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center my-5">
                <i className="fas fa-hand-holding-heart fa-4x text-muted mb-3"></i>
                <h5>No donations found</h5>
                <p className="text-muted">There are no organ donations in the system yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Donor</th>
                      <th>Organ Type</th>
                      <th>Status</th>
                      <th>Date Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map(donation => (
                      <tr key={donation.id}>
                        <td>{donation.id}</td>
                        <td>{donation.donor?.user?.fullName || 'Unknown'}</td>
                        <td>{donation.organType.replace('_', ' ')}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeColor(donation.donationStatus)}`}>
                            {donation.donationStatus}
                          </span>
                        </td>
                        <td>{new Date(donation.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-info me-2"
                            onClick={() => setSelectedDonation(donation)}
                            data-bs-toggle="modal" 
                            data-bs-target="#donationDetailsModal"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          
                          {donation.donationStatus === 'PENDING' && (
                            <>
                              <button 
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApproveDonation(donation.id)}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRejectDonation(donation.id)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
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
      )}
      
      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">All Requests</h5>
          </div>
          <div className="card-body">
            {loading.requests ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading requests...</p>
              </div>
            ) : error.requests ? (
              <div className="alert alert-danger" role="alert">
                {error.requests}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center my-5">
                <i className="fas fa-procedures fa-4x text-muted mb-3"></i>
                <h5>No requests found</h5>
                <p className="text-muted">There are no organ requests in the system yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Receiver</th>
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
                        <td>{request.id}</td>
                        <td>{request.receiver?.user?.fullName || 'Unknown'}</td>
                        <td>{request.organType.replace('_', ' ')}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeColor(request.requestStatus)}`}>
                            {request.requestStatus}
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
                          
                          {request.requestStatus === 'PENDING' && (
                            <>
                              <button 
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
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
      )}
      
      {/* Potential Matches Tab */}
      {activeTab === 'matches' && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Potential Organ Matches</h5>
          </div>
          <div className="card-body">
            {loading.matches ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Finding potential matches...</p>
              </div>
            ) : error.matches ? (
              <div className="alert alert-danger" role="alert">
                {error.matches}
              </div>
            ) : potentialMatches.length === 0 ? (
              <div className="text-center my-5">
                <i className="fas fa-exchange-alt fa-4x text-muted mb-3"></i>
                <h5>No potential matches found</h5>
                <p className="text-muted">There are no potential matches between donations and requests at this time.</p>
                <p>Ensure that there are approved donations and requests in the system.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Donor</th>
                      <th>Receiver</th>
                      <th>Organ Type</th>
                      <th>Urgency</th>
                      <th>Compatibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {potentialMatches.map((match, index) => (
                      <tr key={index}>
                        <td>{match.donation?.donor?.user?.fullName || 'Unknown'}</td>
                        <td>{match.request?.receiver?.user?.fullName || 'Unknown'}</td>
                        <td>{match.donation?.organType.replace('_', ' ')}</td>
                        <td>
                          <span className={`badge ${getUrgencyBadgeColor(match.request?.urgencyLevel)}`}>
                            {match.request?.urgencyLevel}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getCompatibilityBadgeColor(match.compatibilityScore)}`}>
                            {match.compatibilityScore}%
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => setSelectedMatch(match)}
                            data-bs-toggle="modal" 
                            data-bs-target="#matchDetailsModal"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Donation Details Modal */}
      <div className="modal fade" id="donationDetailsModal" tabIndex="-1" aria-labelledby="donationDetailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="donationDetailsModalLabel">Donation Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedDonation && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Donor:</strong> {selectedDonation.donor?.user?.fullName || 'Unknown'}
                    </div>
                    <div className="col-md-6">
                      <strong>Donor ID:</strong> {selectedDonation.donor?.id || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Organ Type:</strong> {selectedDonation.organType.replace('_', ' ')}
                    </div>
                    <div className="col-md-6">
                      <strong>Status:</strong> 
                      <span className={`badge ms-2 ${getStatusBadgeColor(selectedDonation.donationStatus)}`}>
                        {selectedDonation.donationStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Date Registered:</strong> {new Date(selectedDonation.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-md-6">
                      <strong>Last Updated:</strong> {new Date(selectedDonation.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Blood Type:</strong> {selectedDonation.donor?.bloodType || 'Unknown'}
                    </div>
                    <div className="col-md-6">
                      <strong>Active Donor:</strong> {selectedDonation.donor?.isActiveDonor ? 'Yes' : 'No'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Medical Notes:</strong>
                    <p className="text-muted mt-1">{selectedDonation.medicalNotes || 'No medical notes provided.'}</p>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Donor's Medical History:</strong>
                    <p className="text-muted mt-1">{selectedDonation.donor?.medicalHistory || 'No medical history provided.'}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedDonation && selectedDonation.donationStatus === 'PENDING' && (
                <>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => {
                      handleApproveDonation(selectedDonation.id);
                      document.querySelector('#donationDetailsModal .btn-close').click();
                    }}
                  >
                    Approve Donation
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      handleRejectDonation(selectedDonation.id);
                      document.querySelector('#donationDetailsModal .btn-close').click();
                    }}
                  >
                    Reject Donation
                  </button>
                </>
              )}
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Request Details Modal */}
      <div className="modal fade" id="requestDetailsModal" tabIndex="-1" aria-labelledby="requestDetailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="requestDetailsModalLabel">Request Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedRequest && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Receiver:</strong> {selectedRequest.receiver?.user?.fullName || 'Unknown'}
                    </div>
                    <div className="col-md-6">
                      <strong>Receiver ID:</strong> {selectedRequest.receiver?.id || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Organ Type:</strong> {selectedRequest.organType.replace('_', ' ')}
                    </div>
                    <div className="col-md-6">
                      <strong>Status:</strong> 
                      <span className={`badge ms-2 ${getStatusBadgeColor(selectedRequest.requestStatus)}`}>
                        {selectedRequest.requestStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Urgency Level:</strong> 
                      <span className={`badge ms-2 ${getUrgencyBadgeColor(selectedRequest.urgencyLevel)}`}>
                        {selectedRequest.urgencyLevel}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <strong>Doctor Approval:</strong> {selectedRequest.doctorApproval ? 'Yes' : 'No'}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Date Submitted:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}
                    </div>
                    <div className="col-md-6">
                      <strong>Last Updated:</strong> {new Date(selectedRequest.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Blood Type:</strong> {selectedRequest.receiver?.bloodType || 'Unknown'}
                    </div>
                    <div className="col-md-6">
                      <strong>Waiting Since:</strong> {selectedRequest.receiver?.waitingSince ? new Date(selectedRequest.receiver.waitingSince).toLocaleDateString() : 'Not specified'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Medical Notes:</strong>
                    <p className="text-muted mt-1">{selectedRequest.medicalNotes || 'No medical notes provided.'}</p>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Receiver's Medical History:</strong>
                    <p className="text-muted mt-1">{selectedRequest.receiver?.medicalHistory || 'No medical history provided.'}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedRequest && selectedRequest.requestStatus === 'PENDING' && (
                <>
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => {
                      handleApproveRequest(selectedRequest.id);
                      document.querySelector('#requestDetailsModal .btn-close').click();
                    }}
                  >
                    Approve Request
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      handleRejectRequest(selectedRequest.id);
                      document.querySelector('#requestDetailsModal .btn-close').click();
                    }}
                  >
                    Reject Request
                  </button>
                </>
              )}
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Match Details Modal */}
      <div className="modal fade" id="matchDetailsModal" tabIndex="-1" aria-labelledby="matchDetailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="matchDetailsModalLabel">Match Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedMatch && (
                <div>
                  <div className="alert alert-info mb-4">
                    <h5 className="alert-heading">Compatibility Score: 
                      <span className={`badge ms-2 ${getCompatibilityBadgeColor(selectedMatch.compatibilityScore)}`}>
                        {selectedMatch.compatibilityScore}%
                      </span>
                    </h5>
                    <p className="mb-0">This score is based on blood type compatibility, tissue matching, and other medical factors.</p>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card mb-4">
                        <div className="card-header bg-primary text-white">
                          <h5 className="card-title mb-0">Donor Information</h5>
                        </div>
                        <div className="card-body">
                          <p><strong>Name:</strong> {selectedMatch.donation?.donor?.user?.fullName || 'Unknown'}</p>
                          <p><strong>Organ Type:</strong> {selectedMatch.donation?.organType.replace('_', ' ')}</p>
                          <p><strong>Blood Type:</strong> {selectedMatch.donation?.donor?.bloodType || 'Unknown'}</p>
                          <p><strong>Status:</strong> 
                            <span className={`badge ms-2 ${getStatusBadgeColor(selectedMatch.donation?.donationStatus)}`}>
                              {selectedMatch.donation?.donationStatus}
                            </span>
                          </p>
                          <p><strong>Medical Notes:</strong> {selectedMatch.donation?.medicalNotes || 'None'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card mb-4">
                        <div className="card-header bg-info text-white">
                          <h5 className="card-title mb-0">Receiver Information</h5>
                        </div>
                        <div className="card-body">
                          <p><strong>Name:</strong> {selectedMatch.request?.receiver?.user?.fullName || 'Unknown'}</p>
                          <p><strong>Organ Needed:</strong> {selectedMatch.request?.organType.replace('_', ' ')}</p>
                          <p><strong>Blood Type:</strong> {selectedMatch.request?.receiver?.bloodType || 'Unknown'}</p>
                          <p><strong>Urgency:</strong> 
                            <span className={`badge ms-2 ${getUrgencyBadgeColor(selectedMatch.request?.urgencyLevel)}`}>
                              {selectedMatch.request?.urgencyLevel}
                            </span>
                          </p>
                          <p><strong>Medical Notes:</strong> {selectedMatch.request?.medicalNotes || 'None'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Match Notes:</strong>
                    <p className="text-muted mt-1">{selectedMatch.matchNotes || 'No notes provided for this match.'}</p>
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

export default AdminDashboard;