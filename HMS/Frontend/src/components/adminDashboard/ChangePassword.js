import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    // Match check
    if (newPassword !== confirmPassword) {
      setIsSuccess(false);
      setMessage('New password and confirm password do not match.');
      return;
    }

    // Password validation
    if (newPassword.length < 8 || newPassword.length > 16) {
      setIsSuccess(false);
      setMessage('Password must be between 8 and 16 characters long.');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setIsSuccess(false);
      setMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userId = storedUser?.userId;

      const response = await fetch(API_ENDPOINTS.CHANGE_PASSWORD(userId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const text = await response.text();
      if (!response.ok) throw new Error(text);

      setIsSuccess(true);
      setMessage('Password updated successfully');
    } catch (err) {
      setIsSuccess(false);
      setMessage(err.message || 'Failed to change password');
    } finally {
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const labelStyle = { fontWeight: 'bold', display: 'block', marginBottom: '6px' };
  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '16px'
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <h2 style={{ color: '#18507b', marginBottom: '24px' }}>Change Password</h2>

      <div>
        <label style={labelStyle}>Current Password:</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>New Password:</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Confirm New Password:</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={inputStyle}
        />

        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 16px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            width : '100%',
            cursor: 'pointer'
          }}
        >
          Save
        </button>

        {message && (
          <p style={{ marginTop: '12px', color: isSuccess ? 'green' : 'red' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
