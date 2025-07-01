import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../constants/api';
import { Button, Form, Input, Select, message } from 'antd';

const { TextArea } = Input;

export default function AppointmentOutcomeRecord({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Add this debug state
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const fetchCompletedAppointments = async () => {
      try {
        console.log('Fetching completed appointments...');
        const response = await fetch(API_ENDPOINTS.GET_COMPLETED_APPOINTMENTS_BY_DOCTOR_ID(doctorId));
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Fetched appointments:', data);
        setAppointments(data);
      } catch (error) {
        console.error('Fetch error:', error);
        message.error('Failed to load appointments');
      }
    };
    fetchCompletedAppointments();
  }, [doctorId]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('--- SUBMISSION STARTED ---');
      
      // 1. Validate selection
      if (!selectedAppointment) {
        throw new Error('No appointment selected!');
      }

      // 2. Log raw appointment data
      console.log('Selected appointment:', selectedAppointment);

      // 3. Construct payload with validation
      const payload = {
        doctorId: JSON.parse(localStorage.getItem('user'))?.userId,
        patientId: selectedAppointment.patient?.id || selectedAppointment.patientId,
        appointmentDateTime: selectedAppointment.startTime,
        ...values
      };
      console.log('Submission payload:', payload);

      // 4. Validate required fields
      if (!payload.doctorId || !payload.patientId || !payload.appointmentDateTime) {
        throw new Error('Missing required fields in payload');
      }

      // 5. Save outcome record
      console.log('Sending POST to:', API_ENDPOINTS.CREATE_OUTCOME_RECORD);
      const saveResponse = await fetch(API_ENDPOINTS.CREATE_OUTCOME_RECORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('Save response status:', saveResponse.status);

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Save failed: ${errorText}`);
      }

      // 6. Delete appointment
      console.log('Sending DELETE to:', API_ENDPOINTS.DELETE_APPOINTMENT(selectedAppointment.appointmentId));
      const deleteResponse = await fetch(
        API_ENDPOINTS.DELETE_APPOINTMENT(selectedAppointment.appointmentId),
        { method: 'DELETE' }
      );
      console.log('Delete response status:', deleteResponse.status);

      if (!deleteResponse.ok) {
        throw new Error('Appointment deletion failed');
      }

      // 7. Update UI
      message.success('Outcome saved successfully!');
      setAppointments(prev => prev.filter(a => a.appointmentId !== selectedAppointment.appointmentId));
      setSelectedAppointment(null);
      form.resetFields();

    } catch (error) {
      console.error('Submission error:', error);
      message.error(error.message);
      setDebugInfo(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#18507b', marginBottom: '24px' }}>Appointment Outcomes</h2>
      
      {/* Debug panel */}
      <div style={{ color: 'red', marginBottom: '16px' }}>
        {debugInfo}
      </div>

      <div style={{ marginBottom: '24px' }}>
        {appointments.map(appt => (
          <Button
            key={appt.appointmentId}
            type={selectedAppointment?.appointmentId === appt.appointmentId ? 'primary' : 'default'}
            onClick={() => {
              console.log('Selected appointment:', appt);
              setSelectedAppointment(appt);
            }}
            style={{ margin: '4px' }}
          >
            {new Date(appt.startTime).toLocaleDateString()} - {appt.patientName}
          </Button>
        ))}
      </div>

      {selectedAppointment && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            diagnosis: '',
            prescription: '',
            prescriptionStatus: 'PENDING',
            notes: ''
          }}
        >
          <Form.Item label="Diagnosis" name="diagnosis" rules={[{ required: true }]}>
            <Input placeholder="Enter diagnosis" />
          </Form.Item>

          <Form.Item label="Prescription" name="prescription" rules={[{ required: true }]}>
            <Input placeholder="Enter prescription" />
          </Form.Item>

          <Form.Item label="Prescription Status" name="prescriptionStatus" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="PENDING">Pending</Select.Option>
              <Select.Option value="DISPENSED">Dispensed</Select.Option>
              <Select.Option value="CANCELLED">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={4} placeholder="Additional notes" />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            style={{ width: '200px' }}
          >
            {loading ? 'Saving...' : 'Save Outcome'}
          </Button>
        </Form>
      )}
    </div>
  );
}
