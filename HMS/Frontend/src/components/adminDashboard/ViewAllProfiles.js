import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

export default function ViewAllProfiles() {
  const [activeType, setActiveType] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProfiles = async (type) => {
    setActiveType(type);
    setData([]);
    setLoading(true);
    setError('');
    try {
      let endpoint;
      if (type === 'Doctor') endpoint = API_ENDPOINTS.GET_ALL_DOCTORS;
      else if (type === 'Pharmacist') endpoint = API_ENDPOINTS.GET_ALL_PHARMACISTS;
      else if (type === 'Patient') endpoint = API_ENDPOINTS.GET_ALL_PATIENTS;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch ' + type.toLowerCase() + 's');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = {
    marginRight: '10px',
    padding: '10px 16px',
    background: '#18507b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#18507b' }}>View All Profiles</h2>

      <div style={{ marginBottom: '20px' }}>
        <button style={buttonStyle} onClick={() => fetchProfiles('Doctor')}>Doctors</button>
        <button style={buttonStyle} onClick={() => fetchProfiles('Pharmacist')}>Pharmacists</button>
        <button style={buttonStyle} onClick={() => fetchProfiles('Patient')}>Patients</button>
      </div>

      {loading && <p>Loading {activeType?.toLowerCase()}s...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data.length > 0 && (
        <div>
          <h3>{activeType}s:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.map((user, idx) => (
              <li key={idx} style={{
                padding: '10px',
                borderBottom: '1px solid #ccc',
                backgroundColor: '#f9f9f9',
                marginBottom: '5px',
                borderRadius: '4px'
              }}>
                <strong>{user.name}</strong> ({user.username}) — {user.contactInfo}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!activeType && <p>Please select a user type to view profiles.</p>}
    </div>
  );
}
