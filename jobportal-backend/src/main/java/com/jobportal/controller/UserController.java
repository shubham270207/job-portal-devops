package com.jobportal.controller;

import com.jobportal.entity.User;
import com.jobportal.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {

        List<User> users = userService.getAllUsers();

        for (User user : users) {
            user.setPassword(null);
        }

        return users;
    }
}