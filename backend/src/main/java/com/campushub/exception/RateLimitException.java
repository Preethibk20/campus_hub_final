package com.campushub.exception;

public class RateLimitException extends RuntimeException {
    private final long retryAfterSeconds;

    public RateLimitException(long retryAfterSeconds) {
        super("Too many requests. Retry after " + retryAfterSeconds + " seconds.");
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}


