package com.example.hms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.hms.entity.User;
import com.example.hms.entity.User.Status;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    Optional<User> findByContactInfo(String contactInfo);
    List<User> findByStatus(Status status); // Return List of inactive users
}


