package com.example.hms.service;

import com.example.hms.dto.SignupUser;
import com.example.hms.entity.*;
import com.example.hms.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SignupService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PharmacistRepository pharmacistRepository;
    private final AdminRepository adminRepository;

    // Step 1: Create base user
    @Transactional
    public Long createUser(SignupUser dto) {
        // Check for duplicates by username or contact info
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.findByContactInfo(dto.getContactInfo()).isPresent()) {
            throw new IllegalArgumentException("A user already exists with this contact information");
        }

        switch (dto.getRole().toUpperCase()) {
            case "DOCTOR" -> {
                Doctor doctor = new Doctor();
                populateBaseFields(doctor, dto);
                doctor.setStatus(User.Status.INACTIVE); // default for non-patient
                doctorRepository.save(doctor);
                return doctor.getId();
            }
            case "PATIENT" -> {
                Patient patient = new Patient();
                populateBaseFields(patient, dto);
                patient.setStatus(User.Status.ACTIVE); // auto-activated
                patientRepository.save(patient);
                return patient.getId();
            }
            case "PHARMACIST" -> {
                Pharmacist pharmacist = new Pharmacist();
                populateBaseFields(pharmacist, dto);
                pharmacist.setStatus(User.Status.INACTIVE);
                pharmacistRepository.save(pharmacist);
                return pharmacist.getId();
            }
            case "ADMIN" -> {
                Admin admin = new Admin();
                populateBaseFields(admin, dto);
                admin.setStatus(User.Status.INACTIVE);
                adminRepository.save(admin);
                return admin.getId();
            }
            default -> throw new IllegalArgumentException("Invalid role: " + dto.getRole());
        }
    }

    private void populateBaseFields(User user, SignupUser dto) {
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setName(dto.getName());
        user.setAge(dto.getAge());
        user.setGender(dto.getGender());
        user.setContactInfo(dto.getContactInfo());
        // status is set role-wise in createUser method
    }

    // Step 2: Complete signup for each role

    @Transactional
    public String completeDoctorSignup(Doctor doctor) {
        Doctor existing = doctorRepository.findById(doctor.getId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        existing.setSpecialization(doctor.getSpecialization());
        doctorRepository.save(existing);
        return "Doctor signup completed.";
    }

    @Transactional
    public String completePatientSignup(Patient patient) {
        Patient existing = patientRepository.findById(patient.getId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        existing.setBloodType(patient.getBloodType());
        existing.setHeight(patient.getHeight());
        existing.setWeight(patient.getWeight());
        patientRepository.save(existing);
        return "Patient signup completed.";
    }

    @Transactional
    public String completePharmacistSignup(Pharmacist pharmacist) {
        Pharmacist existing = pharmacistRepository.findById(pharmacist.getId())
                .orElseThrow(() -> new IllegalArgumentException("Pharmacist not found"));
        // Add fields if needed
        pharmacistRepository.save(existing);
        return "Pharmacist signup completed.";
    }

    @Transactional
    public String completeAdminSignup(Admin admin) {
        Admin existing = adminRepository.findById(admin.getId())
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));
        // Add fields if needed
        adminRepository.save(existing);
        return "Admin signup completed.";
    }
}
