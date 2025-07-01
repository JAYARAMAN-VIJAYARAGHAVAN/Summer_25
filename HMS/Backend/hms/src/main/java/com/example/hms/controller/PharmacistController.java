package com.example.hms.controller;

import com.example.hms.entity.Pharmacist;
import com.example.hms.service.PharmacistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacists")
@CrossOrigin(origins = "*")
public class PharmacistController {

    @Autowired
    private PharmacistService pharmacistService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getPharmacistById(@PathVariable Long id) {
        return pharmacistService.getPharmacistById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ NEW: Get all pharmacists (for View All Profiles)
    @GetMapping
    public ResponseEntity<List<Pharmacist>> getAllPharmacists() {
        return ResponseEntity.ok(pharmacistService.getAllPharmacists());
    }

    @PutMapping("/{id}")
public ResponseEntity<?> updatePharmacist(@PathVariable Long id, @RequestBody Pharmacist updatedPharmacist) {
    try {
        Pharmacist saved = pharmacistService.updatePharmacist(id, updatedPharmacist);
        return ResponseEntity.ok(saved);
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.internalServerError().body("Update failed: " + e.getMessage());
    }
}

}
