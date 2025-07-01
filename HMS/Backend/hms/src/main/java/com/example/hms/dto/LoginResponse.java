package com.example.hms.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private Long userId;
    private String name;
    private String role;
}
