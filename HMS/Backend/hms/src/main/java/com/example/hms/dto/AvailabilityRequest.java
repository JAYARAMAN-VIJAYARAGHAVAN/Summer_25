package com.example.hms.dto;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;
import java.util.Set;

@Data
public class AvailabilityRequest {
    private Long doctorId;
    private Map<DayOfWeek, TimeRangeDTO> weeklySchedule;
    private Set<LocalDateTime> unavailableSlots;
}
