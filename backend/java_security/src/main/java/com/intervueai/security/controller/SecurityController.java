package com.intervueai.security.controller;

import com.intervueai.security.model.SecurityCheck;
import com.intervueai.security.service.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/security/java")
@CrossOrigin(origins = "*")
public class SecurityController {

    @Autowired
    private SecurityService securityService;

    @PostMapping("/validate-session")
    public SecurityCheck validateSession(@RequestBody SecurityCheck securityCheck) {
        return securityService.validateSession(securityCheck);
    }

    @PostMapping("/check-device-binding")
    public SecurityCheck checkDeviceBinding(@RequestBody SecurityCheck securityCheck) {
        return securityService.checkDeviceBinding(securityCheck);
    }

    @PostMapping("/detect-anomaly")
    public SecurityCheck detectAnomaly(@RequestBody SecurityCheck securityCheck) {
        return securityService.detectAnomaly(securityCheck);
    }

    @PostMapping("/calculate-integrity-score")
    public SecurityCheck calculateIntegrityScore(@RequestBody SecurityCheck securityCheck) {
        return securityService.calculateIntegrityScore(securityCheck);
    }

    @PostMapping("/encrypt-data")
    public String encryptData(@RequestBody String data) {
        return securityService.encryptData(data);
    }

    @PostMapping("/decrypt-data")
    public String decryptData(@RequestBody String encryptedData) {
        return securityService.decryptData(encryptedData);
    }
}
