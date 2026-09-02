package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.Property;
import com.example.digitalhousingplatform.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    @Autowired
    private PropertyRepository propertyRepository;

    @GetMapping
    public List<Property> listProperties() {
        return propertyRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getProperty(@PathVariable int id) {
        return propertyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> addProperty(@RequestBody Property property) {

        if (property.getExpiryDate() != null && property.getPostedDate() != null
                && !property.getExpiryDate().isAfter(property.getPostedDate())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Expiry date must be after the posted date."));
        }

        return ResponseEntity.ok(propertyRepository.save(property));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProperty(@PathVariable int id, @RequestBody Property property) {

        if (!propertyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        if (property.getExpiryDate() != null && property.getPostedDate() != null
                && !property.getExpiryDate().isAfter(property.getPostedDate())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Expiry date must be after the posted date."));
        }

        property.setPropertyId(id);
        return ResponseEntity.ok(propertyRepository.save(property));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable int id) {
        propertyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}