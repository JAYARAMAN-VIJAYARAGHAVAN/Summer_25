import React, { useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DEFAULT_WEEKDAY_START = '09:00';
const DEFAULT_WEEKDAY_END = '17:00';

export default function SetInitialAvailabilityModal({ doctorId, onClose }) {
  const [form, setForm] = useState(() =>
    DAYS.reduce((acc, day) => {
      const isWeekend = day === 'SATURDAY' || day === 'SUNDAY';
      acc[day] = {
        working: !isWeekend,
        startTime: isWeekend ? '' : DEFAULT_WEEKDAY_START,
        endTime: isWeekend ? '' : DEFAULT_WEEKDAY_END
      };
      return acc;
    }, {})
  );

  const [error, setError] = useState('');

  const handleChange = (day, field, value) => {
    setForm(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleToggle = (day) => {
    setForm(prev => ({
      ...prev,
      [day]: {
        working: !prev[day].working,
        startTime: !prev[day].working ? DEFAULT_WEEKDAY_START : '',
        endTime: !prev[day].working ? DEFAULT_WEEKDAY_END : ''
      }
    }));
  };

  const isValidHalfHour = (timeStr) => {
    if (!timeStr) return true;
    const minutes = parseInt(timeStr.split(':')[1], 10);
    return minutes === 0 || minutes === 30;
  };

  const handleSubmit = async () => {
    for (let day of DAYS) {
      const { working, startTime, endTime } = form[day];

      if (working && (!startTime || !endTime)) {
        setError(`Please fill both start and end time for ${day}, or turn off Working.`);
        return;
      }

      if (working && startTime >= endTime) {
        setError(`${day}: Start time must be before end time.`);
        return;
      }

      if (working && (!isValidHalfHour(startTime) || !isValidHalfHour(endTime))) {
        setError(`${day}: Times must be in 30-minute intervals.`);
        return;
      }
    }

    const weeklySchedule = {};
    for (let day of DAYS) {
      const { working, startTime, endTime } = form[day];
      if (working && startTime && endTime) {
        weeklySchedule[day] = { startTime, endTime };
      }
    }

    const payload = {
      doctorId,
      weeklySchedule,
      unavailableSlots: []
    };

    try {
      const res = await fetch(API_ENDPOINTS.CREATE_AVAILABILITY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save availability');
      onClose();
    } catch (err) {
      setError('Failed to save availability. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        padding: '32px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '650px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#18507b', marginBottom: '24px' }}>Set Weekly Availability</h2>

        {DAYS.map(day => (
          <div key={day} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '16px'
          }}>
            <label style={{ fontWeight: 'bold', flex: '1' }}>{day}:</label>

            <div style={{ flex: '2', display: 'flex', gap: '12px' }}>
              <input
                type="time"
                step="1800"
                disabled={!form[day].working}
                value={form[day].startTime}
                onChange={e => handleChange(day, 'startTime', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: form[day].working ? 'white' : '#f0f0f0'
                }}
              />
              <span style={{ alignSelf: 'center' }}>to</span>
              <input
                type="time"
                step="1800"
                disabled={!form[day].working}
                value={form[day].endTime}
                onChange={e => handleChange(day, 'endTime', e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: form[day].working ? 'white' : '#f0f0f0'
                }}
              />
            </div>

            <div style={{ flexShrink: 0 }}>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={form[day].working}
                  onChange={() => handleToggle(day)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        ))}

        {error && <p style={{ color: 'red', marginTop: '8px' }}>{error}</p>}

        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            marginTop: '24px',
            padding: '12px',
            backgroundColor: '#18507b',
            color: '#fff',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Save
        </button>

        {/* Apple Toggle CSS */}
        <style>{`
          .switch {
            position: relative;
            display: inline-block;
            width: 46px;
            height: 26px;
          }

          .switch input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0;
            right: 0; bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 26px;
          }

          .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
          }

          input:checked + .slider {
            background-color: #18507b;
          }

          input:checked + .slider:before {
            transform: translateX(20px);
          }
        `}</style>
      </div>
    </div>
  );
}
