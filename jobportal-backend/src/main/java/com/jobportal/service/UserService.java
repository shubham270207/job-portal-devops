package com.jobportal.service;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(
            String name,
            String email,
            String password) {

        User user = new User();

        user.setName(name);
        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(password)
        );

        user.setRole("USER");

        return userRepository.save(user);
    }

    public User findByEmail(String email) {

        return userRepository
                .findByEmail(email)
                .orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}