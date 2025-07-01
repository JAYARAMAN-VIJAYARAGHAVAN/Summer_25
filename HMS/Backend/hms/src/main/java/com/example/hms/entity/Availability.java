package com.example.hms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ElementCollection
    @CollectionTable(name = "weekly_schedule", joinColumns = @JoinColumn(name = "availability_id"))
    @MapKeyColumn(name = "day_of_week")
    private Map<DayOfWeek, TimeRange> weeklySchedule;

    @ElementCollection
    @CollectionTable(name = "unavailable_slots", joinColumns = @JoinColumn(name = "availability_id"))
    @Column(name = "unavailable_date_time")
    private Set<LocalDateTime> unavailableSlots;

    @Embeddable
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TimeRange {
        private LocalTime startTime;
        private LocalTime endTime;
    }
} 
