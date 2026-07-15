package com.civicpulse.security;

import java.util.Date;
import java.security.Key;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import com.civicpulse.entity.User;

@Component
public class JwtTokenProvider {

    // Must be at least 256 bits (32 characters) for HS256
    private static final String SECRET_STRING = "civicpulsesupersecretjwtkeythatisextremelylongandsecureforproductionuse2026";
    private final Key key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes());
    
    // 24 hours expiration
    private static final long EXPIRATION_TIME = 86400000;

    public String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
