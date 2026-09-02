package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.HasTenancy;
import com.example.digitalhousingplatform.model.JoinCode;
import com.example.digitalhousingplatform.model.Property;
import com.example.digitalhousingplatform.model.Tenant;
import com.example.digitalhousingplatform.repository.HasTenancyRepository;
import com.example.digitalhousingplatform.repository.JoinCodeRepository;
import com.example.digitalhousingplatform.repository.PropertyRepository;
import com.example.digitalhousingplatform.repository.TenantRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/joincodes")
public class JoinCodeController {

    @Autowired
    private JoinCodeRepository joinCodeRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HasTenancyRepository hasTenancyRepository;

    private static final String CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    private final SecureRandom random = new SecureRandom();

    @GetMapping
    public List<JoinCode> listJoinCodes() {
        return joinCodeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<JoinCode> getJoinCode(@PathVariable int id) {
        return joinCodeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateJoinCode(@RequestBody Map<String, Integer> request) {

        Integer propertyId = request.get("propertyId");

        if (propertyId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Property ID is required."));
        }

        Property property = propertyRepository.findById(propertyId).orElse(null);

        if (property == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Property not found."));
        }

        String code;

        do {
            code = generateCode();
        } while (joinCodeRepository.findByCodeValue(code).isPresent());

        JoinCode joinCode = new JoinCode();
        joinCode.setPropertyId(propertyId);
        joinCode.setCodeValue(code);
        joinCode.setGeneratedDate(LocalDate.now());
        joinCode.setExpiryDate(LocalDate.now().plusDays(7));
        joinCode.setStatus("ACTIVE");

        JoinCode saved = joinCodeRepository.save(joinCode);

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinProperty(@RequestBody Map<String, Object> request) {

        Object tenantIdObject = request.get("tenantId");
        Object codeObject = request.get("code");

        if (tenantIdObject == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Tenant ID is required."));
        }

        if (codeObject == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Join code is required."));
        }

        int tenantId;

        try {
            tenantId = Integer.parseInt(tenantIdObject.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid tenant ID."));
        }

        String code = codeObject.toString().trim().toUpperCase();

        if (code.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Join code is required."));
        }

        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);

        if (tenant == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Tenant not found."));
        }

        JoinCode joinCode = joinCodeRepository.findByCodeValue(code).orElse(null);

        if (joinCode == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid join code."));
        }

        if (!"ACTIVE".equalsIgnoreCase(joinCode.getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "This join code is inactive."));
        }

        if (joinCode.getExpiryDate() != null &&
                joinCode.getExpiryDate().isBefore(LocalDate.now())) {

            joinCode.setStatus("EXPIRED");
            joinCodeRepository.save(joinCode);

            return ResponseEntity.badRequest().body(Map.of("error", "This join code has expired."));
        }

        int propertyId = joinCode.getPropertyId();

        Property property = propertyRepository.findById(propertyId).orElse(null);

        if (property == null) {
            return ResponseEntity.status(404).body(
                    Map.of("error", "The property associated with this code no longer exists."));
        }

        List<HasTenancy> tenantTenancies = hasTenancyRepository.findAll();

        boolean alreadyInProperty = tenantTenancies.stream().anyMatch(
                tenancy -> tenancy.getTenantId() == tenantId
                        && tenancy.getPropertyId() == propertyId
                        && tenancy.getLeaveDate() == null
        );

        if (alreadyInProperty) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "You are already a tenant of this property."));
        }

        boolean hasActiveTenancy = tenantTenancies.stream().anyMatch(
                tenancy -> tenancy.getTenantId() == tenantId
                        && tenancy.getLeaveDate() == null
        );

        if (hasActiveTenancy) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "You already have an active property. Leave your current property before joining another one."));
        }

        HasTenancy tenancy = new HasTenancy();
        tenancy.setTenantId(tenantId);
        tenancy.setPropertyId(propertyId);
        tenancy.setJoinDate(LocalDate.now());
        tenancy.setLeaveDate(null);

        HasTenancy savedTenancy = hasTenancyRepository.save(tenancy);

        // NOTE: code stays ACTIVE — it's reusable by every tenant of this property
        // until expiry or manual revocation. No status/usedByTenantId mutation here.

        return ResponseEntity.ok(
                Map.of(
                        "message", "Property joined successfully.",
                        "propertyId", propertyId,
                        "tenantId", tenantId,
                        "joinDate", savedTenancy.getJoinDate()
                )
        );
    }

    @PostMapping
    public JoinCode addJoinCode(@RequestBody JoinCode joinCode) {

        if (joinCode.getGeneratedDate() == null) {
            joinCode.setGeneratedDate(LocalDate.now());
        }

        if (joinCode.getStatus() == null) {
            joinCode.setStatus("ACTIVE");
        }

        return joinCodeRepository.save(joinCode);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJoinCode(@PathVariable int id) {

        if (!joinCodeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        joinCodeRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    private String generateCode() {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            int index = random.nextInt(CHARACTERS.length());
            builder.append(CHARACTERS.charAt(index));
        }
        return builder.toString();
    }
}