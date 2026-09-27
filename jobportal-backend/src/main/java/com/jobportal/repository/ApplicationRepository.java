package com.jobportal.repository;

import com.jobportal.entity.Application;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ApplicationRepository
        extends MongoRepository<Application, String> {

    List<Application> findByUserId(String userId);

    List<Application> findByJobId(String jobId);
}