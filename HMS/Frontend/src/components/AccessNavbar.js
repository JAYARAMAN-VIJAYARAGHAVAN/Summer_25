import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AccessNavbar() {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const { role } = JSON.parse(storedUser);

    switch (role) {
      case 'Patient':
        navigate('/patient-dashboard');
        break;
      case 'Doctor':
        navigate('/doctor-dashboard');
        break;
      case 'Pharmacist':
        navigate('/pharmacist-dashboard');
        break;
      default:
        navigate('/login');
    }
  };

  const linkStyle = {
    color: 'white',
    marginRight: '16px',
    textDecoration: 'none',
    fontWeight: 500
  };

  return (
    <nav
      style={{
        background: '#0077b6',
        padding: '16px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* LOGO (same as HomeNavbar) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/HVHospitals.png"
          alt="HV Logo"
          style={{ height: '48px', width: '48px', objectFit: 'contain' }}
        />
        <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>HV Hospitals</span>
      </div>

      {/* Nav Links */}
      <div>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/about" style={linkStyle}>About</Link>
        <Link to="/our-doctors" style={linkStyle}>Our Doctors</Link>
        <span onClick={handleDashboardClick} style={{ ...linkStyle, cursor: 'pointer' }}>Dashboard</span>
      </div>
    </nav>
  );
}

export default AccessNavbar;
