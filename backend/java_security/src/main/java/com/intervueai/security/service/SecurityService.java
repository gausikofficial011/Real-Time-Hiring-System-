package com.intervueai.security.service;

import com.intervueai.security.model.SecurityCheck;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class SecurityService {

    private static final String SECRET_KEY = "IntervueAI-Secret-Key-123";
    private static final String ALGORITHM = "AES";
    
    // In-memory session storage (in production, use Redis or database)
    private Map<String, SecurityCheck> sessionStore = new HashMap<>();
    private Map<String, String> deviceBindings = new HashMap<>();

    public SecurityCheck validateSession(SecurityCheck securityCheck) {
        SecurityCheck result = new SecurityCheck();
        result.setUserId(securityCheck.getUserId());
        result.setSessionId(securityCheck.getSessionId());
        result.setTimestamp(System.currentTimeMillis());

        // Check if session exists
        if (sessionStore.containsKey(securityCheck.getSessionId())) {
            SecurityCheck stored = sessionStore.get(securityCheck.getSessionId());
            if (stored.getUserId().equals(securityCheck.getUserId())) {
                result.setValid(true);
                result.setMessage("Session validated successfully");
            } else {
                result.setValid(false);
                result.setMessage("Session user mismatch");
                result.setViolationType("session_hijack_attempt");
            }
        } else {
            result.setValid(false);
            result.setMessage("Session not found");
            result.setViolationType("invalid_session");
        }

        return result;
    }

    public SecurityCheck checkDeviceBinding(SecurityCheck securityCheck) {
        SecurityCheck result = new SecurityCheck();
        result.setUserId(securityCheck.getUserId());
        result.setDeviceId(securityCheck.getDeviceId());
        result.setTimestamp(System.currentTimeMillis());

        // Check device binding
        if (deviceBindings.containsKey(securityCheck.getUserId())) {
            String boundDevice = deviceBindings.get(securityCheck.getUserId());
            if (boundDevice.equals(securityCheck.getDeviceId())) {
                result.setValid(true);
                result.setMessage("Device binding validated");
            } else {
                result.setValid(false);
                result.setMessage("Device mismatch detected");
                result.setViolationType("device_mismatch");
            }
        } else {
            // First time, bind the device
            deviceBindings.put(securityCheck.getUserId(), securityCheck.getDeviceId());
            result.setValid(true);
            result.setMessage("Device bound successfully");
        }

        return result;
    }

    public SecurityCheck detectAnomaly(SecurityCheck securityCheck) {
        SecurityCheck result = new SecurityCheck();
        result.setUserId(securityCheck.getUserId());
        result.setTimestamp(System.currentTimeMillis());

        // Simulated anomaly detection
        // In production, use ML models for behavior analysis
        boolean anomalyDetected = false;
        String anomalyType = null;

        // Check for rapid session changes
        if (securityCheck.getAdditionalData() != null) {
            Map<String, Object> data = (Map<String, Object>) securityCheck.getAdditionalData();
            if (data.containsKey("loginAttempts")) {
                int attempts = (Integer) data.get("loginAttempts");
                if (attempts > 5) {
                    anomalyDetected = true;
                    anomalyType = "brute_force_attempt";
                }
            }
        }

        result.setValid(!anomalyDetected);
        if (anomalyDetected) {
            result.setViolationType(anomalyType);
            result.setMessage("Security anomaly detected: " + anomalyType);
        } else {
            result.setMessage("No anomalies detected");
        }

        return result;
    }

    public SecurityCheck calculateIntegrityScore(SecurityCheck securityCheck) {
        SecurityCheck result = new SecurityCheck();
        result.setUserId(securityCheck.getUserId());
        result.setInterviewId(securityCheck.getInterviewId());
        result.setTimestamp(System.currentTimeMillis());

        // Calculate integrity score based on violations
        int baseScore = 100;
        
        if (securityCheck.getAdditionalData() != null) {
            Map<String, Object> data = (Map<String, Object>) securityCheck.getAdditionalData();
            if (data.containsKey("violations")) {
                int violations = (Integer) data.get("violations");
                baseScore -= (violations * 10);
            }
            if (data.containsKey("severity")) {
                String severity = (String) data.get("severity");
                switch (severity) {
                    case "low":
                        baseScore -= 5;
                        break;
                    case "medium":
                        baseScore -= 10;
                        break;
                    case "high":
                        baseScore -= 20;
                        break;
                    case "critical":
                        baseScore -= 40;
                        break;
                }
            }
        }

        result.setIntegrityScore(Math.max(0, baseScore));
        result.setValid(result.getIntegrityScore() >= 60);
        result.setMessage("Integrity score calculated: " + result.getIntegrityScore());

        return result;
    }

    public String encryptData(String data) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            byte[] encryptedBytes = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decryptData(String encryptedData) {
        try {
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    public String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public boolean checkPassword(String password, String hashedPassword) {
        return BCrypt.checkpw(password, hashedPassword);
    }
}
