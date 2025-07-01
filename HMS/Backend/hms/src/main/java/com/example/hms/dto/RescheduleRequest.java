package com.example.hms.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RescheduleRequest {
    private Long appointmentId;
    private LocalDateTime newStartTime;
    private LocalDateTime newEndTime;
}
