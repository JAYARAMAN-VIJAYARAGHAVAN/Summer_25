package com.example.hms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Doctor extends User {

    @Enumerated(EnumType.STRING)
    private Specialization specialization;

    private String resumeUrl;

    public enum Specialization {
        CARDIOLOGY,
        DERMATOLOGY,
        PEDIATRICS,
        ORTHOPEDICS,
        NEUROLOGY,
        GENERAL_PRACTICE,
        RADIOLOGY,
        ONCOLOGY
    }
}
