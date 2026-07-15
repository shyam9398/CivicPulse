package com.civicpulse.dto;

import java.time.LocalDateTime;

public class ImageAnalysisResult {
    private boolean gpsFound;
    private Double latitude;
    private Double longitude;
    private LocalDateTime captureTime;
    private String category;
    private int confidence;
    private String suggestedDepartment;
    private String priority;

    // Getters and Setters
    public boolean isGpsFound() {
        return gpsFound;
    }

    public void setGpsFound(boolean gpsFound) {
        this.gpsFound = gpsFound;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public LocalDateTime getCaptureTime() {
        return captureTime;
    }

    public void setCaptureTime(LocalDateTime captureTime) {
        this.captureTime = captureTime;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getConfidence() {
        return confidence;
    }

    public void setConfidence(int confidence) {
        this.confidence = confidence;
    }

    public String getSuggestedDepartment() {
        return suggestedDepartment;
    }

    public void setSuggestedDepartment(String suggestedDepartment) {
        this.suggestedDepartment = suggestedDepartment;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}
