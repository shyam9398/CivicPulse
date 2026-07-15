package com.civicpulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.entity.Complaint;
import com.civicpulse.dto.ErrorMsg;
import com.civicpulse.repository.ComplaintRepository;
import java.util.List;

@RestController
@RequestMapping("/api/history")
@CrossOrigin(origins = "http://localhost:5173")
public class HistoryController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserComplaintHistory(@PathVariable Long userId) {
        try {
            List<Complaint> history = complaintRepository.findByUserIdOrderByCreatedTimeDesc(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }
}
