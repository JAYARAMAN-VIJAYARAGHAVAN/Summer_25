import React from 'react';

export default function DoctorSidebar({ onSelect, activeSection }) {
  const buttons = [
    { key: 'info', label: 'Personal Information' },
    { key: 'schedule', label: 'Appointment Schedule' },
    { key: 'availability', label: 'Appointment Outcomes' },
    { key: 'accept', label: 'Accept/Decline Appointments' },
    { key: 'password', label: 'Change Password' },
    { key: 'signout', label: 'Sign Out' }
  ];

  return (
    <div style={{
      minWidth: '220px',
      marginRight: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      {buttons.map(btn => (
        <button
          key={btn.key}
          onClick={() => onSelect(btn.key)}
          style={{
            background: '#18507b',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '4px',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left',
            outline: activeSection === btn.key ? '2px solid #003049' : 'none'
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
