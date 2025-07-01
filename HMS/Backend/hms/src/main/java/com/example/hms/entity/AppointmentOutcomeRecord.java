package com.example.hms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentOutcomeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private LocalDateTime appointmentDateTime;

    private String diagnosis;

    @Column(length = 1000)
    private String prescription;

    @Enumerated(EnumType.STRING)
    private PrescriptionStatus prescriptionStatus;

    @Column(length = 2000)
    private String notes;

    public enum PrescriptionStatus {
        PENDING,
        DISPENSED,
        CANCELLED
    }
}
