package com.example.hms.service;

import com.example.hms.entity.Pharmacist;
import com.example.hms.repository.PharmacistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PharmacistService {

    @Autowired
    private PharmacistRepository pharmacistRepository;

    public Optional<Pharmacist> getPharmacistById(Long id) {
        return pharmacistRepository.findById(id);
    }

    public List<Pharmacist> getAllPharmacists() {
        return pharmacistRepository.findAll();
    }

    public Pharmacist updatePharmacist(Long id, Pharmacist updated) {
    return pharmacistRepository.findById(id).map(existing -> {
        existing.setName(updated.getName());
        existing.setAge(updated.getAge());
        existing.setGender(updated.getGender());
        existing.setContactInfo(updated.getContactInfo());
        return pharmacistRepository.save(existing);
    }).orElseThrow(() -> new RuntimeException("Pharmacist not found"));
}

}
