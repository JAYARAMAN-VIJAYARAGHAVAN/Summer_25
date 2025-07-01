package com.example.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class TimeRangeDTO {
    private LocalTime startTime;
    private LocalTime endTime;
}
