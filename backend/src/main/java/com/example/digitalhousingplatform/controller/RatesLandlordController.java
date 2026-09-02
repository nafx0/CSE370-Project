package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.HasTenancy;
import com.example.digitalhousingplatform.model.Property;
import com.example.digitalhousingplatform.model.RatesLandlord;
import com.example.digitalhousingplatform.repository.HasTenancyRepository;
import com.example.digitalhousingplatform.repository.PropertyRepository;
import com.example.digitalhousingplatform.repository.RatesLandlordRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rateslandlords")
public class RatesLandlordController {

    @Autowired
    private RatesLandlordRepository ratesLandlordRepository;

    @Autowired
    private HasTenancyRepository hasTenancyRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @GetMapping
    public List<RatesLandlord> listRatesLandlord() {
        return ratesLandlordRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatesLandlord> getRatesLandlord(@PathVariable int id) {
        return ratesLandlordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tenant/{tenantId}")
    public List<RatesLandlord> getRatingsByTenant(@PathVariable int tenantId) {
        return ratesLandlordRepository.findAll().stream()
                .filter(r -> r.getTenantId() == tenantId)
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> addRatesLandlord(@RequestBody RatesLandlord ratesLandlord) {

        List<HasTenancy> tenancies = hasTenancyRepository.findAll();

        boolean eligible = tenancies.stream().anyMatch(t ->
                t.getTenantId() == ratesLandlord.getTenantId()
                        && t.getLeaveDate() != null
                        && propertyRepository.findById(t.getPropertyId())
                        .map(Property::getLandlordId)
                        .map(landlordId -> landlordId == ratesLandlord.getLandlordId())
                        .orElse(false)
        );

        if (!eligible) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "You can only rate a landlord after leaving one of their properties."));
        }

        return ResponseEntity.ok(ratesLandlordRepository.save(ratesLandlord));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRatesLandlord(@PathVariable int id) {
        ratesLandlordRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // no need frontend
    }
}