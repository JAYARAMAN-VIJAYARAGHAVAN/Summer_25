package com.example.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SlotDTO {
    private String time;   // e.g., "09:30"
    private String status; // AVAILABLE or BOOKED
}
