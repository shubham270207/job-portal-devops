package com.jobportal.auth;

import com.jobportal.entity.User;
import com.jobportal.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        if (request == null) {
            return ResponseEntity.badRequest().body("Request body is required");
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Full name is required");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty() || !request.getEmail().contains("@")) {
            return ResponseEntity.badRequest().body("Valid email address is required");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User existing = userService.findByEmail(normalizedEmail);

        if (existing != null) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }

        String role = (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN")) ? "ADMIN" : "USER";

        User user = userService.register(
                request.getName().trim(),
                normalizedEmail,
                request.getPassword(),
                role
        );

        // Hide password from API response
        user.setPassword(null);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        if (request == null) {
            return ResponseEntity.badRequest().body("Request body is required");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userService.findByEmail(normalizedEmail);

        if (user == null) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        boolean passwordMatch =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatch) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        // Enforce role-based access: user must log in with their registered role
        String requestedRole = (request.getRole() != null && !request.getRole().trim().isEmpty())
                ? request.getRole().trim().toUpperCase()
                : null;

        String userRole = user.getRole() != null ? user.getRole().toUpperCase() : "USER";

        if (requestedRole != null && !requestedRole.equals(userRole)) {
            if ("ADMIN".equals(requestedRole)) {
                return ResponseEntity
                        .status(403)
                        .body("Access denied. You are not authorized to access the Admin Portal. Please use the Candidate Portal.");
            } else {
                return ResponseEntity
                        .status(403)
                        .body("Access denied. You are not authorized to access the Candidate Portal. Please use the Admin Portal.");
            }
        }

        String token =
                jwtService.generateToken(user.getEmail(), userRole);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login successful");
        response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", userRole);
        response.put("userId", user.getId());

        return ResponseEntity.ok(response);
    }
}