package com.example.hms.controller;

import com.example.hms.dto.InactiveUserDTO;
import com.example.hms.dto.UserIdRequest;
import com.example.hms.entity.Admin;
import com.example.hms.entity.User;
import com.example.hms.service.AdminService;
import com.example.hms.service.UserService;

import java.util.List;

import org.aspectj.internal.lang.annotation.ajcDeclareAnnotation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    // Get Admin by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAdminById(@PathVariable Long id) {
        return adminService.getAdminById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all inactive users
    @GetMapping("/inactive-users")
    public ResponseEntity<List<InactiveUserDTO>> getInactiveUsers() {
        return ResponseEntity.ok(userService.getInactiveUsers());
    }


    // Activate a user account
    @PostMapping("/activate-account")
    public ResponseEntity<String> activateAccount(@RequestBody UserIdRequest request) {
        try {
            userService.activateAccount(request.getUserId());
            return ResponseEntity.ok("Account activated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error activating account: " + e.getMessage());
        }
    }

    // Delete a user account
    @DeleteMapping("/delete-account")
    public ResponseEntity<String> deleteAccount(@RequestBody UserIdRequest request) {
        try {
            userService.deleteAccount(request.getUserId());
            return ResponseEntity.ok("Account deleted successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error deleting account: " + e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Admin updatedAdmin) {
        try {
            Admin saved = adminService.updateAdmin(id, updatedAdmin);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Update failed: " + e.getMessage());
        }
    }

}
