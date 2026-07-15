package com.civicpulse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private String name;
    private String email;
    private String phoneNumber;
    private String role;
    
    private String profilePicture;
    private String address;
    private String city;
    private String state;
    private String country;
    private LocalDateTime joinedDate;
    
    private long totalComplaints;
    private long resolvedComplaints;
    private long pendingComplaints;
}
