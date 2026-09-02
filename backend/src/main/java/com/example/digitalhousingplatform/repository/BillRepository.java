package com.example.digitalhousingplatform.repository;

import com.example.digitalhousingplatform.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Integer> {
}