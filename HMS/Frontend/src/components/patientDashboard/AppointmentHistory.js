import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

export default function AppointmentHistory() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorFilter, setDoctorFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) throw new Error('User not logged in');

        const { userId, role } = JSON.parse(storedUser);
        if (role !== 'Patient') throw new Error('Unauthorized access');

        const response = await fetch(API_ENDPOINTS.GET_OUTCOME_RECORDS_BY_PATIENT_ID(userId));
        if (!response.ok) throw new Error('Failed to fetch outcome records');

        const data = await response.json();
        setRecords(data);
        setFilteredRecords(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    let updated = [...records];

    if (doctorFilter) {
      updated = updated.filter(r => r.doctorName === doctorFilter);
    }

    updated.sort((a, b) => {
      const dateA = new Date(a.appointmentDateTime);
      const dateB = new Date(b.appointmentDateTime);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredRecords(updated);
  }, [doctorFilter, sortOrder, records]);

  const cellStyle = {
    padding: '12px',
    border: '1px solid #ddd',
    fontSize: '14px',
    textAlign: 'left',
    verticalAlign: 'top'
  };

  const dropdownStyle = {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  if (loading) return <div style={{ padding: '0 16px' }}>Loading appointment history...</div>;
  if (error) return <div style={{ color: 'red', padding: '0 16px' }}>Error: {error}</div>;
  if (records.length === 0) return <div style={{ padding: '0 16px' }}>No appointment outcomes found.</div>;

  const doctorOptions = [...new Set(records.map(r => r.doctorName))].filter(Boolean);

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: '#18507b' }}>Appointment History</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} style={dropdownStyle}>
            <option value="">All Doctors</option>
            {doctorOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} style={dropdownStyle}>
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </select>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
        <thead>
          <tr style={{ backgroundColor: '#0077b6', color: 'white' }}>
            <th style={cellStyle}>Outcome ID</th>
            <th style={cellStyle}>Doctor</th>
            <th style={cellStyle}>Diagnosis</th>
            <th style={cellStyle}>Prescription</th>
            <th style={cellStyle}>Status</th>
            <th style={cellStyle}>Date & Time</th>
            <th style={cellStyle}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.map(record => (
            <tr key={record.id}>
              <td style={cellStyle}>{record.id}</td>
              <td style={cellStyle}>{record.doctorName}</td>
              <td style={cellStyle}>{record.diagnosis}</td>
              <td style={cellStyle}>{record.prescription}</td>
              <td style={cellStyle}>{record.prescriptionStatus}</td>
              <td style={cellStyle}>{new Date(record.appointmentDateTime).toLocaleString()}</td>
              <td style={cellStyle}>{record.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
