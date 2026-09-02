package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.HasTenancy;
import com.example.digitalhousingplatform.repository.HasTenancyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hastenancies")
public class HasTenancyController {

    @Autowired
    private HasTenancyRepository hasTenancyRepository;

    @GetMapping
    public List<HasTenancy> listHasTenancies() {
        return hasTenancyRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addHasTenancy(@RequestBody HasTenancy hasTenancy) {

        List<HasTenancy> tenancies = hasTenancyRepository.findAll();

        boolean hasActiveTenancy = tenancies.stream().anyMatch(
                t -> t.getTenantId() == hasTenancy.getTenantId()
                        && t.getLeaveDate() == null
        );

        if (hasActiveTenancy) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "This tenant already has an active property. Leave the current property before joining another one."));
        }

        return ResponseEntity.ok(hasTenancyRepository.save(hasTenancy));
    }

    @PutMapping("/leave")
    public ResponseEntity<?> leaveProperty(@RequestBody Map<String, Integer> request) {

        Integer tenantId = request.get("tenantId");
        Integer propertyId = request.get("propertyId");

        if (tenantId == null || propertyId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "tenantId and propertyId are required."));
        }

        HasTenancy tenancy = hasTenancyRepository.findAll().stream()
                .filter(t -> t.getTenantId() == tenantId
                        && t.getPropertyId() == propertyId
                        && t.getLeaveDate() == null)
                .findFirst()
                .orElse(null);

        if (tenancy == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "No active tenancy found."));
        }

        tenancy.setLeaveDate(LocalDate.now());
        hasTenancyRepository.save(tenancy);

        return ResponseEntity.ok(Map.of("message", "Left property successfully."));
    }
}