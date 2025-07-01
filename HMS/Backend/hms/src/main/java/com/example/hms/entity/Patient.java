package com.example.hms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Patient extends User {

    @Enumerated(EnumType.STRING)
    private BloodType bloodType;

    private Double height;
    private Double weight;

    public enum BloodType {
        A_POSITIVE,
        A_NEGATIVE,
        B_POSITIVE,
        B_NEGATIVE,
        AB_POSITIVE,
        AB_NEGATIVE,
        O_POSITIVE,
        O_NEGATIVE
    }

}
