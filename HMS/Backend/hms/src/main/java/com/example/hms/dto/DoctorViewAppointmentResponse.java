package com.example.hms.dto;

import com.example.hms.entity.Appointment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorViewAppointmentResponse {
    private Long appointmentId;
    private Long patientId; // ✅ Add this
    private String patientName;
    private Appointment.Status status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}

