package com.example.hms.dto;

import com.example.hms.entity.AppointmentOutcomeRecord.PrescriptionStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentOutcomeRecordRequest {
    private Long doctorId;
    private Long patientId;
    private LocalDateTime appointmentDateTime;
    private String diagnosis;
    private String prescription;
    private PrescriptionStatus prescriptionStatus;
    private String notes;
}
