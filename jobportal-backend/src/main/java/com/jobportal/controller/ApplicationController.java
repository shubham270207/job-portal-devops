package com.jobportal.controller;

import com.jobportal.entity.Application;
import com.jobportal.repository.ApplicationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;

    public ApplicationController(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    @PostMapping
    public Application apply(@RequestBody Application application) {

        if (application.getStatus() == null) {
            application.setStatus("APPLIED");
        }

        return applicationRepository.save(application);
    }

    @GetMapping("/user/{userId}")
    public List<Application> getUserApplications(
            @PathVariable String userId) {

        return applicationRepository.findByUserId(userId);
    }

    @GetMapping("/job/{jobId}")
    public List<Application> getJobApplications(
            @PathVariable String jobId) {

        return applicationRepository.findByJobId(jobId);
    }
}