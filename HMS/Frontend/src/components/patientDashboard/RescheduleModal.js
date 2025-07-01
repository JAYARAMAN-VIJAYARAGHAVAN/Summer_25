import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

export default function RescheduleModal({ appointment, doctor, onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedDate) return;
  
    const fetchSlots = async () => {
      const dateStr = selectedDate.toISOString().split('T')[0];
      try {
        const res = await fetch(API_ENDPOINTS.GET_AVAILABLE_SLOTS(doctor.id, dateStr));
        const data = await res.json();
        setAvailableSlots(data);
      } catch {
        setError('Failed to fetch slots.');
      }
    };
  
    fetchSlots();
  }, [selectedDate, doctor.id]);
  

  const calculateEndTime = (startTime) => {
    const [h, m] = startTime.split(':').map(Number);
    const start = new Date(0, 0, 0, h, m);
    const end = new Date(start.getTime() + 30 * 60000);
    return end.toTimeString().substring(0, 5);
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select a date and slot.');
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    const startTime = `${dateStr}T${selectedSlot}`;
    const endTime = `${dateStr}T${calculateEndTime(selectedSlot)}`;

    try {
      const res = await fetch(API_ENDPOINTS.RESCHEDULE_APPOINTMENT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.appointmentId,
          newStartTime: startTime,
          newEndTime: endTime
        })
      });

      if (!res.ok) throw new Error();
      onSuccess?.(); // refresh appointments if needed
      onClose();
    } catch {
      setError('❌ Failed to reschedule. Please try again.');
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={{ color: '#18507b', marginBottom: '16px' }}>Reschedule Appointment</h2>

        <p><strong>Doctor:</strong> {doctor.name}</p>
        <p><strong>Current:</strong> {new Date(appointment.startTime).toLocaleString()}</p>

        <label style={{ display: 'block', marginTop: '20px', marginBottom: '6px', fontWeight: 'bold' }}>
          Select New Date:
        </label>
        <input
          type="date"
          onChange={e => {
            const date = new Date(e.target.value);
            setSelectedSlot(''); 
            setAvailableSlots([]); 
            setSelectedDate(date); 
            setError('');
          }}
          
          style={inputStyle}
        />

        {selectedDate && (
          <>
            <label style={{ display: 'block', marginTop: '20px', marginBottom: '8px', fontWeight: 'bold' }}>
              Available Time Slots:
            </label>
            <div style={slotGridStyle}>
              {availableSlots.map(slot => (
                <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot.time)}
                    disabled={slot.status !== 'AVAILABLE'}
                    style={{
                    backgroundColor: selectedSlot === slot.time ? '#0077b6' : '#eee',
                    color: selectedSlot === slot.time ? '#fff' : '#000',
                    border: '1px solid #ccc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: slot.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
                    opacity: slot.status === 'AVAILABLE' ? 1 : 0.5
                    }}
                >
                    {slot.time}
                </button>
                
              ))}
            </div>
          </>
        )}

        {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}

        <button onClick={handleConfirm} style={confirmBtnStyle}>
          Confirm Reschedule
        </button>

        <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
      </div>
    </div>
  );
}

// Styles
const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalStyle = {
  background: '#fff',
  padding: '32px',
  borderRadius: '10px',
  width: '90%',
  maxWidth: '500px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '16px'
};

const slotGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: '10px',
  marginTop: '8px'
};

const confirmBtnStyle = {
  marginTop: '24px',
  width: '100%',
  padding: '12px',
  backgroundColor: '#18507b',
  color: '#fff',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  cursor: 'pointer'
};

const cancelBtnStyle = {
  marginTop: '12px',
  width: '100%',
  padding: '10px',
  backgroundColor: '#ccc',
  color: '#000',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer'
};
