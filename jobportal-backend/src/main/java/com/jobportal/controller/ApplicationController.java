package com.jobportal.controller;

import com.jobportal.entity.Application;
import com.jobportal.entity.Job;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    public ApplicationController(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
    }

    @PostMapping
    public ResponseEntity<?> apply(@RequestBody Application application) {
        if (application == null) {
            return ResponseEntity.badRequest().body("Application data is required");
        }

        if (application.getJobId() == null || application.getJobId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Job ID is required");
        }

        if (application.getUserId() == null || application.getUserId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("User ID is required");
        }

        application.setJobId(application.getJobId().trim());
        application.setUserId(application.getUserId().trim());

        // Check if user already applied to this specific job
        List<Application> userApps = applicationRepository.findByUserId(application.getUserId());
        boolean alreadyApplied = userApps.stream()
                .anyMatch(a -> application.getJobId().equals(a.getJobId()));

        if (alreadyApplied) {
            return ResponseEntity.badRequest().body("You have already applied for this job");
        }

        // Enrich with Job Title and Company if not provided
        if (application.getJobTitle() == null || application.getJobCompany() == null) {
            Job job = jobRepository.findById(application.getJobId()).orElse(null);
            if (job != null) {
                if (application.getJobTitle() == null) {
                    application.setJobTitle(job.getTitle());
                }
                if (application.getJobCompany() == null) {
                    application.setJobCompany(job.getCompany());
                }
            }
        }

        if (application.getStatus() == null || application.getStatus().trim().isEmpty()) {
            application.setStatus("APPLIED");
        }

        if (application.getApplicationDate() == null || application.getApplicationDate().trim().isEmpty()) {
            application.setApplicationDate(java.time.Instant.now().toString());
        }

        Application saved = applicationRepository.save(application);
        return ResponseEntity.ok(saved);
    }

    // Admin endpoint: view all applications across all jobs
    @GetMapping
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    // Admin endpoint: Accept, Reject, or Review application
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        Application application = applicationRepository.findById(id).orElse(null);
        if (application == null) {
            return ResponseEntity.notFound().build();
        }

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Status is required (e.g. ACCEPTED, REJECTED, UNDER_REVIEW)");
        }

        application.setStatus(newStatus.trim().toUpperCase());

        if (body.containsKey("adminFeedback")) {
            application.setAdminFeedback(body.get("adminFeedback"));
        }

        application.setReviewDate(java.time.Instant.now().toString());

        Application updated = applicationRepository.save(application);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/user/{userId}")
    public List<Application> getUserApplications(
            @PathVariable String userId) {

        List<Application> apps = applicationRepository.findByUserIdOrApplicantEmail(userId, userId);
        if (apps == null || apps.isEmpty()) {
            apps = applicationRepository.findByUserId(userId);
        }
        return apps;
    }

    @GetMapping("/job/{jobId}")
    public List<Application> getJobApplications(
            @PathVariable String jobId) {

        return applicationRepository.findByJobId(jobId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApplication(@PathVariable String id) {
        if (!applicationRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        applicationRepository.deleteById(id);
        return ResponseEntity.ok("Application deleted successfully");
    }
}