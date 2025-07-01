import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { ROUTES } from './constants/routes';
import HomePage from './pages/HomePage'; 
import NavbarController from './components/NavbarController';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import SelectTimeSlot from './components/patientDashboard/SelectTimeSlot';
import PharmacistDashboard from './pages/PharmacistDashboard'; // Adjust path as needed
import AdminDashboard from './pages/AdminDashboard';





function App() {
  return (
    <Router>
      <NavbarController />
      <Routes>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path={ROUTES.PATIENT_DASHBOARD} element={<PatientDashboard />} />
        <Route path={ROUTES.DOCTOR_DASHBOARD} element={<DoctorDashboard />} />
        <Route path={ROUTES.PHARMACIST_DASHBOARD} element={<PharmacistDashboard />} />
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        <Route path="/select-slot" element={<SelectTimeSlot />} />
        {/* Add more dashboard routes here */}
      </Routes>
    </Router>
  );
}

export default App;
