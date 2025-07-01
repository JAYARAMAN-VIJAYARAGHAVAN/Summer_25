import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

// Helper to calculate 30-minute end time
function calculateEndTime(startTime) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date(0, 0, 0, hours, minutes);
  const end = new Date(start.getTime() + 30 * 60000);
  return end.toTimeString().substring(0, 5);
}

export default function SelectTimeSlot({ doctor, selectedDate, onBack }) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSlots = async () => {
      const dateStr = selectedDate.toLocaleDateString('en-CA');
      try {
        const res = await fetch(API_ENDPOINTS.GET_AVAILABLE_SLOTS(doctor.id, dateStr));
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setSlots(data);
      } catch (err) {
        console.error('❌ Error fetching slots:', err);
        setSlots([]);
      }
    };
    fetchSlots();
  }, [doctor.id, selectedDate]);

  const handleConfirm = async () => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const dateStr = selectedDate.toLocaleDateString('en-CA');
    const startTime = `${dateStr}T${selectedSlot}`;
    const endTime = `${dateStr}T${calculateEndTime(selectedSlot)}`;

    const payload = {
      doctorId: doctor.id,
      patientId: storedUser.userId,
      startTime,
      endTime
    };

    const response = await fetch(API_ENDPOINTS.CREATE_APPOINTMENT_REQUEST, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      setMessage('✅ Appointment requested successfully!');
    } else {
      setMessage('❌ Failed to request appointment.');
    }
  };

  return (
    <div>
      <button onClick={onBack} style={backBtnStyle}>← Back to calendar</button>
      <h3 style={{ color: '#18507b' }}>Select Time on {selectedDate.toDateString()}</h3>

      <div style={slotGridStyle}>
        {slots.map(slot => {
          const isBooked = slot.status !== 'AVAILABLE';
          return (
            <div
              key={slot.time}
              style={{
                padding: '12px',
                textAlign: 'center',
                backgroundColor: isBooked ? '#999' : (selectedSlot === slot.time ? '#0077b6' : '#fff'),
                color: isBooked ? '#eee' : (selectedSlot === slot.time ? '#fff' : '#000'),
                border: '1px solid #ccc',
                borderRadius: '6px',
                cursor: isBooked ? 'not-allowed' : 'pointer'
              }}
              onClick={() => {
                if (!isBooked) setSelectedSlot(slot.time);
              }}
            >
              {slot.time}
            </div>
          );
        })}
      </div>

      {selectedSlot && (
        <button onClick={handleConfirm} style={confirmBtnStyle}>
          Confirm Appointment
        </button>
      )}

      {message && (
        <p style={{ marginTop: '16px', color: message.includes('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
}

const backBtnStyle = {
  marginBottom: '16px',
  backgroundColor: '#ccc',
  padding: '6px 12px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer'
};

const slotGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '16px',
  marginTop: '24px'
};

const confirmBtnStyle = {
  marginTop: '24px',
  width: '100%',
  backgroundColor: '#18507b',
  color: 'white',
  padding: '12px',
  border: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
