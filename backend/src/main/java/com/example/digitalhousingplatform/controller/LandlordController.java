package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.Landlord;
import com.example.digitalhousingplatform.repository.LandlordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/landlords")
public class LandlordController {

    @Autowired
    private LandlordRepository landlordRepository;

    @GetMapping
    public List<Landlord> listLandlords() {
        return landlordRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Landlord> getLandlord(@PathVariable int id) {
        return landlordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLandlord(@PathVariable int id) {
        landlordRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // dont use
    }
}