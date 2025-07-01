import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';
import { SPECIALIZATIONS } from '../../constants/specializations';

const GENDER_OPTIONS = ['Male', 'Female'];

export default function PersonalInfoSection({ doctor }) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    age: '',
    gender: '',
    contactInfo: '',
    specialization: '',
    resumeUrl: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (doctor) {
      setFormData({
        username: doctor.username || '',
        name: doctor.name || '',
        age: doctor.age || '',
        gender: doctor.gender || '',
        contactInfo: doctor.contactInfo || '',
        specialization: doctor.specialization || '',
        resumeUrl: doctor.resumeUrl || ''
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
      setMessage('Resume upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.gender || !formData.specialization) {
      setMessage('Please select both gender and specialization.');
      return;
    }

    if (resumeFile) {
      const resumeUrl = await uploadResumeToS3();
      if (!resumeUrl) return;
      formData.resumeUrl = resumeUrl;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const doctorId = storedUser?.userId;

      const response = await fetch(API_ENDPOINTS.UPDATE_DOCTOR_PROFILE(doctorId), {
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

      <div style={formGroupStyle}>
        <label style={labelStyle}>Specialization:</label>
        <select
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          style={inputStyle}
        >
          <option value="" disabled hidden>Select Specialization</option>
          {SPECIALIZATIONS.map(spec => (
            <option key={spec} value={spec}>{spec.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle}>Upload Resume (PDF):</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleResumeChange}
          style={inputStyle}
        />
        {uploading && <p style={{ color: '#888' }}>Uploading...</p>}
        {formData.resumeUrl && (
          <a
            href={formData.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: '8px', color: '#2563eb', display: 'inline-block' }}
          >
            View Uploaded Resume
          </a>
        )}
        {formData.resumeUrl && (
          <iframe
            src={formData.resumeUrl}
            title="Resume Preview"
            width="100%"
            height="1000px"
            style={{
              border: '1px solid #ccc',
              marginTop: '16px',
              borderRadius: '8px'
            }}
          />
        )}

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
