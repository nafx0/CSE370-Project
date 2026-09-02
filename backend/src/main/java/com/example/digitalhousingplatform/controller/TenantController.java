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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private HasTenancyRepository hasTenancyRepository;

    @Autowired
    private JoinCodeRepository joinCodeRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    // ------------------------------------------------------------
    // GET ALL TENANTS
    // ------------------------------------------------------------

    @GetMapping
    public List<Tenant> listTenants() {
        return tenantRepository.findAll();
    }

    // ------------------------------------------------------------
    // GET TENANT BY USER ID
    // ------------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenant(@PathVariable int id) {
        return tenantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ------------------------------------------------------------
    // GET CURRENT TENANT PROPERTY
    // ------------------------------------------------------------

    @GetMapping("/{tenantId}/property")
    public ResponseEntity<?> getCurrentProperty(
            @PathVariable int tenantId
    ) {

        Optional<HasTenancy> tenancy =
                hasTenancyRepository.findActiveTenancyByTenantId(tenantId);

        if (tenancy.isEmpty()) {
            return ResponseEntity.ok(
                    Map.of(
                            "hasProperty", false,
                            "message", "You have not joined a property yet."
                    )
            );
        }

        HasTenancy activeTenancy = tenancy.get();

        Optional<Property> property =
                propertyRepository.findById(activeTenancy.getPropertyId());

        if (property.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of("error", "Property associated with your tenancy was not found.")
            );
        }

        return ResponseEntity.ok(
                Map.of(
                        "hasProperty", true,
                        "property", property.get(),
                        "tenancy", activeTenancy
                )
        );
    }

    // ------------------------------------------------------------
    // GET TENANT TENANCY HISTORY
    // ------------------------------------------------------------

    @GetMapping("/{tenantId}/tenancies")
    public ResponseEntity<List<HasTenancy>> getTenantTenancies(
            @PathVariable int tenantId
    ) {

        return ResponseEntity.ok(
                hasTenancyRepository.findByTenantId(tenantId)
        );
    }

    // ------------------------------------------------------------
    // JOIN PROPERTY USING CODE
    // ------------------------------------------------------------

    @PostMapping("/{tenantId}/join")
    @Transactional
    public ResponseEntity<?> joinProperty(
            @PathVariable int tenantId,
            @RequestBody Map<String, String> request
    ) {

        // --------------------------------------------------------
        // CHECK TENANT
        // --------------------------------------------------------

        Optional<Tenant> tenant =
                tenantRepository.findById(tenantId);

        if (tenant.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of("error", "Tenant account not found.")
            );
        }

        // --------------------------------------------------------
        // GET CODE
        // --------------------------------------------------------

        String codeValue = request.get("code");

        if (codeValue == null || codeValue.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Please enter a property join code.")
            );
        }

        codeValue = codeValue.trim();

        // --------------------------------------------------------
        // FIND JOIN CODE
        // --------------------------------------------------------

        Optional<JoinCode> codeOptional =
                joinCodeRepository.findByCodeValue(codeValue);

        if (codeOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Invalid property join code.")
            );
        }

        JoinCode joinCode = codeOptional.get();

        // --------------------------------------------------------
        // CHECK CODE STATUS
        // --------------------------------------------------------

        if (joinCode.getStatus() == null ||
                !joinCode.getStatus().equalsIgnoreCase("ACTIVE")) {

            return ResponseEntity.badRequest().body(
                    Map.of("error", "This join code is no longer active.")
            );
        }

        // --------------------------------------------------------
        // CHECK EXPIRY
        // --------------------------------------------------------

        if (joinCode.getExpiryDate() != null &&
                joinCode.getExpiryDate().isBefore(LocalDate.now())) {

            joinCode.setStatus("EXPIRED");
            joinCodeRepository.save(joinCode);

            return ResponseEntity.badRequest().body(
                    Map.of("error", "This join code has expired.")
            );
        }

        // --------------------------------------------------------
        // FIND PROPERTY
        // --------------------------------------------------------

        Optional<Property> propertyOptional =
                propertyRepository.findById(joinCode.getPropertyId());

        if (propertyOptional.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of("error", "The property associated with this code does not exist.")
            );
        }

        Property property = propertyOptional.get();

        // --------------------------------------------------------
        // CHECK WHETHER TENANT IS ALREADY IN THIS PROPERTY
        // --------------------------------------------------------

        Optional<HasTenancy> currentTenancy =
                hasTenancyRepository.findActiveTenancyByTenantId(tenantId);

        if (currentTenancy.isPresent()) {

            HasTenancy existing = currentTenancy.get();

            if (existing.getPropertyId() == property.getPropertyId()) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "error",
                                "You are already a tenant of this property."
                        )
                );
            }

            // ----------------------------------------------------
            // LEAVE PREVIOUS PROPERTY
            // ----------------------------------------------------

            existing.setLeaveDate(LocalDate.now());

            hasTenancyRepository.save(existing);
        }

        // --------------------------------------------------------
        // CREATE NEW TENANCY
        // --------------------------------------------------------

        HasTenancy newTenancy = new HasTenancy();

        newTenancy.setTenantId(tenantId);
        newTenancy.setPropertyId(property.getPropertyId());
        newTenancy.setJoinDate(LocalDate.now());
        newTenancy.setLeaveDate(null);

        hasTenancyRepository.save(newTenancy);

        // --------------------------------------------------------
        // MARK CODE AS USED
        // --------------------------------------------------------

        joinCode.setUsedByTenantId(tenantId);
        joinCode.setStatus("USED");

        joinCodeRepository.save(joinCode);

        // --------------------------------------------------------
        // RETURN RESULT
        // --------------------------------------------------------

        return ResponseEntity.ok(
                Map.of(
                        "message", "Successfully joined the property.",
                        "property", property,
                        "tenancy", newTenancy
                )
        );
    }

    // ------------------------------------------------------------
    // LEAVE CURRENT PROPERTY
    // ------------------------------------------------------------

    @PostMapping("/{tenantId}/leave")
    @Transactional
    public ResponseEntity<?> leaveProperty(
            @PathVariable int tenantId
    ) {

        Optional<HasTenancy> currentTenancy =
                hasTenancyRepository.findActiveTenancyByTenantId(tenantId);

        if (currentTenancy.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "You are not currently living in a property.")
            );
        }

        HasTenancy tenancy = currentTenancy.get();

        tenancy.setLeaveDate(LocalDate.now());

        hasTenancyRepository.save(tenancy);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "You have successfully left the property."
                )
        );
    }

    // ------------------------------------------------------------
    // DELETE TENANT
    // ------------------------------------------------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(
            @PathVariable int id
    ) {

        if (!tenantRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        tenantRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}