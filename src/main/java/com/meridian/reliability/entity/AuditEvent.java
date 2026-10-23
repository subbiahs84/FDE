package com.meridian.reliability.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "audit_event", indexes = @Index(name = "idx_audit_created", columnList = "created_timestamp"))
@Getter @Setter @NoArgsConstructor
public class AuditEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "event_type", nullable = false, length = 80)
    private String eventType;
    @Column(nullable = false, length = 1000)
    private String description;
    @Column(name = "created_timestamp", nullable = false)
    private Instant createdTimestamp;

    public AuditEvent(String eventType, String description) {
        this.eventType = eventType;
        this.description = description;
        this.createdTimestamp = Instant.now();
    }
}
