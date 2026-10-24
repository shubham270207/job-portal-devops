package com.jobportal.controller;

import com.jobportal.entity.Job;
import com.jobportal.service.JobService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        if (job == null) {
            return ResponseEntity.badRequest().body("Job data is required");
        }
        if (job.getTitle() == null || job.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Job title is required");
        }
        if (job.getCompany() == null || job.getCompany().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Company name is required");
        }
        if (job.getLocation() == null || job.getLocation().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Location is required");
        }
        if (job.getSalary() == null || job.getSalary().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Salary is required");
        }
        if (job.getSkills() == null || job.getSkills().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Skills are required");
        }

        job.setTitle(job.getTitle().trim());
        job.setCompany(job.getCompany().trim());
        job.setLocation(job.getLocation().trim());
        job.setSalary(job.getSalary().trim());
        job.setSkills(job.getSkills().trim());
        if (job.getDescription() != null) {
            job.setDescription(job.getDescription().trim());
        }

        Job created = jobService.createJob(job);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/{id}")
    public Job getJob(@PathVariable String id) {
        return jobService.getJobById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteJob(@PathVariable String id) {
        jobService.deleteJob(id);
        return "Job deleted successfully";
    }

    @GetMapping("/search/title")
    public List<Job> searchByTitle(@RequestParam String title) {
        return jobService.searchByTitle(title);
    }

    @GetMapping("/search/location")
    public List<Job> searchByLocation(@RequestParam String location) {
        return jobService.searchByLocation(location);
    }
}