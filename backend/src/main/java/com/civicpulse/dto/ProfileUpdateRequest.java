package com.civicpulse.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String country;
    private String profilePicture;
    private String currentPassword;
    private String newPassword;
}
