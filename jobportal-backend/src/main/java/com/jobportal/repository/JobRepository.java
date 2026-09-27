package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface JobRepository extends MongoRepository<Job, String> {

    List<Job> findByTitleContainingIgnoreCase(String title);

    List<Job> findByLocationContainingIgnoreCase(String location);
}