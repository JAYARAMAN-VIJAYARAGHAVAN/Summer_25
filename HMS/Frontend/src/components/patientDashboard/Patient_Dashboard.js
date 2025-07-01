import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';
import PatientSidebar from '../sidebar/PatientSidebar';
import PersonalInfoSection from './PersonalInfoSection';
import AppointmentHistory from './AppointmentHistory';
import ChangePassword from './ChangePassword';
import ViewAppointments from './ViewAppointments';
import BookAppointment from './BookAppointment';

export default function Patient_Dashboard() {
  const [activeSection, setActiveSection] = useState('info');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) throw new Error('User not logged in');

        const { userId, role } = JSON.parse(storedUser);
        if (role !== 'Patient') throw new Error('Unauthorized access');

        const response = await fetch(API_ENDPOINTS.GET_PATIENT_BY_ID(userId));
        if (!response.ok) throw new Error('Failed to fetch patient data');

        const data = await response.json();
        setPatient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const renderSection = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!patient) return null;

    switch (activeSection) {
      case 'info': return <PersonalInfoSection patient={patient} />;
      case 'appointments': return <AppointmentHistory />;
      case 'password': return <ChangePassword />;
      case 'viewappointments': return <ViewAppointments patient={patient}/>;
      case 'bookAppointment': return <BookAppointment />;

      default: return <div>Select a section from the sidebar.</div>;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      minHeight: '80vh',
      background: '#f7fafd',
      padding: '40px'
    }}>
      <PatientSidebar onSelect={setActiveSection} />
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px 0 rgba(56, 120, 255, 0.06)',
        padding: '32px',
        minWidth: '400px',
        flex: 1
      }}>
        {renderSection()}
      </div>
    </div>
  );
}
