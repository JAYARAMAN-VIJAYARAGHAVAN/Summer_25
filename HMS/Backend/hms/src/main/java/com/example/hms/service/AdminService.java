package com.example.hms.service;

import com.example.hms.entity.Admin;
import com.example.hms.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.findById(id);
    }

    public Admin updateAdmin(Long id, Admin updated) {
    return adminRepository.findById(id).map(existing -> {
        existing.setName(updated.getName());
        existing.setAge(updated.getAge());
        existing.setGender(updated.getGender());
        existing.setContactInfo(updated.getContactInfo());
        return adminRepository.save(existing);
    }).orElseThrow(() -> new RuntimeException("Admin not found"));
}

}
