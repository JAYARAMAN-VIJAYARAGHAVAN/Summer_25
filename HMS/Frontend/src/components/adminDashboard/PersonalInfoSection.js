import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

const GENDER_OPTIONS = ['Male', 'Female'];

export default function AdminPersonalInfoSection({ admin }) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    age: '',
    gender: '',
    contactInfo: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (admin) {
      setFormData({
        username: admin.username || '',
        name: admin.name || '',
        age: admin.age || '',
        gender: admin.gender || '',
        contactInfo: admin.contactInfo || ''
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    if (!formData.gender) {
      setMessage('Please select a gender.');
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const adminId = storedUser?.userId;

      const response = await fetch(API_ENDPOINTS.UPDATE_ADMIN_PROFILE(adminId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Update failed');
      setMessage('Profile updated successfully');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setMessage('Update failed. Try again.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '16px'
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  const labelStyle = {
    marginBottom: '6px',
    fontWeight: 500
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <h2 style={{ color: '#18507b', marginBottom: '24px' }}>Edit Personal Information</h2>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Username:</label>
        <input
          name="username"
          value={formData.username}
          readOnly
          style={{ ...inputStyle, backgroundColor: '#f5f5f5' }}
        />
      </div>

      {['name', 'age', 'contactInfo'].map(field => (
        <div key={field} style={formGroupStyle}>
          <label style={labelStyle}>
            {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
          </label>
          <input
            name={field}
            value={formData[field]}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      ))}

      <div style={formGroupStyle}>
        <label style={labelStyle}>Gender:</label>
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="" disabled hidden>Select Gender</option>
          {GENDER_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: '16px',
          padding: '10px 20px',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Save
      </button>

      {message && (
        <p style={{
          color: message.includes('success') ? 'green' : 'red',
          marginTop: '16px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
