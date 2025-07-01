import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';
import PharmacistSidebar from '../sidebar/PharmacistSidebar';
import PersonalInfoSection from './PersonalInfoSection';
import ChangePassword from './ChangePassword';
import ViewAppointmentOutcomeRecord from './ViewAppointmentOutcomeRecord';

export default function Pharmacist_Dashboard() {
  const [activeSection, setActiveSection] = useState('info');
  const [pharmacist, setPharmacist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPharmacistData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) throw new Error('User not logged in');

        const { userId, role } = JSON.parse(storedUser);
        if (role !== 'Pharmacist') throw new Error('Unauthorized access');

        const response = await fetch(API_ENDPOINTS.GET_PHARMACIST_BY_ID(userId));
        if (!response.ok) throw new Error('Failed to fetch pharmacist data');

        const data = await response.json();
        setPharmacist(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacistData();
  }, []);

  const renderSection = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!pharmacist) return null;

    switch (activeSection) {
      case 'info': return <PersonalInfoSection pharmacist={pharmacist} />;
      case 'password': return <ChangePassword userId={pharmacist.id} />;
      case 'outcomes': return <ViewAppointmentOutcomeRecord />;
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
      <PharmacistSidebar onSelect={setActiveSection} activeSection={activeSection} />
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
