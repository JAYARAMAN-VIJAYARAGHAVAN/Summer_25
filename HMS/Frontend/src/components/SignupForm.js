import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupBaseUser, signupByRole } from '../services/authService';
import { ROLE_OPTIONS, ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
import { SPECIALIZATIONS } from '../constants/specializations';
import { BLOOD_TYPES } from '../constants/bloodTypes';
import { API_ENDPOINTS } from '../constants/api';

function SignupForm() {
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [baseUserData, setBaseUserData] = useState({
    name: '',
    username: '',
    password: '',
    age: '',
    gender: '',
    contactInfo: '',
    role: ROLES.PATIENT
  });

  const [roleData, setRoleData] = useState({ role: ROLES.PATIENT });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleBaseChange = (e) => {
    setBaseUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (e) => {
    setRoleData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const uploadResumeToS3 = async () => {
    if (!resumeFile) return null;
    setUploading(true);
    const fileName = `${Date.now()}-${resumeFile.name}`;
    try {
      const res = await fetch(`${API_ENDPOINTS.GET_S3_UPLOAD_URL}?fileName=${fileName}`);
      const uploadUrl = await res.text();
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: resumeFile
      });
      if (!putRes.ok) throw new Error('Upload failed');
      return uploadUrl.split('?')[0];
    } catch (err) {
      console.error('Resume upload error:', err);
      setError('Resume upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleBaseSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { password } = baseUserData;

    if (password.length < 8 || password.length > 16) {
      setError('Password must be between 8 and 16 characters long.');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    const payload = {
      ...baseUserData,
      age: parseInt(baseUserData.age, 10)
    };

    try {
      const res = await signupBaseUser(payload);
      setUserId(res.data);
      setRoleData(prev => ({ ...prev, role: baseUserData.role }));
      setStep(2);
    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || ERROR_MESSAGES.SIGNUP_FAILED);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let resumeUrl = null;
    if (roleData.role === ROLES.DOCTOR) {
      resumeUrl = await uploadResumeToS3();
      if (!resumeUrl) return;
    }

    const payload = {
      ...roleData,
      id: userId,
      resumeUrl: resumeUrl || undefined
    };

    try {
      await signupByRole(roleData.role, payload);
      setMessage(SUCCESS_MESSAGES.SIGNUP_COMPLETE);
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      setError(ERROR_MESSAGES.ROLE_SIGNUP_FAILED);
    }
  };

  const renderRoleFields = () => {
    const role = roleData.role;

    if (role === ROLES.DOCTOR) {
      return (
        <>
          <select
            name="specialization"
            value={roleData.specialization || ''}
            onChange={handleRoleChange}
            required
            style={inputStyle}
          >
            <option value="">Select Specialization</option>
            {SPECIALIZATIONS.map(spec => (
              <option key={spec} value={spec}>{spec.replace('_', ' ')}</option>
            ))}
          </select>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleResumeChange}
            required
            style={inputStyle}
          />
          {uploading && <p>Uploading resume...</p>}
        </>
      );
    }

    if (role === ROLES.PATIENT) {
      return (
        <>
          <select
            name="bloodType"
            value={roleData.bloodType || ''}
            onChange={handleRoleChange}
            required
            style={inputStyle}
          >
            <option value="">Select Blood Type</option>
            {BLOOD_TYPES.map(bt => (
              <option key={bt} value={bt}>{bt.replace('_', ' ')}</option>
            ))}
          </select>
          <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            value={roleData.height || ''}
            onChange={handleRoleChange}
            required
            style={inputStyle}
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={roleData.weight || ''}
            onChange={handleRoleChange}
            required
            style={inputStyle}
          />
        </>
      );
    }

    return null; 
  };

  const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #dbeafe',
    background: '#f1f5fb',
    color: '#1e293b',
    fontSize: '1rem',
    outline: 'none',
    marginBottom: '0px'
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 24px 0 rgba(56, 120, 255, 0.10)',
    padding: '40px 32px',
    minWidth: '340px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };
  

  const buttonStyle = {
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
  };

  const secondaryButtonStyle = {
    background: '#f1f5fb',
    color: '#2563eb',
    fontWeight: 600,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #dbeafe',
    fontSize: '1rem',
    marginTop: '8px',
    cursor: 'pointer',
    marginRight: '8px'
  };

  // --- Main Render ---
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #ffffff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={cardStyle}>
        <h2 style={{
          color: '#1e3a8a',
          fontWeight: 700,
          fontSize: '2rem',
          marginBottom: '24px',
          letterSpacing: '1px'
        }}>
          Create Account
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
        {message && (
          <div style={{
            color: '#22c55e',
            background: '#f0fdf4',
            borderRadius: '6px',
            padding: '8px 16px',
            marginBottom: '16px',
            width: '100%',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleBaseSubmit} style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {['name', 'username', 'password', 'age', 'contactInfo'].map((field) => (
              <input
                key={field}
                name={field}
                type={field === 'password' ? 'password' : field === 'age' ? 'number' : 'text'}
                placeholder={
                  field === 'contactInfo'
                    ? 'Contact Information'
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
                value={baseUserData[field]}
                onChange={handleBaseChange}
                required
                style={inputStyle}
              />
            ))}

            <select
              name="gender"
              value={baseUserData.gender}
              onChange={handleBaseChange}
              required
              style={inputStyle}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <select
              name="role"
              value={baseUserData.role}
              onChange={handleBaseChange}
              required
              style={inputStyle}
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button type="submit" style={buttonStyle}>Next</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRoleSubmit} style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {renderRoleFields()}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="button" onClick={() => setStep(1)} style={secondaryButtonStyle}>Back</button>
              <button type="submit" style={buttonStyle}>Complete Signup</button>
            </div>
          </form>
        )}

        <div style={{
          marginTop: '24px',
          color: '#334155',
          fontSize: '1rem'
        }}>
          Already have an account?{' '}
          <a
            href={ROUTES.LOGIN}
            style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
