package com.example.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.example.hms.entity.Appointment;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long appointmentId;
    private String doctorName;
    private String patientName;
    private Appointment.Status status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
