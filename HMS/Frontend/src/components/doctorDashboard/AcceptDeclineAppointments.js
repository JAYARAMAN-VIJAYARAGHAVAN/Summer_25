import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

export default function AcceptDeclineAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || storedUser.role !== 'Doctor') throw new Error('Unauthorized');

      const doctorId = storedUser.userId;
      const response = await axios.get(API_ENDPOINTS.GET_REQUESTED_APPOINTMENTS_BY_DOCTOR_ID(doctorId));
      setAppointments(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appointmentId, action) => {
    try {
      const url = API_ENDPOINTS.UPDATE_APPOINTMENT_STATUS(appointmentId, action);
      await axios.put(url);
      await fetchAppointments(); // refresh list
    } catch (err) {
      alert('Failed to update appointment status');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (appointments.length === 0) return <p>No requested appointments.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#18507b', marginBottom: '24px' }}>Accept/Decline Appointments</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={cellStyle}>Patient</th>
            <th style={cellStyle}>Start Time</th>
            <th style={cellStyle}>End Time</th>
            <th style={cellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.appointmentId}>
              <td style={cellStyle}>{appt.patientName || 'N/A'}</td>
              <td style={cellStyle}>{new Date(appt.startTime).toLocaleString()}</td>
              <td style={cellStyle}>{new Date(appt.endTime).toLocaleString()}</td>
              <td style={cellStyle}>
                <button onClick={() => handleAction(appt.appointmentId, 'BOOKED')} style={buttonStyle('green')}>Accept</button>
                <button onClick={() => handleAction(appt.appointmentId, 'DECLINED')} style={buttonStyle('red')}>Decline</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const cellStyle = {
  padding: '12px',
  border: '1px solid #ccc',
  textAlign: 'left',
};

const buttonStyle = (color) => ({
  marginRight: '10px',
  padding: '6px 12px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
});
