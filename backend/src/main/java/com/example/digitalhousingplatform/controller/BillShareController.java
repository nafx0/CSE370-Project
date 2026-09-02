package com.example.digitalhousingplatform.controller;

import com.example.digitalhousingplatform.model.BillShare;
import com.example.digitalhousingplatform.repository.BillShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billshares")
public class BillShareController {

    @Autowired
    private BillShareRepository billShareRepository;

    @GetMapping
    public List<BillShare> listBillShares() {
        return billShareRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillShare> getBillShare(@PathVariable int id) {
        return billShareRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public BillShare addBillShare(@RequestBody BillShare billShare) {
        return billShareRepository.save(billShare);
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<?> payBillShare(@PathVariable int id, @RequestBody Map<String, String> request) {

        BillShare billShare = billShareRepository.findById(id).orElse(null);

        if (billShare == null) {
            return ResponseEntity.notFound().build();
        }

        if ("PAID".equalsIgnoreCase(billShare.getPaidStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "This bill share is already paid and cannot be modified."));
        }

        String transactionId = request.get("transactionId");

        if (transactionId == null || transactionId.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Transaction ID is required to confirm payment."));
        }

        billShare.setTransactionId(transactionId);
        billShare.setPaidStatus("PAID");
        billShare.setPaidDate(LocalDate.now());

        return ResponseEntity.ok(billShareRepository.save(billShare));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBillShare(@PathVariable int id) {
        billShareRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // dont use
    }
}