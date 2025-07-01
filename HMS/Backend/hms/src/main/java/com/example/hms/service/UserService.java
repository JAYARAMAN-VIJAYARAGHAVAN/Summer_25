package com.example.hms.service;

import com.example.hms.dto.InactiveUserDTO;
import com.example.hms.entity.Admin;
import com.example.hms.entity.Doctor;
import com.example.hms.entity.Patient;
import com.example.hms.entity.Pharmacist;
import com.example.hms.entity.User;
import com.example.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<InactiveUserDTO> getInactiveUsers() {
        List<User> inactiveUsers = userRepository.findByStatus(User.Status.INACTIVE);

        return inactiveUsers.stream().map(user -> {
            String role = "Unknown";

            if (user instanceof Doctor) {
                role = "Doctor";
            } else if (user instanceof Patient) {
                role = "Patient";
            } else if (user instanceof Pharmacist) {
                role = "Pharmacist";
            } else if (user instanceof Admin) {
                role = "Admin";
            }

            return new InactiveUserDTO(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getContactInfo(),
                role,
                user.getStatus().name()
            );
        }).collect(Collectors.toList());
    }


    // Activate User account
    public void activateAccount(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        user.setStatus(User.Status.ACTIVE);
        userRepository.save(user);
    }

    // Delete User account
    public void deleteAccount(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        userRepository.delete(user);
    }

    // Password Change functionality (placeholder for hashed password comparison)
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        // TODO: Replace with hashed password comparison in real app
        if (!user.getPassword().equals(currentPassword)) return false;

        user.setPassword(newPassword);
        userRepository.save(user);
        return true;
    }
}
