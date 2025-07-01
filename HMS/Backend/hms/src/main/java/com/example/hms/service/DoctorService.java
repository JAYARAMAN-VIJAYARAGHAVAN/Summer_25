package com.example.hms.service;

import com.example.hms.entity.Doctor;
import com.example.hms.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        return doctorRepository.findById(id)
            .map(existing -> {
                existing.setName(updatedDoctor.getName());
                existing.setUsername(updatedDoctor.getUsername());
                existing.setAge(updatedDoctor.getAge());
                existing.setGender(updatedDoctor.getGender());
                existing.setContactInfo(updatedDoctor.getContactInfo());
                existing.setSpecialization(updatedDoctor.getSpecialization());
                if (updatedDoctor.getResumeUrl() != null) {
                    existing.setResumeUrl(updatedDoctor.getResumeUrl());
                }
                return doctorRepository.save(existing);
            })
            .orElseThrow(() -> new RuntimeException("Doctor not found with ID " + id));
    }

    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }
}
