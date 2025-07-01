import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';
import RescheduleModal from './RescheduleModal';
import DeclinedModal from './DeclinedModal';

export default function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [declinedAppointments, setDeclinedAppointments] = useState([]);
  const [showDeclinedModal, setShowDeclinedModal] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error('User not logged in');

      const { userId, role } = JSON.parse(storedUser);
      if (role !== 'Patient') throw new Error('Unauthorized access');

      const response = await fetch(API_ENDPOINTS.GET_APPOINTMENTS_BY_PATIENT_ID(userId));
      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      setAppointments(data);
      setFilteredAppointments(data);

      const declined = data.filter(appt => appt.status === 'DECLINED');
      if (declined.length > 0) {
        setDeclinedAppointments(declined);
        setShowDeclinedModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.GET_ALL_DOCTORS);
      if (!res.ok) throw new Error('Failed to fetch doctors');
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = [...appointments];

    if (statusFilter) {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (doctorFilter) {
      filtered = filtered.filter(a => a.doctorName === doctorFilter);
    }

    if (startDateFilter) {
      const selected = new Date(startDateFilter);
      filtered = filtered.filter(a => new Date(a.startTime).toDateString() === selected.toDateString());
    }

    setFilteredAppointments(filtered);
  }, [statusFilter, doctorFilter, startDateFilter, appointments]);

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const response = await fetch(API_ENDPOINTS.CANCEL_APPOINTMENT(appointmentId), {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to cancel appointment');
      alert('Appointment cancelled successfully');
      fetchAppointments();
    } catch (err) {
      alert(err.message);
    }
  };

  const isThreeDaysAway = (startTime) => {
    const now = new Date();
    const appointmentDate = new Date(startTime);
    const diffInMs = appointmentDate - now;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays >= 3;
  };

  const cellStyle = {
    padding: '12px',
    border: '1px solid #ddd',
    fontSize: '14px',
    textAlign: 'left'
  };

  const dropdownStyle = {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px'
  };

  if (loading) return <div style={{ padding: '0 16px' }}>Loading appointments...</div>;
  if (error) return <div style={{ color: 'red', padding: '0 16px' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: '#18507b' }}>Your Appointments</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={dropdownStyle}>
            <option value="">All Status</option>
            {[...new Set(appointments.map(a => a.status))].filter(Boolean).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} style={dropdownStyle}>
            <option value="">All Doctors</option>
            {[...new Set(appointments.map(a => a.doctorName))].filter(Boolean).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <input
            type="date"
            value={startDateFilter}
            onChange={e => setStartDateFilter(e.target.value)}
            style={dropdownStyle}
          />
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div>No appointments match the filter criteria.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#0077b6', color: 'white' }}>
              <th style={cellStyle}>Appointment ID</th>
              <th style={cellStyle}>Doctor</th>
              <th style={cellStyle}>Status</th>
              <th style={cellStyle}>Start Time</th>
              <th style={cellStyle}>End Time</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appointment => {
              const isEditable = appointment.status === 'BOOKED' && isThreeDaysAway(appointment.startTime);
              const doctor = doctors.find(d => d.name === appointment.doctorName);

              return (
                <tr key={appointment.appointmentId}>
                  <td style={cellStyle}>{appointment.appointmentId}</td>
                  <td style={cellStyle}>{appointment.doctorName || 'Unknown Doctor'}</td>
                  <td style={cellStyle}>{appointment.status}</td>
                  <td style={cellStyle}>{new Date(appointment.startTime).toLocaleString()}</td>
                  <td style={cellStyle}>{new Date(appointment.endTime).toLocaleString()}</td>
                  <td style={cellStyle}>
                    {appointment.status === 'BOOKED' && (
                      <>
                        <button
                          onClick={() => handleCancel(appointment.appointmentId)}
                          disabled={!isEditable}
                          style={{
                            marginRight: '8px',
                            backgroundColor: isEditable ? '#d62828' : '#ccc',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            cursor: isEditable ? 'pointer' : 'not-allowed',
                            borderRadius: '4px'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (!doctor) {
                              alert('Doctor info missing for reschedule.');
                              return;
                            }
                            setSelectedAppointment(appointment);
                            setSelectedDoctor(doctor);
                            setShowModal(true);
                          }}
                          disabled={!isEditable}
                          style={{
                            backgroundColor: isEditable ? '#f77f00' : '#ccc',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            cursor: isEditable ? 'pointer' : 'not-allowed',
                            borderRadius: '4px'
                          }}
                        >
                          Reschedule
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && selectedAppointment && selectedDoctor && (
        <RescheduleModal
          appointment={selectedAppointment}
          doctor={selectedDoctor}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
            setSelectedDoctor(null);
          }}
          onSuccess={fetchAppointments}
        />
      )}

      {showDeclinedModal && (
        <DeclinedModal
          appointments={declinedAppointments}
          onClose={() => setShowDeclinedModal(false)}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  );
}