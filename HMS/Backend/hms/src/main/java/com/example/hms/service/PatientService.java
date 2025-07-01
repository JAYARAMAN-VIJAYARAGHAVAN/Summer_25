package com.example.hms.service;

import com.example.hms.entity.Patient;
import com.example.hms.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient updatePatient(Long id, Patient updatedPatient) {
        return patientRepository.findById(id).map(existing -> {
            existing.setName(updatedPatient.getName());
            existing.setAge(updatedPatient.getAge());
            existing.setGender(updatedPatient.getGender());
            existing.setContactInfo(updatedPatient.getContactInfo());
            existing.setBloodType(updatedPatient.getBloodType());
            existing.setHeight(updatedPatient.getHeight());
            existing.setWeight(updatedPatient.getWeight());
            return patientRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Patient not found"));
    }
}
