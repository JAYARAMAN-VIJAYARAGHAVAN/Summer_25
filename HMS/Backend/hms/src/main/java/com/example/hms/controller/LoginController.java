package com.example.hms.controller;

import com.example.hms.dto.LoginRequest;
import com.example.hms.dto.LoginResponse;
import com.example.hms.entity.User;
import com.example.hms.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/login")
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;

    @PostMapping
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            User user = loginService.login(request.getUsername(), request.getPassword());

            LoginResponse response = new LoginResponse();
            response.setUserId(user.getId());
            response.setName(user.getName());
            response.setRole(user.getClass().getSimpleName());

            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            ex.printStackTrace(); 
            throw ex; 
        }
    }

}
