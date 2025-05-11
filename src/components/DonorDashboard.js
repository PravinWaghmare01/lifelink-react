import React, { useState, useEffect } from 'react';
import { DonorApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DonorDashboard = () => {
  const { currentUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  
  // Donation form state
  const [donationForm, setDonationForm] = useState({
    organType: '',
    medicalNotes: ''
  });

  // Fetch donations on component mount
  useEffect(() => {
    fetchDonations();
  }, []);

  // Fetch donor's donations
  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await DonorApi.getDonations();
      setDonations(data);
      setError('');
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load your donations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle donation form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonationForm({
      ...donationForm,
      [name]: value
    });
  };

  // Handle donation form submission
  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await DonorApi.donate(donationForm);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Your donation has been registered successfully!',
        type: 'success'
      });
      
      // Reset form and hide it
      setDonationForm({
        organType: '',
        medicalNotes: ''
      });
      setShowDonationForm(false);
      
      // Reload donations
      fetchDonations();
    } catch (err) {
      console.error('Error registering donation:', err);
      setAlert({
        show: true,
        message: 'Failed to register your donation. Please try again.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle donation cancellation
  const handleCancelDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) {
      return;
    }
    
    try {
      setLoading(true);
      await DonorApi.cancelDonation(donationId);
      
      // Show success alert
      setAlert({
        show: true,
        message: 'Your donation has been cancelled successfully.',
        type: 'success'
      });
      
      // Reload donations
      fetchDonations();
    } catch (err) {
      console.error('Error cancelling donation:', err);
      setAlert({
        show: true,
        message: 'Failed to cancel your donation. Please try again.',
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
      case 'TRANSPLANTED':
        return 'bg-primary';
      case 'EXPIRED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-md-8">
          <h2>Donor Dashboard</h2>
          <p className="lead">Manage your organ donations and track their status</p>
        </div>
        <div className="col-md-4 text-md-end">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowDonationForm(!showDonationForm)}
          >
            <i className="fas fa-plus-circle me-2"></i>
            {showDonationForm ? 'Cancel' : 'Register New Donation'}
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
      
      {/* Donation Form */}
      {showDonationForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="card-title mb-0">Register New Organ Donation</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleDonationSubmit}>
              <div className="mb-3">
                <label htmlFor="organType" className="form-label">Organ Type</label>
                <select 
                  className="form-select" 
                  id="organType" 
                  name="organType"
                  value={donationForm.organType}
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
                <label htmlFor="medicalNotes" className="form-label">Medical Notes</label>
                <textarea 
                  className="form-control" 
                  id="medicalNotes" 
                  name="medicalNotes"
                  value={donationForm.medicalNotes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter any relevant medical information"
                ></textarea>
              </div>
              
              <div className="d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-secondary me-2"
                  onClick={() => setShowDonationForm(false)}
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
                  ) : 'Register Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Donations List */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Your Donations</h5>
        </div>
        <div className="card-body">
          {loading && !showDonationForm ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading your donations...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center my-5">
              <i className="fas fa-hand-holding-heart fa-4x text-muted mb-3"></i>
              <h5>No donations yet</h5>
              <p className="text-muted">You haven't registered any organ donations yet.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowDonationForm(true)}
              >
                Register Your First Donation
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Organ Type</th>
                    <th>Status</th>
                    <th>Date Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(donation => (
                    <tr key={donation.id}>
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
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancelDonation(donation.id)}
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
      
      {/* Donation Details Modal */}
      <div className="modal fade" id="donationDetailsModal" tabIndex="-1" aria-labelledby="donationDetailsModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="donationDetailsModalLabel">Donation Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {selectedDonation && (
                <div>
                  <div className="mb-3">
                    <strong>Organ Type:</strong> {selectedDonation.organType.replace('_', ' ')}
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong> 
                    <span className={`badge ms-2 ${getStatusBadgeColor(selectedDonation.donationStatus)}`}>
                      {selectedDonation.donationStatus}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Date Registered:</strong> {new Date(selectedDonation.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mb-3">
                    <strong>Last Updated:</strong> {new Date(selectedDonation.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="mb-3">
                    <strong>Medical Notes:</strong>
                    <p className="text-muted mt-1">{selectedDonation.medicalNotes || 'No medical notes provided.'}</p>
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

export default DonorDashboard;