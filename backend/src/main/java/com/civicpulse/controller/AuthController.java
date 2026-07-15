package com.civicpulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.civicpulse.dto.LoginRequest;
import com.civicpulse.dto.SignupRequest;
import com.civicpulse.dto.AuthResponse;
import com.civicpulse.entity.User;
import com.civicpulse.service.UserService;
import com.civicpulse.security.JwtTokenProvider;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SignupRequest request){
        try {
            User user = userService.registerUser(request);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.civicpulse.dto.ErrorMsg(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){
        try {
            User user = userService.loginUser(request);
            String token = jwtTokenProvider.generateToken(user);
            AuthResponse response = new AuthResponse(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getPhoneNumber(),
                    user.getRole()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.civicpulse.dto.ErrorMsg(e.getMessage()));
        }
    }

    @GetMapping("/users")
    public Object users(){
        return userService.getAllUsers();
    }
}