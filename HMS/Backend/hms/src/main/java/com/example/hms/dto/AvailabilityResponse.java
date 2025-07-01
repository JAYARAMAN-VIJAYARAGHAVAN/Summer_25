package com.example.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

@Data
@AllArgsConstructor
public class AvailabilityResponse {
    private Long doctorId;
    private Map<DayOfWeek, TimeRangeDTO> weeklySchedule;
    private Set<LocalDateTime> unavailableSlots;
}
