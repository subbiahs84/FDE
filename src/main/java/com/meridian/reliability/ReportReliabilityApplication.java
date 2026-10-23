package com.meridian.reliability;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@SpringBootApplication
@EnableRetry
public class ReportReliabilityApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReportReliabilityApplication.class, args);
    }
}
