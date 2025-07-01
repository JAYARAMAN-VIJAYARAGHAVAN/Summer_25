package com.example.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InactiveUserDTO {
    private Long id;
    private String username;
    private String name;
    private String contactInfo; // ✅ Add this
    private String role;
    private String status;
}
