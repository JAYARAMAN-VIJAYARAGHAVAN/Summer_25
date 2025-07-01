package com.example.hms.controller;

import com.example.hms.dto.AppointmentOutcomeRecordRequest;
import com.example.hms.dto.AppointmentOutcomeRecordResponse;
import com.example.hms.entity.AppointmentOutcomeRecord;
import com.example.hms.service.AppointmentOutcomeRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/outcomes")
@CrossOrigin(origins = "*")
public class AppointmentOutcomeRecordController {

    @Autowired
    private AppointmentOutcomeRecordService outcomeService;

    // Existing endpoint: get outcomes by patient ID
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<List<AppointmentOutcomeRecordResponse>> getOutcomesByPatientId(@PathVariable Long patientId) {
        List<AppointmentOutcomeRecordResponse> records = outcomeService.getRecordsByPatientId(patientId);
        return ResponseEntity.ok(records);
    }

    // New endpoint: pharmacist GET pending outcomes (prescriptionStatus != DISPENSED)
    @GetMapping("/pharmacist/pending")
    public ResponseEntity<List<AppointmentOutcomeRecordResponse>> getPendingOutcomesForPharmacist() {
        List<AppointmentOutcomeRecordResponse> records = outcomeService.getPendingRecordsForPharmacist();
        return ResponseEntity.ok(records);
    }

    // Existing endpoint: create new outcome record
    @PostMapping
    public ResponseEntity<?> createOutcomeRecord(@RequestBody AppointmentOutcomeRecordRequest request) {
        try {
            AppointmentOutcomeRecord created = outcomeService.createRecord(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // New endpoint: update prescription status by ID
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePrescriptionStatus(
        @PathVariable Long id,
        @RequestParam AppointmentOutcomeRecord.PrescriptionStatus prescriptionStatus) {
        try {
            AppointmentOutcomeRecord updated = outcomeService.updatePrescriptionStatus(id, prescriptionStatus);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
