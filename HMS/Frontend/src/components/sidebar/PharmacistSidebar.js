import React from 'react';

export default function PharmacistSidebar({ onSelect, activeSection }) {
  const buttons = [
    { key: 'info', label: 'View Info' },
    { key: 'password', label: 'Change Password' },
    { key: 'outcomes', label: 'View Appointment Outcome Record' },
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
