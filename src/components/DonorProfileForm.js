import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap';
import { FaUserEdit } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DonorProfileForm = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    bloodType: '',
    dateOfBirth: '',
    medicalHistory: '',
    contactNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    preferredHospital: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/patient/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Profile data retrieved:', response.data);
        setProfileData(response.data);
        
        // If profile exists, pre-fill the form
        if (response.data.profileExists && response.data.profileData) {
          const profile = response.data.profileData;
          setFormData({
            bloodType: profile.bloodType || '',
            dateOfBirth: profile.dateOfBirth || '',
            medicalHistory: profile.medicalHistory || '',
            contactNumber: profile.contactNumber || '',
            address: profile.address || '',
            emergencyContactName: profile.emergencyContactName || '',
            emergencyContactNumber: profile.emergencyContactNumber || '',
            preferredHospital: profile.preferredHospital || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile information');
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const url = profileData.profileExists 
        ? '/api/patient/profile/donor' // Update existing profile
        : '/api/patient/profile/donor'; // Create new profile
      
      const method = profileData.profileExists ? 'put' : 'post';
      
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Profile saved successfully:', response.data);
      setSubmitSuccess(true);
      
      // Refresh profile data
      const updatedProfile = await axios.get('/api/patient/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setProfileData(updatedProfile.data);
      
    } catch (err) {
      console.error('Error saving profile:', err);
      setSubmitError(err.response?.data?.message || 'Failed to save profile information');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center my-5">Loading profile information...</div>;
  }
  
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  // Make sure user is a donor
  if (profileData.userType !== 'DONOR') {
    return <Alert variant="danger">This page is only accessible for donor accounts.</Alert>;
  }
  
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Donor Profile Information</h5>
            </Card.Header>
            
            <Card.Body>
              {!profileData.profileExists && (
                <Alert variant="info">
                  Please complete your donor profile information to continue.
                </Alert>
              )}
              
              {submitSuccess && (
                <Alert variant="success">
                  Profile saved successfully!
                </Alert>
              )}
              
              {submitError && (
                <Alert variant="danger">
                  {submitError}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Blood Type</Form.Label>
                      <Form.Select 
                        name="bloodType" 
                        value={formData.bloodType} 
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Blood Type</option>
                        <option value="A POSITIVE">A+</option>
                        <option value="A NEGATIVE">A-</option>
                        <option value="B POSITIVE">B+</option>
                        <option value="B NEGATIVE">B-</option>
                        <option value="AB POSITIVE">AB+</option>
                        <option value="AB NEGATIVE">AB-</option>
                        <option value="O POSITIVE">O+</option>
                        <option value="O NEGATIVE">O-</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="contactNumber"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Medical History</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        placeholder="List any medical conditions, medications, or past surgeries"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Emergency Contact Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Emergency Contact Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="emergencyContactNumber"
                        value={formData.emergencyContactNumber}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Preferred Hospital</Form.Label>
                      <Form.Control
                        type="text"
                        name="preferredHospital"
                        value={formData.preferredHospital}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-grid gap-2 mt-3">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Saving...' : (profileData.profileExists ? 'Update Profile' : 'Create Profile')}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DonorProfileForm;