package com.meridian.reliability.classifier;

import com.meridian.reliability.domain.Classification;
import com.meridian.reliability.repository.ClassificationRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ClassificationService {
    private final ClassificationRuleRepository rules;

    public Classification classify(String status) {
        if (status == null || status.isBlank()) return Classification.UNKNOWN;
        return rules.findByStatusIgnoreCase(status.trim().toUpperCase(Locale.ROOT))
                .map(rule -> rule.getClassification())
                .orElse(Classification.UNKNOWN);
    }
}
