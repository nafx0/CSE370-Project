package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.Landlord;
import com.example.digitalhousingplatform.model.Tenant;
import com.example.digitalhousingplatform.model.User;
import com.example.digitalhousingplatform.repository.LandlordRepository;
import com.example.digitalhousingplatform.repository.TenantRepository;
import com.example.digitalhousingplatform.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LandlordRepository landlordRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        User existing = userRepository.findByEmail(user.getEmail());
        if (existing != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists."));
        }

        User savedUser = userRepository.save(user);

        if ("landlord".equalsIgnoreCase(savedUser.getRole())) {
            Landlord landlord = new Landlord();
            landlord.setUserId(savedUser.getUserId());
            landlordRepository.save(landlord);
        } else if ("tenant".equalsIgnoreCase(savedUser.getRole())) {
            Tenant tenant = new Tenant();
            tenant.setUserId(savedUser.getUserId());
            tenantRepository.save(tenant);
        }

        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser, HttpSession session) {
        User user = userRepository.findByEmail(loginUser.getEmail());

        if (user == null || !user.getPassword().equals(loginUser.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }

        session.setAttribute("loggedInUser", user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }
        return ResponseEntity.ok(user);
    }
}