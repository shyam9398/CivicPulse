package com.civicpulse.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.civicpulse.entity.Complaint;
import com.civicpulse.entity.ComplaintImage;
import com.civicpulse.entity.ComplaintStatus;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatusResponse {
    private Complaint complaint;
    private List<ComplaintImage> images;
    private List<ComplaintStatus> timeline;
    private String currentStatus;
    private String officerName;
    private String department;
    private String estimatedResolutionTime; // e.g., "3 days"
    private String latestRemarks;
}
