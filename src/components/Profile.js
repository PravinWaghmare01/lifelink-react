import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Table, InputGroup } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080/lifelink/api';

const Profile = () => {
  const { currentUser } = useAuth();
  
  // Split the full name if available
  const splitName = () => {
    if (currentUser?.fullName) {
      const names = currentUser.fullName.split(' ');
      return {
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || ''
      };
    }
    return { firstName: '', lastName: '' };
  };
  
  const { firstName, lastName } = splitName();
  
  // Set default date to 20 years ago
  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 20);
  
  // Determine if user is donor or receiver based on roles
  const isDonor = currentUser?.roles?.includes('ROLE_DONOR');
  const isReceiver = currentUser?.roles?.includes('ROLE_RECEIVER');
  const userType = isDonor ? 'Donor' : (isReceiver ? 'Receiver' : 'User');
  
  const [profile, setProfile] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    email: currentUser?.email || '',
    contactNumber: '',
    address: '',
    dateOfBirth: pastDate,
    bloodType: 'A_POSITIVE',
    medicalHistory: '',
    // Donor specific fields
    emergencyContactName: '',
    emergencyContactNumber: '',
    preferredHospital: '',
    // Receiver specific fields
    urgencyLevel: 'MEDIUM'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [hasProfile, setHasProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [forceEdit, setForceEdit] = useState(false); // New state to force edit mode
  
  // Add state for request history
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  
  // Add state for donation history
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [donationsError, setDonationsError] = useState('');
  
  // Add state for security tab
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const bloodTypes = [
    'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 
    'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'
  ];
  
  const urgencyLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  // Check if profile has all required fields
  const isProfileComplete = (p) => {
    const commonRequiredFields = [
      'firstName', 'lastName', 'email', 'contactNumber', 
      'address', 'dateOfBirth', 'bloodType'
    ];
    
    const donorSpecificFields = ['emergencyContactName', 'emergencyContactNumber'];
    const receiverSpecificFields = ['urgencyLevel'];
    
    const requiredFields = [
      ...commonRequiredFields,
      ...(isDonor ? donorSpecificFields : []),
      ...(isReceiver ? receiverSpecificFields : [])
    ];
    
    return requiredFields.every(field => p[field] && p[field].toString().trim() !== '');
  };

  // Load data from localStorage first (on initial mount)
  useEffect(() => {
    // Always check localStorage first
    const storedProfile = localStorage.getItem('userProfile');
    let localProfileLoaded = false;
    
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        console.log('Profile loaded from localStorage:', parsedProfile);
        
        // Ensure date is properly converted to Date object
        const dateOfBirth = parsedProfile.dateOfBirth ? 
          new Date(parsedProfile.dateOfBirth) : 
          pastDate;
        
        const loadedProfile = {
          firstName: parsedProfile.firstName || firstName || '',
          lastName: parsedProfile.lastName || lastName || '',
          email: parsedProfile.email || currentUser?.email || '',
          contactNumber: parsedProfile.contactNumber || '',
          address: parsedProfile.address || '',
          dateOfBirth: dateOfBirth,
          bloodType: parsedProfile.bloodType || 'A_POSITIVE',
          medicalHistory: parsedProfile.medicalHistory || '',
          // Donor specific fields
          emergencyContactName: parsedProfile.emergencyContactName || '',
          emergencyContactNumber: parsedProfile.emergencyContactNumber || '',
          preferredHospital: parsedProfile.preferredHospital || '',
          // Receiver specific fields
          urgencyLevel: parsedProfile.urgencyLevel || 'MEDIUM'
        };
        
        setProfile(loadedProfile);
        
        // Check if the profile is complete
        const complete = isProfileComplete(loadedProfile);
        setHasProfile(complete);
        localProfileLoaded = true;
        
        // If profile exists in localStorage but is incomplete, force edit mode
        if (!complete) {
          setForceEdit(true);
          setIsEditing(true);
        }
        
      } catch (parseError) {
        console.error('Error parsing stored profile:', parseError);
      }
    }

    // Then try API, but preserve local profile data if API fails
    fetchUserProfile(localProfileLoaded);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Add effect to fetch requests/donations when the active tab changes
  useEffect(() => {
    if (activeTab === 'requests' && isReceiver) {
      fetchRequests();
    } else if (activeTab === 'donations' && isDonor) {
      fetchDonations();
    }
  }, [activeTab, isDonor, isReceiver]);

  // Helper function to filter out specific error messages
  const shouldShowError = (errorMessage) => {
    if (!errorMessage) return false;
    
    const ignoredErrors = [
      "No message available", 
      "Type definition error", 
      "ByteBuddyInterceptor"
    ];
    
    return !ignoredErrors.some(msg => errorMessage.includes(msg));
  };
  
  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setPasswordError('You must be logged in to change your password');
        setPasswordLoading(false);
        return;
      }
      
      // Try multiple API endpoints to change password
      let changeSuccess = false;
      let lastError = null;
      
      // First attempt - try with the full path
      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/change-password`,
          {
            oldPassword,
            newPassword
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('Password change response:', response);
        changeSuccess = true;
      } catch (error1) {
        console.log('First password change attempt failed:', error1);
        lastError = error1;
        
        // Second attempt - try alternative endpoint
        try {
          const response = await axios.post(
            '/lifelink/api/auth/change-password',
            {
              oldPassword,
              newPassword
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          console.log('Password change response (second attempt):', response);
          changeSuccess = true;
        } catch (error2) {
          console.log('Second password change attempt failed:', error2);
          lastError = error2;
        }
      }
      
      if (changeSuccess) {
        // Clear form fields on success
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('Password changed successfully!');
      } else {
        if (lastError?.response?.status === 404) {
          setPasswordError('Password change feature is not available yet. Please contact support.');
        } else if (lastError?.response?.status === 401) {
          setPasswordError('Current password is incorrect');
        } else if (lastError?.response?.data?.message && shouldShowError(lastError.response.data.message)) {
          setPasswordError(lastError.response.data.message);
        } else {
          setPasswordError('Failed to change password. Please try again later.');
        }
        console.error('All password change attempts failed');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      
      if (err.response?.data?.message && shouldShowError(err.response.data.message)) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError('Failed to change password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // Function to fetch request history
  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setRequestsError('You must be logged in to view your requests');
        setRequestsLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/receiver/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
      setRequestsError('');
    } catch (err) {
      console.error('Error fetching requests:', err);
      setRequestsError('Failed to load your organ requests. Please try again later.');
      // Still set empty array to prevent UI from breaking
      setRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  };
  
  // Function to fetch donation history
  const fetchDonations = async () => {
    try {
      setDonationsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setDonationsError('You must be logged in to view your donations');
        setDonationsLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/donor/donations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setDonations(response.data);
      } else {
        setDonations([]);
      }
      setDonationsError('');
    } catch (err) {
      console.error('Error fetching donations:', err);
      setDonationsError('Failed to load your donation history. Please try again later.');
      // Still set empty array to prevent UI from breaking
      setDonations([]);
    } finally {
      setDonationsLoading(false);
    }
  };

  const fetchUserProfile = async (keepLocalProfileOnError = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to view your profile');
        setLoading(false);
        return;
      }
      
      console.log('User type detected:', isDonor ? 'Donor' : (isReceiver ? 'Receiver' : 'Unknown'));
      
      // Try multiple endpoints to get profile data
      let profileData = null;
      let fetchError = null;
      
      // First attempt - standard profile endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/patient/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data && typeof response.data === 'object') {
          console.log('Profile data from main endpoint:', response.data);
          profileData = response.data;
          // Save to localStorage immediately upon successful fetch
          localStorage.setItem('userProfile', JSON.stringify(profileData));
        }
      } catch (error1) {
        console.log('First profile fetch attempt failed:', error1);
        fetchError = error1;
        
        // Check if user type is available in error response
        if (error1.response?.data?.userType) {
          console.log('User type from error response:', error1.response.data.userType);
        }
        
        // Second attempt - try specific endpoint based on role
        const specificEndpoint = isDonor ? 
          `${API_BASE_URL}/patient/profile/donor` : 
          `${API_BASE_URL}/patient/profile/receiver`;
          
        console.log('Trying role-specific endpoint:', specificEndpoint);
        
        try {
          const response = await axios.get(specificEndpoint, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data && typeof response.data === 'object') {
            console.log('Profile data from specific endpoint:', response.data);
            profileData = response.data;
            // Save to localStorage immediately upon successful fetch
            localStorage.setItem('userProfile', JSON.stringify(profileData));
          }
        } catch (error2) {
          console.log('Second profile fetch attempt failed:', error2);
          // Keep the first error if the second also fails
        }
      }
      
      // Process retrieved data or handle error
      if (profileData) {
        console.log('Profile data retrieved:', profileData);
        
        // Filter out "message" fields if they're error messages
        if (profileData.message && shouldShowError(profileData.message)) {
          setError(profileData.message);
        } else {
          setError('');
        }
        
        // Check if we have actual profile data (not just error messages)
        const hasRealData = profileData && 
                         typeof profileData === 'object' && 
                         (profileData.firstName || profileData.lastName || profileData.email);
        
        if (hasRealData) {
          // Ensure date is properly converted
          const dateOfBirth = profileData.dateOfBirth ? 
            new Date(profileData.dateOfBirth) : 
            pastDate;
          
          const updatedProfile = {
            firstName: profileData.firstName || firstName || '',
            lastName: profileData.lastName || lastName || '',
            email: profileData.email || currentUser?.email || '',
            contactNumber: profileData.contactNumber || '',
            address: profileData.address || '',
            dateOfBirth: dateOfBirth,
            bloodType: profileData.bloodType || 'A_POSITIVE',
            medicalHistory: profileData.medicalHistory || '',
            // Donor specific fields
            emergencyContactName: profileData.emergencyContactName || '',
            emergencyContactNumber: profileData.emergencyContactNumber || '',
            preferredHospital: profileData.preferredHospital || '',
            // Receiver specific fields
            urgencyLevel: profileData.urgencyLevel || 'MEDIUM'
          };

          setProfile(updatedProfile);
          
          // Check if the profile data is complete
          const profileComplete = isProfileComplete(updatedProfile);
          setHasProfile(profileComplete);
          
          // If profile exists but is incomplete, force edit mode
          if (!profileComplete) {
            setForceEdit(true);
            setIsEditing(true);
          }
          
          console.log("Profile data loaded successfully:", profileData);
        }
      } else if (fetchError) {
        console.error('All profile fetch attempts failed');
        
        // Only show error if it's not one of the ignored ones and we don't want to keep local profile
        if (!keepLocalProfileOnError) {
          if (fetchError.response?.data?.message && shouldShowError(fetchError.response.data.message)) {
            setError(fetchError.response.data.message);
          } else if (shouldShowError(fetchError.message)) {
            setError(fetchError.message);
          } else {
            setError('Could not retrieve profile from server.');
          }
          
          // If server says no profile exists but we have one in local storage,
          // let's keep our profile and just force edit mode to update server
          setForceEdit(true);
          setIsEditing(true);
        }
      }
      
      setFetchAttempted(true);
    } catch (err) {
      console.error('Error in profile fetch process:', err);
      
      // Only show error if we don't want to keep local profile
      if (!keepLocalProfileOnError) {
        if (err.response?.data?.message && shouldShowError(err.response.data.message)) {
          setError(err.response.data.message);
        } else if (shouldShowError(err.message)) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred while fetching your profile.');
        }
        
        // Force edit mode to fix server-side profile
        setForceEdit(true);
        setIsEditing(true);
      }
      
      setFetchAttempted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    // Ensure date is in the past
    const today = new Date();
    if (date >= today) {
      setError('Date of birth must be in the past');
      return;
    }
    
    setProfile(prev => ({
      ...prev,
      dateOfBirth: date
    }));
    
    setError(''); // Clear error if valid date
  };
  
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate date of birth is in the past
    const today = new Date();
    if (profile.dateOfBirth >= today) {
      setError('Date of birth must be in the past');
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to update your profile');
        setLoading(false);
        return;
      }
      
      // Format data for API
      const formattedProfile = {
        ...profile,
        dateOfBirth: formatDate(profile.dateOfBirth),
        medicalHistory: profile.medicalHistory || ''
      };
      
      // Log the profile being submitted
      console.log('Submitting profile with values:', formattedProfile);
      
      // ALWAYS save to localStorage first as a backup
      localStorage.setItem('userProfile', JSON.stringify(formattedProfile));
      console.log('Profile saved to localStorage:', formattedProfile);
      
      console.log('User type for API endpoints:', isDonor ? 'Donor' : (isReceiver ? 'Receiver' : 'Unknown'));
      
      // Determine endpoints based on user role
      let updateEndpoint, createEndpoint;
      
      if (isDonor) {
        updateEndpoint = `${API_BASE_URL}/patient/profile/donor`;
        createEndpoint = `${API_BASE_URL}/patient/profile/donor`;
      } else if (isReceiver) {
        updateEndpoint = `${API_BASE_URL}/patient/profile/receiver`;
        createEndpoint = `${API_BASE_URL}/patient/profile/receiver`;
      } else {
        updateEndpoint = `${API_BASE_URL}/patient/profile/update`;
        createEndpoint = `${API_BASE_URL}/patient/profile`;
      }
      
      console.log('Using update endpoint:', updateEndpoint);
      console.log('Using create endpoint:', createEndpoint);
      
      // Try both POST and PUT methods for maximum compatibility
      let updateSuccess = false;
      let lastError = null;
      
      // First try POST to create endpoint (most reliable for new profiles)
      try {
        await axios.post(
          createEndpoint,
          formattedProfile,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        updateSuccess = true;
      } catch (error1) {
        console.log('POST create attempt failed:', error1);
        lastError = error1;
        
        // Second try - PUT to update endpoint
        try {
          await axios.put(
            updateEndpoint,
            formattedProfile,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          updateSuccess = true;
        } catch (error2) {
          console.log('PUT update attempt failed:', error2);
          lastError = error2;
          
          // Last try - PUT to generic endpoint
          try {
            await axios.put(
              `${API_BASE_URL}/patient/profile/update`,
              formattedProfile,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            updateSuccess = true;
          } catch (error3) {
            console.error('All update attempts failed');
            lastError = error3;
          }
        }
      }
      
      if (updateSuccess) {
        setHasProfile(true);
        setIsEditing(false);
        setForceEdit(false);
        setSuccess('Profile updated successfully!');
      } else {
        // Even if server update failed, we've saved to localStorage
        setHasProfile(true);
        setIsEditing(false);
        
        if (lastError?.response?.status === 500) {
          setSuccess('Profile saved locally. Server update failed, but your data is safe.');
        } else if (lastError?.response?.data?.message && shouldShowError(lastError.response.data.message)) {
          setError(lastError.response.data.message);
        } else {
          setSuccess('Profile saved locally. Changes may not be reflected on the server.');
        }
      }
    } catch (err) {
      console.error('Error in overall update process:', err);
      
      // Even if there's an error, we've already saved to localStorage
      setHasProfile(true);
      setIsEditing(false);
      
      if (err.response?.data?.message && shouldShowError(err.response.data.message)) {
        setError(err.response.data.message);
      } else {
        setSuccess('Profile saved locally. Server update failed, but your data is safe.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle edit mode
  const handleEditProfile = () => {
    // Make sure we're using the current profile values from state
    // This ensures the form fields are pre-populated
    const currentProfile = { ...profile };
    
    // If dateOfBirth is a string, convert it to Date object
    if (typeof currentProfile.dateOfBirth === 'string') {
      currentProfile.dateOfBirth = new Date(currentProfile.dateOfBirth);
    }
    
    // Update the profile state with current values
    setProfile(currentProfile);
    
    // Enable editing mode
    setIsEditing(true);
    setError('');
    setSuccess('');
    
    console.log("Edit mode enabled with profile data:", currentProfile);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Don't allow canceling if we're forcing edit mode
    if (forceEdit) {
      setError('Please complete your profile to continue using the platform.');
      return;
    }
    
    setIsEditing(false);
    
    console.log('Edit cancelled, attempting to revert profile data');
    
    // Try to reload data from localStorage first
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        console.log('Reverting to stored profile:', parsedProfile);
        
        // Ensure date is properly converted
        const dateOfBirth = parsedProfile.dateOfBirth ? 
          new Date(parsedProfile.dateOfBirth) : 
          pastDate;
          
        setProfile({
          firstName: parsedProfile.firstName || firstName || '',
          lastName: parsedProfile.lastName || lastName || '',
          email: parsedProfile.email || currentUser?.email || '',
          contactNumber: parsedProfile.contactNumber || '',
          address: parsedProfile.address || '',
          dateOfBirth: dateOfBirth,
          bloodType: parsedProfile.bloodType || 'A_POSITIVE',
          medicalHistory: parsedProfile.medicalHistory || '',
          // Donor specific fields
          emergencyContactName: parsedProfile.emergencyContactName || '',
          emergencyContactNumber: parsedProfile.emergencyContactNumber || '',
          preferredHospital: parsedProfile.preferredHospital || '',
          // Receiver specific fields
          urgencyLevel: parsedProfile.urgencyLevel || 'MEDIUM'
        });
      } catch (parseError) {
        console.error('Error parsing stored profile:', parseError);
        // Fall back to API if localStorage parse fails
        fetchUserProfile();
      }
    } else {
      // Fall back to API if no localStorage data
      fetchUserProfile();
    }
    
    setError('');
    setSuccess('');
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

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4">
          <Card className="mb-4 text-center">
            <Card.Body>
              <div className="mb-3">
                <i className="fas fa-user-circle fa-6x text-primary"></i>
              </div>
              <h5 className="card-title">{profile.firstName} {profile.lastName}</h5>
              <p className="card-text text-muted">{isDonor ? 'Donor' : (isReceiver ? 'Receiver' : 'User')}</p>
              {profile.email && (
                <p className="card-text">
                  <i className="fas fa-envelope me-2"></i>
                  {profile.email}
                </p>
              )}
            </Card.Body>
          </Card>
          
          <div className="list-group mb-4">
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="fas fa-user me-2"></i>Profile Information
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <i className="fas fa-lock me-2"></i>Security
            </button>
            {isDonor && (
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'donations' ? 'active' : ''}`}
                onClick={() => setActiveTab('donations')}
              >
                <i className="fas fa-hand-holding-heart me-2"></i>Donation History
              </button>
            )}
            {isReceiver && (
              <button 
                className={`list-group-item list-group-item-action ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                <i className="fas fa-procedures me-2"></i>Request History
              </button>
            )}
          </div>
        </div>
        
        <div className="col-md-8">
          {activeTab === 'profile' && (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  {isDonor ? 'Donor Profile Information' : 'Receiver Profile Information'}
                </h5>
                {hasProfile && !isEditing && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleEditProfile}
                  >
                    <i className="fas fa-edit me-1"></i> Edit Profile
                  </Button>
                )}
              </Card.Header>
              <Card.Body>
                {/* Only show filtered errors
                {/* Only show filtered errors */}
                {error && shouldShowError(error) && (
                  <Alert variant="danger">{error}</Alert>
                )}
                
                {success && <Alert variant="success">{success}</Alert>}
                
                {forceEdit && (
                  <Alert variant="warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Your profile is incomplete or not properly synced with the server. Please complete all required fields and save to fully use the platform.
                  </Alert>
                )}
                
                {fetchAttempted && !hasProfile && !isEditing && !forceEdit && (
                  <Alert variant="info">
                    Please complete your {isDonor ? 'donor' : 'receiver'} profile information below to fully use the platform.
                  </Alert>
                )}
                
                {isEditing || !hasProfile || forceEdit ? (
                  <Form onSubmit={handleSubmit}>
                    <h6 className="mb-3">Personal Information</h6>
                    <Row className="mb-3">
                      <Form.Group as={Col} md="6">
                        <Form.Label>First Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={profile.firstName || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group as={Col} md="6">
                        <Form.Label>Last Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={profile.lastName || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Row>

                    <Row className="mb-3">
                      <Form.Group as={Col} md="6">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={profile.email || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>

                      <Form.Group as={Col} md="6">
                        <Form.Label>Date of Birth * (must be in the past)</Form.Label>
                        <DatePicker
                          selected={profile.dateOfBirth instanceof Date ? profile.dateOfBirth : new Date(profile.dateOfBirth)}
                          onChange={handleDateChange}
                          dateFormat="yyyy-MM-dd"
                          showYearDropdown
                          scrollableYearDropdown
                          yearDropdownItemNumber={100}
                          className="form-control"
                          placeholderText="Select date of birth"
                          maxDate={new Date(new Date().setDate(new Date().getDate() - 1))}
                          required
                        />
                      </Form.Group>
                    </Row>
                    <Row className="mb-3">
                      <Form.Group as={Col} md="6">
                        <Form.Label>Phone Number *</Form.Label>
                        <Form.Control
                          type="text"
                          name="contactNumber"
                          value={profile.contactNumber || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your contact number"
                          required
                        />
                      </Form.Group>

                      <Form.Group as={Col} md="6">
                        <Form.Label>Address *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="address"
                          value={profile.address || ''}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                          required
                        />
                      </Form.Group>
                    </Row>

                    <hr className="my-4" />
                    <h6 className="mb-3">Medical Information</h6>

                    <Row className="mb-3">
                      <Form.Group as={Col} md="6">
                        <Form.Label>Blood Type *</Form.Label>
                        <Form.Select
                          name="bloodType"
                          value={profile.bloodType || 'A_POSITIVE'}
                          onChange={handleInputChange}
                          required
                        >
                          {bloodTypes.map(type => (
                            <option key={type} value={type}>
                              {type.replace('_', ' ')}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Text className="text-muted">
                          Your blood type is critical for organ matching
                        </Form.Text>
                      </Form.Group>

                      {isDonor ? (
                        <Form.Group as={Col} md="6">
                          <Form.Label>Preferred Hospital</Form.Label>
                          <Form.Control
                            type="text"
                            name="preferredHospital"
                            value={profile.preferredHospital || ''}
                            onChange={handleInputChange}
                            placeholder="Enter your preferred hospital"
                          />
                          <Form.Text className="text-muted">
                            Where you'd prefer the donation procedure to take place
                          </Form.Text>
                        </Form.Group>
                      ) : (
                        <Form.Group as={Col} md="6">
                          <Form.Label>Urgency Level *</Form.Label>
                          <Form.Select
                            name="urgencyLevel"
                            value={profile.urgencyLevel || 'MEDIUM'}
                            onChange={handleInputChange}
                            required
                          >
                            {urgencyLevels.map(level => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            This will be verified by medical professionals
                          </Form.Text>
                        </Form.Group>
                      )}
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Medical History</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="medicalHistory"
                        value={profile.medicalHistory || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your medical history"
                      />
                      <Form.Text className="text-muted">
                        Include any relevant medical conditions, past surgeries, or ongoing treatments
                      </Form.Text>
                    </Form.Group>

                    {isDonor && (
                      <>
                        <hr className="my-4" />
                        <h6 className="mb-3">Emergency Contact Information</h6>
                        <Row className="mb-3">
                          <Form.Group as={Col} md="6">
                            <Form.Label>Emergency Contact Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="emergencyContactName"
                              value={profile.emergencyContactName || ''}
                              onChange={handleInputChange}
                              placeholder="Enter emergency contact name"
                              required
                            />
                            <Form.Text className="text-muted">
                              Person to contact in case of emergency
                            </Form.Text>
                          </Form.Group>
                          
                          <Form.Group as={Col} md="6">
                            <Form.Label>Emergency Contact Number *</Form.Label>
                            <Form.Control
                              type="text"
                              name="emergencyContactNumber"
                              value={profile.emergencyContactNumber || ''}
                              onChange={handleInputChange}
                              placeholder="Enter emergency contact number"
                              required
                            />
                          </Form.Group>
                        </Row>
                      </>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                      {isEditing && !forceEdit && (
                        <Button 
                          variant="secondary" 
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : (isEditing ? 'Update Profile' : 'Save Profile')}
                      </Button>
                    </div>
                  </Form>
                ) : (
                  // Display profile in read-only mode when not editing
                  <div className="profile-display">
                    <Row className="mb-4">
                      <Col md={6}>
                        <h6>Personal Information</h6>
                        <dl className="row">
                          <dt className="col-sm-4">First Name:</dt>
                          <dd className="col-sm-8">{profile.firstName}</dd>
                          
                          <dt className="col-sm-4">Last Name:</dt>
                          <dd className="col-sm-8">{profile.lastName}</dd>
                          
                          <dt className="col-sm-4">Email:</dt>
                          <dd className="col-sm-8">{profile.email}</dd>
                          
                          <dt className="col-sm-4">Date of Birth:</dt>
                          <dd className="col-sm-8">{profile.dateOfBirth instanceof Date 
                            ? profile.dateOfBirth.toLocaleDateString() 
                            : new Date(profile.dateOfBirth).toLocaleDateString()}</dd>
                          
                          <dt className="col-sm-4">Phone:</dt>
                          <dd className="col-sm-8">{profile.contactNumber}</dd>
                          
                          <dt className="col-sm-4">Address:</dt>
                          <dd className="col-sm-8">{profile.address}</dd>
                        </dl>
                      </Col>
                      
                      <Col md={6}>
                        <h6>Medical Information</h6>
                        <dl className="row">
                          <dt className="col-sm-4">Blood Type:</dt>
                          <dd className="col-sm-8">{profile.bloodType?.replace('_', ' ')}</dd>
                          
                          {isDonor ? (
                            <>
                              <dt className="col-sm-4">Preferred Hospital:</dt>
                              <dd className="col-sm-8">{profile.preferredHospital || 'Not specified'}</dd>
                              
                              <dt className="col-sm-4">Medical History:</dt>
                              <dd className="col-sm-8">{profile.medicalHistory || 'None provided'}</dd>
                              
                              <dt className="col-sm-4">Emergency Contact:</dt>
                              <dd className="col-sm-8">{profile.emergencyContactName || 'Not provided'}</dd>
                              
                              <dt className="col-sm-4">Emergency Number:</dt>
                              <dd className="col-sm-8">{profile.emergencyContactNumber || 'Not provided'}</dd>
                            </>
                          ) : (
                            <>
                              <dt className="col-sm-4">Urgency Level:</dt>
                              <dd className="col-sm-8">{profile.urgencyLevel}</dd>
                              
                              <dt className="col-sm-4">Medical History:</dt>
                              <dd className="col-sm-8">{profile.medicalHistory || 'None provided'}</dd>
                            </>
                          )}
                        </dl>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card>
              <Card.Header>
                <h5 className="card-title mb-0">Security Settings</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handlePasswordChange}>
                  <h6 className="mb-3">Change Password</h6>
                  
                  {passwordError && (
                    <Alert variant="danger">{passwordError}</Alert>
                  )}
                  
                  {passwordSuccess && (
                  <Alert variant="success">{passwordSuccess}</Alert>
                  )}
                      
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        <i className={`fas ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Password must be at least 8 characters long
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <Button 
                        variant="outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </div>
                </Form>
                
                <hr className="my-4" />
                
                <h6 className="mb-3">Account Security</h6>
                <div className="mb-3">
                  <p>
                    <i className="fas fa-shield-alt text-primary me-2"></i>
                    Two-factor authentication: <span className="text-danger">Not enabled</span>
                  </p>
                  <Button variant="outline-primary" size="sm" disabled>
                    Enable 2FA
                  </Button>
                  <Form.Text className="text-muted d-block mt-2">
                    Two-factor authentication adds an extra layer of security to your account. This feature will be available soon.
                  </Form.Text>
                </div>
                
                <div className="mb-3">
                  <p>
                    <i className="fas fa-clock text-primary me-2"></i>
                    Last sign-in: <span className="text-muted">May 3, 2025</span>
                  </p>
                </div>
                
                <div>
                  <p>
                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                    Security level: <span className="text-warning">Medium</span>
                  </p>
                  <div className="progress" style={{ height: '5px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      role="progressbar" 
                      style={{ width: '50%' }} 
                      aria-valuenow="50" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <Form.Text className="text-muted d-block mt-2">
                    Enable two-factor authentication to increase your account security.
                  </Form.Text>
                </div>
              </Card.Body>
            </Card>
          )}
          
          {activeTab === 'donations' && isDonor && (
            <Card>
              <Card.Header>
                <h5 className="card-title mb-0">Donation History</h5>
              </Card.Header>
              <Card.Body>
                {donationsLoading ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading your donations...</p>
                  </div>
                ) : donationsError ? (
                  <Alert variant="danger">{donationsError}</Alert>
                ) : donations.length === 0 ? (
                  <div className="text-center my-4">
                    <i className="fas fa-hand-holding-heart fa-4x text-muted mb-3"></i>
                    <h5>No donations yet</h5>
                    <p className="text-muted">You haven't submitted any organ donations yet.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => window.location.href = '/donor-dashboard'}
                    >
                      Go to Dashboard to Submit Donation
                    </Button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Organ Type</th>
                          <th>Status</th>
                          <th>Date Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map(donation => (
                          <tr key={donation.id}>
                            <td>{donation.organType.replace('_', ' ')}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeColor(donation.status || donation.donationStatus)}`}>
                                {donation.status || donation.donationStatus}
                              </span>
                            </td>
                            <td>
                              {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'Invalid Date'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
          
          {activeTab === 'requests' && isReceiver && (
            <Card>
              <Card.Header>
                <h5 className="card-title mb-0">Request History</h5>
              </Card.Header>
              <Card.Body>
                {requestsLoading ? (
                  <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading your requests...</p>
                  </div>
                ) : requestsError ? (
                  <Alert variant="danger">{requestsError}</Alert>
                ) : requests.length === 0 ? (
                  <div className="text-center my-4">
                    <i className="fas fa-procedures fa-4x text-muted mb-3"></i>
                    <h5>No requests yet</h5>
                    <p className="text-muted">You haven't submitted any organ requests yet.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => window.location.href = '/receiver-dashboard'}
                    >
                      Go to Dashboard to Submit Request
                    </Button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Organ Type</th>
                          <th>Status</th>
                          <th>Urgency</th>
                          <th>Date Submitted</th>
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
                            <td>
                              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Invalid Date'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;