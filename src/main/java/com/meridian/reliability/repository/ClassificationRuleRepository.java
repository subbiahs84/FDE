package com.meridian.reliability.repository;

import com.meridian.reliability.entity.ClassificationRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClassificationRuleRepository extends JpaRepository<ClassificationRule, Long> {
    Optional<ClassificationRule> findByStatusIgnoreCase(String status);
}
