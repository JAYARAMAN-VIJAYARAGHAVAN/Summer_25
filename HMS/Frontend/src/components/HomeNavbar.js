import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const HomeNavbar = () => {
  return (
    <nav style={{
      background: '#0077b6',
      padding: '16px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/HVHospitals.png"
          alt="HV Logo"
          style={{ height: '48px', width: '48px', objectFit: 'contain' }}
        />
        <span style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>HV Hospitals</span>
      </div>

      <div>
        <Link to={ROUTES.HOME} style={{ color: 'white', marginRight: '16px', textDecoration: 'none' }}>Home</Link>
        <Link to="/about" style={{ color: 'white', marginRight: '16px', textDecoration: 'none' }}>About</Link>
        <Link to="/doctors" style={{ color: 'white', marginRight: '16px', textDecoration: 'none' }}>Our Doctors</Link>
        <Link to={ROUTES.SIGNUP} style={{ color: 'white', marginRight: '16px', textDecoration: 'none' }}>Signup</Link>
        <Link to={ROUTES.LOGIN} style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
      </div>
    </nav>
  );
};

export default HomeNavbar;
