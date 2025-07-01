import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/api';

export default function ActivateAccount() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchInactiveUsers = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_INACTIVE_USERS);
        setUsers(response.data || []);
      } catch (error) {
        console.error('Failed to fetch inactive users:', error);
      }
    };
    fetchInactiveUsers();
  }, []);

  const handleActivate = async (userId) => {
    try {
      await axios.post(API_ENDPOINTS.ACTIVATE_USER, { userId });
      setUsers(users.map(user => user.id === userId ? { ...user, status: 'ACTIVE' } : user));
      setMessage('User activated successfully');
    } catch (error) {
      console.error('Failed to activate user:', error);
      setMessage('Activation failed');
    } finally {
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(API_ENDPOINTS.DELETE_USER, { data: { userId } });
      setUsers(users.filter(user => user.id !== userId));
      setMessage('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      setMessage('Deletion failed');
    } finally {
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div style={{ padding: '0 16px' }}>
      <h2 style={{ color: '#18507b', marginBottom: '24px' }}>Inactive User Accounts</h2>

      {users.length === 0 ? (
        <p style={{ color: '#777' }}>No inactive users found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Contact Info</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={tdStyle}>{user.name}</td>
                <td style={tdStyle}>{user.username}</td>
                <td style={tdStyle}>{user.contactInfo}</td>
                <td style={tdStyle}>{user.role}</td>
                <td style={tdStyle}>{user.status}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleActivate(user.id)} style={activateButtonStyle}>Activate</button>
                  <button onClick={() => handleDelete(user.id)} style={deleteButtonStyle}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {message && (
        <p style={{
          color: message.includes('success') ? 'green' : 'red',
          marginTop: '16px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}

// --- Styles ---

const thStyle = {
  textAlign: 'left',
  padding: '12px',
  backgroundColor: '#f0f0f0',
  borderBottom: '1px solid #ccc',
};

const tdStyle = {
  padding: '12px',
  borderBottom: '1px solid #eee',
};

const activateButtonStyle = {
  padding: '6px 12px',
  marginRight: '8px',
  backgroundColor: '#4caf50',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  padding: '6px 12px',
  backgroundColor: '#f44336',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
