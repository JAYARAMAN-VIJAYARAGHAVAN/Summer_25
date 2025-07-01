import React from 'react';

export default function PatientSidebar({ onSelect }) {
  const sidebarButtons = [
    { label: 'Personal Information', key: 'info' },
    { label: 'View Appointments', key: 'viewappointments' }, // ✅ Fixed key
    { label: 'View Appointment History', key: 'appointments' },
    { label: 'Book Appointment', key: 'bookAppointment' },
    { label: 'Change Password', key: 'password' },
    {
      label: 'Sign Out',
      key: 'logout',
      onClick: () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  ];

  return (
    <div style={{
      minWidth: '220px',
      marginRight: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      {sidebarButtons.map((btn, idx) => (
        <button
          key={idx}
          onClick={btn.onClick || (() => onSelect(btn.key))}
          style={{
            background: '#18507b',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '4px',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
