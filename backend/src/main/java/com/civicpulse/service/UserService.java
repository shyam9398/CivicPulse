package com.civicpulse.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.civicpulse.dto.LoginRequest;
import com.civicpulse.dto.SignupRequest;
import com.civicpulse.entity.User;
import com.civicpulse.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Register User
    public User registerUser(SignupRequest request) {

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Check password and confirm password
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Create User Entity
        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());

        // NOTE:
        // This stores the password as plain text.
        // In the next step we'll encrypt it using BCrypt.
        user.setPassword(request.getPassword());

        // Default Role
        user.setRole("CITIZEN");

        // Save User
        return userRepository.save(user);
    }

    // Login User
    public User loginUser(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        return user;
    }

    // Get All Users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

}