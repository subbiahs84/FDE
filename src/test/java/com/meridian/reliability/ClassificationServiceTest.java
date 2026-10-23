package com.meridian.reliability;

import com.meridian.reliability.classifier.ClassificationService;
import com.meridian.reliability.domain.Classification;
import com.meridian.reliability.entity.ClassificationRule;
import com.meridian.reliability.repository.ClassificationRuleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClassificationServiceTest {
    @Mock ClassificationRuleRepository rules;
    @InjectMocks ClassificationService classifier;

    @Test
    void classifiesUsingTheConfiguredRule() {
        when(rules.findByStatusIgnoreCase("NETWORK_ERROR"))
                .thenReturn(Optional.of(new ClassificationRule("NETWORK_ERROR", Classification.RETRYABLE_FAILURE)));

        assertThat(classifier.classify(" network_error ")).isEqualTo(Classification.RETRYABLE_FAILURE);
    }

    @Test
    void missingRuleAndBlankInputRemainUnknown() {
        when(rules.findByStatusIgnoreCase("UNRECOGNIZED")).thenReturn(Optional.empty());

        assertThat(classifier.classify("UNRECOGNIZED")).isEqualTo(Classification.UNKNOWN);
        assertThat(classifier.classify(" ")).isEqualTo(Classification.UNKNOWN);
        assertThat(classifier.classify(null)).isEqualTo(Classification.UNKNOWN);
    }
}
