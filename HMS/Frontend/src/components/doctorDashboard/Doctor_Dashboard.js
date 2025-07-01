import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';
import DoctorSidebar from '../sidebar/DoctorSidebar';
import PersonalInfoSection from './PersonalInfoSection';
import AppointmentSchedule from './AppointmentSchedule';
import AppointmentOutcomeRecord from './AppointmentOutcomeRecord';
import AcceptDeclineAppointments from './AcceptDeclineAppointments';
import ChangePassword from './ChangePassword';
import SetInitialAvailabilityModal from './SetInitialAvailabilityModal';

export default function Doctor_Dashboard() {
  const [activeSection, setActiveSection] = useState('info');
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) throw new Error('User not logged in');

        const { userId, role } = JSON.parse(storedUser);
        if (role !== 'Doctor') throw new Error('Unauthorized access');

        const response = await fetch(API_ENDPOINTS.GET_DOCTOR_BY_ID(userId));
        if (!response.ok) throw new Error('Failed to fetch doctor data');

        const data = await response.json();
        setDoctor(data);

        const availabilityRes = await fetch(API_ENDPOINTS.CHECK_DOCTOR_AVAILABILITY_EXISTS(data.id));
        const exists = await availabilityRes.json();
        if (!exists) {
          setShowSetupModal(true);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const renderSection = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!doctor) return null;

    switch (activeSection) {
      case 'info': return <PersonalInfoSection doctor={doctor} />;
      case 'schedule': return <AppointmentSchedule doctorId={doctor.id} />;
      case 'availability': return <AppointmentOutcomeRecord doctorId={doctor.id} />;
      case 'accept': return <AcceptDeclineAppointments doctorId={doctor.id} />;
      case 'password': return <ChangePassword userId={doctor.id} />;
      case 'signout':
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
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
      <DoctorSidebar active={activeSection} onSelect={setActiveSection} />
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

      {showSetupModal && (
        <SetInitialAvailabilityModal
          doctorId={doctor?.id}
          onClose={() => setShowSetupModal(false)}
        />
      )}
    </div>
  );
}
