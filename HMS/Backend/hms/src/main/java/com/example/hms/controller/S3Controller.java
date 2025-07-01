package com.example.hms.controller;

import com.example.hms.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;

    @GetMapping("/upload-url")
    public ResponseEntity<String> getUploadUrl(@RequestParam String fileName) {
        String uploadUrl = s3Service.generatePresignedUploadUrl(fileName);
        return ResponseEntity.ok(uploadUrl);
    }
}
