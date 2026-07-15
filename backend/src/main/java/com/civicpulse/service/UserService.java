package com.civicpulse.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.civicpulse.dto.LoginRequest;
import com.civicpulse.dto.SignupRequest;
import com.civicpulse.entity.User;
import com.civicpulse.entity.Profile;
import com.civicpulse.repository.UserRepository;
import com.civicpulse.repository.ProfileRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register User
    @Transactional
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

        // Encrypt using BCrypt
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Default Role (admin@civicpulse.gov is ADMIN, others are CITIZEN)
        if (request.getEmail().equalsIgnoreCase("admin@civicpulse.gov")) {
            user.setRole("ADMIN");
        } else {
            user.setRole("CITIZEN");
        }

        // Save User
        User savedUser = userRepository.save(user);

        // Create an initial Profile for the User
        Profile profile = new Profile();
        profile.setUser(savedUser);
        profile.setJoinedDate(LocalDateTime.now());
        profile.setProfilePicture("");
        profile.setAddress("");
        profile.setCity("");
        profile.setState("");
        profile.setCountry("");
        profileRepository.save(profile);

        return savedUser;
    }

    // Login User
    public User loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        return user;
    }

    // Get All Users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}