package com.civicpulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.entity.User;
import com.civicpulse.entity.Profile;
import com.civicpulse.dto.ProfileResponse;
import com.civicpulse.dto.ProfileUpdateRequest;
import com.civicpulse.dto.ErrorMsg;
import com.civicpulse.repository.UserRepository;
import com.civicpulse.repository.ProfileRepository;
import com.civicpulse.repository.ComplaintRepository;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> getProfile() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Profile profile = profileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));

            long total = complaintRepository.countByUserId(user.getId());
            long resolved = complaintRepository.countByUserIdAndStatus(user.getId(), "Resolved")
                            + complaintRepository.countByUserIdAndStatus(user.getId(), "Closed");
            long rejected = complaintRepository.countByUserIdAndStatus(user.getId(), "Rejected");
            long pending = total - (resolved + rejected);

            ProfileResponse response = new ProfileResponse(
                    user.getName(),
                    user.getEmail(),
                    user.getPhoneNumber(),
                    user.getRole(),
                    profile.getProfilePicture(),
                    profile.getAddress(),
                    profile.getCity(),
                    profile.getState(),
                    profile.getCountry(),
                    profile.getJoinedDate(),
                    total,
                    resolved,
                    pending
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Profile profile = profileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found"));

            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                user.setName(request.getName());
            }
            if (request.getPhoneNumber() != null) {
                user.setPhoneNumber(request.getPhoneNumber());
            }

            if (request.getAddress() != null) profile.setAddress(request.getAddress());
            if (request.getCity() != null) profile.setCity(request.getCity());
            if (request.getState() != null) profile.setState(request.getState());
            if (request.getCountry() != null) profile.setCountry(request.getCountry());
            if (request.getProfilePicture() != null) profile.setProfilePicture(request.getProfilePicture());

            // Password change
            if (request.getCurrentPassword() != null && request.getNewPassword() != null 
                && !request.getCurrentPassword().trim().isEmpty() && !request.getNewPassword().trim().isEmpty()) {
                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                    throw new RuntimeException("Incorrect current password");
                }
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }

            userRepository.save(user);
            profileRepository.save(profile);

            long total = complaintRepository.countByUserId(user.getId());
            long resolved = complaintRepository.countByUserIdAndStatus(user.getId(), "Resolved")
                            + complaintRepository.countByUserIdAndStatus(user.getId(), "Closed");
            long rejected = complaintRepository.countByUserIdAndStatus(user.getId(), "Rejected");
            long pending = total - (resolved + rejected);

            ProfileResponse response = new ProfileResponse(
                    user.getName(),
                    user.getEmail(),
                    user.getPhoneNumber(),
                    user.getRole(),
                    profile.getProfilePicture(),
                    profile.getAddress(),
                    profile.getCity(),
                    profile.getState(),
                    profile.getCountry(),
                    profile.getJoinedDate(),
                    total,
                    resolved,
                    pending
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }
}
