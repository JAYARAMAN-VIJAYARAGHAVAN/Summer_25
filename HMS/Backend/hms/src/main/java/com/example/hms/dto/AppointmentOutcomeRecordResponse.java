package com.example.hms.dto;

import com.example.hms.entity.AppointmentOutcomeRecord.PrescriptionStatus;
import java.time.LocalDateTime;

public record AppointmentOutcomeRecordResponse(
    Long id,
    String doctorName,
    String patientName,
    String diagnosis,
    String prescription,
    PrescriptionStatus prescriptionStatus,
    LocalDateTime appointmentDateTime,
    String notes
) {}
