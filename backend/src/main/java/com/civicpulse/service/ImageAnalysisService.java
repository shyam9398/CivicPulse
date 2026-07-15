package com.civicpulse.service;

import com.civicpulse.dto.ImageAnalysisResult;
import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.GpsDirectory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class ImageAnalysisService {

    public ImageAnalysisResult analyzeImage(MultipartFile file) {
        ImageAnalysisResult result = new ImageAnalysisResult();
        result.setGpsFound(false);
        
        try {
            byte[] bytes = file.getBytes();
            
            // 1. Parse EXIF Metadata using Drew Noakes metadata-extractor
            try (ByteArrayInputStream exifInput = new ByteArrayInputStream(bytes)) {
                Metadata metadata = ImageMetadataReader.readMetadata(exifInput);
                
                // Get GPS directory
                GpsDirectory gpsDir = metadata.getFirstDirectoryOfType(GpsDirectory.class);
                if (gpsDir != null && gpsDir.getGeoLocation() != null) {
                    result.setGpsFound(true);
                    result.setLatitude(gpsDir.getGeoLocation().getLatitude());
                    result.setLongitude(gpsDir.getGeoLocation().getLongitude());
                }
                
                // Get subIFD directory for time
                ExifSubIFDDirectory subIfdDir = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
                if (subIfdDir != null) {
                    Date date = subIfdDir.getDateOriginal();
                    if (date != null) {
                        result.setCaptureTime(LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()));
                    }
                }
            } catch (Exception ex) {
                System.err.println("EXIF parsing failed: " + ex.getMessage());
            }

            // If EXIF date is missing, default to now
            if (result.getCaptureTime() == null) {
                result.setCaptureTime(LocalDateTime.now());
            }

            // 2. Perform Image Classification
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
            String detectedCategory = null;
            int confidence = 0;

            // Step 2a: Keyword-based detection (high confidence)
            if (filename.contains("pothole")) {
                detectedCategory = "Pothole";
                confidence = 97;
            } else if (filename.contains("garbage") || filename.contains("trash") || filename.contains("dump") || filename.contains("waste") || filename.contains("bin")) {
                if (filename.contains("dumping") || filename.contains("illegal")) {
                    detectedCategory = "Illegal Dumping";
                } else if (filename.contains("construction") || filename.contains("waste")) {
                    detectedCategory = "Construction Waste";
                } else {
                    detectedCategory = "Garbage";
                }
                confidence = 98;
            } else if (filename.contains("leak") || filename.contains("pipe") || filename.contains("burst")) {
                detectedCategory = "Water Leakage";
                confidence = 92;
            } else if (filename.contains("road") || filename.contains("crack") || filename.contains("asphalt") || filename.contains("damage")) {
                detectedCategory = "Road Damage";
                confidence = 96;
            } else if (filename.contains("drain")) {
                detectedCategory = "Broken Drain";
                confidence = 93;
            } else if (filename.contains("manhole")) {
                detectedCategory = "Open Manhole";
                confidence = 97;
            } else if (filename.contains("tree") || filename.contains("branch") || filename.contains("fallen")) {
                detectedCategory = "Fallen Tree";
                confidence = 91;
            } else if (filename.contains("light") || filename.contains("lamp") || filename.contains("bulb") || filename.contains("dark")) {
                detectedCategory = "Street Light Failure";
                confidence = 94;
            } else if (filename.contains(" pole") || filename.contains("pole ") || filename.contains("_pole") || filename.contains("pole_") || filename.startsWith("pole.") || filename.equals("pole") || filename.contains("electric") || filename.contains("transformer")) {
                detectedCategory = "Electric Pole Damage";
                confidence = 96;
            } else if (filename.contains("signal") || filename.contains("traffic")) {
                detectedCategory = "Traffic Signal Damage";
                confidence = 92;
            } else if (filename.contains("sewage") || filename.contains("sewer") || filename.contains("overflow")) {
                detectedCategory = "Sewage Overflow";
                confidence = 97;
            } else if (filename.contains("footpath") || filename.contains("sidewalk") || filename.contains("pavement")) {
                detectedCategory = "Damaged Footpath";
                confidence = 92;
            }

            // Step 2b: Pixel-based heuristic detection (if filename has no keyword)
            if (detectedCategory == null) {
                try (ByteArrayInputStream imageInput = new ByteArrayInputStream(bytes)) {
                    BufferedImage img = ImageIO.read(imageInput);
                    if (img != null) {
                        int greenPixels = 0;
                        int grayPixels = 0;
                        int bluePixels = 0;
                        int darkPixels = 0;
                        int totalPixels = 0;
                        
                        // Sample pixels in steps of 15 for speed
                        for (int y = 0; y < img.getHeight(); y += 15) {
                            for (int x = 0; x < img.getWidth(); x += 15) {
                                int rgb = img.getRGB(x, y);
                                int r = (rgb >> 16) & 0xFF;
                                int g = (rgb >> 8) & 0xFF;
                                int b = rgb & 0xFF;
                                totalPixels++;
                                
                                // Detect green (vegetation / trees)
                                if (g > 1.25 * r && g > 1.25 * b && g > 55) {
                                    greenPixels++;
                                }
                                // Detect gray (asphalt, concrete roads)
                                if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15 && r > 40 && r < 185) {
                                    grayPixels++;
                                }
                                // Detect blue/cyan (water pool / pipe burst)
                                if (b > 1.25 * r && b > 1.15 * g && b > 60) {
                                    bluePixels++;
                                }
                                // Detect dark (night / broken lights)
                                int brightness = (r + g + b) / 3;
                                if (brightness < 45) {
                                    darkPixels++;
                                }
                            }
                        }
                        
                        double greenRatio = (double) greenPixels / totalPixels;
                        double grayRatio = (double) grayPixels / totalPixels;
                        double blueRatio = (double) bluePixels / totalPixels;
                        double darkRatio = (double) darkPixels / totalPixels;

                        if (greenRatio > 0.35) {
                            detectedCategory = "Fallen Tree";
                            confidence = 78;
                        } else if (grayRatio > 0.40) {
                            detectedCategory = "Road Damage";
                            confidence = 82;
                        } else if (blueRatio > 0.20) {
                            detectedCategory = "Water Leakage";
                            confidence = 75;
                        } else if (darkRatio > 0.65) {
                            detectedCategory = "Street Light Failure";
                            confidence = 80;
                        }
                    }
                } catch (Exception ex) {
                    System.err.println("Pixel scanning failed: " + ex.getMessage());
                }
            }

            // Step 2c: Defaulting to Unknown if confidence < 60% or not detected
            if (detectedCategory == null) {
                detectedCategory = "Unknown Issue";
                confidence = 50;
            }

            result.setCategory(detectedCategory);
            result.setConfidence(confidence);

            // Step 3: Map category to department & priority
            mapMetadata(result);
            
        } catch (Exception e) {
            System.err.println("Image analysis failed completely: " + e.getMessage());
            result.setCategory("Unknown Issue");
            result.setConfidence(30);
            result.setCaptureTime(LocalDateTime.now());
            mapMetadata(result);
        }

        return result;
    }

    private void mapMetadata(ImageAnalysisResult result) {
        String category = result.getCategory();
        if (category == null || category.equalsIgnoreCase("Unknown Issue")) {
            result.setSuggestedDepartment("General City Administration");
            result.setPriority("Medium");
            return;
        }

        switch (category) {
            case "Pothole":
                result.setSuggestedDepartment("Roads & Buildings");
                result.setPriority("High");
                break;
            case "Road Damage":
                result.setSuggestedDepartment("Public Works Department");
                result.setPriority("High");
                break;
            case "Garbage":
                result.setSuggestedDepartment("Sanitation & Waste Management");
                result.setPriority("Medium");
                break;
            case "Illegal Dumping":
                result.setSuggestedDepartment("Sanitation & Waste Management");
                result.setPriority("Medium");
                break;
            case "Construction Waste":
                result.setSuggestedDepartment("Sanitation & Waste Management");
                result.setPriority("Low");
                break;
            case "Water Leakage":
                result.setSuggestedDepartment("Water Supply & Sewage Board");
                result.setPriority("Medium");
                break;
            case "Broken Drain":
                result.setSuggestedDepartment("Water Supply & Sewage Board");
                result.setPriority("High");
                break;
            case "Open Manhole":
                result.setSuggestedDepartment("Water Supply & Sewage Board");
                result.setPriority("Emergency");
                break;
            case "Sewage Overflow":
                result.setSuggestedDepartment("Water Supply & Sewage Board");
                result.setPriority("Emergency");
                break;
            case "Fallen Tree":
                result.setSuggestedDepartment("Horticulture & Parks");
                result.setPriority("Medium");
                break;
            case "Street Light Failure":
                result.setSuggestedDepartment("Electricity & Lighting Department");
                result.setPriority("Low");
                break;
            case "Electric Pole Damage":
                result.setSuggestedDepartment("Electricity Distribution Corp");
                result.setPriority("Emergency");
                break;
            case "Traffic Signal Damage":
                result.setSuggestedDepartment("Traffic Control & Police");
                result.setPriority("High");
                break;
            case "Damaged Footpath":
                result.setSuggestedDepartment("Public Works Department");
                result.setPriority("Low");
                break;
            default:
                result.setSuggestedDepartment("General City Administration");
                result.setPriority("Medium");
                break;
        }
    }
}
