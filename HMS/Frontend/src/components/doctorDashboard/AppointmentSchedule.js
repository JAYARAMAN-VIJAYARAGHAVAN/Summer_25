import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

export default function AppointmentSchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'history'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [outcomeRecords, setOutcomeRecords] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) throw new Error('User not logged in');
        const { userId, role } = JSON.parse(storedUser);
        if (role !== 'Doctor') throw new Error('Unauthorized access');

        const response = await fetch(API_ENDPOINTS.GET_BOOKED_APPOINTMENTS_BY_DOCTOR_ID(userId));
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleViewHistory = async (patientId) => {
    try {
      const [patientRes, recordsRes] = await Promise.all([
        fetch(API_ENDPOINTS.GET_PATIENT_BY_ID(patientId)),
        fetch(API_ENDPOINTS.GET_OUTCOME_RECORDS_BY_PATIENT_ID(patientId))
      ]);

      if (!patientRes.ok || !recordsRes.ok) throw new Error('Failed to fetch patient history');
      const patientData = await patientRes.json();
      const recordsData = await recordsRes.json();

      setSelectedPatient(patientData);
      setOutcomeRecords(recordsData);
      setViewMode('history');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  if (viewMode === 'history' && selectedPatient) {
    return (
      <div style={{ padding: '20px' }}>
        <button onClick={() => setViewMode('table')} style={backButtonStyle}>← Back</button>
        <h2 style={{ color: '#18507b', marginBottom: '16px' }}>Patient History</h2>
        <p><strong>Name:</strong> {selectedPatient.name}</p>
        <p><strong>Age:</strong> {selectedPatient.age}</p>
        <p><strong>Gender:</strong> {selectedPatient.gender}</p>
        <p><strong>Height:</strong> {selectedPatient.height} cm</p>
        <p><strong>Weight:</strong> {selectedPatient.weight} kg</p>
        <p><strong>Blood Type:</strong> {selectedPatient.bloodType}</p>

        <h4 style={{ marginTop: '16px' }}>Appointment Outcome Record</h4>
        {outcomeRecords.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0077b6', color: 'white' }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Diagnosis</th>
                <th style={thStyle}>Prescription</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {outcomeRecords.map(record => (
                <tr key={record.id}>
                  <td style={tdStyle}>{new Date(record.appointmentDateTime).toLocaleString()}</td>
                  <td style={tdStyle}>{record.diagnosis}</td>
                  <td style={tdStyle}>{record.prescription}</td>
                  <td style={tdStyle}>{record.prescriptionStatus}</td>
                  <td style={tdStyle}>{record.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // ✅ Main Appointment Table
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#18507b', marginBottom: '24px' }}>Appointment Schedule</h2>
      {appointments.length === 0 ? (
        <div>No appointments scheduled.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0077b6', color: 'white' }}>
              <th style={thStyle}>Appointment ID</th>
              <th style={thStyle}>Patient</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Start Time</th>
              <th style={thStyle}>End Time</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => (
              <tr key={appointment.appointmentId}>
                <td style={tdStyle}>{appointment.appointmentId}</td>
                <td style={tdStyle}>{appointment.patientName}</td>
                <td style={tdStyle}>{appointment.status}</td>
                <td style={tdStyle}>{new Date(appointment.startTime).toLocaleString()}</td>
                <td style={tdStyle}>{new Date(appointment.endTime).toLocaleString()}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleViewHistory(appointment.patientId)} style={buttonStyle}>
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = { padding: '8px', border: '1px solid #ddd' };
const tdStyle = { padding: '8px', border: '1px solid #ddd' };
const buttonStyle = {
  backgroundColor: '#00b4d8',
  color: 'white',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer'
};
const backButtonStyle = {
  marginBottom: '16px',
  backgroundColor: '#ccc',
  border: 'none',
  borderRadius: '4px',
  padding: '6px 12px',
  cursor: 'pointer'
};
