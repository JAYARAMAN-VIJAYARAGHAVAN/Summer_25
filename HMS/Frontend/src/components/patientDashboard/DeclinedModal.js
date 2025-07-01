import React from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

export default function DeclinedModal({ appointments, onClose, onSuccess }) {
  const handleAcknowledge = async () => {
    try {
      await Promise.all(
        appointments.map(appt =>
          axios.delete(API_ENDPOINTS.DELETE_APPOINTMENT(appt.appointmentId))
        )
      );
      onSuccess(); // refresh list
      onClose();
    } catch (err) {
      alert('Failed to delete declined appointments.');
    }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h3 style={{ marginBottom: '16px' }}>Declined Appointments</h3>
        <ul style={{ paddingLeft: 0 }}>
          {appointments.map(appt => (
            <li key={appt.appointmentId} style={{ marginBottom: '8px', listStyle: 'none' }}>
              ❌ <strong>{appt.doctorName}</strong> — {new Date(appt.startTime).toLocaleString()}
            </li>
          ))}
        </ul>
        <button onClick={handleAcknowledge} style={buttonStyle}>
          OK, Remove All
        </button>
      </div>
    </div>
  );
}

const modalOverlay = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999
};

const modalContent = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '12px',
  maxWidth: '400px',
  width: '90%',
  textAlign: 'center'
};

const buttonStyle = {
  marginTop: '20px',
  padding: '10px 20px',
  backgroundColor: '#18507b',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};
