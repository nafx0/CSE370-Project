package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.Complaint;
import com.example.digitalhousingplatform.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping
    public List<Complaint> listComplaints() {
        return complaintRepository.findAll();
    }

    @PostMapping
    public Complaint addComplaint(@RequestBody Complaint complaint) {
        int nextId = complaintRepository.findAll().stream()
                .filter(c -> c.getPropertyId() == complaint.getPropertyId())
                .mapToInt(Complaint::getComplaintId)
                .max()
                .orElse(0) + 1;
        complaint.setComplaintId(nextId);
        complaint.setDate(LocalDate.now());
        return complaintRepository.save(complaint);
    }

    @PutMapping("/{propertyId}/{complaintId}")
    public ResponseEntity<Complaint> updateComplaint(@PathVariable int propertyId, @PathVariable int complaintId, @RequestBody Complaint complaint) {
        Complaint.ComplaintId id = new Complaint.ComplaintId();
        id.setPropertyId(propertyId);
        id.setComplaintId(complaintId);
        if (!complaintRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        complaint.setPropertyId(propertyId);
        complaint.setComplaintId(complaintId);
        return ResponseEntity.ok(complaintRepository.save(complaint));
    }

    @DeleteMapping("/{propertyId}/{complaintId}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable int propertyId, @PathVariable int complaintId) {
        Complaint.ComplaintId id = new Complaint.ComplaintId();
        id.setPropertyId(propertyId);
        id.setComplaintId(complaintId);
        complaintRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}