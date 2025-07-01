import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';
import AdminSidebar from '../sidebar/AdminSidebar';
import PersonalInfoSection from './PersonalInfoSection';
import ChangePassword from './ChangePassword';
import ViewAllProfiles from './ViewAllProfiles'
import ActivateAccount from './ActivateAccount'

export default function Admin_Dashboard() {
  const [activeSection, setActiveSection] = useState('info');
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) throw new Error('User not logged in');

        const { userId, role } = JSON.parse(storedUser);
        if (role !== 'Admin') throw new Error('Unauthorized access');

        const response = await fetch(API_ENDPOINTS.GET_ADMIN_BY_ID(userId));
        if (!response.ok) throw new Error('Failed to fetch admin data');

        const data = await response.json();
        setAdmin(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const renderSection = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!admin) return null;

    switch (activeSection) {
      case 'info': return <PersonalInfoSection admin={admin} />;
      case 'password': return <ChangePassword userId={admin.id} />;
      case 'activate': return <ActivateAccount />; 
      case 'profiles': return <ViewAllProfiles />;
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
      <AdminSidebar onSelect={setActiveSection} activeSection={activeSection} />
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
