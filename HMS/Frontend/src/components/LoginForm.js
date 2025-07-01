import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { ERROR_MESSAGES } from '../constants/messages';

function LoginForm() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const { data } = await loginUser(formData);
      const { userId, name, role } = data;
  
      localStorage.setItem('user', JSON.stringify({ userId, name, role }));
      window.dispatchEvent(new Event('user-login'));  // <-- dispatch event here
  
      switch (role) {
        case ROLES.DOCTOR:
          navigate(ROUTES.DOCTOR_DASHBOARD);
          break;
        case ROLES.PATIENT:
          navigate(ROUTES.PATIENT_DASHBOARD);
          break;
        case ROLES.PHARMACIST:
          navigate(ROUTES.PHARMACIST_DASHBOARD);
          break;
        case ROLES.ADMIN:
          navigate(ROUTES.ADMIN_DASHBOARD);
          break;
        default:
          navigate(ROUTES.DASHBOARD);
      }
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.message || '';
  
      if (message.includes('Account not activated')) {
        setError('Your account is not activated yet. Please wait for admin approval.');
      } else {
        setError(ERROR_MESSAGES.LOGIN_FAILED);
      }
    }
  };
  

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #ffffff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px 0 rgba(56, 120, 255, 0.10)',
        padding: '40px 32px',
        minWidth: '340px',
        width: '100%',
        maxWidth: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{
          color: '#1e3a8a',
          fontWeight: 700,
          fontSize: '2rem',
          marginBottom: '24px',
          letterSpacing: '1px'
        }}>
          Login to HMS
        </h2>
        {error && (
          <div style={{
            color: '#dc2626',
            background: '#fef2f2',
            borderRadius: '6px',
            padding: '8px 16px',
            marginBottom: '16px',
            width: '100%',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #dbeafe',
              background: '#f1f5fb',
              color: '#1e293b',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #dbeafe',
              background: '#f1f5fb',
              color: '#1e293b',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)',
              color: '#fff',
              fontWeight: 600,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1rem',
              marginTop: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px 0 rgba(56, 120, 255, 0.10)',
              transition: 'background 0.2s'
            }}
          >
            Login
          </button>
        </form>
        <div style={{
          marginTop: '24px',
          color: '#334155',
          fontSize: '1rem'
        }}>
          Don't have an account?{' '}
          <a
            href={ROUTES.SIGNUP}
            style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
