import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

const PRESCRIPTION_STATUSES = ['PENDING', 'DISPENSED', 'CANCELLED'];

export default function ViewAppointmentOutcomeRecord() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.GET_PENDING_OUTCOMES_FOR_PHARMACIST);
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setSuccessMessage('');
    try {
      const response = await fetch(API_ENDPOINTS.UPDATE_PRESCRIPTION_STATUS(id, newStatus), {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to update status');
      setRecords(records.map(record => 
        record.id === id ? { ...record, prescriptionStatus: newStatus } : record
      ));
      if (newStatus === 'DISPENSED') {
        setSuccessMessage(`Prescription status updated to DISPENSED for record ID ${id}.`);
        setTimeout(() => setSuccessMessage(''), 4000); // clear message after 4 seconds
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div>Loading appointment outcome records...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (records.length === 0) return <div>No pending appointment outcome records.</div>;

  return (
    <div>
      <h2 style={{ color: '#18507b', marginBottom: '24px' }}>Pending Appointment Outcome Records</h2>

      {successMessage && (
        <div style={{
          padding: '10px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '4px',
          marginBottom: '16px',
          fontWeight: 'bold',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Doctor</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Patient</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Date & Time</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Diagnosis</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Prescription</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '8px', textAlign: 'left' }}>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map(record => (
            <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{record.id}</td>
              <td style={{ padding: '8px' }}>{record.doctorName || 'N/A'}</td>
              <td style={{ padding: '8px' }}>{record.patientName || 'N/A'}</td>
              <td style={{ padding: '8px' }}>{new Date(record.appointmentDateTime).toLocaleString()}</td>
              <td style={{ padding: '8px' }}>{record.diagnosis}</td>
              <td style={{ padding: '8px' }}>{record.prescription}</td>
              <td style={{ padding: '8px' }}>{record.prescriptionStatus}</td>
              <td style={{ padding: '8px' }}>
                <select
                  disabled={updatingId === record.id}
                  value={record.prescriptionStatus}
                  onChange={e => updateStatus(record.id, e.target.value)}
                >
                  {PRESCRIPTION_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
