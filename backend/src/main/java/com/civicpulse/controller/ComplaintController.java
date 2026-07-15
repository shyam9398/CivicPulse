package com.civicpulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.civicpulse.entity.*;
import com.civicpulse.dto.*;
import com.civicpulse.repository.*;
import com.civicpulse.service.*;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private ComplaintImageRepository complaintImageRepository;

    @Autowired
    private ComplaintStatusRepository complaintStatusRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ComplaintTimelineRepository complaintTimelineRepository;

    @Autowired
    private ImageAnalysisService imageAnalysisService;

    @Autowired
    private GeocodingService geocodingService;

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile imageFile) {
        try {
            if (imageFile == null || imageFile.isEmpty()) {
                throw new RuntimeException("Image file is empty or null");
            }
            
            String originalFilename = imageFile.getOriginalFilename();
            String ext = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = "temp_" + UUID.randomUUID().toString() + ext;
            
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(filename);
            Files.copy(imageFile.getInputStream(), filePath);
            String publicPath = "/uploads/" + filename;

            ImageAnalysisResult analysisResult = imageAnalysisService.analyzeImage(imageFile);
            
            AddressDetails addressDetails = null;
            if (analysisResult.isGpsFound() && analysisResult.getLatitude() != null && analysisResult.getLongitude() != null) {
                addressDetails = geocodingService.reverseGeocode(analysisResult.getLatitude(), analysisResult.getLongitude());
            }

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("imagePath", publicPath);
            response.put("gpsFound", analysisResult.isGpsFound());
            response.put("latitude", analysisResult.getLatitude());
            response.put("longitude", analysisResult.getLongitude());
            response.put("captureTime", analysisResult.getCaptureTime());
            response.put("category", analysisResult.getCategory());
            response.put("confidence", analysisResult.getConfidence());
            response.put("suggestedDepartment", analysisResult.getSuggestedDepartment());
            response.put("priority", analysisResult.getPriority());
            response.put("address", addressDetails);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<?> getReverseGeocode(@RequestParam("lat") Double lat, @RequestParam("lng") Double lng) {
        try {
            if (lat == null || lng == null) {
                throw new RuntimeException("Latitude and Longitude are required");
            }
            AddressDetails details = geocodingService.reverseGeocode(lat, lng);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createComplaint(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("priority") String priority,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "state", required = false) String state,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "houseNumber", required = false) String houseNumber,
            @RequestParam(value = "street", required = false) String street,
            @RequestParam(value = "area", required = false) String area,
            @RequestParam(value = "village", required = false) String village,
            @RequestParam(value = "district", required = false) String district,
            @RequestParam(value = "pincode", required = false) String pincode,
            @RequestParam(value = "gpsAccuracy", required = false) Double gpsAccuracy,
            @RequestParam(value = "captureTime", required = false) String captureTimeStr,
            @RequestParam(value = "tempImagePath", required = false) String tempImagePath,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String complaintId = generateComplaintId();
            String department = autoAssignDepartment(category);

            Complaint complaint = new Complaint();
            complaint.setId(complaintId);
            complaint.setUser(user);
            complaint.setTitle(title);
            complaint.setDescription(description);
            complaint.setCategory(category);
            complaint.setPriority(priority);
            complaint.setDepartment(department);
            complaint.setLatitude(latitude);
            complaint.setLongitude(longitude);
            complaint.setAddress(address);
            complaint.setCity(city);
            complaint.setState(state);
            complaint.setCountry(country);
            complaint.setHouseNumber(houseNumber);
            complaint.setStreet(street);
            complaint.setArea(area);
            complaint.setVillage(village);
            complaint.setDistrict(district);
            complaint.setPincode(pincode);
            complaint.setGpsAccuracy(gpsAccuracy);
            
            if (captureTimeStr != null && !captureTimeStr.isEmpty()) {
                try {
                    complaint.setCaptureTime(LocalDateTime.parse(captureTimeStr));
                } catch (Exception ex) {
                    complaint.setCaptureTime(LocalDateTime.now());
                }
            } else {
                complaint.setCaptureTime(LocalDateTime.now());
            }

            complaint.setStatus("Pending");
            complaint.setCreatedTime(LocalDateTime.now());
            complaint.setUpdatedTime(LocalDateTime.now());

            if (imageFile != null && !imageFile.isEmpty()) {
                String originalFilename = imageFile.getOriginalFilename();
                String ext = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    ext = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String filename = complaintId + "_" + System.currentTimeMillis() + ext;
                
                Path uploadPath = Paths.get("uploads");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                Path filePath = uploadPath.resolve(filename);
                Files.copy(imageFile.getInputStream(), filePath);
                
                String publicPath = "/uploads/" + filename;
                complaint.setImagePath(publicPath);
            } else if (tempImagePath != null && !tempImagePath.isEmpty()) {
                String filenameOnly = tempImagePath.replace("/uploads/", "");
                Path sourcePath = Paths.get("uploads").resolve(filenameOnly);
                if (Files.exists(sourcePath)) {
                    String ext = "";
                    if (filenameOnly.contains(".")) {
                        ext = filenameOnly.substring(filenameOnly.lastIndexOf("."));
                    }
                    String finalFilename = complaintId + "_" + System.currentTimeMillis() + ext;
                    Path destPath = Paths.get("uploads").resolve(finalFilename);
                    Files.move(sourcePath, destPath);
                    complaint.setImagePath("/uploads/" + finalFilename);
                } else {
                    complaint.setImagePath(tempImagePath);
                }
            }

            Complaint savedComplaint = complaintRepository.save(complaint);

            // Save to complaint_images
            if (savedComplaint.getImagePath() != null) {
                ComplaintImage ci = new ComplaintImage();
                ci.setComplaint(savedComplaint);
                ci.setImagePath(savedComplaint.getImagePath());
                complaintImageRepository.save(ci);
            }

            // Create initial complaint status
            ComplaintStatus status = new ComplaintStatus();
            status.setComplaint(savedComplaint);
            status.setStatus("Submitted");
            status.setRemarks("Complaint registered successfully.");
            status.setOfficerName("System Auto-Assign");
            status.setUpdatedTime(LocalDateTime.now());
            complaintStatusRepository.save(status);

            // Create timeline entry
            ComplaintTimeline timeline = new ComplaintTimeline();
            timeline.setComplaint(savedComplaint);
            timeline.setStatus("Submitted");
            timeline.setRemarks("Complaint registered successfully.");
            timeline.setOfficerName("System Auto-Assign");
            timeline.setUpdatedTime(LocalDateTime.now());
            complaintTimelineRepository.save(timeline);

            // Create notification
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setComplaint(savedComplaint);
            notification.setTitle("Complaint Submitted");
            notification.setMessage("Your complaint '" + title + "' (ID: " + complaintId + ") has been submitted successfully.");
            notification.setStatus("UNREAD");
            notification.setCreatedTime(LocalDateTime.now());
            notificationRepository.save(notification);

            return ResponseEntity.ok(savedComplaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllComplaints() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                List<Complaint> all = complaintRepository.findAllByOrderByCreatedTimeDesc();
                return ResponseEntity.ok(all);
            } else {
                List<Complaint> userComplaints = complaintRepository.findByUserIdOrderByCreatedTimeDesc(user.getId());
                return ResponseEntity.ok(userComplaints);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintById(@PathVariable String id) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + id));
            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComplaint(@PathVariable String id, @RequestBody com.civicpulse.dto.AdminUpdateRequest updatedData) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            boolean statusChanged = false;
            String oldStatus = complaint.getStatus();
            String newStatus = updatedData.getStatus();
            
            if (newStatus != null && !newStatus.equalsIgnoreCase(oldStatus)) {
                complaint.setStatus(newStatus);
                statusChanged = true;
            }
            if (updatedData.getDepartment() != null) {
                complaint.setDepartment(updatedData.getDepartment());
            }
            if (updatedData.getPriority() != null) {
                complaint.setPriority(updatedData.getPriority());
            }
            
            complaint.setUpdatedTime(LocalDateTime.now());
            Complaint saved = complaintRepository.save(complaint);

            String remarks = updatedData.getRemarks() != null && !updatedData.getRemarks().trim().isEmpty() 
                    ? updatedData.getRemarks() : "Complaint details updated by Admin.";
            String officer = updatedData.getOfficerName() != null && !updatedData.getOfficerName().trim().isEmpty() 
                    ? updatedData.getOfficerName() : "Admin Operations";

            // Log status timeline node in complaint_status
            ComplaintStatus statusLog = new ComplaintStatus();
            statusLog.setComplaint(saved);
            statusLog.setStatus(statusChanged ? newStatus : "Updated");
            statusLog.setRemarks(remarks);
            statusLog.setOfficerName(officer);
            statusLog.setUpdatedTime(LocalDateTime.now());
            complaintStatusRepository.save(statusLog);

            // Log status timeline node in complaint_timeline
            ComplaintTimeline timelineLog = new ComplaintTimeline();
            timelineLog.setComplaint(saved);
            timelineLog.setStatus(statusChanged ? newStatus : "Updated");
            timelineLog.setRemarks(remarks);
            timelineLog.setOfficerName(officer);
            timelineLog.setUpdatedTime(LocalDateTime.now());
            complaintTimelineRepository.save(timelineLog);

            // Create customized status notification
            createStatusNotification(saved, statusChanged ? newStatus : "Updated", remarks, officer);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable String id, @RequestBody com.civicpulse.dto.AdminUpdateRequest updatedData) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            String oldStatus = complaint.getStatus();
            String newStatus = updatedData.getStatus();
            boolean statusChanged = false;
            
            if (newStatus != null && !newStatus.equalsIgnoreCase(oldStatus)) {
                complaint.setStatus(newStatus);
                statusChanged = true;
            }
            
            complaint.setUpdatedTime(LocalDateTime.now());
            Complaint saved = complaintRepository.save(complaint);

            String remarks = updatedData.getRemarks() != null && !updatedData.getRemarks().trim().isEmpty() 
                    ? updatedData.getRemarks() : "Status updated by dispatch officer.";
            String officer = updatedData.getOfficerName() != null && !updatedData.getOfficerName().trim().isEmpty() 
                    ? updatedData.getOfficerName() : "Dispatch Officer";

            // Log status timeline node in complaint_status
            ComplaintStatus statusLog = new ComplaintStatus();
            statusLog.setComplaint(saved);
            statusLog.setStatus(statusChanged ? newStatus : "Updated");
            statusLog.setRemarks(remarks);
            statusLog.setOfficerName(officer);
            statusLog.setUpdatedTime(LocalDateTime.now());
            complaintStatusRepository.save(statusLog);

            // Log status timeline node in complaint_timeline
            ComplaintTimeline timelineLog = new ComplaintTimeline();
            timelineLog.setComplaint(saved);
            timelineLog.setStatus(statusChanged ? newStatus : "Updated");
            timelineLog.setRemarks(remarks);
            timelineLog.setOfficerName(officer);
            timelineLog.setUpdatedTime(LocalDateTime.now());
            complaintTimelineRepository.save(timelineLog);

            // Create customized status notification
            createStatusNotification(saved, statusChanged ? newStatus : "Updated", remarks, officer);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    private void createStatusNotification(Complaint complaint, String status, String remarks, String officerName) {
        Notification notification = new Notification();
        notification.setUser(complaint.getUser());
        notification.setComplaint(complaint);
        
        String title = "Complaint Status Updated";
        String message = "Your complaint '" + complaint.getTitle() + "' (ID: " + complaint.getId() + ") status has been updated to " + status + ".";
        
        if ("Submitted".equalsIgnoreCase(status) || "Pending".equalsIgnoreCase(status)) {
            title = "Complaint Submitted";
            message = "Your complaint '" + complaint.getTitle() + "' (ID: " + complaint.getId() + ") has been submitted successfully.";
        } else if ("Verified".equalsIgnoreCase(status)) {
            title = "Complaint Verified";
            message = "Your complaint '" + complaint.getTitle() + "' (ID: " + complaint.getId() + ") has been verified by the municipal authority.";
        } else if ("Assigned".equalsIgnoreCase(status)) {
            title = "Officer Assigned";
            String officer = (officerName != null && !officerName.isEmpty()) ? officerName : "a municipal officer";
            message = "Officer " + officer + " has been assigned to your complaint '" + complaint.getTitle() + "' (ID: " + complaint.getId() + ").";
        } else if ("In Progress".equalsIgnoreCase(status) || "Work Started".equalsIgnoreCase(status) || "WorkStarted".equalsIgnoreCase(status)) {
            title = "Work Started";
            message = "Work has started on resolving your complaint '" + complaint.getTitle() + "' (ID: " + complaint.getId() + ").";
            if (remarks != null && !remarks.trim().isEmpty()) {
                message += " Remarks: " + remarks;
            }
        } else if ("Resolved".equalsIgnoreCase(status)) {
            title = "Complaint Resolved";
            message = "Your complaint '" + complaint.getTitle() + "' (ID: " + complaint.getId() + ") has been resolved successfully!";
            if (remarks != null && !remarks.trim().isEmpty()) {
                message += " Remarks: " + remarks;
            }
        } else if ("Rejected".equalsIgnoreCase(status)) {
            title = "Complaint Rejected";
            message = "Your complaint '" + complaint.getTitle() + "' (ID: " + complaint.getId() + ") has been rejected.";
            if (remarks != null && !remarks.trim().isEmpty()) {
                message += " Reason: " + remarks;
            }
        }
        
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setStatus("UNREAD");
        notification.setCreatedTime(LocalDateTime.now());
        notificationRepository.save(notification);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable String id) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));
            complaintRepository.delete(complaint);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorMsg(e.getMessage()));
        }
    }

    private synchronized String generateComplaintId() {
        int year = LocalDateTime.now().getYear();
        Optional<Complaint> latest = complaintRepository.findFirstByOrderByIdDesc();
        long nextNum = 1;
        if (latest.isPresent()) {
            String lastId = latest.get().getId();
            String prefix = "CP" + year;
            if (lastId.startsWith(prefix) && lastId.length() == 11) {
                try {
                    String numPart = lastId.substring(6);
                    nextNum = Long.parseLong(numPart) + 1;
                } catch (NumberFormatException e) {
                    nextNum = complaintRepository.count() + 1;
                }
            } else {
                nextNum = complaintRepository.count() + 1;
            }
        } else {
            nextNum = complaintRepository.count() + 1;
        }
        return String.format("CP%d%05d", year, nextNum);
    }

    private String autoAssignDepartment(String category) {
        if (category == null) return "General City Administration";
        switch (category) {
            case "Pothole":
            case "Road Damage":
            case "Damaged Footpath":
                return "Public Works Department";
            case "Garbage":
            case "Illegal Dumping":
            case "Construction Waste":
                return "Sanitation & Waste Management";
            case "Water Leakage":
            case "Broken Drain":
            case "Open Manhole":
            case "Sewage Overflow":
                return "Water Supply & Sewage Board";
            case "Street Light Failure":
            case "Electric Pole Damage":
                return "Electricity Distribution Corp";
            case "Traffic Signal Damage":
                return "Traffic Control & Police";
            case "Fallen Tree":
                return "Horticulture & Parks";
            default:
                return "General City Administration";
        }
    }
}
