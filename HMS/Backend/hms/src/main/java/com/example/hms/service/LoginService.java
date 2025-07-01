package com.example.hms.service;

import com.example.hms.entity.User;
import com.example.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final UserRepository userRepository;

    public User login(String username, String password) {
        String trimmedUsername = username.trim();
        String trimmedPassword = password.trim();

        System.out.println("Login attempt: username='" + trimmedUsername + "', password='" + trimmedPassword + "'");

        Optional<User> optionalUser = userRepository.findByUsername(trimmedUsername);
        if (optionalUser.isEmpty()) {
            System.out.println("No user found with username='" + trimmedUsername + "'");
            throw new IllegalArgumentException("Invalid username or password");
        }

        User user = optionalUser.get();
        System.out.println("DB user: username='" + user.getUsername() + "', password='" + user.getPassword() + "'");

        if (!trimmedPassword.equals(user.getPassword())) {
            System.out.println("Password mismatch");
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (user.getStatus() != User.Status.ACTIVE) {
            System.out.println("Account not activated: status=" + user.getStatus());
            throw new IllegalStateException("Account not activated. Please wait for admin approval.");
        }

        return user;
    }
}
