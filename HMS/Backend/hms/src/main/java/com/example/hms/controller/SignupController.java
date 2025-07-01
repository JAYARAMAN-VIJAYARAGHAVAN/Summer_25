package com.example.hms.controller;

import com.example.hms.dto.SignupUser;
import com.example.hms.entity.*;
import com.example.hms.service.SignupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/signup")
@RequiredArgsConstructor
public class SignupController {

    private final SignupService signupService;

    // Step 1: Base User Signup
    @PostMapping("/user")
    public ResponseEntity<Long> signupUser(@RequestBody SignupUser dto) {
        Long userId = signupService.createUser(dto);
        return ResponseEntity.ok(userId);
    }

    // Step 2: Role-specific signup
    @PostMapping("/doctor")
    public ResponseEntity<String> signupDoctor(@RequestBody Doctor doctor) {
        String message = signupService.completeDoctorSignup(doctor);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/patient")
    public ResponseEntity<String> signupPatient(@RequestBody Patient patient) {
        String message = signupService.completePatientSignup(patient);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/pharmacist")
    public ResponseEntity<String> signupPharmacist(@RequestBody Pharmacist pharmacist) {
        String message = signupService.completePharmacistSignup(pharmacist);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/admin")
    public ResponseEntity<String> signupAdmin(@RequestBody Admin admin) {
        String message = signupService.completeAdminSignup(admin);
        return ResponseEntity.ok(message);
    }
}
