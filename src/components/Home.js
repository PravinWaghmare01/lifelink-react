import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll to section if coming from another page
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const element = document.getElementById(location.state.scrollTo);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const handleRegisterClick = (userType) => {
    navigate('/register', { state: { userType } });
  };

  return (
    <>
      <div className="hero-section py-5 d-flex align-items-center" 
        style={{ 
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/OrganPortal.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: "white", 
          minHeight: "500px",
          position: "relative"
        }}>
        <div className="container text-center">
          <h1 className="display-4 fw-bold">LifeLink</h1>
          <p className="lead mb-4 fw-bold">Connecting Donors, Saving Lives.</p>
          <p className="lead mb-4">Join our network to donate or receive life-saving organs and make a difference.</p>
          <div className="d-grid gap-2 d-sm-flex justify-content-center">
            <button 
              onClick={() => handleRegisterClick('DONOR')} 
              className="btn btn-primary btn-lg px-4 me-sm-3"
            >
              Become a Donor
            </button>
            <button 
              onClick={() => handleRegisterClick('RECEIVER')} 
              className="btn btn-outline-light btn-lg px-4"
            >
              Register as Receiver
            </button>
          </div>
          
          {/* Admin Login Link - Small and subtle */}
          <div className="mt-4 pt-2">
            <Link 
              to="/login" 
              state={{ isAdmin: true }} 
              className="text-white-50 small"
            >
              <i className="fas fa-user-shield me-1"></i>
              Administrator Login
            </Link>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <div className="row mb-5" id="about">
          <div className="col-lg-12 text-center mb-5">
            <h2 className="display-5 fw-bold">About Organ Donation</h2>
            <div className="mx-auto" style={{ maxWidth: "400px" }}>
              <hr className="mb-3" />
              <div className="text-primary mb-3">
                <i className="fas fa-heart fa-2x text-primary"></i>
              </div>
              <hr />
            </div>
          </div>
          <div className="col-md-6">
            <h3>Why Donate?</h3>
            <p className="lead">Organ donation is a selfless act that can save up to 8 lives from a single donor.</p>
            <p>Every day, about 20 people die waiting for an organ transplant. By registering to become an organ donor, you can help reduce this number and provide hope to those in need.</p>
            <p>Organs that can be donated include the heart, lungs, liver, kidneys, pancreas, and intestines. Tissues that can be donated include corneas, skin, heart valves, bone, blood vessels, and connective tissue.</p>
          </div>
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h4 className="card-title">Donation Facts</h4>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">One donor can save up to 8 lives</li>
                  <li className="list-group-item">More than 100,000 people are waiting for transplants</li>
                  <li className="list-group-item">Every 10 minutes, someone is added to the waiting list</li>
                  <li className="list-group-item">About 85% of patients on the waiting list need a kidney</li>
                  <li className="list-group-item">Most major religions support organ donation</li>
                  <li className="list-group-item">There's no cost to the donor or donor's family</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-5">
          <div className="col-lg-12 text-center mb-5">
            <h2 className="display-5 fw-bold">How It Works</h2>
            <div className="mx-auto" style={{ maxWidth: "400px" }}>
              <hr className="mb-3" />
              <div className="text-primary mb-3">
                <i className="fas fa-exchange-alt fa-2x text-primary"></i>
              </div>
              <hr />
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <div className="icon-wrapper mb-3">
                  <i className="fas fa-user-plus fa-4x text-primary"></i>
                </div>
                <h3 className="card-title">1. Register</h3>
                <p className="card-text">Create an account as a donor or receiver. Provide your medical information and consent.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <div className="icon-wrapper mb-3">
                  <i className="fas fa-heartbeat fa-4x text-primary"></i>
                </div>
                <h3 className="card-title">2. Match</h3>
                <p className="card-text">Our system matches compatible donors and receivers based on medical criteria and urgency.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card h-100 text-center">
              <div className="card-body">
                <div className="icon-wrapper mb-3">
                  <i className="fas fa-hospital-user fa-4x text-primary"></i>
                </div>
                <h3 className="card-title">3. Transplant</h3>
                <p className="card-text">Medical professionals coordinate the transplant process, ensuring the highest standards of care.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-5" id="faq">
          <div className="col-lg-12 text-center mb-5">
            <h2 className="display-5 fw-bold">Frequently Asked Questions</h2>
            <div className="mx-auto" style={{ maxWidth: "400px" }}>
              <hr className="mb-3" />
              <div className="text-primary mb-3">
                <i className="fas fa-question-circle fa-2x text-primary"></i>
              </div>
              <hr />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="accordion" id="accordionFAQ">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    Who can be an organ donor?
                  </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionFAQ" aria-labelledby="headingOne">
                  <div className="accordion-body">
                    Almost anyone can be an organ donor, regardless of age or medical history. The medical condition of the donor at the time of death will determine what organs and tissues can be donated. Even those with chronic conditions such as diabetes or hypertension can still donate.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                    Is there an age limit for organ donation?
                  </button>
                </h2>
                <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionFAQ" aria-labelledby="headingTwo">
                  <div className="accordion-body">
                    There is no age limit for organ donation. The deciding factor is the condition of the organs, not the age of the donor. Organs have been successfully transplanted from donors in their 70s and 80s.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingThree">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                    How are organs matched to recipients?
                  </button>
                </h2>
                <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionFAQ" aria-labelledby="headingThree">
                  <div className="accordion-body">
                    Organs are matched to recipients based on a number of factors including blood type, tissue type, medical urgency, waiting time, and geographic location. The matching process is designed to ensure the best possible outcomes for transplant recipients.
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingFour">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                    What is the cost of organ donation?
                  </button>
                </h2>
                <div id="collapseFour" className="accordion-collapse collapse" data-bs-parent="#accordionFAQ" aria-labelledby="headingFour">
                  <div className="accordion-body">
                    There is no cost to the donor or the donor's family for organ or tissue donation. All costs related to donation are paid by the organ procurement organization or the recipient's insurance.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-5" id="contact">
          <div className="col-lg-12 text-center mb-5">
            <h2 className="display-5 fw-bold">Contact Us</h2>
            <div className="mx-auto" style={{ maxWidth: "400px" }}>
              <hr className="mb-3" />
              <div className="text-primary mb-3">
                <i className="fas fa-envelope fa-2x text-primary"></i>
              </div>
              <hr />
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h4 className="card-title">Get in Touch</h4>
                <p className="card-text">Have questions about organ donation or our platform? We're here to help!</p>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="fas fa-map-marker-alt me-2 text-primary"></i> 123 Organ St, Medical City, MC 12345</li>
                  <li className="mb-2"><i className="fas fa-phone me-2 text-primary"></i> (123) 456-7890</li>
                  <li className="mb-2"><i className="fas fa-envelope me-2 text-primary"></i> info@lifelink.org</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h4 className="card-title">Send a Message</h4>
                <form>
                  <div className="mb-3">
                    <input type="text" className="form-control" placeholder="Your Name" aria-label="Your Name" required />
                  </div>
                  <div className="mb-3">
                    <input type="email" className="form-control" placeholder="Your Email" aria-label="Your Email" required />
                  </div>
                  <div className="mb-3">
                    <textarea className="form-control" rows="4" placeholder="Your Message" aria-label="Your Message" required></textarea>
                  </div>
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">Send Message</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;