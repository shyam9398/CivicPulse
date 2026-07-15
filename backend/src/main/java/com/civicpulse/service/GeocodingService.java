package com.civicpulse.service;

import com.civicpulse.dto.AddressDetails;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeocodingService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AddressDetails reverseGeocode(double latitude, double longitude) {
        AddressDetails details = new AddressDetails();
        try {
            String url = String.format("https://nominatim.openstreetmap.org/reverse?format=json&lat=%f&lon=%f&zoom=18&addressdetails=1", latitude, longitude);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "CivicPulse/1.0 (burla@example.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                
                String displayAddress = root.path("display_name").asText("");
                details.setDisplayAddress(displayAddress);
                
                JsonNode addr = root.path("address");
                if (!addr.isMissingNode()) {
                    details.setHouseNumber(addr.path("house_number").asText(""));
                    details.setStreet(addr.path("road").asText(""));
                    
                    String area = addr.path("suburb").asText("");
                    if (area.isEmpty()) area = addr.path("neighbourhood").asText("");
                    if (area.isEmpty()) area = addr.path("quarter").asText("");
                    if (area.isEmpty()) area = addr.path("city_district").asText("");
                    details.setArea(area);
                    
                    String village = addr.path("village").asText("");
                    if (village.isEmpty()) village = addr.path("hamlet").asText("");
                    if (village.isEmpty()) village = addr.path("isolated_dwelling").asText("");
                    details.setVillage(village);
                    
                    String city = addr.path("city").asText("");
                    if (city.isEmpty()) city = addr.path("town").asText("");
                    if (city.isEmpty()) city = addr.path("municipality").asText("");
                    if (city.isEmpty()) city = village;
                    details.setCity(city);
                    
                    String district = addr.path("state_district").asText("");
                    if (district.isEmpty()) district = addr.path("county").asText("");
                    if (district.isEmpty()) district = addr.path("district").asText("");
                    details.setDistrict(district);
                    
                    details.setState(addr.path("state").asText(""));
                    details.setCountry(addr.path("country").asText(""));
                    details.setPincode(addr.path("postcode").asText(""));
                }
            }
        } catch (Exception e) {
            System.err.println("Geocoding failed: " + e.getMessage());
            details.setDisplayAddress(String.format("Lat: %f, Lng: %f", latitude, longitude));
        }
        return details;
    }
}
