package com.meridian.reliability.exception;

public class RetryNotAllowedException extends RuntimeException {
    public RetryNotAllowedException(String message) { super(message); }
}
