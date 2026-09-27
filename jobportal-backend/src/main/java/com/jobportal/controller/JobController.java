package com.jobportal.controller;

import com.jobportal.entity.Job;
import com.jobportal.service.JobService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public Job createJob(@RequestBody Job job) {
        return jobService.createJob(job);
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