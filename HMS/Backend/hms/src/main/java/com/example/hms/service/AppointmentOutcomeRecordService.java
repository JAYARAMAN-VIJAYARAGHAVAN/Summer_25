package com.example.hms.service;

import com.example.hms.dto.AppointmentOutcomeRecordRequest;
import com.example.hms.dto.AppointmentOutcomeRecordResponse;
import com.example.hms.entity.AppointmentOutcomeRecord;
import com.example.hms.entity.Doctor;
import com.example.hms.entity.Patient;
import com.example.hms.repository.AppointmentOutcomeRecordRepository;
import com.example.hms.repository.DoctorRepository;
import com.example.hms.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentOutcomeRecordService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentOutcomeRecordService.class);

    private final AppointmentOutcomeRecordRepository outcomeRecordRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AppointmentOutcomeRecordService(
        AppointmentOutcomeRecordRepository outcomeRecordRepository,
        DoctorRepository doctorRepository,
        PatientRepository patientRepository
    ) {
        this.outcomeRecordRepository = outcomeRecordRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public List<AppointmentOutcomeRecordResponse> getRecordsByPatientId(Long patientId) {
        return outcomeRecordRepository.findByPatientId(patientId)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    // New: Get all records excluding DISPENSED (considered completed)
    public List<AppointmentOutcomeRecordResponse> getPendingRecordsForPharmacist() {
        return outcomeRecordRepository.findByPrescriptionStatusNot(AppointmentOutcomeRecord.PrescriptionStatus.DISPENSED)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentOutcomeRecord createRecord(AppointmentOutcomeRecordRequest request) {
        try {
            Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
            Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

            AppointmentOutcomeRecord record = new AppointmentOutcomeRecord();
            record.setDoctor(doctor);
            record.setPatient(patient);
            record.setAppointmentDateTime(request.getAppointmentDateTime());
            record.setDiagnosis(request.getDiagnosis());
            record.setPrescription(request.getPrescription());
            record.setPrescriptionStatus(request.getPrescriptionStatus());
            record.setNotes(request.getNotes());

            AppointmentOutcomeRecord savedRecord = outcomeRecordRepository.save(record);
            logger.info("Saved outcome record ID: {}", savedRecord.getId());

            return savedRecord;

        } catch (Exception e) {
            logger.error("Error creating outcome record: {}", e.getMessage());
            throw new RuntimeException("Failed to create outcome record: " + e.getMessage());
        }
    }

    // New: Update prescription status by record ID
    @Transactional
    public AppointmentOutcomeRecord updatePrescriptionStatus(Long id, AppointmentOutcomeRecord.PrescriptionStatus prescriptionStatus) {
        AppointmentOutcomeRecord record = outcomeRecordRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Outcome record not found with ID: " + id));
        record.setPrescriptionStatus(prescriptionStatus);
        return outcomeRecordRepository.save(record);
    }

    // Helper to map entity to DTO
    private AppointmentOutcomeRecordResponse toResponse(AppointmentOutcomeRecord record) {
        return new AppointmentOutcomeRecordResponse(
            record.getId(),
            record.getDoctor().getName(),
            record.getPatient().getName(),
            record.getDiagnosis(),
            record.getPrescription(),
            record.getPrescriptionStatus(),
            record.getAppointmentDateTime(),
            record.getNotes()
        );
    }
}
