import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api';
import SelectTimeSlot from './SelectTimeSlot';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.GET_ALL_DOCTORS)
      .then(res => res.json())
      .then(setDoctors)
      .catch(console.error);
  }, []);

  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const weeks = [];
    let week = [];

    for (let i = 0; i < firstDay.getDay(); i++) week.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      week.push(date);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    while (week.length < 7) week.push(null);
    weeks.push(week);

    return weeks;
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const weeks = getMonthDays(year, month);

    return (
      <div>
        <button onClick={() => setSelectedDoctor(null)} style={backBtnStyle}>← Back to doctor list</button>
        <h3 style={{ color: '#18507b' }}>Select Date for Dr. {selectedDoctor.name}</h3>
        <div style={navRowStyle}>
          <button onClick={goToPrevMonth} style={arrowBtnStyle}>←</button>
          <strong>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
          <button onClick={goToNextMonth} style={arrowBtnStyle}>→</button>
        </div>
        <table style={calendarTableStyle}>
          <thead>
            <tr style={{ backgroundColor: '#0077b6', color: 'white' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <th key={day} style={thStyle}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, i) => (
              <tr key={i}>
                {week.map((date, j) => (
                  <td
                    key={j}
                    onClick={() => date && setSelectedDate(date)}
                    style={{
                      width: '60px',
                      height: '100px',
                      textAlign: 'center',
                      backgroundColor: date?.toDateString() === new Date().toDateString() ? '#cce3f6' : 'white',
                      color: date ? '#000' : '#ccc',
                      cursor: date ? 'pointer' : 'default',
                      border: '1px solid #ddd',
                      fontWeight: 'bold'
                    }}
                  >
                    {date ? date.getDate() : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (selectedDate) {
    return (
      <SelectTimeSlot
        doctor={selectedDoctor}
        selectedDate={selectedDate}
        onBack={() => setSelectedDate(null)}
      />
    );
  }

  return (
    <div>
      <h2 style={{ color: '#18507b' }}>Book Appointment</h2>
      {!selectedDoctor ? (
        <>
          <input
            type="text"
            value={search}
            placeholder="Search for doctor..."
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
          />
          {filteredDoctors.map(doc => (
            <div key={doc.id} style={doctorCardStyle}>
              <div onClick={() => setSelectedDoctor(doc)} style={{ cursor: 'pointer' }}>
                <strong>{doc.name}</strong> {doc.specialization && `(${doc.specialization})`}
              </div>
              {doc.resumeUrl && (
                <a
                  href={doc.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.9rem', color: '#0077b6', textDecoration: 'underline', marginTop: '4px', display: 'inline-block' }}
                >
                  View Resume
                </a>
              )}
            </div>
          ))}
        </>
      ) : renderCalendar()}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px', border: '1px solid #ccc',
  borderRadius: '4px', marginBottom: '16px'
};

const doctorCardStyle = {
  background: '#f0f8ff', padding: '12px', border: '1px solid #0077b6',
  borderRadius: '6px', marginBottom: '8px', cursor: 'pointer'
};

const calendarTableStyle = {
  width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginTop: '12px'
};

const thStyle = { padding: '8px', border: '1px solid #ddd' };
const navRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' };
const arrowBtnStyle = { background: '#0077b6', color: 'white', padding: '6px 12px', border: 'none' };
const backBtnStyle = { marginBottom: '16px', backgroundColor: '#ccc', padding: '6px 12px', borderRadius: '4px', border: 'none' };
