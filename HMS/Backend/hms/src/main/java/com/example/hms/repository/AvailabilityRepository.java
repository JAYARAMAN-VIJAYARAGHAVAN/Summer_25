package com.example.hms.repository;

import com.example.hms.entity.Availability;
import com.example.hms.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    boolean existsByDoctorId(Long doctorId);
    Availability findByDoctorId(Long doctorId);
    
}
