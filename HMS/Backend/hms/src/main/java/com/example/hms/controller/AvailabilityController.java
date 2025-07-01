package com.example.hms.controller;

import com.example.hms.dto.AvailabilityRequest;
import com.example.hms.dto.AvailabilityResponse;
import com.example.hms.dto.SlotDTO;
import com.example.hms.entity.Availability;
import com.example.hms.entity.Doctor;
import com.example.hms.repository.DoctorRepository;
import com.example.hms.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "*")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping
    public ResponseEntity<?> createAvailability(@RequestBody AvailabilityRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId()).orElse(null);
        if (doctor == null) return ResponseEntity.badRequest().body("Doctor not found");

        availabilityService.saveAvailability(request, doctor);
        return ResponseEntity.ok("Availability saved successfully");
    }

    @GetMapping("/doctor/{doctorId}/exists")
    public ResponseEntity<Boolean> hasAvailability(@PathVariable Long doctorId) {
        boolean exists = availabilityService.doctorHasAvailability(doctorId);
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAvailability(@PathVariable Long doctorId) {
        Availability availability = availabilityService.getAvailability(doctorId);
        if (availability == null) {
            return ResponseEntity.notFound().build();
        }

        availabilityService.cleanExpiredUnavailableSlots(availability);
        AvailabilityResponse response = availabilityService.toAvailabilityResponse(availability);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/slots")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam Long doctorId,
            @RequestParam String date
    ) {
        try {
            List<String> slots = availabilityService.getAvailableSlots(doctorId, date);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to fetch slots: " + e.getMessage());
        }
    }

    @GetMapping("/full")
    public ResponseEntity<List<SlotDTO>> getAllSlotsForDoctorAndDate(
            @RequestParam Long doctorId,
            @RequestParam String date) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<SlotDTO> slots = availabilityService.getAllSlotsWithStatus(doctorId, localDate);
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

}
