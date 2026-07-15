package com.civicpulse.dto;

import lombok.Data;

@Data
public class AdminUpdateRequest {
    private String status;
    private String department;
    private String priority;
    private String remarks;
    private String officerName;
}
