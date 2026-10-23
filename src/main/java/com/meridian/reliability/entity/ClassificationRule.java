package com.meridian.reliability.entity;

import com.meridian.reliability.domain.Classification;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "classification_rule", uniqueConstraints =
        @UniqueConstraint(name = "uk_classification_rule_status", columnNames = "status"))
@Getter @Setter @NoArgsConstructor
public class ClassificationRule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 80)
    private String status;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Classification classification;

    public ClassificationRule(String status, Classification classification) {
        this.status = status;
        this.classification = classification;
    }
}
