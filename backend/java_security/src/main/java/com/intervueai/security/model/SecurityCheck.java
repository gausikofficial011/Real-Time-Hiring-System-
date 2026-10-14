package com.intervueai.security.model;

import lombok.Data;

@Data
public class SecurityCheck {
    private String userId;
    private String deviceId;
    private String sessionId;
    private String interviewId;
    private boolean isValid;
    private String violationType;
    private int integrityScore;
    private String message;
    private long timestamp;
    private Object additionalData;
}
