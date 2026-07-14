package com.civicpulse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.civicpulse.dto.LoginRequest;
import com.civicpulse.dto.SignupRequest;
import com.civicpulse.entity.User;
import com.civicpulse.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody SignupRequest request){

        return userService.registerUser(request);

    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request){

        return userService.loginUser(request);

    }

    @GetMapping("/users")
    public Object users(){

        return userService.getAllUsers();

    }

}