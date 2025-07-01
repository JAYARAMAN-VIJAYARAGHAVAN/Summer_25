package com.example.hms.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupUser {
    private String username;
    private String password;
    private String name;
    private int age;
    private String gender;
    private String contactInfo;
    private String role;
}
