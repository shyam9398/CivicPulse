package com.civicpulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.entity.Complaint;
import com.civicpulse.entity.ComplaintImage;
import com.civicpulse.entity.ComplaintStatus;
import com.civicpulse.dto.StatusResponse;
import com.civicpulse.dto.ErrorMsg;
import com.civicpulse.repository.ComplaintRepository;
import com.civicpulse.repository.ComplaintImageRepository;
import com.civicpulse.repository.ComplaintStatusRepository;

import java.util.List;

@RestController
@RequestMapping("/api/status")
@CrossOrigin(origins = "http://localhost:5173")
public class StatusController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintImageRepository complaintImageRepository;

    @Autowired
    private ComplaintStatusRepository complaintStatusRepository;

    @GetMapping("/{complaintId}")
    public ResponseEntity<?> getComplaintStatus(@PathVariable String complaintId) {
        try {
            Complaint complaint = complaintRepository.findById(complaintId)
                    .orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + complaintId));

            List<ComplaintImage> images = complaintImageRepository.findByComplaintId(complaintId);
            List<ComplaintStatus> timeline = complaintStatusRepository.findByComplaintIdOrderByUpdatedTimeAsc(complaintId);

            String officerName = "Not Assigned Yet";
            String latestRemarks = "No remarks yet.";
            if (!timeline.isEmpty()) {
                ComplaintStatus latestNode = timeline.get(timeline.size() - 1);
                if (latestNode.getOfficerName() != null && !latestNode.getOfficerName().isEmpty()) {
                    officerName = latestNode.getOfficerName();
                }
                if (latestNode.getRemarks() != null && !latestNode.getRemarks().isEmpty()) {
                    latestRemarks = latestNode.getRemarks();
                }
            }

            String estTime = "3-5 Business Days";
            if (complaint.getPriority() != null) {
                switch (complaint.getPriority()) {
                    case "Emergency":
                        estTime = "Within 24 Hours";
                        break;
                    case "High":
                        estTime = "1-2 Days";
                        break;
                    case "Medium":
                        estTime = "3-5 Days";
                        break;
                    case "Low":
                        estTime = "7-10 Days";
                        break;
                }
            }

            StatusResponse response = new StatusResponse(
                    complaint,
                    images,
                    timeline,
                    complaint.getStatus(),
                    officerName,
                    complaint.getDepartment(),
                    estTime,
                    latestRemarks
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }
}
