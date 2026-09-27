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

        User existing =
                userService.findByEmail(request.getEmail());

        if (existing != null) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }

        User user = userService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        User user =
                userService.findByEmail(request.getEmail());

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

        String token =
                jwtService.generateToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login successful");
        response.put("token", token);
        response.put("name", user.getName());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}