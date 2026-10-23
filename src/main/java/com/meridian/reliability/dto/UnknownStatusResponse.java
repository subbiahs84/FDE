package com.meridian.reliability.dto;

import java.util.List;

public record UnknownStatusResponse(String status, long occurrences, List<Long> attemptIds) { }
