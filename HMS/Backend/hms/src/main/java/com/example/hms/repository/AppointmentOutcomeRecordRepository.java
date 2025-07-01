package com.example.hms.repository;

import com.example.hms.entity.AppointmentOutcomeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AppointmentOutcomeRecordRepository extends JpaRepository<AppointmentOutcomeRecord, Long> {

    List<AppointmentOutcomeRecord> findByPatientId(Long patientId);

    @Query("SELECT r FROM AppointmentOutcomeRecord r JOIN FETCH r.doctor JOIN FETCH r.patient WHERE r.patient.id = :patientId")
    List<AppointmentOutcomeRecord> findByPatientIdWithDetails(@Param("patientId") Long patientId);

    // New: Find all records where prescriptionStatus is NOT the specified status (e.g. DISPENSED)
    List<AppointmentOutcomeRecord> findByPrescriptionStatusNot(AppointmentOutcomeRecord.PrescriptionStatus prescriptionStatus);
}
