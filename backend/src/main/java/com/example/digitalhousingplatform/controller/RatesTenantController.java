package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.HasTenancy;
import com.example.digitalhousingplatform.model.Property;
import com.example.digitalhousingplatform.model.RatesTenant;
import com.example.digitalhousingplatform.repository.HasTenancyRepository;
import com.example.digitalhousingplatform.repository.PropertyRepository;
import com.example.digitalhousingplatform.repository.RatesTenantRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratestenants")
public class RatesTenantController {

    @Autowired
    private RatesTenantRepository ratesTenantRepository;

    @Autowired
    private HasTenancyRepository hasTenancyRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @GetMapping
    public List<RatesTenant> listRatesTenant() {
        return ratesTenantRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatesTenant> getRatesTenant(@PathVariable int id) {
        return ratesTenantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addRatesTenant(@RequestBody RatesTenant ratesTenant) {

        List<HasTenancy> tenancies = hasTenancyRepository.findAll();

        boolean eligible = tenancies.stream().anyMatch(t ->
                t.getTenantId() == ratesTenant.getTenantId()
                        && t.getLeaveDate() != null
                        && propertyRepository.findById(t.getPropertyId())
                        .map(Property::getLandlordId)
                        .map(landlordId -> landlordId == ratesTenant.getLandlordId())
                        .orElse(false)
        );

        if (!eligible) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "You can only rate a tenant after they have left your property."));
        }

        return ResponseEntity.ok(ratesTenantRepository.save(ratesTenant));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRatesTenant(@PathVariable int id) {
        ratesTenantRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}